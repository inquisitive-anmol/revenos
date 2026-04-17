import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { BookerAgent, StoredSlot } from "@revenos/agents";
import { Lead, Meeting, Campaign, AgentLog, Agent, EmailThread } from "@revenos/db";
import { getNylasClient } from "../config/nylas";
import { Types } from "mongoose"; // add this at the top of the file with other imports
import { deductCredits, InsufficientCreditsError, CREDIT_COSTS } from "@revenos/billing";


export interface BookerConfirmJobData {
    workspaceId: string;
    campaignId: string;
    leadId: string;
    threadId: string;           // MongoDB _id of EmailThread
    threadObjectId: string;
    replyContent: string;
    proposedSlots: StoredSlot[];
    bookerMeta: {
        leadEmail: string;
        leadName: string;
        calendarId: string;
        durationMins: number;
    };
    lead: {
        email: string;
        firstName: string;
        lastName: string;
        company: string;
        title: string;
    };
}

export const bookerConfirmWorker = new Worker<BookerConfirmJobData>(
    "booker-confirm",
    async (job: Job<BookerConfirmJobData>) => {
        const {
            workspaceId,
            campaignId,
            leadId,
            threadId,
            threadObjectId,
            replyContent,
            proposedSlots,
            bookerMeta,
            lead,
        } = job.data;

        console.log(`[BookerConfirmJob] Starting job ${job.id} for lead ${leadId}`);

        // 1. Get or create booker agent record
        let agent = await Agent.findOne({ workspaceId, type: "booker" });
        if (!agent) {
            agent = await Agent.create({
                workspaceId,
                type: "booker",
                config: {
                    icpDescription: "",
                    emailTone: "professional",
                    followUpDays: [0, 3, 7],
                    qualificationThreshold: 7,
                },
                status: "idle",
            });
        }

        // 2. Initialize booker agent
        const nylasClient = getNylasClient();
        const bookerAgent = new BookerAgent(
            {
                workspaceId,
                campaignId,
                agentId: agent._id.toString(),
                config: {
                    icpDescription: "",
                    emailTone: "professional",
                    followUpDays: [0, 3, 7],
                    qualificationThreshold: 7,
                },
            },
            nylasClient
        );

        // 3. Run Phase 2 — classify reply + book the chosen slot
        const result = await bookerAgent.confirmBooking({
            leadId,
            workspaceId,
            campaignId,
            threadId,
            replyText: replyContent,
            proposedSlots,
            bookerMeta,
            lead,
            emailConfig: {
                fromEmail: process.env.FROM_EMAIL!,
                fromName: process.env.FROM_NAME!,
            },
            calendar: {
                grantId: process.env.NYLAS_GRANT_ID!,
                calendarId: bookerMeta.calendarId || "primary",
                meetingDuration: bookerMeta.durationMins || 30,
                timezone: "Asia/Kolkata",
            },
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
                console.warn(`[BookerConfirmJob] Insufficient credits for workspace ${workspaceId}`);
            } else {
                throw err;
            }
        }

        // 4. If unclear — agent already sent clarification email, just log and exit
        if (result.unclear || !result.meetingBooked) {
            console.log(`[BookerConfirmJob] Slot unclear for lead ${lead.email}, clarification sent`);

            await AgentLog.create({
                workspaceId,
                agentId: agent._id,
                campaignId,
                event: "booker.slot_unclear",
                data: { leadId, threadId },
                timestamp: new Date(),
            });

            return result;
        }

        // 5. Save meeting to MongoDB
        const meeting = await Meeting.create({
            workspaceId,
            leadId,
            campaignId,
            calendarEventId: result.calendarEventId,
            scheduledAt: result.scheduledAt,
        });

        // 6. Update EmailThread — mark booked + save meetingDetails

        await (EmailThread as any).collection.updateOne(
            { _id: new Types.ObjectId(threadObjectId) },
            {
                $set: {
                    status: "meeting_booked",
                    meetingDetails: {
                        eventId: result.calendarEventId,
                        confirmedSlot: result.confirmedSlot,
                    },
                    updatedAt: new Date(),
                },
            }
        );

        // 7. Update lead status
        await Lead.findOneAndUpdate(
            { _id: leadId, workspaceId },
            { status: "meeting_booked" }
        );

        // 8. Update campaign metrics
        await Campaign.findOneAndUpdate(
            { _id: campaignId, workspaceId },
            { $inc: { "metrics.meetingsBooked": 1 } }
        );

        try {
            await deductCredits(
                workspaceId,
                CREDIT_COSTS.AI_AGENT_RUN, // Cost is same as AI_AGENT_RUN per instructions 
                "AI_AGENT_RUN", // closest enum reason
                meeting._id.toString(),
                { action: 'meeting_booked' }
            );
        } catch (err) {
            if (err instanceof InsufficientCreditsError) {
                console.warn(`[BookerConfirmJob] Insufficient credits for workspace ${workspaceId}`);
            } else {
                throw err;
            }
        }

        // 9. Log completion
        await AgentLog.create({
            workspaceId,
            agentId: agent._id,
            campaignId,
            event: "booker.meeting_booked",
            data: {
                leadId,
                meetingId: meeting._id,
                calendarEventId: result.calendarEventId,
                scheduledAt: result.scheduledAt,
                confirmedSlot: result.confirmedSlot,
            },
            timestamp: new Date(),
        });

        console.log(`[BookerConfirmJob] Meeting booked for ${lead.email} ✅`);

        return result;
    },
    { connection: redis }
);

bookerConfirmWorker.on("completed", (job) => {
    console.log(`[BookerConfirmWorker] Job ${job.id} completed`);
});

bookerConfirmWorker.on("failed", (job, err) => {
    console.error(`[BookerConfirmWorker] Job ${job?.id} failed:`, err.message);
});