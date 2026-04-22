import { useEffect } from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import toast from 'react-hot-toast';

function formatDate(ts?: string) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface IntegrationCardProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  connected: boolean;
  connectedAs?: string;
  connectedAt?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  connectLabel?: string;
  badge?: string;
  isConnecting?: boolean;
}

function IntegrationCard({
  icon, iconBg, title, subtitle, connected, connectedAs, connectedAt,
  onConnect, onDisconnect, connectLabel = 'Connect', badge, isConnecting
}: IntegrationCardProps) {
  return (
    <div className={`bg-surface rounded-2xl border p-6 flex items-start gap-5 transition-all ${connected ? 'border-green-200 shadow-sm shadow-green-50' : 'border-outline'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[22px] ${iconBg}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          {badge && (
            <span className="text-[10px] bg-surface-container text-secondary px-2 py-0.5 rounded-full font-semibold">{badge}</span>
          )}
          {connected && (
            <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </span>
          )}
        </div>
        <p className="text-xs text-secondary font-medium">{subtitle}</p>
        {connected && connectedAs && (
          <p className="text-xs text-on-surface font-semibold mt-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
            {connectedAs}
            {connectedAt && <span className="text-secondary font-normal ml-1">· since {formatDate(connectedAt)}</span>}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        {connected ? (
          <button
            onClick={onDisconnect}
            className="px-4 py-2 border border-outline text-secondary text-xs font-bold rounded-lg hover:border-error hover:text-error hover:bg-error/5 transition-all active:scale-95"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-on-primary-fixed-variant transition-all active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-wait flex items-center gap-2"
          >
            {isConnecting && (
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            )}
            {isConnecting ? 'Redirecting...' : connectLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsTab() {
  const {
    integrations, loading, connecting,
    fetchIntegrations,
    connectViaOAuth,
    disconnectEmail, disconnectCalendar, disconnectSlack,
  } = useIntegrations();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectEmail = async () => {
    try {
      await connectViaOAuth('email');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to start email connection');
    }
  };

  const handleConnectCalendar = async () => {
    try {
      await connectViaOAuth('calendar');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to start calendar connection');
    }
  };

  const handleDisconnectEmail = async () => {
    try { await disconnectEmail(); toast.success('Email disconnected'); }
    catch { toast.error('Failed to disconnect email'); }
  };
  const handleDisconnectCalendar = async () => {
    try { await disconnectCalendar(); toast.success('Calendar disconnected'); }
    catch { toast.error('Failed to disconnect calendar'); }
  };
  const handleDisconnectSlack = async () => {
    try { await disconnectSlack(); toast.success('Slack disconnected'); }
    catch { toast.error('Failed to disconnect Slack'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-on-surface">Integrations</h2>
        <p className="text-sm text-secondary mt-1">
          Connect your workspace tools once — all campaigns share these connections.
        </p>
      </div>

      {/* Email */}
      <IntegrationCard
        icon="mail"
        iconBg="bg-red-500"
        title="Email Account"
        subtitle="Used to send all outreach emails across your campaigns via Nylas."
        connected={integrations.email.connected}
        connectedAs={integrations.email.email}
        connectedAt={integrations.email.connectedAt}
        onDisconnect={handleDisconnectEmail}
        onConnect={handleConnectEmail}
        connectLabel="Connect Email"
        isConnecting={connecting === 'email'}
      />

      {/* Calendar */}
      <IntegrationCard
        icon="calendar_month"
        iconBg="bg-blue-500"
        title="Calendar"
        subtitle="Used by the Booker agent to check availability and schedule meetings via Nylas."
        connected={integrations.calendar.connected}
        connectedAt={integrations.calendar.connectedAt}
        onDisconnect={handleDisconnectCalendar}
        onConnect={handleConnectCalendar}
        connectLabel="Connect Calendar"
        isConnecting={connecting === 'calendar'}
      />

      {/* Slack */}
      <IntegrationCard
        icon="forum"
        iconBg="bg-purple-600"
        title="Slack"
        subtitle="Receive alerts when meetings are booked or agents escalate to human review."
        connected={integrations.slack.connected}
        connectedAs={integrations.slack.channel ? `#${integrations.slack.channel}` : undefined}
        connectedAt={integrations.slack.connectedAt}
        onDisconnect={handleDisconnectSlack}
        onConnect={() => toast('Slack integration — configure webhook URL in env first.', { icon: 'ℹ️' })}
        connectLabel="Connect Slack"
        badge="Optional"
      />

      <div className="pt-4 border-t border-outline">
        <div className="flex items-start gap-3 text-xs text-secondary">
          <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">lock</span>
          <p>
            All integration tokens are stored server-side and never exposed to the client.
            OAuth flows are handled by <strong>Nylas</strong>. Your credentials are encrypted and scoped to this workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
