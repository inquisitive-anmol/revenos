import { getResendClient } from "./resend.client";
import crypto from "crypto";

export interface SendEmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  messageId: string; // the thread tracking ID — saved as externalThreadId
  resendId: string;
  success: boolean;
}

export const sendEmail = async (
  options: SendEmailOptions
): Promise<SendEmailResult> => {
  const resend = getResendClient();

  // Generate a unique thread ID — embed it in reply-to address
  const threadId = crypto.randomUUID();
  const replyToAddress = `contact+${threadId}@contact.leadxai.in`;

  const result = await resend.emails.send({
    to: options.to,
    from: options.from,
    subject: options.subject,
    html: options.html,
    replyTo: replyToAddress, // <-- encoded thread ID
    tags: options.tags,
  });

  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }

  // The threadId is what you save as externalThreadId
  return {
    messageId: threadId,
    resendId: result.data?.id || "",
    success: true,
  };
};