import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "../../../../hooks/useCampaigns";
import { useCampaignStore, type Campaign } from "../../../../stores/campaign.store";

export default function CampaignsPage() {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const { fetchCampaigns, updateCampaignStatus } = useCampaigns();
  const { campaigns, loading } = useCampaignStore();

  // Fetch on mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Derived metrics
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  const totalLeadsContacted = campaigns.reduce((sum, c) => sum + (c.metrics?.emailsSent || 0), 0);
  const totalMeetings = campaigns.reduce((sum, c) => sum + (c.metrics?.meetingsBooked || 0), 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + (c.metrics?.repliesReceived || 0), 0);
  const replyRate = totalLeadsContacted > 0
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
            Paused
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-bold">
            Draft
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const handleLaunchCampaign = async (campaignId: string) => {
    try {
      await updateCampaignStatus(campaignId, "active");
      await fetchCampaigns();
    } catch (err: any) {
      console.error("Failed to launch:", err.message);
    }
  };



  return (
    <div className="p-4 md:p-8 pb-2 flex-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Campaigns</h1>
          <p className="text-secondary font-medium">Manage and monitor your precision outreach velocity.</p>
        </div>
        <Link to="/campaigns/create" className="w-full md:w-auto justify-center bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          New Campaign
        </Link>
      </div>

      {/* Metrics Summary Rows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">Active Campaigns</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-on-surface tracking-tight">
              {loading ? "—" : activeCampaigns.length}
            </span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">Emails Sent</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-on-surface tracking-tight">
              {loading ? "—" : totalLeadsContacted.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">Reply Rate</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-on-surface tracking-tight">
              {loading ? "—" : `${replyRate}%`}
            </span>
            <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(replyRate), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between h-[120px]">
          <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">Meetings Booked</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-on-surface tracking-tight">
              {loading ? "—" : totalMeetings}
            </span>
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
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
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
      </div>

      {/* Campaigns Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface-container-low border-b border-outline text-[11px] font-bold text-secondary uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Emails Sent</th>
                <th className="px-6 py-4">Replies</th>
                <th className="px-6 py-4">Reply Rate</th>
                <th className="px-6 py-4">Meetings</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary font-medium">
                    Loading campaigns...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary font-medium">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign: any) => {
                  const sent = campaign.metrics?.emailsSent || 0;
                  const replies = campaign.metrics?.repliesReceived || 0;
                  const meetings = campaign.metrics?.meetingsBooked || 0;
                  const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0";

                  return (
                    <tr key={campaign._id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-on-surface">{campaign.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-5 font-semibold text-on-surface text-sm">
                        {sent.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-sm text-on-surface">{replies}</span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-primary">{rate}%</span>
                          <div className="w-24 h-1 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(parseFloat(rate), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-sm text-on-surface">
                        {meetings}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {campaign.status === "draft" && (
                            <button
                              onClick={() => handleLaunchCampaign(campaign._id)}
                              className="bg-primary text-white p-2 rounded-lg"
                            >
                              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                            </button>
                          )}
                          <Link
                            to={`/campaigns/${campaign._id}`}
                            className="text-primary text-sm font-bold hover:underline"
                          >
                            Details
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
      </div>
    </div>
  );
}