import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { io, Socket } from 'socket.io-client';

interface AgentLogEvent {
  timestamp: string;
  agentType: string;
  message: string;
  leadName?: string;
  event?: string;
}

const AGENT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  prospector: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'person_search' },
  qualifier:  { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'mark_email_read' },
  booker:     { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'calendar_month' },
  system:     { bg: 'bg-surface-container', text: 'text-secondary', icon: 'info' },
};

function getAgentMeta(event: string) {
  if (event?.startsWith('prospector')) return AGENT_COLORS.prospector;
  if (event?.startsWith('qualifier'))  return AGENT_COLORS.qualifier;
  if (event?.startsWith('booker'))     return AGENT_COLORS.booker;
  return AGENT_COLORS.system;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

interface ActivityFeedProps {
  campaignId: string;
  workspaceId: string;
}

export default function ActivityFeed({ campaignId, workspaceId }: ActivityFeedProps) {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<AgentLogEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let socket: Socket;

    const connect = async () => {
      const token = await getToken();
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      socket = io(apiUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      socket.on('agent.log', (data: AgentLogEvent) => {
        // Only show logs for this campaign
        setLogs((prev) => [...prev.slice(-99), data]); // Keep last 100
      });
    };

    connect();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [campaignId, workspaceId]);

  // Auto-scroll to latest
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-on-surface">Live Agent Feed</h3>
        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          connected ? 'bg-green-50 text-green-700' : 'bg-surface-container text-secondary'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="material-symbols-outlined text-[32px] text-outline-variant mb-2">sensors</span>
            <p className="text-xs font-semibold text-secondary">Waiting for agent activity...</p>
          </div>
        )}
        {logs.map((log, i) => {
          const meta = getAgentMeta(log.event ?? log.agentType);
          return (
            <div key={i} className={`rounded-xl p-3 ${meta.bg} flex gap-3 items-start`}>
              <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${meta.text}`}>
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${meta.text}`}>
                    {log.agentType || 'system'}
                  </span>
                  <span className="text-[10px] text-secondary font-medium flex-shrink-0">
                    {timeAgo(log.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-on-surface font-medium leading-snug">{log.message}</p>
                {log.leadName && (
                  <p className="text-[10px] text-secondary mt-0.5">Lead: {log.leadName}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
