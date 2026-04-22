import { useState, useCallback } from 'react';
import { useApi } from '../lib/api';

export interface IntegrationStatus {
  connected: boolean;
  provider?: 'google' | 'microsoft';
  email?: string;
  channel?: string;
  connectedAt?: string;
}

export interface IntegrationsState {
  email: IntegrationStatus;
  calendar: IntegrationStatus;
  slack: IntegrationStatus;
}

const DEFAULT_STATE: IntegrationsState = {
  email:    { connected: false },
  calendar: { connected: false },
  slack:    { connected: false },
};

export function useIntegrations() {
  const api = useApi();
  const [integrations, setIntegrations] = useState<IntegrationsState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<'email' | 'calendar' | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/integrations');
      setIntegrations(res.data.data ?? DEFAULT_STATE);
    } catch {
      // silently fail — UI handles empty state
    } finally {
      setLoading(false);
    }
  }, [api]);

  // ── Nylas Hosted OAuth ──────────────────────────────────────────────────────

  /**
   * Initiates the Nylas OAuth flow for the given type.
   * Fetches the auth URL from the backend, then redirects the browser to Nylas.
   * The user will be sent back to /integrations/callback after approval.
   */
  const connectViaOAuth = useCallback(async (type: 'email' | 'calendar') => {
    setConnecting(type);
    try {
      const res = await api.get(`/api/v1/integrations/auth-url?type=${type}`);
      const url: string = res.data?.data?.url;
      if (!url) throw new Error('No auth URL returned from server');
      window.location.href = url;
    } catch (err: any) {
      setConnecting(null);
      throw new Error(err?.response?.data?.error ?? err.message ?? 'Failed to start OAuth flow');
    }
    // Note: connecting state is intentionally left set — the page will redirect away
  }, [api]);

  /**
   * Called by the /integrations/callback page.
   * Sends the code + state to the backend to exchange for a grant_id.
   */
  const exchangeCode = useCallback(async (code: string, state: string) => {
    const res = await api.post('/api/v1/integrations/exchange', { code, state });
    return res.data?.data as { type: 'email' | 'calendar'; provider: string; email?: string; connectedAt: string };
  }, [api]);

  // ── Disconnect helpers ──────────────────────────────────────────────────────

  const disconnectEmail = useCallback(async () => {
    await api.patch('/api/v1/integrations/email', { action: 'disconnect' });
    setIntegrations((s) => ({ ...s, email: { connected: false } }));
  }, [api]);

  const disconnectCalendar = useCallback(async () => {
    await api.patch('/api/v1/integrations/calendar', { action: 'disconnect' });
    setIntegrations((s) => ({ ...s, calendar: { connected: false } }));
  }, [api]);

  const disconnectSlack = useCallback(async () => {
    await api.patch('/api/v1/integrations/slack', { action: 'disconnect' });
    setIntegrations((s) => ({ ...s, slack: { connected: false } }));
  }, [api]);

  return {
    integrations,
    loading,
    connecting,
    fetchIntegrations,
    connectViaOAuth,
    exchangeCode,
    disconnectEmail,
    disconnectCalendar,
    disconnectSlack,
  };
}
