import { qualifierQueue } from "../config/queue";
import { EmailThread, Lead } from "@revenos/db";
import mongoose from "mongoose";

export const handleEmailReply = async (payload: any): Promise<void> => {
  // Resend webhook payload structure
  const type = payload.type;

  if (type !== "email.complained" && type !== "inbound.email") {
    console.log(`[Webhook] Ignoring event type: ${type}`);
    return;
  }

  const replyContent =
    payload.data?.text || payload.data?.html || payload.data?.body || "";

  const inReplyTo =
    payload.data?.headers?.["in-reply-to"] ||
    payload.data?.inReplyTo ||
    "";

  if (!replyContent) {
    console.log("[Webhook] No reply content found");
    return;
  }

  if (!inReplyTo) {
    console.log("[Webhook] No inReplyTo header found — cannot correlate thread");
    return;
  }

  // Bootstrap lookup: we don't know workspaceId yet (webhook arrives externally).
  // Use raw collection to bypass the tenancy plugin for this one initial query.
  const rawThread = await mongoose.connection
    .collection("emailthreads")
    .findOne({ externalThreadId: inReplyTo });

  if (!rawThread) {
    console.log(`[Webhook] No thread found for messageId: ${inReplyTo}`);
    return;
  }

  const workspaceId = rawThread.workspaceId.toString();

  // All subsequent queries now have workspaceId — plugin is satisfied.
  const lead = await Lead.findOne({
    _id: rawThread.leadId,
    workspaceId,
  });

  if (!lead) {
    console.log(`[Webhook] No lead found for thread`);
    return;
  }

  // Save inbound reply to thread
  await EmailThread.findOneAndUpdate(
    { _id: rawThread._id, workspaceId },
    {
      $push: {
        messages: {
          messageId: `reply-${Date.now()}`,
          direction: "inbound",
          subject:
            payload.data?.subject ||
            "Re: " + (rawThread.messages?.[0]?.subject ?? ""),
          body: replyContent,
          sentAt: new Date(),
        },
      },
      status: "replied",
    }
  );

  // Get original email body for context
  const originalEmail = rawThread.messages?.[0]?.body || "";

  // Enqueue classification job
  await qualifierQueue.add(
    "classify-reply",
    {
      workspaceId,
      campaignId: rawThread.campaignId.toString(),
      leadId: rawThread.leadId.toString(),
      originalEmail,
      replyContent,
      fromEmail: process.env.FROM_EMAIL!,
      fromName: process.env.FROM_NAME!,
      playbook: {
        tone: "professional",
        valueProposition: "RevenOS automates your outbound sales process",
        callToAction: "15-minute call",
      },
    },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );

  console.log(
    `[Webhook] Reply queued for classification. Lead: ${lead.email}`
  );
};