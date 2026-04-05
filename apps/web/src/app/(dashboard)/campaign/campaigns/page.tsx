import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../../../../hooks/useCampaigns";
import { useCampaignStore, type Campaign } from "../../../../stores/campaign.store";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const { fetchCampaigns } = useCampaigns();
  const { campaigns, loading, error } = useCampaignStore();

  // Fetch on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Derived metrics
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const totalLeadsContacted = campaigns.reduce((sum, c) => sum + (c.metrics?.emailsSent || 0), 0);
  const totalMeetings = campaigns.reduce((sum, c) => sum + (c.metrics?.meetingsBooked || 0), 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + (c.metrics?.repliesReceived || 0), 0);
  const qualificationRate = totalLeadsContacted > 0
    ? ((totalReplies / totalLeadsContacted) * 100).toFixed(1)
    : "0";

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesTab =
      activeTab === "All" ||
      c.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      filterQuery === "" ||
      c.name.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Status badge
  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Active
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-outline text-secondary text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Paused
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            Draft
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const { updateCampaignStatus } = useCampaigns();

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      await updateCampaignStatus(campaignId, "active");
      await fetchCampaigns();
    } catch (err: any) {
      console.error("Failed to launch:", err.message);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await updateCampaignStatus(campaignId, "paused");
      await fetchCampaigns();
    } catch (err: any) {
      console.error("Failed to pause:", err.message);
    }
  };


  // Meetings trend icon
  const getMeetingsTrend = (meetings: number) => {
    if (meetings > 20) return <span className="material-symbols-outlined text-green-500 text-[16px]">trending_up</span>;
    if (meetings > 5) return <span className="material-symbols-outlined text-secondary text-[16px]">remove</span>;
    return <span className="material-symbols-outlined text-error text-[16px]">trending_down</span>;
  };

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 h-16 bg-surface border-b border-outline flex justify-between items-center px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-primary">
            Revenos
          </Link>
          <div className="hidden md:flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline w-72 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <span className="material-symbols-outlined text-secondary text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-secondary font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative w-9 h-9 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-full active:scale-95">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-full active:scale-95">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
          </button>
          <button className="w-9 h-9 rounded-full bg-[#115e59] flex items-center justify-center overflow-hidden border border-outline shadow-sm ml-2">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Executive&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover scale-110 translate-y-1" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-outline bg-surface-container-low/30 flex flex-col p-4 z-40">
        <div className="mb-4 px-2 mt-2">
          <h3 className="text-[11px] uppercase tracking-widest text-secondary font-bold mb-4">Main Menu</h3>
          <nav className="space-y-1.5">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-on-surface hover:bg-surface rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">grid_view</span>
              Dashboard
            </Link>
            <Link to="/agents" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-on-surface hover:bg-surface rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              Agents
            </Link>
            <Link to="/campaigns" className="flex items-center gap-3 px-3 py-2.5 bg-primary-container/50 text-primary rounded-lg transition-all font-semibold text-sm shadow-sm">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              Campaigns
            </Link>
            <Link to="/pipeline" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-on-surface hover:bg-surface rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">alt_route</span>
              Pipeline
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-on-surface hover:bg-surface rounded-lg transition-all font-semibold text-sm">
              <span className="material-symbols-outlined text-[22px]">settings</span>
              Settings
            </Link>
          </nav>
        </div>

        <div className="mt-auto border-t border-outline pt-5 px-2">
          <Link to="/campaigns/create" className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            New Campaign
          </Link>
          <Link to="/help" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-on-surface hover:bg-surface rounded-lg transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">contact_support</span>
            Help Center
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 flex-1 flex flex-col min-h-screen">
        <div className="p-8 pb-2 flex-1">

          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Campaigns</h1>
              <p className="text-secondary font-medium">Manage and monitor your precision outreach velocity.</p>
            </div>
            <Link to="/campaigns/create" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              New Campaign
            </Link>
          </div>

          {/* Metrics Summary — REAL DATA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Active Campaigns</span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : activeCampaigns.length}
                </span>
                <span className="text-green-700 flex items-center text-xs font-bold bg-green-100 px-2.5 py-1 rounded-lg gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                  Live
                </span>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Emails Sent</span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : totalLeadsContacted.toLocaleString()}
                </span>
                <span className="text-primary flex items-center text-xs font-bold bg-primary-container/60 px-2.5 py-1 rounded-lg">
                  Live
                </span>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Reply Rate</span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : `${qualificationRate}%`}
                </span>
                <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-tertiary rounded-full"
                    style={{ width: `${Math.min(parseFloat(qualificationRate), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Meetings Booked</span>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : totalMeetings}
                </span>
                <span className="text-primary text-xs font-bold mb-1.5">Total</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-surface p-4 rounded-xl border border-outline mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-sm font-medium placeholder:text-secondary"
                  placeholder="Filter by campaign name..."
                />
              </div>

              <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline">
                {["All", "Active", "Paused", "Draft"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === tab ? "bg-surface shadow-sm text-primary" : "text-secondary hover:text-on-surface"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all bg-surface">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all bg-surface">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                More Filters
              </button>
            </div>
          </div>

          {/* Campaigns Table — REAL DATA */}
          <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-surface-container-low border-b border-outline">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Campaign Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Emails Sent</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Replies</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Reply Rate</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary">Meetings</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline">

                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-secondary font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                          Loading campaigns...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-error font-medium">
                        Failed to load campaigns. Please try again.
                      </td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[40px] text-secondary">campaign</span>
                          <p className="text-secondary font-semibold">No campaigns found</p>
                          <Link to="/campaigns/create" className="text-primary text-sm font-bold hover:underline">
                            Create your first campaign →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((campaign: any) => {
                      const sent = campaign.metrics?.emailsSent || 0;
                      const replies = campaign.metrics?.repliesReceived || 0;
                      const meetings = campaign.metrics?.meetingsBooked || 0;
                      const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0";
                      const updatedAt = new Date(campaign.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
                      });

                      return (
                        <tr key={campaign._id} className="hover:bg-surface-container-low/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-on-surface">{campaign.name}</span>
                              <span className="text-xs text-secondary mt-0.5 font-medium">Created {updatedAt}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="px-6 py-5 font-semibold text-on-surface text-sm">
                            {sent.toLocaleString()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-on-surface">{replies}</span>
                              <span className={`text-xs font-bold mt-0.5 ${parseFloat(rate) > 10 ? "text-primary" : "text-secondary"}`}>
                                {rate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(parseFloat(rate), 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-on-surface">{meetings}</span>
                              {getMeetingsTrend(meetings)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {campaign.status === "draft" && (
                                <button
                                  onClick={() => handleLaunchCampaign(campaign._id)}
                                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.95] transition-all flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                                  Launch
                                </button>
                              )}
                              {campaign.status === "active" && (
                                <button
                                  onClick={() => handlePauseCampaign(campaign._id)}
                                  className="bg-surface border border-outline text-secondary px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-low active:scale-[0.95] transition-all flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-[16px]">pause</span>
                                  Pause
                                </button>
                              )}
                              <Link
                                to={`/campaigns/${campaign._id}`}
                                className="bg-surface border border-outline hover:border-primary hover:text-primary hover:bg-primary-container/10 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-[0.95]"
                              >
                                View Details
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-5 bg-surface-container-low border-t border-outline flex items-center justify-between">
              <span className="text-[13px] font-semibold text-secondary">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-outline rounded-lg bg-surface text-secondary hover:text-primary hover:border-primary transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline rounded-lg bg-surface text-secondary hover:text-primary hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-outline bg-surface py-5 px-8 flex justify-between items-center text-xs text-secondary font-medium shrink-0">
          <div className="flex items-center gap-6">
            <span>© 2025 Revenos. All rights reserved.</span>
            <div className="flex gap-5">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/api-status" className="hover:text-primary transition-colors">API Status</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-secondary">All systems operational</span>
          </div>
        </footer>
      </main>
    </div>
  );
}