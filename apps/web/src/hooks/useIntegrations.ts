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

  // For dev/testing: manually save email integration (in production this would be via Nylas OAuth callback)
  const saveEmailIntegration = useCallback(async (email: string, provider: 'google' | 'microsoft' = 'google') => {
    await api.patch('/api/v1/integrations/email', { provider, email, action: 'connect' });
    setIntegrations((s) => ({
      ...s,
      email: { connected: true, provider, email, connectedAt: new Date().toISOString() },
    }));
  }, [api]);

  return {
    integrations,
    loading,
    fetchIntegrations,
    disconnectEmail,
    disconnectCalendar,
    disconnectSlack,
    saveEmailIntegration,
  };
}
