import crypto from "crypto";
import { getResendClient } from "./resend.client";

export interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  messageId: string; // RFC Message-ID e.g. <uuid@contact.leadxai.in>
  resendId: string;  // Resend's internal UUID
  success: boolean;
}

export const sendEmail = async (
  options: SendEmailOptions
): Promise<SendEmailResult> => {
  const resend = getResendClient();

  // Generate RFC Message-ID before sending — we own it, no guessing after the fact
  const domain = options.from.includes("@")
    ? options.from.split("@")[1].replace(/>.*/, "").trim()
    : "mail.local";
  const generatedMessageId = `<${crypto.randomUUID()}@${domain}>`;

  const result = await resend.emails.send({
    to: options.to,
    from: options.from,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    tags: options.tags,
    headers: {
      "Message-ID": generatedMessageId,
    },
  });

  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }

  return {
    messageId: generatedMessageId, // save this as externalThreadId
    resendId: result.data?.id || "",
    success: true,
  };
};