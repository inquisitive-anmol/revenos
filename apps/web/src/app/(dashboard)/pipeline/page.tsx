import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLeads } from "../../../hooks/useLeads";
import { useLeadStore, type Lead } from "../../../stores/lead.store";
import { useMeetings } from "../../../hooks/useMeetings";
import { useMeetingStore } from "../../../stores/meeting.store";
import { useUser } from "@clerk/clerk-react";
import { useApi } from "../../../lib/api";

// Column definitions
const COLUMNS: { id: Lead["status"]; label: string; color: string }[] = [
  { id: "prospecting", label: "Leads", color: "border-l-slate-400" },
  { id: "contacted", label: "Qualified", color: "border-l-blue-400" },
  { id: "qualified", label: "Interested", color: "border-l-primary" },
  { id: "meeting_booked", label: "Meetings Booked", color: "border-l-green-500" },
];

// Score badge color
const getScoreBadge = (score: number) => {
  const pct = score * 10;
  if (pct >= 80) return { bg: "bg-green-100", text: "text-green-700" };
  if (pct >= 50) return { bg: "bg-orange-100", text: "text-orange-700" };
  return { bg: "bg-red-100", text: "text-red-700" };
};

export default function PipelinePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const api = useApi();

  const { user } = useUser();
  const navigate = useNavigate();

  const { fetchLeads, updateLeadStatus } = useLeads();
  const { leads, loading } = useLeadStore();

  const { fetchMeetings } = useMeetings();
  const { meetings } = useMeetingStore();

  // Fetch on mount
  useEffect(() => {
    fetchLeads();
    fetchMeetings();
  }, []);

  // Filter leads by search
  const filteredLeads = leads.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.firstName?.toLowerCase().includes(q) ||
      l.lastName?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    );
  });

  // Group leads by status
  const getColumnLeads = (status: Lead["status"]) =>
    filteredLeads.filter((l) => l.status === status);

  // Get meeting for a lead
  const getMeeting = (leadId: string) =>
    meetings.find((m) => m.leadId === leadId);

  // Format meeting date
  const formatMeetingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
    setDraggingId(leadId);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, status: Lead["status"]) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    const lead = leads.find((l) => l._id === leadId);
    if (!lead || lead.status === status) return;
    await updateLeadStatus(leadId, status);
    setDraggingId(null);
  };

  const handleQualify = async (leadId: string, campaignId: string) => {
    if (qualifyingId) return;
    setQualifyingId(leadId);
    try {
      await api.post(
        `/api/v1/campaigns/${campaignId}/qualify/${leadId}`
      );
      // Refresh leads after qualifying
      await fetchLeads();
    } catch (err: any) {
      console.error("Failed to qualify lead:", err.message);
    } finally {
      setQualifyingId(null);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans overflow-hidden">

      {/* Top Header */}
      <header className="h-16 bg-surface border-b border-outline flex items-center justify-between px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
          <span className="text-lg font-bold text-on-surface tracking-tight">Revenos</span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl px-8 hidden md:block">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-secondary font-medium"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <button className="relative text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>
          <Link to="/settings" className="text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          </Link>
          <div className="h-8 w-px bg-outline mx-1"></div>
          <button className="flex items-center gap-3 text-left group">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                {user?.fullName || user?.firstName || "User"}
              </span>
              <span className="text-xs font-medium text-secondary">Admin Account</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#fde0d9] flex items-center justify-center overflow-hidden shadow-sm">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover scale-110 translate-y-1" />
              }
            </div>
          </button>
        </div>
      </header>

      {/* Filter & Action Toolbar */}
      <div className="h-16 bg-surface border-b border-outline px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-x-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg text-sm font-semibold text-on-surface whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Agent: All
            <span className="material-symbols-outlined text-[18px] text-secondary">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg text-sm font-semibold text-on-surface whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Date: Last 30 Days
            <span className="material-symbols-outlined text-[18px] text-secondary">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg text-sm font-semibold text-on-surface whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            High Confidence
            <span className="material-symbols-outlined text-[18px] text-secondary">expand_more</span>
          </button>

          {/* Live lead count */}
          {!loading && (
            <span className="text-xs font-bold text-secondary ml-2">
              {filteredLeads.length} leads total
            </span>
          )}
        </div>

        <Link
          to="/campaigns/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Campaign
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-secondary text-sm font-medium">
          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
          Loading pipeline...
        </div>
      )}

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden bg-background">
        <div className="flex gap-6 px-8 py-6 h-full min-w-max items-start">

          {COLUMNS.map((col) => {
            const colLeads = getColumnLeads(col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col w-[320px] flex-shrink-0 h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">
                      {col.label}
                    </h3>
                    <span className="px-2 py-0.5 bg-surface-container-low border border-outline text-secondary text-[10px] font-bold rounded-full">
                      {colLeads.length}
                    </span>
                  </div>
                  <button className="text-outline-variant hover:text-secondary">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                  </button>
                </div>

                {/* Drop Zone */}
                <div
                  className={`flex flex-col gap-4 flex-1 min-h-[200px] rounded-xl transition-colors ${draggingId ? "bg-primary-container/10 border-2 border-dashed border-primary/20" : ""
                    }`}
                >
                  {/* Empty state */}
                  {colLeads.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <span className="material-symbols-outlined text-[32px] text-outline-variant mb-2">inbox</span>
                      <p className="text-xs font-semibold text-secondary">No leads here yet</p>
                    </div>
                  )}

                  {/* Lead Cards */}
                  {colLeads.map((lead: any) => {
                    const score = lead.icpScore * 10;
                    const badge = getScoreBadge(lead.icpScore);
                    const meeting = getMeeting(lead._id);
                    const isBooked = col.id === "meeting_booked";

                    return (
                      <div
                        key={lead._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead._id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => navigate(`/leads/${lead._id}`)}
                        className={`bg-surface border border-outline rounded-xl p-5 shadow-sm relative group cursor-pointer hover:shadow-md transition-all
                          ${isBooked ? "border-t-[4px] border-t-green-500" : ""}
                          ${lead.status === "qualified" ? "border-l-[4px] border-l-primary" : ""}
                          ${draggingId === lead._id ? "opacity-40 scale-95" : ""}
                        `}
                      >
                        {/* Drag handle */}
                        <span className="material-symbols-outlined absolute top-4 right-4 text-outline-variant group-hover:text-secondary transition-colors text-[20px] cursor-grab">
                          drag_indicator
                        </span>

                        {/* Human controlled badge */}
                        {lead.humanControlled && (
                          <span className="absolute top-4 left-4 px-2 py-0.5 bg-error/10 text-error text-[9px] font-bold uppercase rounded-full">
                            Human
                          </span>
                        )}

                        {/* ICP Score */}
                        <span className={`inline-block px-2 py-0.5 ${badge.bg} ${badge.text} text-[10px] font-bold uppercase tracking-wider rounded mb-3 ${lead.humanControlled ? "mt-5" : ""}`}>
                          Score: {score}%
                        </span>

                        {/* Lead Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                            {lead.firstName?.[0]}{lead.lastName?.[0]}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-on-surface leading-tight">
                              {lead.firstName} {lead.lastName}
                            </h4>
                            <p className="text-xs font-medium text-secondary mt-0.5">
                              {lead.title ? `${lead.title} · ` : ""}{lead.company}
                            </p>
                          </div>
                        </div>

                        {/* Research notes or email snippet */}
                        {lead.researchNotes && (
                          <div className="bg-surface-container-low text-on-surface-variant text-sm italic font-medium p-3 rounded-lg leading-relaxed mb-3 line-clamp-2">
                            "{lead.researchNotes}"
                          </div>
                        )}

                        {/* Meeting badge for booked leads */}
                        {isBooked && meeting && (
                          <div className="bg-primary-container/40 text-primary text-[11px] font-bold py-2.5 px-3 rounded-lg flex items-center gap-2 mt-2">
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            {formatMeetingDate(meeting.scheduledAt)} at{" "}
                            {new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline">
                          <span className="text-[10px] font-semibold text-secondary truncate max-w-[140px]">
                            {lead.email}
                          </span>
                          <div className="flex items-center gap-2">
                            {col.id === "prospecting" && !lead.humanControlled && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQualify(lead._id, lead.campaignId);
                                }}
                                disabled={qualifyingId === lead._id}
                                className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-on-primary-fixed-variant active:scale-95 transition-all flex items-center gap-1 disabled:opacity-60"
                              >
                                {qualifyingId === lead._id ? (
                                  <span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[12px]">send</span>
                                )}
                                {qualifyingId === lead._id ? "Sending..." : "Qualify"}
                              </button>
                            )}
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.humanControlled ? "bg-error" : "bg-green-500"
                              }`}></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </main>
    </div>
  );
}