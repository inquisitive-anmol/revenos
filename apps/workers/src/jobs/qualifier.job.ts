import { Worker, Job, Queue } from "bullmq";
import { redis } from "../config/redis";
import { QualifierAgent } from "@revenos/agents";
import { Lead, Campaign, EmailThread, AgentLog, Agent } from "@revenos/db";
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";

export interface QualifierJobData {
    workspaceId: string;
    campaignId: string;
    leadId: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    playbook: {
        tone: string;
        valueProposition: string;
        callToAction: string;
    };
}

// Booker queue — will be used in Sprint 4
export const bookerQueue = new Queue("booker", { connection: redis });

export const qualifierWorker = new Worker<QualifierJobData>(
    "qualifier",
    async (job: Job) => {
        // Route based on job name
        if (job.name === "classify-reply") {
            const {
                workspaceId,
                campaignId,
                leadId,
                originalEmail,
                replyContent,
            } = job.data;

            console.log(`[ReplyClassifier] Classifying reply for lead ${leadId}`);

            const agent = await Agent.findOne({ workspaceId, type: "qualifier" });
            if (!agent) throw new Error("Qualifier agent not found");

            const qualifierAgent = new QualifierAgent({
                workspaceId,
                campaignId,
                agentId: agent._id.toString(),
                config: {
                    icpDescription: "",
                    emailTone: "professional",
                    followUpDays: [0, 3, 7],
                    qualificationThreshold: 7,
                },
            });

            const classification = await qualifierAgent.classifyReply(
                originalEmail,
                replyContent
            );

            try {
                await deductCredits(
                    workspaceId,
                    CREDIT_COSTS.AI_AGENT_RUN,
                    "AI_AGENT_RUN",
                    leadId
                );
            } catch (err) {
                if (err instanceof InsufficientCreditsError) {
                    console.warn(`[QualifierJob] Insufficient credits for workspace ${workspaceId}`);
                } else {
                    throw err;
                }
            }

            console.log(`[ReplyClassifier] Intent: ${classification.intent}`);
            console.log(`[ReplyClassifier] Score: ${classification.score}`);
            console.log(`[ReplyClassifier] Action: ${classification.suggestedAction}`);

            if (
                classification.intent === "interested" ||
                classification.score >= 7
            ) {
                await Lead.findOneAndUpdate(
                    { _id: leadId, workspaceId },
                    { status: "qualified", icpScore: classification.score }
                );
                console.log(`[ReplyClassifier] Lead ${leadId} QUALIFIED ✅`);

                // Trigger booker agent
                await bookerQueue.add(
                    "book",
                    { workspaceId, campaignId, leadId },
                    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
                );
                console.log(`[ReplyClassifier] Booker agent triggered for lead ${leadId}`);
            } else if (classification.intent === "not_interested") {
                await Lead.findOneAndUpdate(
                    { _id: leadId, workspaceId },
                    { status: "disqualified" }
                );
                console.log(`[ReplyClassifier] Lead ${leadId} disqualified`);
            }

            await AgentLog.create({
                workspaceId,
                agentId: agent._id,
                campaignId,
                event: "qualifier.reply_classified",
                data: {
                    leadId,
                    intent: classification.intent,
                    score: classification.score,
                    suggestedAction: classification.suggestedAction,
                },
                timestamp: new Date(),
            });

            return classification;
        }

        // Default — qualify job
        const {
            workspaceId,
            campaignId,
            leadId,
            fromEmail,
            fromName,
            replyTo,
            playbook,
        } = job.data;

        console.log(`[QualifierJob] Starting job ${job.id} for lead ${leadId}`);

        const lead = await Lead.findOne({ _id: leadId, workspaceId });
        if (!lead) throw new Error(`Lead ${leadId} not found`);

        const agent = await Agent.findOneAndUpdate(
            { workspaceId, type: "qualifier" },
            {
                $setOnInsert: {
                    workspaceId,
                    type: "qualifier",
                    config: {
                        icpDescription: "",
                        emailTone: playbook.tone,
                        followUpDays: [0, 3, 7],
                        qualificationThreshold: 7,
                    },
                    status: "idle",
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const qualifierAgent = new QualifierAgent({
            workspaceId,
            campaignId,
            agentId: agent._id.toString(),
            config: {
                icpDescription: "",
                emailTone: playbook.tone,
                followUpDays: [0, 3, 7],
                qualificationThreshold: 7,
            },
        });

        const result = await qualifierAgent.run({
            leadId,
            workspaceId,
            campaignId,
            lead: {
                email: lead.email,
                firstName: lead.firstName,
                lastName: lead.lastName,
                company: lead.company,
                title: lead.title,
                industry: lead.industry ?? null,
                companySize: lead.companySize ?? null,
                icpScore: lead.icpScore,
                researchNotes: lead.researchNotes,
            },
            emailConfig: { fromEmail, fromName, replyTo },
            playbook,
        });

        try {
            await deductCredits(
                workspaceId,
                CREDIT_COSTS.AI_AGENT_RUN,
                "AI_AGENT_RUN",
                leadId
            );
        } catch (err) {
            if (err instanceof InsufficientCreditsError) {
                console.warn(`[QualifierJob] Insufficient credits for workspace ${workspaceId}`);
            } else {
                throw err;
            }
        }

        const existingThread = await EmailThread.findOne({ externalThreadId: result.messageId, workspaceId });
        if (!existingThread) {
            await EmailThread.create({
                workspaceId,
                leadId: lead._id,
                campaignId,
                externalThreadId: result.messageId,
                messages: [
                    {
                        messageId: result.messageId,
                        direction: "outbound",
                        subject: result.subject,
                        body: result.body,
                        sentAt: new Date(),
                    },
                ],
                status: "active",
            });
        }

        await Lead.findOneAndUpdate(
            { _id: leadId, workspaceId },
            { status: "contacted" }
        );

        await Campaign.findOneAndUpdate(
            { _id: campaignId, workspaceId },
            { $inc: { "metrics.emailsSent": 1 } }
        );

        await AgentLog.create({
            workspaceId,
            agentId: agent._id,
            campaignId,
            event: "qualifier.email_sent",
            data: { leadId, messageId: result.messageId, subject: result.subject },
            timestamp: new Date(),
        });

        try {
            await deductCredits(
                workspaceId,
                CREDIT_COSTS.EMAIL_SENT,
                "EMAIL_SENT",
                existingThread ? existingThread._id.toString() : leadId
            );
        } catch (err) {
            if (err instanceof InsufficientCreditsError) {
                console.warn(`[QualifierJob] Insufficient credits for workspace ${workspaceId}`);
            } else {
                throw err;
            }
        }

        console.log(`[QualifierJob] Completed. Email sent to ${lead.email}`);
        return { emailSent: true, messageId: result.messageId, leadId };
    },
    { connection: redis }
);


qualifierWorker.on("completed", (job) => {
    console.log(`[QualifierWorker] Job ${job.id} completed`);
});

qualifierWorker.on("failed", (job, err) => {
    console.error(
        `[QualifierWorker] Job ${job?.id} failed:`, err.message
    );
});

