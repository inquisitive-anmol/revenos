import { Request, Response } from 'express';
import { Workspace } from '@revenos/db';
import { getNylasClient } from '@/config/nylas';
import jwt from 'jsonwebtoken';

const NYLAS_REDIRECT_URI = process.env.NYLAS_REDIRECT_URI ?? 'http://localhost:5173/integrations/callback';
const STATE_SECRET = process.env.NYLAS_STATE_SECRET ?? 'revenos-nylas-state-secret';
const STATE_TTL_SECONDS = 600; // 10 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function signState(payload: { workspaceId: string; type: 'email' | 'calendar' }): string {
  return jwt.sign(payload, STATE_SECRET, { expiresIn: STATE_TTL_SECONDS });
}

function verifyState(token: string): { workspaceId: string; type: 'email' | 'calendar' } {
  try {
    return jwt.verify(token, STATE_SECRET) as { workspaceId: string; type: 'email' | 'calendar' };
  } catch {
    throw new Error('Invalid or expired state token. Please try connecting again.');
  }
}

function getScopesForType(type: 'email' | 'calendar'): string[] {
  if (type === 'calendar') {
    return ['calendar', 'calendar.free_busy'];
  }
  return ['email', 'email.send', 'email.metadata'];
}

// ─── Handlers ────────────────────────────────────────────────────────────────

// GET /api/v1/integrations — return current integration status for workspace
export const getIntegrationsHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;

  const workspace = await Workspace.findOne({ _id: workspaceId })
    .select('integrations')
    .lean();

  if (!workspace) {
    return res.status(404).json({ success: false, error: 'Workspace not found' });
  }

  // Return safe shape — no tokens/grant IDs exposed to client
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

// GET /api/v1/integrations/auth-url?type=email|calendar
// Generates a Nylas Hosted Auth URL and returns it to the frontend.
export const getAuthUrlHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
  const type = req.query.type as string;

  if (type !== 'email' && type !== 'calendar') {
    return res.status(400).json({ success: false, error: 'type must be "email" or "calendar"' });
  }

  const clientId = process.env.NYLAS_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ success: false, error: 'Nylas is not configured on this server. Set NYLAS_CLIENT_ID.' });
  }

  const state = signState({ workspaceId, type });
  const scopes = getScopesForType(type);
  const nylas = getNylasClient();

  const authUrl = nylas.auth.urlForOAuth2({
    clientId,
    redirectUri: NYLAS_REDIRECT_URI,
    scope: scopes,
    state,
  });

  return res.status(200).json({ success: true, data: { url: authUrl } });
};

// POST /api/v1/integrations/exchange
// Called by the frontend callback page with { code, state }.
// Exchanges the code for a Nylas grant_id and saves it to the workspace.
export const exchangeCodeHandler = async (req: Request, res: Response) => {
  const { code, state } = req.body as { code?: string; state?: string };

  if (!code || !state) {
    return res.status(400).json({ success: false, error: 'code and state are required' });
  }

  const clientId = process.env.NYLAS_CLIENT_ID;
  // In Nylas v3, the API Key is used as the client secret for token exchange.
  // NYLAS_CLIENT_SECRET can be set explicitly, or it falls back to NYLAS_API_KEY.
  const clientSecret = process.env.NYLAS_CLIENT_SECRET ?? process.env.NYLAS_API_KEY;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ success: false, error: 'Nylas is not configured on this server. Set NYLAS_CLIENT_ID and NYLAS_API_KEY.' });
  }

  // Verify state — extracts workspaceId + type, throws if invalid/expired
  let statePayload: { workspaceId: string; type: 'email' | 'calendar' };
  try {
    statePayload = verifyState(state);
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }

  const { workspaceId, type } = statePayload;

  const nylas = getNylasClient();

  // Exchange authorization code for a Nylas grant
  const tokenResponse = await nylas.auth.exchangeCodeForToken({
    clientId,
    clientSecret,
    redirectUri: NYLAS_REDIRECT_URI,
    code,
  });

  const grantId: string = (tokenResponse as any).grantId ?? (tokenResponse as any).grant_id;
  const email: string = (tokenResponse as any).email ?? '';
  const provider: string = (tokenResponse as any).provider ?? 'google';

  if (!grantId) {
    return res.status(502).json({ success: false, error: 'Nylas did not return a grant_id. Please try again.' });
  }

  // Persist to workspace
  const update: Record<string, unknown> = {};
  if (type === 'calendar') {
    update['integrations.calendar'] = {
      provider,
      nylasGrantId: grantId,
      connectedAt: new Date(),
    };
  } else {
    update['integrations.email'] = {
      provider,
      email,
      nylasGrantId: grantId,
      connectedAt: new Date(),
    };
  }

  await Workspace.updateOne({ _id: workspaceId }, { $set: update });

  return res.status(200).json({
    success: true,
    data: {
      type,
      provider,
      email: type === 'email' ? email : undefined,
      connectedAt: new Date(),
    },
  });
};

// PATCH /integrations/email — save or disconnect email integration
export const updateEmailIntegrationHandler = async (req: Request, res: Response) => {
  const workspaceId = req.tenant!.id;
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
  const workspaceId = req.tenant!.id;
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
  const workspaceId = req.tenant!.id;
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
