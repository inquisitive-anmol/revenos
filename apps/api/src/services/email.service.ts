import { EmailService } from '@revenos/communication';
import { env } from '../config/env';

/**
 * email.service.ts
 *
 * API-specific instance of the shared EmailService.
 */
export const emailService = new EmailService(
  process.env.RESEND_API_KEY!,
  process.env.FROM_EMAIL!,
  process.env.FROM_NAME!
);

export default emailService;
