import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey: string, fromEmail: string, fromName: string) {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendEmail(to: string, subject: string, html: string) {
    const { data, error } = await this.resend.emails.send({
      from: `${this.fromName} <${this.fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) throw error;
    return data;
  }

  async sendLowCreditAlert(to: string, data: { balance: number; allocation: number; workspaceName: string; clientUrl: string }) {
    const subject = `⚠️ Low Credit Alert: ${data.workspaceName}`;
    const percent = Math.round((data.balance / data.allocation) * 100);
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e63946;">Low Credit Alert</h2>
        <p>Hello,</p>
        <p>Your workspace <strong>${data.workspaceName}</strong> is running low on credits.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Current Balance:</strong> ${data.balance} credits</p>
          <p style="margin: 5px 0;"><strong>Plan Allocation:</strong> ${data.allocation} credits</p>
          <p style="margin: 5px 0;"><strong>Remaining:</strong> ${percent}%</p>
        </div>
        <p>Once your balance reaches 0, your active agents (Prospector, Booker, etc.) will pause until your next billing cycle reset or until you top up.</p>
        <a href="${data.clientUrl}/billing" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">Top Up Credits</a>
        <p style="margin-top: 30px; font-size: 12px; color: #6c757d;">
          You are receiving this because your balance fell below 20% of your plan's monthly allocation.
        </p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }

  async sendMeetingBookedAlert(to: string, lead: any, meeting: any, clientUrl: string) {
    const subject = `🎉 Meeting Booked: ${lead.firstName} @ ${lead.company}`;
    
    // Format date string safely
    const scheduledDate = new Date(meeting.scheduledAt).toLocaleString("en-US", {
      timeZone: "UTC", // Will be localized further on client or configured via Campaign
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #28a745;">🚀 New Meeting Booked!</h2>
        <p>RevenOS AI has successfully secured a meeting.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Lead:</strong> ${lead.firstName} ${lead.lastName} (${lead.title})</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${lead.company}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${scheduledDate} UTC</p>
        </div>
        <p>The calendar invite has been sent to both parties automatically via Nylas.</p>
        <a href="${clientUrl}/campaign/${meeting.campaignId}/leads/${lead._id}" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px;">View Lead in RevenOS</a>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}

export class SlackService {
  async sendWebhook(url: string, payload: { text: string; blocks?: any[] }) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Slack notify failed: ${response.statusText}`);
    }
  }
}
