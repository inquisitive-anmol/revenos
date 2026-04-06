import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useApi } from "../../../../lib/api";

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  icpScore: number;
  status: string;
  researchNotes?: string;
  linkedinUrl?: string;
  industry?: string;
  companySize?: number;
  humanControlled: boolean;
  campaignId: string;
  createdAt: string;
}

interface EmailThread {
  _id: string;
  externalThreadId: string;
  messages: {
    messageId: string;
    direction: "outbound" | "inbound";
    subject: string;
    body: string;
    sentAt: string;
  }[];
  status: string;
  createdAt: string;
}

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useUser();

  const [lead, setLead] = useState<Lead | null>(null);
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [takingOver, setTakingOver] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchLead = async () => {
      setLoading(true);
      setError(null);
      try {
        const [leadRes, threadRes] = await Promise.all([
          api.get(`/api/v1/leads/${id}`),
          api.get(`/api/v1/leads/${id}/threads`).catch(() => ({ data: { data: [] } })),
        ]);
        const leadData = leadRes.data?.data?.lead || leadRes.data?.lead;
        setLead(leadData);
        console.log("Lead API response:", leadRes.data);
        setThreads(threadRes.data.data || threadRes.data.threads || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleTakeover = async () => {
    if (!lead) return;
    setTakingOver(true);
    try {
      await api.patch(`/api/v1/leads/${id}/takeover`);
      setLead({ ...lead, humanControlled: true });
    } catch (err: any) {
      console.error("Takeover failed:", err.message);
    } finally {
      setTakingOver(false);
    }
  };

  const handleHandback = async () => {
    if (!lead) return;
    setTakingOver(true);
    try {
      await api.patch(`/api/v1/leads/${id}/handback`);
      setLead({ ...lead, humanControlled: false });
    } catch (err: any) {
      console.error("Handback failed:", err.message);
    } finally {
      setTakingOver(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "meeting_booked": return "bg-blue-50 text-blue-700";
      case "qualified": return "bg-green-50 text-green-700";
      case "contacted": return "bg-orange-50 text-orange-700";
      case "disqualified": return "bg-red-50 text-red-700";
      default: return "bg-surface-container text-secondary";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-secondary font-semibold">
          <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
          Loading lead...
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[48px] text-error">error</span>
          <p className="text-on-surface font-bold text-lg">Lead not found</p>
          <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline">← Go Back</button>
        </div>
      </div>
    );
  }

  const allMessages = threads.flatMap((t) => t.messages).sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-outline bg-surface flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tighter text-primary leading-none">RevenOS</span>
            <span className="text-[9px] font-bold tracking-widest text-secondary uppercase mt-1">Precision Velocity</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
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
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-outline">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-sm font-bold text-primary">{user?.firstName?.[0]}</span>
              }
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-on-surface truncate">{user?.fullName || "User"}</p>
              <p className="text-[11px] font-medium text-secondary">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-40 h-16 ml-64 bg-surface/90 backdrop-blur-md border-b border-outline flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
            <Link to="/leads" className="hover:text-primary transition-colors">Leads</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">{lead.firstName} {lead.lastName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lead.humanControlled ? (
            <button
              onClick={handleHandback}
              disabled={takingOver}
              className="px-4 py-2 bg-surface border border-outline text-secondary font-bold text-sm rounded-xl hover:bg-surface-container-low transition-all active:scale-95 disabled:opacity-50"
            >
              Hand Back to AI
            </button>
          ) : (
            <button
              onClick={handleTakeover}
              disabled={takingOver}
              className="px-4 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">person_alert</span>
              Take Over
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="ml-64 flex-1 p-8 bg-background">
        <div className="max-w-6xl mx-auto">

          {/* Lead Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary-container flex items-center justify-center text-primary font-bold text-2xl shadow-sm border border-outline">
                  {lead.firstName?.[0]}{lead.lastName?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-surface p-[3px] rounded-full shadow-sm">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-surface ${lead.humanControlled ? "bg-error" : "bg-green-500"}`}></div>
                </div>
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
                    {lead.firstName} {lead.lastName}
                  </h1>
                  <span className="px-2.5 py-1 bg-primary-container/60 text-primary text-[10px] font-black rounded-md tracking-widest uppercase">
                    Score: {lead.icpScore * 10}%
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-md tracking-widest uppercase ${getStatusColor(lead.status)}`}>
                    {lead.status?.replace(/_/g, " ") || ""}
                  </span>
                </div>
                <p className="text-secondary font-medium text-[15px]">
                  {lead.title} at <span className="text-on-surface font-bold">{lead.company}</span>
                </p>
                {lead.industry && (
                  <p className="text-xs text-secondary font-medium mt-1">
                    {lead.industry} {lead.companySize ? `· ${lead.companySize} employees` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">

              {/* Contact Details */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
                <div className="px-6 py-4 border-b border-outline bg-surface-container-low/30">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">Contact Details</h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline flex items-center justify-center text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-bold text-on-surface">{lead.email}</p>
                    </div>
                  </div>
                  {lead.linkedinUrl && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline flex items-center justify-center text-secondary flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">link</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">LinkedIn</p>
                        <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline">
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Notes */}
              {lead.researchNotes && (
                <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary mb-4">AI Research Notes</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed italic">"{lead.researchNotes}"</p>
                </div>
              )}

              {/* Campaign */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary mb-4">Campaign</h3>
                <Link
                  to={`/campaigns/${lead.campaignId}`}
                  className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline rounded-xl hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
                  <span className="text-sm font-bold text-on-surface">View Campaign</span>
                  <span className="material-symbols-outlined text-secondary text-[16px] ml-auto">arrow_forward</span>
                </Link>
              </div>

            </div>

            {/* Right Column — Email Thread */}
            <div className="lg:col-span-8 space-y-6">

              {/* Activity Timeline */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
                <div className="px-6 py-4 border-b border-outline flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">Activity Timeline</h3>
                </div>
                <div className="p-8">
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-outline">

                    {/* Lead Created */}
                    <div className="relative flex gap-6">
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-surface border-2 border-outline flex items-center justify-center z-10 shadow-sm text-secondary">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                      </div>
                      <div className="ml-16 pt-1 flex-1">
                        <p className="text-sm font-bold text-on-surface">Lead Created</p>
                        <p className="text-[13px] font-medium text-secondary mt-1">
                          Added to pipeline with ICP score {lead.icpScore * 10}%
                        </p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2">
                          {timeAgo(lead.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Email events from threads */}
                    {allMessages.map((msg, idx) => (
                      <div key={idx} className="relative flex gap-6">
                        <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm border-2 ${msg.direction === "inbound"
                          ? "bg-green-50 border-green-500 text-green-600"
                          : "bg-surface border-outline text-secondary"
                          }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {msg.direction === "inbound" ? "reply" : "mail"}
                          </span>
                        </div>
                        <div className="ml-16 pt-1 flex-1">
                          <p className="text-sm font-bold text-on-surface">
                            {msg.direction === "inbound" ? "Reply Received" : "Email Sent by Agent"}
                          </p>
                          <p className="text-[13px] font-medium text-secondary mt-1">{msg.subject}</p>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2">
                            {timeAgo(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Meeting booked */}
                    {lead.status === "meeting_booked" && (
                      <div className="relative flex gap-6">
                        <div className="absolute left-0 w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm text-blue-600">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        </div>
                        <div className="ml-16 pt-1 flex-1">
                          <p className="text-sm font-bold text-on-surface">Meeting Booked</p>
                          <p className="text-[13px] font-medium text-secondary mt-1">Meeting scheduled via RevenOS Booker Agent</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Email Thread */}
              {allMessages.length > 0 && (
                <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline flex items-center justify-between">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">Email Conversation</h3>
                    <span className="text-[10px] font-bold text-primary bg-primary-container/50 px-2 py-0.5 rounded uppercase tracking-wider border border-primary/20">
                      AI Handled
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    {allMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-4 ${msg.direction === "outbound" ? "flex-row-reverse ml-auto max-w-[85%]" : "max-w-[85%]"}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.direction === "outbound"
                          ? "bg-primary shadow-md shadow-primary/30"
                          : "bg-surface-container border border-outline"
                          }`}>
                          {msg.direction === "outbound"
                            ? <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                            : <span className="text-sm font-bold text-secondary">{lead.firstName?.[0]}</span>
                          }
                        </div>
                        <div className={`rounded-2xl p-4 ${msg.direction === "outbound"
                          ? "bg-primary text-white rounded-tr-none"
                          : "bg-surface-container-low border border-outline rounded-tl-none"
                          }`}>
                          <div className="flex justify-between items-center mb-2 gap-4">
                            <span className={`text-[13px] font-bold ${msg.direction === "outbound" ? "text-white" : "text-on-surface"}`}>
                              {msg.direction === "outbound" ? "RevenOS Agent" : `${lead.firstName} ${lead.lastName}`}
                            </span>
                            <span className={`text-[10px] font-bold ${msg.direction === "outbound" ? "text-white/70" : "text-secondary"}`}>
                              {timeAgo(msg.sentAt)}
                            </span>
                          </div>
                          <div
                            className={`text-sm leading-relaxed ${msg.direction === "outbound" ? "text-white/95" : "text-on-surface-variant"}`}
                            dangerouslySetInnerHTML={{ __html: msg.body }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {allMessages.length === 0 && (
                <div className="bg-surface rounded-2xl shadow-sm border border-outline p-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-secondary mb-3 block">mail</span>
                  <p className="text-secondary font-semibold">No emails sent yet</p>
                  <p className="text-xs text-secondary mt-1">Click Qualify on the pipeline to send the first email</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}