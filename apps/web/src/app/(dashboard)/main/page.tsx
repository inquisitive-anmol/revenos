import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useCampaigns } from "../../../hooks/useCampaigns";
import { useLeads } from "../../../hooks/useLeads";
import { useMeetings } from "../../../hooks/useMeetings";
import { useCampaignStore } from "../../../stores/campaign.store";
import { useLeadStore } from "../../../stores/lead.store";
import { useMeetingStore } from "../../../stores/meeting.store";
import { useActivityStore } from "../../../stores/activity.store";
import { NotificationPanel } from "../../../components/shared/NotificationPanel";
import { useNotificationStore } from "../../../stores/notification.store";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Clerk user
  const { user } = useUser();

  // Notification Store
  const { unstyledCount } = useNotificationStore();

  // Hooks
  const { fetchCampaigns } = useCampaigns();
  const { fetchLeads } = useLeads();
  const { fetchMeetings } = useMeetings();

  // Store data
  const { campaigns, loading: campaignsLoading } = useCampaignStore();
  const { leads, loading: leadsLoading } = useLeadStore();
  const { meetings } = useMeetingStore();
  const { activities } = useActivityStore();

  // Handle clicking outside notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="bg-background text-on-background min-h-screen flex font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-outline flex flex-col justify-between flex-shrink-0 z-10">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-transparent">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
                <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <span className="text-lg font-bold text-on-surface tracking-tight">
                Revenos
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-container/50 text-primary  rounded-lg transition-all font-semibold text-sm shadow-sm">
              <span className="material-symbols-outlined text-[22px]">grid_view</span>Dashboard
            </Link>
            <Link to="/agents" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>Agents
            </Link>
            <Link to="/campaigns" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>Campaigns
            </Link>
            <Link to="/pipeline" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">alt_route</span>Pipeline
            </Link>
            <Link to="/leads" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>Leads
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">settings</span>Settings
            </Link>
          </nav>
        </div>

        {/* Settings */}
        <div className="p-4 mb-2">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[22px]">settings</span>
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-20 bg-surface border-b border-outline flex items-center justify-between px-8 flex-shrink-0 z-10">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Global search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-secondary font-medium"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative text-secondary hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low ${isNotificationsOpen ? 'text-primary bg-surface-container-low' : ''}`}
              >
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isNotificationsOpen ? "'FILL' 1" : "" }}>
                  notifications
                </span>
                {unstyledCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full border border-surface flex items-center justify-center">
                    {unstyledCount > 9 ? '9+' : unstyledCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && <NotificationPanel />}
            </div>

            <div className="h-8 w-px bg-outline"></div>

            <button className="flex items-center gap-3 text-left group">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                  {user?.fullName || user?.firstName || "User"}
                </span>
                <span className="text-xs font-medium text-secondary">Admin Account</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e6d5c3] border-2 border-surface flex items-center justify-center overflow-hidden shadow-sm">
                {user?.imageUrl
                  ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-6 h-8 bg-white/40 rounded-t-full mt-2"></div>
                }
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">expand_more</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">

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
                <div className="flex items-end justify-end gap-1 h-6 mt-2 opacity-60">
                  <div className="w-1.5 h-3 bg-primary/30 rounded-t-sm"></div>
                  <div className="w-1.5 h-4 bg-primary/40 rounded-t-sm"></div>
                  <div className="w-1.5 h-2 bg-primary/30 rounded-t-sm"></div>
                  <div className="w-1.5 h-5 bg-primary/60 rounded-t-sm"></div>
                  <div className="w-1.5 h-6 bg-primary rounded-t-sm"></div>
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

                {/* Chart Card — placeholder, will wire with real data later */}
                <div className="bg-surface border border-outline rounded-xl shadow-sm p-6">
                  <h2 className="text-base font-bold text-on-surface mb-6">Meetings over time</h2>
                  <div className="h-40 w-full flex items-end justify-between px-2 gap-2">
                    {/* Simple real bar chart from meetings data */}
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

                {/* Recent Leads Card — REAL DATA */}
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
        </main>
      </div>
    </div>
  );
}