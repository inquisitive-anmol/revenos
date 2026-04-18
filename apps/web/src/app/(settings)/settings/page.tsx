import { useSearchParams } from "react-router-dom";
import PageMetadata from "../../../components/shared/PageMetadata";
import { BillingTabContent } from "../../../components/billing/BillingTabContent";
import IntegrationsTab from "../../../components/settings/IntegrationsTab";

export default function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'ai-behavior';

    const tabs = [
        { id: 'profile',       label: 'Profile' },
        { id: 'workspace',     label: 'Workspace' },
        { id: 'team',          label: 'Team' },
        { id: 'integrations',  label: 'Integrations' },
        { id: 'ai-behavior',   label: 'AI Behavior' },
        { id: 'billing',       label: 'Billing' },
        { id: 'notifications', label: 'Notifications' },
    ];

    const handleTabChange = (tabId: string) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <div>
            <PageMetadata
              title="Account Settings | RevenOs"
              description="Manage your RevenOs account, team members, and integration settings."
            />
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-on-background">Settings Hub</h1>
                    <p className="text-secondary font-medium mt-1">Configure your outreach engine and team preferences.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-outline mb-10 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-secondary hover:text-primary'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {/* ── AI Behavior ─────────────────────────────── */}
                    {activeTab === 'ai-behavior' && (
                        <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <section className="col-span-12 lg:col-span-8 space-y-6">
                                <div className="bg-surface rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-outline/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <span className="material-symbols-outlined text-tertiary text-6xl opacity-10">auto_awesome</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="material-symbols-outlined text-tertiary">psychology</span>
                                        <h2 className="text-xl font-extrabold tracking-tight">AI Behavior Core</h2>
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-on-surface-variant mb-4 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs">target</span>
                                                ICP DEFINITION (Ideal Customer Profile)
                                            </h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Industry</label>
                                                    <select className="w-full bg-surface-container-low border-outline rounded-lg text-sm focus:ring-primary focus:border-primary">
                                                        <option>SaaS & Fintech</option>
                                                        <option>HealthTech</option>
                                                        <option>Manufacturing</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Company Size</label>
                                                    <select className="w-full bg-surface-container-low border-outline rounded-lg text-sm focus:ring-primary focus:border-primary">
                                                        <option>50 - 200 Employees</option>
                                                        <option>201 - 1000 Employees</option>
                                                        <option>1000+ Enterprise</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Target Role</label>
                                                    <select className="w-full bg-surface-container-low border-outline rounded-lg text-sm focus:ring-primary focus:border-primary">
                                                        <option>VP of Sales / CRO</option>
                                                        <option>Marketing Director</option>
                                                        <option>Head of Product</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">fact_check</span>
                                                    QUALIFICATION CRITERIA
                                                </h3>
                                                <textarea className="w-full bg-surface-container-low border-outline rounded-lg text-sm h-24 focus:ring-primary focus:border-primary" placeholder="Define logic for lead qualification..." />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs">forum</span>
                                                    OUTREACH TONE
                                                </h3>
                                                <div className="flex flex-col gap-2">
                                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-primary bg-primary/5 cursor-pointer">
                                                        <input defaultChecked className="text-primary focus:ring-primary" name="tone" type="radio" />
                                                        <div>
                                                            <p className="text-sm font-semibold">Conversational</p>
                                                            <p className="text-xs text-secondary">Low-pressure, personal, brief.</p>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-outline hover:bg-slate-50 cursor-pointer">
                                                        <input className="text-primary focus:ring-primary" name="tone" type="radio" />
                                                        <div>
                                                            <p className="text-sm font-semibold">Formal & Direct</p>
                                                            <p className="text-xs text-secondary">Structured, data-driven, executive.</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                        <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-md active:scale-[0.98] transition-all">Save AI Parameters</button>
                                    </div>
                                </div>
                            </section>

                            <aside className="col-span-12 lg:col-span-4 space-y-6">
                                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline">
                                    <h3 className="font-bold flex items-center gap-2 mb-6">
                                        <span className="material-symbols-outlined text-sm">groups</span>
                                        Team
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-primary">JD</div>
                                            <div>
                                                <p className="text-sm font-bold">John Doe</p>
                                                <p className="text-[10px] text-secondary">john@revenos.ai</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-secondary uppercase">Owner</span>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* ── Integrations ─────────────────────────────── */}
                    {activeTab === 'integrations' && <IntegrationsTab />}

                    {/* ── Billing ─────────────────────────────── */}
                    {activeTab === 'billing' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <BillingTabContent />
                        </div>
                    )}

                    {/* ── Stubs ─────────────────────────────── */}
                    {['profile', 'workspace', 'team', 'notifications'].includes(activeTab) && (
                        <div className="bg-surface-container-low/50 rounded-2xl p-20 border-2 border-dashed border-outline flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                            <span className="material-symbols-outlined text-6xl text-outline mb-4">settings_suggest</span>
                            <h3 className="text-xl font-bold text-secondary uppercase tracking-widest">{activeTab} Details</h3>
                            <p className="text-secondary font-medium mt-2 max-w-xs">This section is currently under construction.</p>
                            <button
                                onClick={() => handleTabChange('ai-behavior')}
                                className="mt-6 px-6 py-2 bg-on-surface text-surface rounded-lg font-bold text-sm"
                            >
                                Back to Control Center
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}