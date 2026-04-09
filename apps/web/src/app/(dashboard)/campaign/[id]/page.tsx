import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApi } from "../../../../lib/api";
import { useCampaignStore } from "../../../../stores/campaign.store";
import { useLeads } from "../../../../hooks/useLeads";
import { useLeadStore } from "../../../../stores/lead.store";

export default function CampaignDetailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const { setActiveCampaign, activeCampaign, campaigns } = useCampaignStore();
  const { fetchLeads } = useLeads();
  const { leads, loading: leadsLoading } = useLeadStore();

  const [localLoading, setLocalLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single campaign by id
  useEffect(() => {
    if (!id) return;

    const fetchCampaign = async () => {
      setLocalLoading(true);
      setError(null);
      try {
        // Use a functional check instead of depending on the whole campaigns array
        const res = await api.get(`/api/v1/campaigns/${id}`);
        setActiveCampaign(res.data.data || res.data);
        
        // Fetch leads for this campaign
        await fetchLeads({ campaignId: id });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchCampaign();

    // Cleanup on unmount
    return () => setActiveCampaign(null);
  }, [id, api, setActiveCampaign, fetchLeads]);

  // Toggle campaign status
  const handleToggleStatus = async () => {
    if (!activeCampaign || toggleLoading) return;
    setToggleLoading(true);
    try {
      const newStatus = activeCampaign.status === "active" ? "paused" : "active";
      await api.patch(`/api/v1/campaigns/${id}/status`, {
        status: newStatus,
      });
      setActiveCampaign({ ...activeCampaign, status: newStatus });
    } catch (err: any) {
      console.error("Failed to toggle status:", err.message);
    } finally {
      setToggleLoading(false);
    }
  };

  // Derived metrics
  const emailsSent = activeCampaign?.metrics?.emailsSent || 0;
  const repliesReceived = activeCampaign?.metrics?.repliesReceived || 0;
  const meetingsBooked = activeCampaign?.metrics?.meetingsBooked || 0;
  const leadsFound = activeCampaign?.metrics?.leadsFound || 0;
  const replyRate = emailsSent > 0
    ? ((repliesReceived / emailsSent) * 100).toFixed(1)
    : "0";

  // Recent 5 leads for this campaign
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Status badge for leads
  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case "meeting_booked":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">Meeting Booked</span>;
      case "qualified":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">Qualified</span>;
      case "contacted":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold">Contacted</span>;
      case "disqualified":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">Disqualified</span>;
      case "prospecting":
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">Prospecting</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-secondary text-xs font-bold">{status}</span>;
    }
  };

  // Time ago helper
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  // Loading state
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

  // Error state
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
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                {activeCampaign.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-5">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3 bg-surface border border-outline rounded-full pl-4 pr-1 py-1 shadow-sm">
              <span className="text-sm font-semibold text-secondary">
                {toggleLoading ? "Updating..." : "Status"}
              </span>
              <button
                onClick={handleToggleStatus}
                disabled={toggleLoading}
                className={`w-11 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ease-in-out disabled:opacity-50 ${activeCampaign.status === "active"
                    ? "bg-primary justify-end"
                    : "bg-slate-300 justify-start"
                  }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>

            <button
              onClick={() => navigate(`/campaigns/${id}/edit`)}
              className="bg-surface text-on-surface border border-outline px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Campaign
            </button>
          </div>
        </div>

        {/* KPI Cards — REAL DATA */}
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

          {/* Chart Area */}
          <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-on-surface">Daily Meetings Booked</h2>
              <button className="flex items-center gap-2 text-xs font-bold text-secondary hover:text-on-surface transition-colors">
                Last 30 Days
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              </button>
            </div>
            <div className="flex-1 w-full min-h-[220px] relative flex items-end">
              <div className="absolute top-1/2 w-full border-t border-dashed border-outline z-0"></div>
              <div className="flex w-full h-full items-end gap-0 relative z-10">
                {[15, 25, 25, 35, 45, 45, 60, 50, 50, 85, 40, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${i === 9 ? "bg-primary" : "bg-primary-fixed-dim/40"}`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Info Card */}
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
                    <p className="text-sm font-extrabold text-on-surface">
                      {activeCampaign.settings?.dailyEmailLimit || 50}
                    </p>
                    <p className="text-xs text-secondary font-medium">Emails/day</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-extrabold text-on-surface">
                      {activeCampaign.settings?.timezone || "UTC"}
                    </p>
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

        </div>

        {/* Recent Leads Table — REAL DATA */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-surface">Recent Leads</h2>
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
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Added</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {leadsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-secondary">group</span>
                        <p className="text-secondary font-semibold text-sm">No leads yet for this campaign</p>
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
                              className="h-full bg-primary rounded-full"
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