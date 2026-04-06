import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLeads } from "../../../../hooks/useLeads";
import { useLeadStore, type Lead } from "../../../../stores/lead.store";
import { useUser } from "@clerk/clerk-react";

const getScoreColor = (score: number) => {
  const pct = score * 10;
  if (pct >= 80) return { badge: "bg-green-50 border-green-100 text-green-700", bars: ["bg-green-500", "bg-green-500", "bg-green-500"] };
  if (pct >= 50) return { badge: "bg-amber-50 border-amber-100 text-amber-700", bars: ["bg-amber-500", "bg-amber-500", "bg-surface-container-highest"] };
  return { badge: "bg-red-50 border-red-100 text-red-700", bars: ["bg-red-500", "bg-surface-container-highest", "bg-surface-container-highest"] };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "meeting_booked":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold rounded-full"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>Meeting Booked</span>;
    case "qualified":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-primary text-[11px] font-bold rounded-full"><span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>Qualified</span>;
    case "contacted":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 text-[11px] font-bold rounded-full"><span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>Contacted</span>;
    case "disqualified":
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-100 text-[11px] font-bold rounded-full"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>Disqualified</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-outline text-secondary text-[11px] font-bold rounded-full"><span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>Prospecting</span>;
  }
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [scoreFilter, setScoreFilter] = useState("All Scores");
  const [industryFilter, setIndustryFilter] = useState("All Industries");

  const navigate = useNavigate();
  const { user } = useUser();
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
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      l.firstName?.toLowerCase().includes(q) ||
      l.lastName?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "All Statuses" ||
      l.status === statusFilter.toLowerCase().replace(" ", "_");

    const score = l.icpScore * 10;
    const matchesScore =
      scoreFilter === "All Scores" ||
      (scoreFilter === "High Score (80+)" && score >= 80) ||
      (scoreFilter === "Med Score (40-79)" && score >= 40 && score < 80) ||
      (scoreFilter === "Low Score (<40)" && score < 40);

    const matchesIndustry = industryFilter === "All Industries" ||
      l.industry?.toLowerCase().includes(industryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesScore && matchesIndustry;
  });

  // Get unique industries
  const industries = ["All Industries", ...Array.from(new Set(leads.map(l => l.industry).filter(Boolean)))];

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-outline bg-surface flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tighter text-primary leading-none">RevenOS</span>
            <span className="text-[9px] font-bold tracking-widest text-secondary uppercase mt-1">Precision Velocity</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
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
          <Link to="/leads" className="flex items-center gap-3 px-4 py-3 bg-primary-container/50 text-primary rounded-lg transition-all font-semibold text-sm shadow-sm">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>Leads
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">settings</span>Settings
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-outline">
          <div className="bg-primary-container/30 rounded-xl p-4 border border-outline">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Storage Usage</p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min((leads.length / 100) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-secondary font-medium">{leads.length} of 10k leads used</p>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-40 h-16 ml-64 bg-surface/80 backdrop-blur-md border-b border-outline flex justify-between items-center px-8">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-secondary text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Search across RevenOS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-secondary font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-5 ml-4">
          <button className="w-9 h-9 flex items-center justify-center text-secondary hover:text-primary transition-colors rounded-full">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-secondary hover:text-primary transition-colors rounded-full">
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>
          <div className="h-8 w-px bg-outline mx-1"></div>
          <button className="flex items-center gap-3 text-left group">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                {user?.fullName || user?.firstName || "User"}
              </span>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-1">Precision Velocity</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-outline shadow-sm">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-primary">{user?.firstName?.[0]}</span>
              }
            </div>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="ml-64 flex-1 p-8 bg-background">

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">

          {/* Header Card */}
          <div className="xl:col-span-1 bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-1.5">Leads Inventory</h1>
              <p className="text-sm font-medium text-secondary leading-relaxed">Manage and nurture your high-velocity pipeline.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                to="/campaigns/create"
                className="flex-1 bg-primary text-white text-sm font-bold py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Lead
              </Link>
              <button className="flex-1 bg-surface text-on-surface border border-outline text-sm font-bold py-2.5 rounded-xl hover:bg-surface-container-low active:scale-[0.98] transition-all">
                Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Qualified */}
            <div className="bg-primary p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <p className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest mb-1.5">Qualified Leads</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">
                    {loading ? "—" : qualifiedLeads.length}
                  </h3>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-primary-fixed text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  From {leads.length} total leads
                </div>
              </div>
              <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[140px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>

            {/* Conversion Rate */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
              <div>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Conversion Rate</p>
                <h3 className="text-4xl font-black text-on-surface tracking-tight">
                  {loading ? "—" : `${conversionRate}%`}
                </h3>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mt-6 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all" style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}></div>
              </div>
            </div>

            {/* Active Outreach */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
              <div>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Active Outreach</p>
                <h3 className="text-4xl font-black text-on-surface tracking-tight">
                  {loading ? "—" : contactedLeads.length}
                </h3>
              </div>
              <div className="flex -space-x-2 mt-6">
                {leads.slice(0, 3).map((l, i) => (
                  <div
                    key={l._id}
                    className="w-8 h-8 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[9px] font-bold text-primary"
                    style={{ zIndex: 3 - i }}
                  >
                    {l.firstName?.[0]}{l.lastName?.[0]}
                  </div>
                ))}
                {leads.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[9px] font-bold text-secondary">
                    +{leads.length - 3}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">

          {/* Toolbar */}
          <div className="p-4 border-b border-outline flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm"
                >
                  <option>All Statuses</option>
                  <option>prospecting</option>
                  <option>contacted</option>
                  <option>qualified</option>
                  <option>meeting_booked</option>
                  <option>disqualified</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>

              {/* Score filter */}
              <div className="relative">
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm"
                >
                  <option>All Scores</option>
                  <option>High Score (80+)</option>
                  <option>Med Score (40-79)</option>
                  <option>Low Score (&lt;40)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>

              {/* Industry filter */}
              <div className="relative">
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm"
                >
                  {industries.map((ind) => (
                    <option key={ind}>{ind}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold text-secondary">
                Showing {filteredLeads.length} of {leads.length} results
              </p>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Name & Persona</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Company & Industry</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Lead Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Added</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/50">

                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading leads...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-error font-semibold">
                      Failed to load leads. Please try again.
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-[40px] text-secondary">group</span>
                        <p className="text-secondary font-semibold">No leads found</p>
                        <Link to="/campaigns/create" className="text-primary text-sm font-bold hover:underline">
                          Create a campaign to add leads →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead: Lead) => {
                    const scoreColors = getScoreColor(lead.icpScore);
                    const score = lead.icpScore * 10;

                    return (
                      <tr
                        key={lead._id}
                        onClick={() => navigate(`/leads/${lead._id}`)}
                        className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary text-sm border border-outline flex-shrink-0">
                              {lead.firstName?.[0]}{lead.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface leading-none mb-1.5">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-xs font-medium text-secondary">{lead.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-on-surface leading-none mb-2">{lead.company}</p>
                          {lead.industry && (
                            <span className="text-[10px] font-bold text-primary bg-primary-container/40 px-2.5 py-0.5 rounded-md">
                              {lead.industry}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`px-2.5 py-1 border text-xs font-black rounded-lg ${scoreColors.badge}`}>
                              {score}
                            </div>
                            <div className="flex gap-1">
                              {scoreColors.bars.map((bar, i) => (
                                <div key={i} className={`w-1.5 h-3.5 rounded-full ${bar}`}></div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-on-surface leading-none mb-1.5">
                            {timeAgo(lead.createdAt)}
                          </p>
                          {lead.researchNotes && (
                            <p className="text-[11px] text-secondary font-medium italic truncate max-w-[160px]">
                              {lead.researchNotes.slice(0, 40)}...
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
                          >
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

          {/* Footer */}
          <div className="px-6 py-5 bg-surface-container-low/30 border-t border-outline flex items-center justify-between">
            <div className="text-[11px] font-bold text-secondary uppercase tracking-widest">
              {filteredLeads.length} leads shown
            </div>
            <div className="text-[11px] font-medium text-secondary">
              Click any row to view lead details
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}