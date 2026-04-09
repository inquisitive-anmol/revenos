import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLeads } from "../../../../hooks/useLeads";
import { useLeadStore, type Lead } from "../../../../stores/lead.store";

const getScoreColor = (score: number) => {
  const pct = score * 10;
  if (pct >= 80) return { badge: "bg-green-50 border-green-100 text-green-700", bars: ["bg-green-500", "bg-green-500", "bg-green-500"] };
  if (pct >= 50) return { badge: "bg-amber-50 border-amber-100 text-amber-700", bars: ["bg-amber-500", "bg-amber-500", "bg-surface-container-highest"] };
  return { badge: "bg-red-50 border-red-100 text-red-700", bars: ["bg-red-500", "bg-surface-container-highest", "bg-surface-container-highest"] };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "meeting_booked":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold rounded-full">Meeting Booked</span>;
    case "qualified":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-primary text-[11px] font-bold rounded-full">Qualified</span>;
    case "contacted":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 text-[11px] font-bold rounded-full">Contacted</span>;
    case "disqualified":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-100 text-[11px] font-bold rounded-full">Disqualified</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-outline text-secondary text-[11px] font-bold rounded-full">Prospecting</span>;
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
};

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [scoreFilter, setScoreFilter] = useState("All Scores");

  const navigate = useNavigate();
  const { fetchLeads } = useLeads();
  const { leads, loading, error } = useLeadStore();

  useEffect(() => {
    fetchLeads();
  }, []);

  // Derived metrics
  const qualifiedLeads = leads.filter(l => l.status === "qualified" || l.status === "meeting_booked");
  const contactedLeads = leads.filter(l => l.status === "contacted");
  const conversionRate = leads.length > 0
    ? ((qualifiedLeads.length / leads.length) * 100).toFixed(1)
    : "0";

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === "All Statuses" ||
      l.status === statusFilter.toLowerCase().replace(" ", "_");

    const score = l.icpScore * 10;
    const matchesScore =
      scoreFilter === "All Scores" ||
      (scoreFilter === "High Score (80+)" && score >= 80) ||
      (scoreFilter === "Med Score (40-79)" && score >= 40 && score < 80) ||
      (scoreFilter === "Low Score (<40)" && score < 40);

    return matchesStatus && matchesScore;
  });

  return (
    <div className="p-4 md:p-8 pb-2 flex-1">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Header Card */}
        <div className="md:col-span-2 lg:col-span-1 bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-1.5">Leads Inventory</h1>
            <p className="text-sm font-medium text-secondary leading-relaxed">Manage and nurture your high-velocity pipeline.</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              to="/campaigns/create"
              className="flex-1 bg-primary text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Lead
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest mb-1.5 text-white/80">Qualified Leads</p>
                <h3 className="text-4xl font-black text-white tracking-tight">
                  {loading ? "—" : qualifiedLeads.length}
                </h3>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[140px] text-white/5 rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
            <div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Conversion Rate</p>
              <h3 className="text-4xl font-black text-on-surface tracking-tight">
                {loading ? "—" : `${conversionRate}%`}
              </h3>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-6 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
            <div>
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Active Outreach</p>
              <h3 className="text-4xl font-black text-on-surface tracking-tight">
                {loading ? "—" : contactedLeads.length}
              </h3>
            </div>
            <div className="flex -space-x-2 mt-6">
               {leads.slice(0, 3).map((l) => (
                  <div key={l._id} className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[9px] font-bold text-primary">
                    {l.firstName?.[0]}{l.lastName?.[0]}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-outline rounded-lg px-4 py-2.5 text-sm font-semibold text-on-surface outline-none"
            >
              <option>All Statuses</option>
              <option>Prospecting</option>
              <option>Contacted</option>
              <option>Qualified</option>
              <option>Meeting Booked</option>
              <option>Disqualified</option>
            </select>

            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-surface border border-outline rounded-lg px-4 py-2.5 text-sm font-semibold text-on-surface outline-none"
            >
              <option>All Scores</option>
              <option>High Score (80+)</option>
              <option>Med Score (40-79)</option>
              <option>Low Score (&lt;40)</option>
            </select>
          </div>
          <p className="text-xs font-semibold text-secondary">
            {filteredLeads.length} results found
          </p>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface-container-low/30 text-[10px] font-bold uppercase tracking-widest text-secondary">
              <tr>
                <th className="px-6 py-4 border-b border-outline">Name & Persona</th>
                <th className="px-6 py-4 border-b border-outline">Company</th>
                <th className="px-6 py-4 border-b border-outline">Lead Score</th>
                <th className="px-6 py-4 border-b border-outline">Status</th>
                <th className="px-6 py-4 border-b border-outline">Added</th>
                <th className="px-6 py-4 border-b border-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-secondary">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-secondary">No leads found</td></tr>
              ) : (
                filteredLeads.map((lead: Lead) => {
                  const scoreColors = getScoreColor(lead.icpScore);
                  const score = lead.icpScore * 10;
                  return (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                            {lead.firstName?.[0]}{lead.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{lead.firstName} {lead.lastName}</p>
                            <p className="text-[11px] text-secondary">{lead.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-on-surface">{lead.company}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${scoreColors.badge}`}>{score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-5 text-xs font-bold text-on-surface">
                        {timeAgo(lead.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-secondary hover:text-primary transition-all">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
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