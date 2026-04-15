import { Resend } from "resend";
import { qualifierQueue, bookerConfirmQueue } from "@revenos/queue";
import { EmailThread, Lead } from "@revenos/db";

const resend = new Resend(process.env.RESEND_API_KEY!);

const stripQuotedReply = (text: string): string => {
  return text
    .split(/\n>|\nOn .+ wrote:|\n--\s*\n/)[0]  // strip at quote markers
    .trim();
};

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

  // Match thread — bypass tenancy plugin
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

  // Append inbound message to thread
  await (EmailThread as any).collection.updateOne(
    { _id: thread._id },
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
      $set: {
        // Don't overwrite status here — router below sets the right one
        updatedAt: new Date(),
      },
    }
  );

  // ── ROUTER: branch on thread.status ──────────────────────────────────────

  const threadStatus = thread.status as string;
  console.log(`[Webhook] Thread status: ${threadStatus}`);

  // ── Branch 1: Normal qualification reply ─────────────────────────────────
  if (threadStatus === "active" || threadStatus === "replied") {
    await (EmailThread as any).collection.updateOne(
      { _id: thread._id },
      { $set: { status: "replied" } }
    );

    const originalEmail = thread.messages[0]?.body || "";
    const cleanReply = stripQuotedReply(replyContent);
    await qualifierQueue.add(
      "classify-reply",
      {
        workspaceId: thread.workspaceId.toString(),
        campaignId: thread.campaignId.toString(),
        leadId: thread.leadId.toString(),
        originalEmail,
        replyContent: cleanReply,
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

    console.log(`[Webhook] Queued for qualification. Lead: ${lead.email}`);
    return;
  }

  // ── Branch 2: Lead replied to slot proposal — confirm booking ────────────
  if (threadStatus === "awaiting_slot_reply") {
    if (!thread.proposedSlots || thread.proposedSlots.length === 0) {
      console.error("[Webhook] awaiting_slot_reply but no proposedSlots on thread — cannot confirm");
      return;
    }

    if (!thread.bookerMeta) {
      console.error("[Webhook] awaiting_slot_reply but no bookerMeta on thread — cannot confirm");
      return;
    }

    const cleanReply = stripQuotedReply(replyContent);

    await bookerConfirmQueue.add(
      "confirm-booking",
      {
        workspaceId: thread.workspaceId.toString(),
        campaignId: thread.campaignId.toString(),
        leadId: thread.leadId.toString(),
        threadId: thread.externalThreadId,
        threadObjectId: thread._id.toString(),
        replyContent: cleanReply,
        proposedSlots: thread.proposedSlots,
        bookerMeta: thread.bookerMeta,
        lead: {
          email: lead.email,
          firstName: lead.firstName,
          lastName: lead.lastName,
          company: lead.company,
          title: lead.title,
        },
      },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );

    console.log(`[Webhook] Queued for booking confirmation. Lead: ${lead.email}`);
    return;
  }

  // ── Branch 3: Already booked — ignore or log ─────────────────────────────
  if (threadStatus === "meeting_booked" || threadStatus === "closed") {
    console.log(`[Webhook] Thread already ${threadStatus}, ignoring reply from ${lead.email}`);
    return;
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  console.log(`[Webhook] Unhandled thread status: ${threadStatus} for lead ${lead.email}`);
};