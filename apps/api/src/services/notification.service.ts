import { SlackService } from '@revenos/communication';
import { emailService } from './email.service';
import { Campaign, Workspace } from '@revenos/db';

const slackService = new SlackService();

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

    // Use campaign author's email if available, otherwise just use a fallback or skip
    // Wait, the user schema might be populated. If not, we might not have email.
    // Let's assume workspace owner or campaign createdby. For now, default to fromEmail for alerting, or fetch user.
    // In our implementation plan we'll try campaign.createdBy.email.
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

    // 2. Slack Alert (if webhook configured & Slack enabled)
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
