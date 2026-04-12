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

  const emailId = payload.data?.email_id;
  if (!emailId) {
    console.log("[Webhook] No email_id in payload");
    return;
  }

  // Fetch full email — body and headers are not in the webhook payload
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

  // headers can be array [{name, value}] or Record<string, string> depending on SDK version
  // handle both shapes safely
  const rawHeaders = (fullEmail as any).headers;
  let inReplyTo: string | undefined;

  if (Array.isArray(rawHeaders)) {
    inReplyTo = rawHeaders.find(
      (h: { name: string; value: string }) =>
        h.name.toLowerCase() === "in-reply-to"
    )?.value?.trim();
  } else if (rawHeaders && typeof rawHeaders === "object") {
    const entry = Object.entries(rawHeaders as Record<string, string>).find(
      ([key]) => key.toLowerCase() === "in-reply-to"
    );
    inReplyTo = entry?.[1]?.trim();
  }

  if (!inReplyTo) {
    console.log("[Webhook] No In-Reply-To header — cannot match thread");
    return;
  }

  console.log(`[Webhook] In-Reply-To: ${inReplyTo}`);

  const thread = await EmailThread.findOne({ externalThreadId: inReplyTo });
  if (!thread) {
    console.log(`[Webhook] No thread found for In-Reply-To: ${inReplyTo}`);
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