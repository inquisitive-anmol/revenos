import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../../../lib/api";
import { useCampaignStore } from "../../../../stores/campaign.store";
import { useLeads } from "../../../../hooks/useLeads";
import { useLeadStore } from "../../../../stores/lead.store";
import ActivityFeed from "../../../../components/dashboard/ActivityFeed";

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const { setActiveCampaign, activeCampaign } = useCampaignStore();
  const { fetchLeads } = useLeads();
  const { leads, loading: leadsLoading } = useLeadStore();

  const [localLoading, setLocalLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadBreakdown, setLeadBreakdown] = useState<Record<string, number>>({});

  // Fetch and poll campaign status
  useEffect(() => {
    if (!id) return;
    let didCancel = false;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/api/v1/campaigns/${id}/status`);
        if (!didCancel && res.data.data) {
          setActiveCampaign(res.data.data.campaign);
          setLeadBreakdown(res.data.data.leadBreakdown || {});
        }
      } catch (err) {
        // ignore background poll errors
      }
    };

    const initialFetch = async () => {
      setLocalLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/campaigns/${id}/status`);
        const payload = res.data.data || res.data;
        setActiveCampaign(payload.campaign);
        setLeadBreakdown(payload.leadBreakdown || {});

        // Fetch leads for the table below
        await fetchLeads({ campaignId: id });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLocalLoading(false);
      }
    };

    initialFetch();

    // Live monitor poll every 5 seconds
    const interval = setInterval(() => {
      fetchStatus();
      // Occasionally refresh leads table
      fetchLeads({ campaignId: id });
    }, 5000);

    return () => {
      didCancel = true;
      clearInterval(interval);
      setActiveCampaign(null);
    };
  }, [id, api, setActiveCampaign, fetchLeads]);

  // Orchestrator Action Dispatch
  const handleAction = async (action: 'start' | 'pause' | 'resume' | 'stop') => {
    if (!activeCampaign || toggleLoading) return;
    setToggleLoading(true);
    try {
      await api.post(`/api/v1/campaigns/${id}/${action}`);
      // Optimistic temporary status update (will be corrected by next poll tick if needed)
      const tmpStatus = action === 'start' || action === 'resume' ? 'active' : action === 'pause' ? 'paused' : 'draft';
      setActiveCampaign({ ...activeCampaign, status: tmpStatus });
    } catch (err: any) {
      console.error(`Failed to ${action} campaign:`, err.message);
    } finally {
      setToggleLoading(false);
    }
  };

  // Derived Pipeline Metrics
  const actualTotal = Object.values(leadBreakdown).reduce((a, b) => a + b, 0);
  const contacted = (leadBreakdown.outreach_sent || 0) + (leadBreakdown.follow_up_scheduled || 0) + (leadBreakdown.follow_up_sent || 0);
  const replies = (leadBreakdown.reply_received || 0) + (leadBreakdown.interested || 0) + (leadBreakdown.not_interested || 0);
  const booked = leadBreakdown.meeting_booked || 0;

  const emailsSent = Math.max(activeCampaign?.metrics?.emailsSent || 0, contacted);
  const repliesReceived = Math.max(activeCampaign?.metrics?.repliesReceived || 0, replies);
  const meetingsBooked = Math.max(activeCampaign?.metrics?.meetingsBooked || 0, booked);
  const leadsFound = actualTotal || activeCampaign?.metrics?.leadsFound || 0;
  
  const replyRate = emailsSent > 0
    ? ((repliesReceived / emailsSent) * 100).toFixed(1)
    : "0";

  // Recent 5 leads for this campaign
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case "meeting_booked": return <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">Meeting Booked</span>;
      case "qualified": return <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">Qualified</span>;
      case "contacted": 
      case "outreach_sent":
      case "follow_up_sent":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold">Contacted</span>;
      case "disqualified": return <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">Disqualified</span>;
      case "pending":
      case "qualifying":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">Prospecting</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-secondary text-xs font-bold">{status}</span>;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (localLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-secondary font-semibold">
          <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
          Loading campaign...
        </div>
      </div>
    );
  }

  if (error || !activeCampaign) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-on-surface font-bold text-lg">Campaign not found</p>
          <Link to="/campaigns" className="text-primary font-bold hover:underline">← Back to Campaigns</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-secondary uppercase tracking-widest mb-4">
          <Link to="/campaigns" className="hover:text-primary transition-colors">Campaigns</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{activeCampaign.name}</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {activeCampaign.name}
            </h1>
            {activeCampaign.status === "active" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active
              </span>
            ) : activeCampaign.status === "paused" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline text-secondary text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Paused
              </span>
            ) : activeCampaign.status === "completed" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Stopped
              </span>
            ) : (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-[11px] font-bold uppercase tracking-wider">
                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                 {activeCampaign.status}
               </span>
            )}
          </div>

            <div className="flex items-center gap-3">
             {/* Dynamic Orchestrator Control Buttons */}
             {activeCampaign.status === "draft" && (
                <button
                  onClick={() => handleAction('start')}
                  disabled={toggleLoading}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  Start Campaign
                </button>
             )}

             {activeCampaign.status === "active" && (
                <>
                  <button
                    onClick={() => handleAction('pause')}
                    disabled={toggleLoading}
                    className="bg-yellow-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-yellow-600 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">pause</span>
                    Pause
                  </button>
                  <button
                    onClick={() => handleAction('stop')}
                    disabled={toggleLoading}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">stop</span>
                    Stop Process
                  </button>
                </>
             )}

             {activeCampaign.status === "paused" && (
                <>
                  <button
                    onClick={() => handleAction('resume')}
                    disabled={toggleLoading}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    Resume
                  </button>
                  <button
                    onClick={() => handleAction('stop')}
                    disabled={toggleLoading}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">stop</span>
                    Stop Process
                  </button>
                </>
             )}

              <Link
                to={`/builder/${id}`}
                className="bg-surface text-on-surface border border-outline px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                Agent Builder
              </Link>

            <button
              onClick={() => navigate(`/campaigns/${id}/edit`)}
              className="bg-surface text-on-surface border border-outline px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low active:scale-95 transition-all flex items-center gap-2 ml-4"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
        </div>

        {/* Live KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">person_search</span>
              </div>
              <span className="bg-primary-container/60 text-primary text-xs font-bold px-2 py-1 rounded-md">Live</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">{leadsFound.toLocaleString()}</h3>
              <p className="text-secondary font-medium text-sm">Leads Found</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">reply</span>
              </div>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">{replyRate}%</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">{repliesReceived}</h3>
              <p className="text-secondary font-medium text-sm">Replies</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </div>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Live</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">{meetingsBooked}</h3>
              <p className="text-secondary font-medium text-sm">Meetings Booked</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <span className="bg-surface-container border border-outline text-secondary text-xs font-bold px-2.5 py-1 rounded-md">Total</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">{emailsSent.toLocaleString()}</h3>
              <p className="text-secondary font-medium text-sm">Emails Sent</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Lead Pipeline Funnel Area */}
          <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-on-surface">Lead Pipeline Funnel</h2>
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-container/30 py-1.5 px-3 rounded-full uppercase tracking-wider">
                 <span className="material-symbols-outlined text-[14px]">sensors</span>
                 Live Monitor
              </span>
            </div>
            
            <div className="flex-1 w-full min-h-[220px] flex flex-col justify-center gap-6">
               <div className="w-full">
                 <div className="flex justify-between text-xs font-bold text-secondary mb-2">
                   <span>Total Discovered Leads</span>
                   <span className="text-on-surface text-sm">{actualTotal}</span>
                 </div>
                 <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                   <div className="h-full bg-slate-300 rounded-full" style={{ width: '100%' }}></div>
                 </div>
               </div>

               <div className="w-full">
                 <div className="flex justify-between text-xs font-bold text-secondary mb-2">
                   <span>Contacted (Outreach Sent)</span>
                   <span className="text-on-surface text-sm">{contacted}</span>
                 </div>
                 <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: actualTotal ? `${(contacted/actualTotal)*100}%` : '0%' }}></div>
                 </div>
               </div>

               <div className="w-full">
                 <div className="flex justify-between text-xs font-bold text-secondary mb-2">
                   <span>Replies Received</span>
                   <span className="text-on-surface text-sm">{replies}</span>
                 </div>
                 <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: actualTotal ? `${(replies/actualTotal)*100}%` : '0%' }}></div>
                 </div>
               </div>

               <div className="w-full">
                 <div className="flex justify-between text-xs font-bold text-secondary mb-2">
                   <span>Meetings Booked</span>
                   <span className="text-on-surface text-sm">{booked}</span>
                 </div>
                 <div className="h-3 bg-surface-container-high rounded-full overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                   <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: actualTotal ? `${(booked/actualTotal)*100}%` : '0%' }}></div>
                 </div>
               </div>
            </div>
          </div>

          {/* Campaign Info Card + Live Activity Feed */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Campaign Info */}
            <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col gap-5">
              <h2 className="text-lg font-bold text-on-surface">Campaign Settings</h2>
              <div className="flex flex-col gap-4">
                <div className="border border-outline rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2">ICP Description</p>
                  <p className="text-sm text-on-surface font-medium leading-relaxed">
                    {activeCampaign.settings?.icpDescription || "No ICP defined"}
                  </p>
                </div>
                <div className="border border-outline rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-3">Daily Limits</p>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-on-surface">{activeCampaign.settings?.dailyEmailLimit || 50}</p>
                      <p className="text-xs text-secondary font-medium">Emails/day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-on-surface">{activeCampaign.settings?.timezone || "UTC"}</p>
                      <p className="text-xs text-secondary font-medium">Timezone</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-on-surface">
                        {new Date(activeCampaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-secondary font-medium">Created</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col" style={{ minHeight: '280px' }}>
              <ActivityFeed campaignId={id!} workspaceId={(activeCampaign as any).workspaceId ?? ''} />
            </div>

          </div>

        </div>

        {/* Live Leads Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-surface">Live Campaign Leads</h2>
            <Link to="/leads" className="text-primary text-sm font-bold hover:underline">
              View All Leads
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-surface-container-low/50 border-b border-outline">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Lead Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Company</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">ICP Score</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Updated</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {leadsLoading && recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Gathering Live Intel...
                      </div>
                    </td>
                  </tr>
                ) : recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-secondary">travel_explore</span>
                        <p className="text-secondary font-semibold text-sm">Awaiting prospector agent scan...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/leads/${lead._id}`} className="font-bold text-sm text-on-surface hover:text-primary transition-colors">
                          {lead.firstName} {lead.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary font-medium">{lead.company}</td>
                      <td className="px-6 py-4">{getLeadStatusBadge(lead.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: `${(lead.icpScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-on-surface">{lead.icpScore}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary font-medium">
                        {timeAgo(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline-variant hover:text-secondary transition-colors">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}