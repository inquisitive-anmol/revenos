import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMeetings } from "../../../../hooks/useMeetings";
import { useMeetingStore, type Meeting, type MeetingLead } from "../../../../stores/meeting.store";
import { useUser } from "@clerk/clerk-react";

const getStatusBadge = (outcome?: string, scheduledAt?: string) => {
  if (outcome === "completed")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>Completed</span>;
  if (outcome === "no_show")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>No Show</span>;
  if (outcome === "rescheduled")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>Rescheduled</span>;
  if (outcome === "cancelled")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>Cancelled</span>;

  // No outcome — check if upcoming or past
  const isPast = scheduledAt ? new Date(scheduledAt) < new Date() : false;
  if (isPast)
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container border border-outline text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5"></span>Pending</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-primary-container/40 text-primary border border-primary/10"><span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse"></span>Scheduled</span>;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
};

const getLead = (meeting: Meeting): MeetingLead | null => {
  if (typeof meeting.leadId === "object" && meeting.leadId !== null) {
    return meeting.leadId as MeetingLead;
  }
  return null;
};

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Meetings");
  const navigate = useNavigate();
  const { user } = useUser();

  const { fetchMeetings, updateOutcome } = useMeetings();
  const { meetings, loading, error } = useMeetingStore();

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Derived metrics
  const now = new Date();
  const todayMeetings = meetings.filter(m => {
    const d = new Date(m.scheduledAt);
    return d.toDateString() === now.toDateString();
  });
  const completedMeetings = meetings.filter(m => m.outcome === "completed");
  const upcomingMeetings = meetings.filter(m => new Date(m.scheduledAt) > now && !m.outcome);
  const conversionRate = meetings.length > 0
    ? ((completedMeetings.length / meetings.length) * 100).toFixed(1)
    : "0";

  // Filter by tab
  const tabFiltered = meetings.filter(m => {
    if (activeTab === "Upcoming") return new Date(m.scheduledAt) > now && !m.outcome;
    if (activeTab === "Completed") return m.outcome === "completed";
    if (activeTab === "Rescheduled") return m.outcome === "rescheduled";
    return true;
  });

  // Filter by search
  const filteredMeetings = tabFiltered.filter(m => {
    if (!searchQuery) return true;
    const lead = getLead(m);
    const q = searchQuery.toLowerCase();
    return (
      lead?.firstName?.toLowerCase().includes(q) ||
      lead?.lastName?.toLowerCase().includes(q) ||
      lead?.company?.toLowerCase().includes(q) ||
      lead?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-background text-on-surface min-h-screen font-sans flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-outline bg-surface shadow-sm z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tighter text-primary leading-none">RevenOS</h1>
            <p className="text-[9px] uppercase font-bold tracking-widest text-secondary mt-0.5">Precision Velocity</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          <Link to="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">grid_view</span>Dashboard
          </Link>
          <Link to="/agents" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>Agents
          </Link>
          <Link to="/campaigns" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">campaign</span>Campaigns
          </Link>
          <Link to="/pipeline" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">alt_route</span>Pipeline
          </Link>
          <Link to="/leads" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">group</span>Leads
          </Link>
          <Link to="/meetings" className="flex items-center px-3 py-2.5 rounded-lg text-primary bg-primary-container/30 font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>Meetings
          </Link>
          <Link to="/settings" className="flex items-center px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low transition-colors font-semibold text-sm gap-3">
            <span className="material-symbols-outlined text-[22px]">settings</span>Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-outline">
          <div className="flex items-center p-2.5 rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-outline overflow-hidden flex items-center justify-center flex-shrink-0">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-primary">{user?.firstName?.[0]}</span>
              }
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-xs font-bold text-on-surface truncate">{user?.fullName || "User"}</p>
              <p className="text-[10px] font-medium text-secondary truncate">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-64 flex-1 min-h-screen flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between px-8 sticky top-0 z-40 bg-surface/80 backdrop-blur-md h-16 border-b border-outline">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold tracking-tight text-on-surface">Meetings</h2>
            <div className="h-5 w-px bg-outline hidden sm:block"></div>
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 transition-all outline-none font-medium placeholder:text-secondary"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-surface-container-low rounded-full transition-all">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1.5">Total Meetings</p>
                <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : meetings.length}
                </h3>
                <p className="text-[10px] font-bold text-green-600 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  {upcomingMeetings.length} upcoming
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-container/50 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline border-l-[4px] border-l-primary flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1.5">Today</p>
                <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : todayMeetings.length}
                </h3>
                <p className="text-[10px] font-bold text-secondary mt-1.5">
                  {todayMeetings.length > 0
                    ? `Next: ${formatDate(todayMeetings[0].scheduledAt).time}`
                    : "No meetings today"}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-container/50 rounded-xl flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1.5">Completion Rate</p>
                <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
                  {loading ? "—" : `${conversionRate}%`}
                </h3>
                <p className="text-[10px] font-bold text-green-600 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  {completedMeetings.length} completed
                </p>
              </div>
              <div className="w-12 h-12 bg-tertiary-container/50 rounded-xl flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[24px]">insights</span>
              </div>
            </div>

          </div>

          {/* Tabs + Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline w-fit">
              {["All Meetings", "Upcoming", "Completed", "Rescheduled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary hover:text-on-surface hover:bg-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-outline">
                    <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Date & Time</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Lead</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Company</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/50">

                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                          Loading meetings...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-error font-semibold">
                        Failed to load meetings.
                      </td>
                    </tr>
                  ) : filteredMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-secondary">calendar_month</span>
                          <p className="text-secondary font-semibold">No meetings found</p>
                          <p className="text-xs text-secondary">Meetings will appear here once the Booker Agent schedules them</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMeetings.map((meeting) => {
                      const lead = getLead(meeting);
                      const { date, time } = formatDate(meeting.scheduledAt);

                      return (
                        <tr key={meeting._id} className="hover:bg-surface-container-low/50 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="text-sm font-extrabold text-on-surface mb-1">{date}</div>
                            <div className="text-xs font-medium text-secondary">{time}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary text-sm border border-outline flex-shrink-0">
                                {lead ? `${lead.firstName?.[0]}${lead.lastName?.[0]}` : "?"}
                              </div>
                              <div>
                                <div className="text-sm font-extrabold text-on-surface mb-0.5">
                                  {lead ? `${lead.firstName} ${lead.lastName}` : "Unknown Lead"}
                                </div>
                                <div className="text-xs font-medium text-secondary">
                                  {lead?.email || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-on-surface">
                              {lead?.company || "—"}
                            </div>
                            <div className="text-xs font-medium text-secondary">
                              {lead?.title || ""}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {getStatusBadge(meeting.outcome, meeting.scheduledAt)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-end gap-2">
                              {lead && (
                                <button
                                  onClick={() => navigate(`/leads/${typeof meeting.leadId === "string" ? meeting.leadId : meeting.leadId._id}`)}
                                  className="text-[11px] font-extrabold text-primary hover:underline transition-all"
                                >
                                  View Lead
                                </button>
                              )}
                              {!meeting.outcome && (
                                <button
                                  onClick={() => updateOutcome(meeting._id, "completed")}
                                  className="text-[11px] font-extrabold text-green-600 hover:underline transition-all"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-5 bg-surface-container-low/30 border-t border-outline flex items-center justify-between">
              <p className="text-[13px] font-bold text-secondary">
                Showing {filteredMeetings.length} of {meetings.length} meetings
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}