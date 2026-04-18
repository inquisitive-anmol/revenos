import { Request, Response } from 'express';
import { Workspace } from '@revenos/db';

// GET /integrations — return current integration status for workspace
export const getIntegrationsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;

  const workspace = await Workspace.findOne({ _id: workspaceId })
    .select('integrations')
    .lean();

  if (!workspace) {
    return res.status(404).json({ success: false, error: 'Workspace not found' });
  }

  // Return safe shape — no tokens exposed to client
  const integrations = workspace.integrations ?? {};
  return res.status(200).json({
    success: true,
    data: {
      email: integrations.email
        ? { connected: true, provider: integrations.email.provider, email: integrations.email.email, connectedAt: integrations.email.connectedAt }
        : { connected: false },
      calendar: integrations.calendar
        ? { connected: true, provider: integrations.calendar.provider, connectedAt: integrations.calendar.connectedAt }
        : { connected: false },
      slack: integrations.slack
        ? { connected: true, channel: integrations.slack.channel, connectedAt: integrations.slack.connectedAt }
        : { connected: false },
    },
  });
};

// PATCH /integrations/email — save or disconnect email integration
export const updateEmailIntegrationHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { action, provider, email, nylasGrantId } = req.body;

  if (action === 'disconnect') {
    await Workspace.updateOne({ _id: workspaceId }, { $unset: { 'integrations.email': '' } });
    return res.status(200).json({ success: true, message: 'Email disconnected' });
  }

  if (!provider || !email) {
    return res.status(400).json({ success: false, error: 'provider and email are required' });
  }

  await Workspace.updateOne(
    { _id: workspaceId },
    { $set: { 'integrations.email': { provider, email, nylasGrantId, connectedAt: new Date() } } }
  );
  return res.status(200).json({ success: true, message: 'Email integration saved' });
};

// PATCH /integrations/calendar — save or disconnect calendar integration
export const updateCalendarIntegrationHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { action, provider, calendarId, nylasGrantId } = req.body;

  if (action === 'disconnect') {
    await Workspace.updateOne({ _id: workspaceId }, { $unset: { 'integrations.calendar': '' } });
    return res.status(200).json({ success: true, message: 'Calendar disconnected' });
  }

  if (!provider) {
    return res.status(400).json({ success: false, error: 'provider is required' });
  }

  await Workspace.updateOne(
    { _id: workspaceId },
    { $set: { 'integrations.calendar': { provider, calendarId, nylasGrantId, connectedAt: new Date() } } }
  );
  return res.status(200).json({ success: true, message: 'Calendar integration saved' });
};

// PATCH /integrations/slack — save or disconnect Slack integration
export const updateSlackIntegrationHandler = async (req: Request, res: Response) => {
  const workspaceId = req.user?.workspaceId;
  const { action, webhookUrl, channel } = req.body;

  if (action === 'disconnect') {
    await Workspace.updateOne({ _id: workspaceId }, { $unset: { 'integrations.slack': '' } });
    return res.status(200).json({ success: true, message: 'Slack disconnected' });
  }

  if (!webhookUrl || !channel) {
    return res.status(400).json({ success: false, error: 'webhookUrl and channel are required' });
  }

  await Workspace.updateOne(
    { _id: workspaceId },
    { $set: { 'integrations.slack': { webhookUrl, channel, connectedAt: new Date() } } }
  );
  return res.status(200).json({ success: true, message: 'Slack integration saved' });
};
