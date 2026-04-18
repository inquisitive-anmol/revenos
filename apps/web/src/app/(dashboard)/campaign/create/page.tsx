import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCampaigns } from "../../../../hooks/useCampaigns";
import { useCampaignStore } from "../../../../stores/campaign.store";
import { parseCSV } from "../../../../lib/csvParser";
import { useApi } from "../../../../lib/api";
import { useIntegrations } from "../../../../hooks/useIntegrations";

const STEPS = [
  { id: 1, label: "Connect Email",  icon: "mail" },
  { id: 2, label: "Upload Leads",   icon: "upload_file" },
  { id: 3, label: "Configure ICP",  icon: "tune" },
  { id: 4, label: "Agent Flow",     icon: "account_tree" },
  { id: 5, label: "Review & Launch",icon: "rocket_launch" },
];

interface WorkflowTemplate {
  workflowId: string;
  name: string;
  description?: string;
  nodes: Array<{ type: string }>;
}

const NODE_COLORS: Record<string, string> = {
  prospector: "bg-blue-50 text-blue-600",
  qualifier:  "bg-amber-50 text-amber-600",
  booker:     "bg-emerald-50 text-emerald-600",
  human:      "bg-purple-50 text-purple-600",
  condition:  "bg-rose-50 text-rose-600",
};

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const api = useApi();
  const { createCampaign, triggerProspector } = useCampaigns();
  const { loading } = useCampaignStore();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Step 1 — Integration status (workspace-level, fetched from API)
  const { integrations, loading: integrationsLoading, fetchIntegrations } = useIntegrations();
  useEffect(() => { fetchIntegrations(); }, []);

  // Step 2 — Leads
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedLeadCount, setParsedLeadCount] = useState(0);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 — ICP
  const [campaignName, setCampaignName] = useState("");
  const [goal] = useState("Lead Generation");
  const [description] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [jobTitles, setJobTitles] = useState("");
  const [problemToSolve, setProblemToSolve] = useState("");

  // Step 4 — Agent Flow
  const [availableFlows, setAvailableFlows] = useState<WorkflowTemplate[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null); // null = default

  useEffect(() => {
    if (step !== 4) return;
    setFlowsLoading(true);
    api.get("/api/v1/workflows")
      .then((res) => setAvailableFlows(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setFlowsLoading(false));
  }, [step]);

  const buildIcpDescription = () => {
    const parts = [];
    if (industry) parts.push(`Industry: ${industry}`);
    if (companySize) parts.push(`Company size: ${companySize}`);
    if (jobTitles) parts.push(`Titles: ${jobTitles}`);
    if (problemToSolve) parts.push(`Problem: ${problemToSolve}`);
    if (description) parts.push(`Goal: ${description}`);
    return parts.join(". ");
  };

  // ── CSV handlers ─────────────────────────────────────────────────────────
  const processCsv = async (file: File) => {
    setCsvFile(file);
    setCsvError(null);
    try {
      const text = await file.text();
      const leads = parseCSV(text);
      setParsedLeadCount(leads.length);
    } catch (err: unknown) {
      setCsvError(err instanceof Error ? err.message : "Invalid CSV");
      setParsedLeadCount(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".csv")) { setCsvError("Please upload a valid .csv file."); return; }
    processCsv(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCsv(file);
  };

  // ── Step validation ───────────────────────────────────────────────────────
  const validateCurrentStep = (): boolean => {
    setStepError(null);
    if (step === 2 && (!csvFile || parsedLeadCount === 0)) {
      setStepError(csvError || "Please upload a CSV file with at least one valid lead.");
      return false;
    }
    if (step === 3) {
      if (!campaignName.trim()) { setStepError("Campaign name is required."); return false; }
      if (!industry && !jobTitles && !problemToSolve) {
        setStepError("Please provide at least one ICP detail."); return false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validateCurrentStep()) setStep((s) => Math.min(5, s + 1)); };
  const prevStep = () => { setStepError(null); setStep((s) => Math.max(1, s - 1)); };

  // ── Launch ────────────────────────────────────────────────────────────────
  const handleLaunch = async () => {
    if (!csvFile) return;
    try {
      const csvText = await csvFile.text();
      const parsedLeads = parseCSV(csvText);
      if (parsedLeads.length === 0) { setStepError("No valid leads found in CSV."); return; }
      const icpDescription = buildIcpDescription();
      const result = await createCampaign(campaignName.trim(), icpDescription, {
        industry, companySize, jobTitles, problemToSolve, goal, status: "active",
        workflowId: selectedWorkflowId ?? undefined,
      });
      const newId = result?.data?.campaign?._id || result?.campaign?._id;
      if (!newId) throw new Error("Failed to get campaign ID");
      await triggerProspector(newId, parsedLeads);
      navigate(`/campaigns/${newId}`);
    } catch (err: unknown) {
      setStepError(err instanceof Error ? err.message : "Failed to launch campaign.");
    }
  };

  const handleSaveDraft = async () => {
    if (!campaignName.trim()) { setStepError("Campaign name is required."); return; }
    try {
      await createCampaign(campaignName.trim(), buildIcpDescription(), {
        industry, companySize, jobTitles, problemToSolve, goal, status: "draft",
        workflowId: selectedWorkflowId ?? undefined,
      });
      navigate("/campaigns");
    } catch (err: unknown) {
      setStepError(err instanceof Error ? err.message : "Failed to save draft.");
    }
  };

  return (
    <div className="flex-1 bg-background relative mb-24">
      {/* Header + Progress */}
      <div className="border-b border-outline bg-surface px-8 py-5">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-xl font-extrabold text-on-surface mb-5">Create New Campaign</h1>
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > s.id ? "bg-primary text-white" : step === s.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container border border-outline text-secondary"}`}>
                    {step > s.id ? <span className="material-symbols-outlined text-[14px]">check</span> : s.id}
                  </div>
                  <span className={`text-[9px] font-bold whitespace-nowrap ${step === s.id ? "text-primary" : "text-secondary"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1.5 mt-[-14px] rounded-full ${step > s.id ? "bg-primary" : "bg-outline"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="p-8 pb-12">
        <div className="max-w-[720px] mx-auto">
          {stepError && (
            <div className="mb-6 flex items-center gap-3 bg-error/10 border border-error/20 text-error rounded-xl px-5 py-4">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-semibold">{stepError}</p>
            </div>
          )}

          {/* ── STEP 1: Email & Calendar Status ── */}
          {step === 1 && (
            <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">electrical_services</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Workspace Integrations</h2>
                  <p className="text-sm text-secondary">These are shared across all campaigns — connect once in Settings.</p>
                </div>
              </div>

              {integrationsLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-secondary">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span className="text-sm">Checking integrations...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Email status */}
                  <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    integrations.email.connected ? "border-green-200 bg-green-50/30" : "border-orange-200 bg-orange-50/30"
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      integrations.email.connected ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"
                    }`}>
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">Outreach Email</p>
                      {integrations.email.connected ? (
                        <p className="text-xs text-green-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          {integrations.email.email}
                        </p>
                      ) : (
                        <p className="text-xs text-orange-600 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          Not connected — emails will fail without this
                        </p>
                      )}
                    </div>
                    {!integrations.email.connected && (
                      <Link
                        to="/settings?tab=integrations"
                        className="flex-shrink-0 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-on-primary-fixed-variant transition-all active:scale-95"
                      >
                        Connect
                      </Link>
                    )}
                  </div>

                  {/* Calendar status */}
                  <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    integrations.calendar.connected ? "border-green-200 bg-green-50/30" : "border-outline bg-surface-container-low/50"
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      integrations.calendar.connected ? "bg-blue-100 text-blue-600" : "bg-surface-container text-secondary"
                    }`}>
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-on-surface">Calendar</p>
                        <span className="text-[10px] bg-surface-container text-secondary px-2 py-0.5 rounded-full font-bold">Optional</span>
                      </div>
                      {integrations.calendar.connected ? (
                        <p className="text-xs text-green-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Connected — Booker agent can schedule meetings
                        </p>
                      ) : (
                        <p className="text-xs text-secondary mt-0.5">Not connected — Booker agent won't be able to schedule meetings</p>
                      )}
                    </div>
                    {!integrations.calendar.connected && (
                      <Link
                        to="/settings?tab=integrations"
                        className="flex-shrink-0 px-4 py-2 border border-outline text-secondary text-xs font-bold rounded-lg hover:border-primary hover:text-primary transition-all"
                      >
                        Connect
                      </Link>
                    )}
                  </div>

                  {/* Info banner when email is not connected */}
                  {!integrations.email.connected && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] flex-shrink-0 mt-0.5">info</span>
                      <div>
                        <p className="text-xs font-bold text-amber-800 mb-1">Email not connected</p>
                        <p className="text-xs text-amber-700">
                          You can still create the campaign now, but agents won't send any emails until you connect an email account in{" "}
                          <Link to="/settings?tab=integrations" className="font-bold underline">Settings → Integrations</Link>.
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-secondary pt-1">
                    <Link to="/settings?tab=integrations" className="font-semibold text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Manage all integrations in Settings
                    </Link>
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ── STEP 2: Upload Leads ── */}
          {step === 2 && (
            <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Upload Lead List</h2>
                  <p className="text-sm text-secondary">Import a CSV with names, emails, and company info.</p>
                </div>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group transition-all ${isDragging ? "border-primary bg-primary-container/20" : csvFile ? "border-green-400 bg-green-50" : "border-outline bg-surface-container-low hover:bg-primary-container/10 hover:border-primary/50"}`}
              >
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md transition-transform group-hover:scale-110 ${csvFile ? "bg-green-500" : "bg-primary"} text-white`}>
                  <span className="material-symbols-outlined text-[28px]">{csvFile ? "check_circle" : "cloud_upload"}</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface mb-1">{csvFile ? csvFile.name : "Drop your CSV here"}</h3>
                <p className="text-xs text-secondary font-medium">
                  {csvFile ? (csvError || `${parsedLeadCount} leads parsed — click to replace`) : "or click to browse (.csv only)"}
                </p>
              </div>
            </section>
          )}

          {/* ── STEP 3: Configure ICP ── */}
          {step === 3 && (
            <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Campaign & ICP Setup</h2>
                  <p className="text-sm text-secondary">Define who you're targeting and why.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface">Campaign Name <span className="text-error">*</span></label>
                  <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. Q4 Enterprise Outreach" className="w-full bg-surface-container-low border border-outline rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface">Industry</label>
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech, SaaS" className="w-full bg-surface-container-low border border-outline rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface">Company Size</label>
                  <input type="text" value={companySize} onChange={(e) => setCompanySize(e.target.value)} placeholder="e.g. 200-500 employees" className="w-full bg-surface-container-low border border-outline rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface">Target Job Titles</label>
                  <input type="text" value={jobTitles} onChange={(e) => setJobTitles(e.target.value)} placeholder="e.g. CTO, VP Sales" className="w-full bg-surface-container-low border border-outline rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-on-surface">Problem to Solve</label>
                  <textarea value={problemToSolve} onChange={(e) => setProblemToSolve(e.target.value)} placeholder="What specific pain point does your product address?" rows={3} className="w-full bg-surface-container-low border border-outline rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-secondary resize-none" />
                </div>
              </div>
            </section>
          )}

          {/* ── STEP 4: Choose Agent Flow ── */}
          {step === 4 && (
            <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Choose Agent Flow</h2>
                  <p className="text-sm text-secondary">Select how agents will process your leads — or use the default.</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Default option */}
                <button
                  onClick={() => setSelectedWorkflowId(null)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedWorkflowId === null ? "border-primary bg-primary-container/10" : "border-outline hover:border-primary/30 bg-surface"}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">auto_awesome</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-on-surface">Default Linear Flow</p>
                      <span className="text-[10px] bg-surface-container text-secondary px-2 py-0.5 rounded-full font-semibold">Recommended</span>
                    </div>
                    <p className="text-xs text-secondary mt-0.5">Prospector → Qualifier → Booker</p>
                  </div>
                  {selectedWorkflowId === null && (
                    <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>

                {/* Saved flows */}
                {flowsLoading ? (
                  <div className="flex items-center justify-center py-8 text-secondary text-sm gap-2">
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Loading your flows...
                  </div>
                ) : availableFlows.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-outline rounded-xl">
                    <p className="text-sm text-secondary font-medium">No saved flows yet.</p>
                  </div>
                ) : (
                  availableFlows.map((flow) => {
                    const nodeTypes = [...new Set(flow.nodes.map((n) => n.type))];
                    return (
                      <button
                        key={flow.workflowId}
                        onClick={() => setSelectedWorkflowId(flow.workflowId)}
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedWorkflowId === flow.workflowId ? "border-primary bg-primary-container/10" : "border-outline hover:border-primary/30 bg-surface"}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary-container/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{flow.name}</p>
                          <p className="text-xs text-secondary mt-0.5 truncate">{flow.description || "No description"}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {nodeTypes.map((t) => (
                              <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${NODE_COLORS[t] ?? "bg-surface-container text-secondary"}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                        {selectedWorkflowId === flow.workflowId && (
                          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Create new flow shortcut */}
              <div className="mt-5 pt-5 border-t border-outline flex items-center justify-between">
                <p className="text-xs text-secondary">Need something custom?</p>
                <a
                  href="/agents/builder/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary text-xs font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Create New Flow
                </a>
              </div>
              <p className="text-[11px] text-secondary mt-2">
                After saving a new flow, come back and refresh this step — it will appear in the list above.
              </p>
            </section>
          )}

          {/* ── STEP 5: Review & Launch ── */}
          {step === 5 && (
            <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Review & Launch</h2>
                  <p className="text-sm text-secondary">Everything looks good? Let's go.</p>
                </div>
              </div>
              <div className="divide-y divide-outline">
                <ReviewRow label="Email"       value={integrations.email.connected ? (integrations.email.email ?? "Connected") : "Not connected (set up in Settings)"} />
                <ReviewRow label="Leads"       value={csvFile ? `${parsedLeadCount} leads from ${csvFile.name}` : "—"} />
                <ReviewRow label="Campaign"    value={campaignName || "—"} />
                <ReviewRow label="Industry"    value={industry || "—"} />
                <ReviewRow label="Agent Flow"  value={selectedWorkflowId
                  ? (availableFlows.find((f) => f.workflowId === selectedWorkflowId)?.name ?? selectedWorkflowId)
                  : "Default Linear Flow"} />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-256px)] bg-surface/90 backdrop-blur-md border-t border-outline py-4 px-6 z-50">
        <div className="max-w-[720px] mx-auto flex justify-between items-center">
          {step === 1 ? (
            <Link to="/campaigns" className="px-4 py-2.5 text-secondary font-semibold hover:text-on-surface transition-colors text-sm">Cancel</Link>
          ) : (
            <button onClick={prevStep} className="px-4 py-2.5 text-secondary font-semibold hover:text-on-surface transition-colors text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          )}
          <div className="flex items-center gap-3">
            {step === 3 && (
              <button onClick={handleSaveDraft} disabled={loading} className="px-5 py-2.5 bg-surface text-on-surface border border-outline rounded-lg font-semibold text-sm hover:bg-surface-container-low active:scale-[0.98] transition-all shadow-sm disabled:opacity-50">
                {loading ? "Saving..." : "Save Draft"}
              </button>
            )}
            {step < 5 ? (
              <button onClick={nextStep} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center gap-2">
                Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleLaunch} disabled={loading} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
                {loading ? "Launching..." : "Launch Campaign"}
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-sm font-semibold text-secondary">{label}</span>
      <span className="text-sm font-bold text-on-surface">{value}</span>
    </div>
  );
}