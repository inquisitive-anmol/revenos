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
  messageId: string;
  success: boolean;
}

export const sendEmail = async (
  options: SendEmailOptions
): Promise<SendEmailResult> => {
  const resend = getResendClient();

  const result = await resend.emails.send({
    to: options.to,
    from: options.from,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    tags: options.tags,
  });

  if (result.error) {
    throw new Error(`Email send failed: ${result.error.message}`);
  }

  return {
    messageId: result.data?.id || "",
    success: true,
  };
};