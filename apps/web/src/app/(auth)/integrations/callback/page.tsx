import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '../../../../hooks/useIntegrations';

type Status = 'loading' | 'success' | 'error';

export default function IntegrationsCallbackPage() {
  const navigate = useNavigate();
  const { exchangeCode } = useIntegrations();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [connectedType, setConnectedType] = useState<'email' | 'calendar' | null>(null);
  const hasRun = useRef(false); // prevent double-fire in React strict mode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error) {
      setErrorMsg(
        error === 'access_denied'
          ? 'You declined the permissions request. Please try connecting again.'
          : `Connection failed: ${error}`
      );
      setStatus('error');
      return;
    }

    if (!code || !state) {
      setErrorMsg('Missing required parameters (code or state). Please try again from Settings.');
      setStatus('error');
      return;
    }

    exchangeCode(code, state)
      .then((data) => {
        setConnectedType(data.type);
        setStatus('success');
        // Redirect to settings after 2.5s
        setTimeout(() => navigate('/settings'), 2500);
      })
      .catch((err: any) => {
        setErrorMsg(err?.response?.data?.error ?? err.message ?? 'Something went wrong. Please try again.');
        setStatus('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-outline rounded-2xl p-8 shadow-lg text-center">

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
            </div>
            <h1 className="text-lg font-bold text-on-surface mb-2">Connecting your account…</h1>
            <p className="text-sm text-secondary">Finalizing the integration with Nylas. This only takes a moment.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[32px] text-green-600">check_circle</span>
            </div>
            <h1 className="text-lg font-bold text-on-surface mb-2">
              {connectedType === 'calendar' ? 'Calendar Connected!' : 'Email Account Connected!'}
            </h1>
            <p className="text-sm text-secondary mb-5">
              {connectedType === 'calendar'
                ? 'The Booker agent can now check your availability and schedule meetings.'
                : 'RevenOS will now send outreach emails through your connected mailbox.'}
            </p>
            <p className="text-xs text-secondary flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Redirecting you back to Settings…
            </p>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[32px] text-red-500">error</span>
            </div>
            <h1 className="text-lg font-bold text-on-surface mb-2">Connection Failed</h1>
            <p className="text-sm text-secondary mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/settings')}
              className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-on-primary-fixed-variant transition-all active:scale-95"
            >
              Back to Settings
            </button>
          </>
        )}

      </div>
    </div>
  );
}
