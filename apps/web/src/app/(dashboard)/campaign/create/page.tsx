import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCampaigns } from "../../../../hooks/useCampaigns";
import { useCampaignStore } from "../../../../stores/campaign.store";
import { parseCSV } from "../../../../lib/csvParser";

export default function CreateCampaignPage() {
    const navigate = useNavigate();
    const { createCampaign, triggerProspector } = useCampaigns();
    const { loading } = useCampaignStore();

    const [selectedAgent, setSelectedAgent] = useState<string>("alpha");

    // Form state
    const [campaignName, setCampaignName] = useState("");
    const [goal, setGoal] = useState("Lead Generation");
    const [description, setDescription] = useState("");
    const [industry, setIndustry] = useState("");
    const [companySize, setCompanySize] = useState("");
    const [jobTitles, setJobTitles] = useState("");
    const [problemToSolve, setProblemToSolve] = useState("");
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [parsedLeadCount, setParsedLeadCount] = useState<number>(0);
    const [csvError, setCsvError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Build ICP description from fields
    const buildIcpDescription = () => {
        const parts = [];
        if (industry) parts.push(`Industry: ${industry}`);
        if (companySize) parts.push(`Company size: ${companySize}`);
        if (jobTitles) parts.push(`Titles: ${jobTitles}`);
        if (problemToSolve) parts.push(`Problem: ${problemToSolve}`);
        if (description) parts.push(`Goal: ${description}`);
        return parts.join(". ");
    };

    // CSV drag & drop
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file || !file.name.endsWith(".csv")) {
            setFormError("Please upload a valid .csv file.");
            return;
        }
        setCsvFile(file);
        setCsvError(null);
        try {
            const text = await file.text();
            const leads = parseCSV(text);
            setParsedLeadCount(leads.length);
        } catch (err: any) {
            setCsvError(err.message);
            setParsedLeadCount(0);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFile(file);
        setCsvError(null);
        try {
            const text = await file.text();
            const leads = parseCSV(text);
            setParsedLeadCount(leads.length);
        } catch (err: any) {
            setCsvError(err.message);
            setParsedLeadCount(0);
        }
    };

    // Save as draft
    const handleSaveDraft = async () => {
        if (!campaignName.trim()) {
            setFormError("Campaign name is required.");
            return;
        }
        setFormError(null);
        try {
            const icpDescription = buildIcpDescription();
            await createCampaign(campaignName.trim(), icpDescription, {
                industry,
                companySize,
                jobTitles,
                problemToSolve,
                goal,
                status: "draft",
            });
            navigate("/campaigns");
        } catch (err: any) {
            setFormError(err.message || "Failed to save draft.");
        }
    };

    // Launch campaign
    const handleLaunch = async () => {
        if (!campaignName.trim()) {
            setFormError("Campaign name is required.");
            return;
        }
        if (!industry && !jobTitles && !problemToSolve) {
            setFormError("Please fill in at least some ICP details.");
            return;
        }
        if (!csvFile) {
            setFormError("Please upload a CSV file with leads.");
            return;
        }
        setFormError(null);

        try {
            // 1. Parse CSV
            const csvText = await csvFile.text();
            const parsedLeads = parseCSV(csvText);

            if (parsedLeads.length === 0) {
                setFormError("No valid leads found in CSV.");
                return;
            }

            // 2. Create campaign
            const icpDescription = buildIcpDescription();
            const result = await createCampaign(campaignName.trim(), icpDescription, {
                industry,
                companySize,
                jobTitles,
                problemToSolve,
                goal,
                status: "active",
            });

            console.log("result: ", result);
            const newId = result?.data?.campaign?._id || result?.campaign?._id;
            if (!newId) throw new Error("Failed to get campaign ID");

            // 3. Trigger prospector with parsed leads
            await triggerProspector(newId, parsedLeads);

            // 4. Navigate to campaign detail
            navigate(`/campaigns/${newId}`);

        } catch (err: any) {
            setFormError(err.message || "Failed to launch campaign.");
        }
    };

    return (
        <div className="flex-1 bg-background relative mb-24">

            {/* Background Decorative Elements */}
            <div className="absolute top-12 right-10 opacity-[0.03] pointer-events-none -z-10">
                <span className="material-symbols-outlined text-[400px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    blur_on
                </span>
            </div>
            <div className="absolute bottom-20 left-4 opacity-[0.03] pointer-events-none -z-10">
                <span className="material-symbols-outlined text-[300px] text-primary">
                    alt_route
                </span>
            </div>

            {/* Main Form Content */}
            <main className="p-8 pb-12">
                <div className="max-w-[800px] mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create New Campaign</h1>
                        <p className="text-secondary font-medium">Define your strategy, target your audience, and deploy your AI agents.</p>
                    </div>

                    {/* Global Error */}
                    {formError && (
                        <div className="mb-6 flex items-center gap-3 bg-error/10 border border-error/20 text-error rounded-xl px-5 py-4">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <p className="text-sm font-semibold">{formError}</p>
                        </div>
                    )}

                    <div className="space-y-8">

                        {/* Section 1: Campaign Basics */}
                        <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary-container/50 text-primary flex items-center justify-center font-bold text-sm">1</div>
                                <h2 className="text-lg font-bold text-on-surface tracking-tight">Campaign Basics</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">
                                        Campaign Name <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        placeholder="e.g. Q4 Enterprise Outreach"
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Goal Selection</label>
                                    <div className="relative">
                                        <select
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none appearance-none cursor-pointer"
                                        >
                                            <option>Lead Generation</option>
                                            <option>Brand Awareness</option>
                                            <option>Event Attendance</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Briefly describe the objective of this campaign..."
                                        rows={3}
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: ICP */}
                        <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary-container/50 text-primary flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-lg font-bold text-on-surface tracking-tight">Ideal Customer Profile (ICP)</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Industry</label>
                                    <input
                                        type="text"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        placeholder="e.g. Fintech, SaaS, Healthcare"
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Company Size</label>
                                    <input
                                        type="text"
                                        value={companySize}
                                        onChange={(e) => setCompanySize(e.target.value)}
                                        placeholder="e.g. 500-1000 employees"
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Job Titles</label>
                                    <input
                                        type="text"
                                        value={jobTitles}
                                        onChange={(e) => setJobTitles(e.target.value)}
                                        placeholder="e.g. CTO, Head of Engineering, VP Sales"
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Problem to Solve</label>
                                    <textarea
                                        value={problemToSolve}
                                        onChange={(e) => setProblemToSolve(e.target.value)}
                                        placeholder="What specific pain point does your product address for these personas?"
                                        rows={3}
                                        className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Lead Source */}
                        <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary-container/50 text-primary flex items-center justify-center font-bold text-sm">3</div>
                                <h2 className="text-lg font-bold text-on-surface tracking-tight">Lead Source</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload CSV */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${isDragging
                                        ? "border-primary bg-primary-container/20"
                                        : csvFile
                                            ? "border-green-400 bg-green-50"
                                            : "border-outline bg-surface-container-low hover:bg-primary-container/20 hover:border-primary/50"
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-md transition-transform group-hover:scale-110 ${csvFile ? "bg-green-500" : "bg-primary"} text-white`}>
                                        <span className="material-symbols-outlined text-[24px]">
                                            {csvFile ? "check_circle" : "cloud_upload"}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-on-surface mb-1">
                                        {csvFile ? csvFile.name : "Upload Leads CSV"}
                                    </h3>
                                    <p className="text-xs text-secondary font-medium">
                                        {csvFile
                                            ? csvError
                                                ? csvError
                                                : `${parsedLeadCount} leads found — Click to replace`
                                            : "Drag and drop your file here, or click to browse"}
                                    </p>
                                    {csvError && (
                                        <p className="text-xs text-error font-semibold mt-2">{csvError}</p>
                                    )}
                                </div>

                                {/* Sync CRM */}
                                <div className="border border-outline bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-container transition-all cursor-pointer">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-10 h-10 bg-surface rounded-lg shadow-sm border border-outline flex items-center justify-center text-orange-500">
                                            <span className="material-symbols-outlined text-[24px]">hub</span>
                                        </div>
                                        <div className="w-10 h-10 bg-surface rounded-lg shadow-sm border border-outline flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-[24px]">sync</span>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-sm text-on-surface mb-1">Sync from CRM</h3>
                                    <p className="text-xs text-secondary font-medium">Connect Salesforce, HubSpot, or Pipedrive</p>
                                    <span className="mt-3 px-2 py-0.5 bg-surface-container border border-outline text-secondary text-[10px] font-bold rounded-full uppercase">Coming Soon</span>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Agent Selection */}
                        <section className="bg-surface p-8 rounded-2xl shadow-sm border border-outline">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-primary-container/50 text-primary flex items-center justify-center font-bold text-sm">4</div>
                                <h2 className="text-lg font-bold text-on-surface tracking-tight">Agent Selection</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Agent Card 1 */}
                                <div
                                    onClick={() => setSelectedAgent("alpha")}
                                    className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${selectedAgent === "alpha" ? "border-primary bg-primary-container/10" : "border-outline bg-surface hover:border-primary/50"}`}
                                >
                                    {selectedAgent === "alpha" && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${selectedAgent === "alpha" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container border border-outline text-secondary"}`}>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-on-surface mb-1">Alpha Outreach</h4>
                                    <p className="text-xs text-secondary leading-relaxed">High-volume LinkedIn & Email sequencer.</p>
                                </div>

                                {/* Agent Card 2 */}
                                <div
                                    onClick={() => setSelectedAgent("persona")}
                                    className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${selectedAgent === "persona" ? "border-primary bg-primary-container/10" : "border-outline bg-surface hover:border-primary/50"}`}
                                >
                                    {selectedAgent === "persona" && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${selectedAgent === "persona" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container border border-outline text-secondary"}`}>
                                        <span className="material-symbols-outlined">auto_awesome</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-on-surface mb-1">Persona Writer</h4>
                                    <p className="text-xs text-secondary leading-relaxed">Hyper-personalized message generation.</p>
                                </div>

                                {/* Agent Card 3 */}
                                <div
                                    onClick={() => setSelectedAgent("data")}
                                    className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer ${selectedAgent === "data" ? "border-primary bg-primary-container/10" : "border-outline bg-surface hover:border-primary/50"}`}
                                >
                                    {selectedAgent === "data" && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                    )}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${selectedAgent === "data" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-container border border-outline text-secondary"}`}>
                                        <span className="material-symbols-outlined">psychology</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-on-surface mb-1">Data Enrichment</h4>
                                    <p className="text-xs text-secondary leading-relaxed">Fills missing contact details in real-time.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Sticky Bottom Footer */}
            <footer className="fixed bottom-0 right-0 w-[calc(100%-256px)] bg-surface/90 backdrop-blur-md border-t border-outline py-4 px-8 z-50">
                <div className="max-w-[800px] mx-auto flex justify-between items-center">
                    <Link to="/campaigns" className="px-4 py-2.5 text-secondary font-semibold hover:text-on-surface transition-colors text-sm active:scale-95">
                        Cancel
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSaveDraft}
                            disabled={loading}
                            className="px-6 py-2.5 bg-surface text-on-surface border border-outline rounded-lg font-semibold text-sm hover:bg-surface-container-low active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Draft"}
                        </button>
                        <button
                            onClick={handleLaunch}
                            disabled={loading}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Launching..." : "Launch Campaign"}
                            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        </button>
                    </div>
                </div>
            </footer>

        </div>
    );
}