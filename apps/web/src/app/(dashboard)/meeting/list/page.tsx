import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMeetings } from "../../../../hooks/useMeetings";
import { useMeetingStore, type Meeting, type MeetingLead } from "../../../../stores/meeting.store";

const getStatusBadge = (outcome?: string, scheduledAt?: string) => {
  if (outcome === "completed")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">Completed</span>;
  if (outcome === "no_show")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">No Show</span>;
  if (outcome === "rescheduled")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">Rescheduled</span>;
  if (outcome === "cancelled")
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">Cancelled</span>;

  const isPast = scheduledAt ? new Date(scheduledAt) < new Date() : false;
  if (isPast)
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container border border-outline text-secondary">Pending</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-primary-container/40 text-primary border border-primary/10">Scheduled</span>;
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
  const [activeTab, setActiveTab] = useState("All Meetings");
  const navigate = useNavigate();

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

  return (
    <div className="p-8 pb-2 flex-1">
      {/* Header Row */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Meetings</h1>
          <p className="text-secondary font-medium">Track your booked meetings and conversion outcomes.</p>
        </div>
      </div>

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
          <div className="w-12 h-12 bg-primary-container/30 rounded-xl flex items-center justify-center text-primary">
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
          <div className="w-12 h-12 bg-primary-container/30 rounded-xl flex items-center justify-center text-primary">
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
          <div className="w-12 h-12 bg-primary-container/30 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl shadow-sm border border-outline w-fit mb-6">
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

      {/* Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface-container-low/30 border-b border-outline">
              <tr>
                <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Lead</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Company</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[11px] font-extrabold text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-secondary">Loading meetings...</td></tr>
              ) : tabFiltered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-secondary">No meetings found</td></tr>
              ) : (
                tabFiltered.map((meeting) => {
                  const lead = getLead(meeting);
                  const { date, time } = formatDate(meeting.scheduledAt);
                  return (
                    <tr key={meeting._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="text-sm font-extrabold text-on-surface mb-1">{date}</div>
                        <div className="text-xs font-medium text-secondary">{time}</div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                              {lead ? `${lead.firstName?.[0]}${lead.lastName?.[0]}` : "?"}
                            </div>
                            <div>
                               <div className="text-sm font-extrabold text-on-surface mb-0.5">
                                {lead ? `${lead.firstName} ${lead.lastName}` : "Unknown Lead"}
                              </div>
                              <div className="text-xs font-medium text-secondary">{lead?.email || ""}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 font-semibold text-sm text-on-surface">
                        {lead?.company || "—"}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(meeting.outcome, meeting.scheduledAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end gap-1">
                           {lead && (
                            <button
                              onClick={() => navigate(`/leads/${typeof meeting.leadId === "string" ? meeting.leadId : (meeting.leadId as any)._id}`)}
                              className="text-[11px] font-extrabold text-primary hover:underline"
                            >
                              View Lead
                            </button>
                          )}
                           {!meeting.outcome && (
                            <button
                              onClick={() => updateOutcome(meeting._id, "completed")}
                              className="text-[11px] font-extrabold text-green-600 hover:underline"
                            >
                              Complete
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
      </div>
    </div>
  );
}