import { Resend } from "resend";
import { qualifierQueue } from "../config/queue";
import { EmailThread, Lead } from "@revenos/db";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const handleEmailReply = async (payload: any): Promise<void> => {
  const type = payload.type;

  if (type !== "email.received") {
    console.log(`[Webhook] Ignoring event type: ${type}`);
    return;
  }

  // Extract threadId from the to address: contact+<threadId>@contact.leadxai.in
  const toAddresses: string[] = payload.data?.to ?? [];
  const trackingAddress = toAddresses.find((addr) =>
    addr.includes("contact+")
  );

  if (!trackingAddress) {
    console.log("[Webhook] No tracking address found in to field");
    return;
  }

  // Parse: contact+227c285f-f298-40da-baaf-150f6d2400b0@contact.leadxai.in
  const match = trackingAddress.match(/contact\+([^@]+)@/);
  const threadId = match?.[1];

  if (!threadId) {
    console.log("[Webhook] Could not parse threadId from address");
    return;
  }

  console.log(`[Webhook] ThreadId extracted: ${threadId}`);

  const emailId = payload.data?.email_id;

  // Fetch full email for body content
  const { data: fullEmail, error } = await resend.emails.receiving.get(emailId);
  if (error || !fullEmail) {
    console.error("[Webhook] Failed to fetch received email:", error);
    return;
  }

  const replyContent = fullEmail.text || fullEmail.html || "";
  if (!replyContent) {
    console.log("[Webhook] No reply content in fetched email");
    return;
  }

  // Match thread — no tenancy plugin issue since this is a direct collection access
  const thread = await (EmailThread as any).collection.findOne({
    externalThreadId: threadId,
  });

  if (!thread) {
    console.log(`[Webhook] No thread found for threadId: ${threadId}`);
    return;
  }

  const lead = await Lead.findOne({
    _id: thread.leadId,
    workspaceId: thread.workspaceId,
  });

  if (!lead) {
    console.log("[Webhook] No lead found for thread");
    return;
  }

  await EmailThread.findOneAndUpdate(
    { _id: thread._id, workspaceId: thread.workspaceId },
    {
      $push: {
        messages: {
          messageId: payload.data.message_id,
          direction: "inbound",
          subject: payload.data.subject || "Re: (no subject)",
          body: replyContent,
          sentAt: new Date(payload.data.created_at || Date.now()),
        },
      },
      status: "replied",
    }
  );

  const originalEmail = thread.messages[0]?.body || "";

  await qualifierQueue.add(
    "classify-reply",
    {
      workspaceId: thread.workspaceId.toString(),
      campaignId: thread.campaignId.toString(),
      leadId: thread.leadId.toString(),
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

  console.log(`[Webhook] Reply queued for classification. Lead: ${lead.email}`);
};