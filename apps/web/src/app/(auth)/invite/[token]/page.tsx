import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { useWorkspaceStore } from '../../../../stores/workspace.store';
import { useApi } from '../../../../lib/api';

interface InviteInfo {
  name: string;
  plan: string;
}

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { setActiveWorkspace } = useWorkspaceStore();
  const api = useApi();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'done' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch workspace info for the invite token (public endpoint)
  useEffect(() => {
    if (!token) return;
    api.get(`/api/v1/workspaces/invite/${token}`)
      .then((res) => {
        setInviteInfo(res.data?.data?.workspace);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.error?.message ?? 'Invalid or expired invite link');
        setStatus('error');
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token || !isSignedIn) return;
    setStatus('accepting');
    try {
      const res = await api.post(`/api/v1/workspaces/invite/${token}/accept`);
      const { workspaceId } = res.data?.data ?? {};
      if (workspaceId) {
        setActiveWorkspace(workspaceId);
      }
      setStatus('done');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error?.message ?? 'Failed to accept invite');
      setStatus('error');
    }
  };

  if (!isLoaded || status === 'loading') {
    return (
      <div className="invite-container">
        <div className="invite-card">
          <div className="invite-spinner" />
          <p>Loading invite...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="invite-container">
        <div className="invite-card invite-card--error">
          <span className="material-symbols-outlined invite-icon">link_off</span>
          <h1>Invalid Invite</h1>
          <p>{errorMsg}</p>
          <button onClick={() => navigate('/')} className="invite-btn">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="invite-container">
        <div className="invite-card invite-card--success">
          <span className="material-symbols-outlined invite-icon">check_circle</span>
          <h1>You're In!</h1>
          <p>Redirecting to your new workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invite-container">
      <div className="invite-card">
        <span className="material-symbols-outlined invite-icon">group_add</span>
        <h1>You've been invited</h1>
        {inviteInfo && (
          <p className="invite-workspace-name">
            Join <strong>{inviteInfo.name}</strong>
          </p>
        )}

        {!isSignedIn ? (
          <div className="invite-auth-prompt">
            <p>Sign in to accept this invite</p>
            <SignInButton mode="modal">
              <button className="invite-btn">Sign In to Accept</button>
            </SignInButton>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={status === 'accepting'}
            className="invite-btn"
          >
            {status === 'accepting' ? 'Accepting...' : 'Accept Invite'}
          </button>
        )}
      </div>
    </div>
  );
}
