import { SlackService, EmailService } from '@revenos/communication';
import { Campaign, Workspace } from '@revenos/db';

const slackService = new SlackService();
const emailService = new EmailService(
  process.env.RESEND_API_KEY || '',
  process.env.FROM_EMAIL || '',
  process.env.FROM_NAME || ''
);

export const notifySalesOwnerOnBooking = async (
  meeting: any,
  lead: any,
  workspaceId: string,
  campaignId: string
) => {
  try {
    const workspace = await Workspace.findById(workspaceId);
    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId }).populate<{ createdBy: any }>('createdBy');

    if (!workspace) return;

    const ownerEmail = (campaign?.createdBy as any)?.email ?? 'admin@revenos.com';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // 1. Email Alert
    try {
      if (ownerEmail) {
        await emailService.sendMeetingBookedAlert(ownerEmail, lead, meeting, clientUrl);
      }
    } catch (e) {
      console.error('[NotificationService] Email alert failed', e);
    }

    // 2. Slack Alert
    if (workspace.settings?.slackWebhookUrl && process.env.ENABLE_SLACK_NOTIFICATIONS === 'true') {
      try {
        await slackService.sendWebhook(workspace.settings.slackWebhookUrl, {
          text: `🎉 *New Meeting Booked!*\nRevenOS AI secured a meeting with *${lead.firstName} ${lead.lastName}* at *${lead.company}*.`,
        });
      } catch (e) {
        console.error('[NotificationService] Slack alert failed', e);
      }
    }
  } catch (error) {
    console.error('[NotificationService] Core orchestrator error', error);
  }
};
