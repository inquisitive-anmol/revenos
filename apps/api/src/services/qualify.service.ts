import { qualifierQueue } from "@revenos/queue";
import { Lead } from "@revenos/db";

export const triggerQualifier = async (
  workspaceId: string,
  campaignId: string,
  leadId: string
): Promise<{ jobId: string }> => {
  // Verify lead exists
  const lead = await Lead.findOne({ _id: leadId, workspaceId });
  if (!lead) throw new Error("Lead not found");

  const job = await qualifierQueue.add(
    "qualify",
    {
      workspaceId,
      campaignId,
      leadId,
      fromEmail: process.env.FROM_EMAIL!,
      fromName: process.env.FROM_NAME!,
      replyTo: process.env.REPLY_TO_EMAIL,
      playbook: {
        tone: "professional",
        valueProposition:
          "RevenOS automates your entire outbound sales process using AI agents that prospect, qualify, and book meetings while you sleep.",
        callToAction:
          "Would you be open to a 15-minute call to see how RevenOS could work for your team?",
      },
    },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    }
  );

  return { jobId: job.id! };
};