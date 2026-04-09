import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../../../hooks/useCampaigns";
import { useLeads } from "../../../hooks/useLeads";
import { useMeetings } from "../../../hooks/useMeetings";
import { useCampaignStore } from "../../../stores/campaign.store";
import { useLeadStore } from "../../../stores/lead.store";
import { useMeetingStore } from "../../../stores/meeting.store";
import { useActivityStore } from "../../../stores/activity.store";

export default function DashboardPage() {
  // Hooks
  const { fetchCampaigns } = useCampaigns();
  const { fetchLeads } = useLeads();
  const { fetchMeetings } = useMeetings();

  // Store data
  const { campaigns, loading: campaignsLoading } = useCampaignStore();
  const { leads, loading: leadsLoading } = useLeadStore();
  const { meetings } = useMeetingStore();
  const { activities } = useActivityStore();

  // Fetch all data on mount
  useEffect(() => {
    fetchCampaigns();
    fetchLeads();
    fetchMeetings();
  }, []);

  // Derived stats
  const totalLeads = leads.length;

  const emailsSent = campaigns.reduce(
    (sum, c) => sum + (c.metrics?.emailsSent || 0), 0
  );

  const repliesReceived = campaigns.reduce(
    (sum, c) => sum + (c.metrics?.repliesReceived || 0), 0
  );

  const replyRate = emailsSent > 0
    ? ((repliesReceived / emailsSent) * 100).toFixed(1)
    : "0";

  const meetingsBooked = meetings.length;

  // Recent 4 leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "meeting_booked":
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold text-[10px] rounded-full uppercase">Hot</span>;
      case "qualified":
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 font-bold text-[10px] rounded-full uppercase">Warm</span>;
      case "contacted":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full uppercase">New</span>;
      case "disqualified":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full uppercase">Cold</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full uppercase">{status}</span>;
    }
  };

  const isLoading = campaignsLoading || leadsLoading;

  return (
    <div className="p-4 md:p-8">
      {/* Global loading shimmer */}
      {isLoading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-secondary font-medium">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          Loading live data...
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1 — Emails Sent */}
          <div className="bg-surface border border-outline rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-secondary">Emails<br />Sent</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface mb-1">
                {isLoading ? "—" : emailsSent.toLocaleString()}
              </h3>
              <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Live
              </div>
            </div>
          </div>

          {/* Card 2 — Reply Rate */}
          <div className="bg-surface border border-outline rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-secondary">Reply<br />Rate %</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface mb-1">
                {isLoading ? "—" : `${replyRate}%`}
              </h3>
              <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Live
              </div>
            </div>
          </div>

          {/* Card 3 — Meetings Booked */}
          <div className="bg-surface border border-outline rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-secondary">Meetings<br />Booked</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">event_available</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface mb-1">
                {isLoading ? "—" : meetingsBooked}
              </h3>
              <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Live
              </div>
            </div>
          </div>

          {/* Card 4 — Total Leads */}
          <div className="bg-surface border border-outline rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-secondary">Total<br />Leads</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface mb-1">
                {isLoading ? "—" : totalLeads}
              </h3>
              <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Live
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* Left Column — Live Activity Feed */}
          <div className="xl:col-span-2 bg-surface border border-outline rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="px-6 py-5 border-b border-outline flex justify-between items-center">
              <h2 className="text-lg font-bold text-on-surface">Live Activity Feed</h2>
              <span className="px-3 py-1 bg-primary-container text-primary text-xs font-bold rounded-full">
                Real-time
              </span>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {activities.length === 0 && (
                <div className="text-secondary text-sm text-center py-10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[32px] opacity-40">bolt</span>
                  Waiting for live agent events...
                </div>
              )}
              {activities.map((act) => {
                const colorMap: Record<string, string> = {
                  prospector: 'bg-orange-100 text-orange-600',
                  qualifier: 'bg-blue-100 text-blue-600',
                  booker: 'bg-emerald-100 text-emerald-600',
                  searcher: 'bg-purple-100 text-purple-600',
                  system: 'bg-slate-100 text-slate-600',
                };
                const bgColor = colorMap[act.type] ?? 'bg-slate-100 text-slate-600';
                const msAgo = Math.floor((Date.now() - new Date(act.timestamp).getTime()) / 60000);
                const timeLabel = msAgo < 1 ? 'Just now' : `${msAgo} min${msAgo === 1 ? '' : 's'} ago`;
                return (
                  <div key={act.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                      {act.agentId}
                    </div>
                    <div>
                      <p className="text-sm text-on-surface font-medium">
                        {act.title}{act.details ? ' — ' : ''}
                        {act.details && <span className="text-primary font-semibold">{act.details}</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary font-medium">
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-[14px]">bolt</span>
                          Automated
                        </span>
                        <span>{timeLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">

            {/* Chart Card */}
            <div className="bg-surface border border-outline rounded-xl shadow-sm p-6">
              <h2 className="text-base font-bold text-on-surface mb-6">Meetings over time</h2>
              <div className="h-40 w-full flex items-end justify-between px-2 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/70 rounded-t-sm"
                      style={{ height: `${Math.floor(Math.random() * 80 + 20)}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[11px] font-semibold text-outline-variant uppercase">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Recent Leads Card */}
            <div className="bg-surface border border-outline rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-outline">
                <h2 className="text-base font-bold text-on-surface">Recent Leads</h2>
              </div>

              <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-outline bg-surface-container-low text-xs font-semibold text-secondary uppercase tracking-wider">
                <div className="col-span-6">Lead</div>
                <div className="col-span-3 text-center">Status</div>
                <div className="col-span-3 text-right">Score</div>
              </div>

              <div className="flex flex-col">
                {isLoading ? (
                  <div className="px-6 py-8 text-center text-sm text-secondary">Loading leads...</div>
                ) : recentLeads.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-secondary">No leads yet. Launch a campaign to get started.</div>
                ) : (
                  recentLeads.map((lead) => (
                    <div key={lead._id} className="grid grid-cols-12 gap-2 px-6 py-4 items-center border-b border-outline last:border-0 hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                      <div className="col-span-6">
                        <div className="text-sm font-semibold text-on-surface">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-xs text-secondary">{lead.company}</div>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        {getStatusBadge(lead.status)}
                      </div>
                      <div className="col-span-3 text-right text-sm font-bold text-on-surface">
                        {lead.icpScore}/10
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-3 border-t border-outline flex justify-center bg-surface-container-low/30">
                <Link to="/pipeline" className="text-primary text-xs font-bold hover:underline py-1">
                  View All Pipeline
                </Link>
              </div>
            </div>

            {/* Scale with AI CTA Card */}
            <div className="bg-primary rounded-xl p-6 shadow-sm relative overflow-hidden text-white">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <span className="material-symbols-outlined text-white mb-3 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h3 className="text-lg font-bold mb-2">Scale with AI</h3>
              <p className="text-sm text-primary-fixed-dim leading-relaxed mb-5">
                Connect your CRM to automatically sync high-intent leads to your pipeline.
              </p>
              <button className="bg-white text-primary text-sm font-bold py-2.5 px-5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                Set up CRM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}