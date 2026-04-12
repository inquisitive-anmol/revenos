import { getResendClient } from "./resend.client";
import crypto from "crypto";

export interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string; // kept for interface compat but ignored internally
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  messageId: string; // threadId — save this as externalThreadId
  resendId: string;
  success: boolean;
}

export const sendEmail = async (
  options: SendEmailOptions
): Promise<SendEmailResult> => {
  const resend = getResendClient();

  // Always generate a unique threadId and embed it in reply-to
  // Ignore options.replyTo — we own the reply-to for thread tracking
  const threadId = crypto.randomUUID();
  const inboxDomain = process.env.REPLY_TO_EMAIL?.split("@")[1] || "contact.leadxai.in";
  const trackingReplyTo = `contact+${threadId}@${inboxDomain}`;

  const result = await resend.emails.send({
    to: options.to,
    from: options.from,
    subject: options.subject,
    html: options.html,
    replyTo: trackingReplyTo, // always the tracking address
    tags: options.tags,
  });

  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }

  return {
    messageId: threadId, // save this as externalThreadId
    resendId: result.data?.id || "",
    success: true,
  };
};