import PageMetadata from "../../../components/shared/PageMetadata";

export default function SettingsPage() {
    return (
        <div>
            <PageMetadata 
              title="Account Settings | RevenOs" 
              description="Manage your RevenOs account, team members, and integration settings."
            />
            {/* Main Canvas Content */}
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-on-background">Settings Hub</h1>
                    <p className="text-secondary font-medium mt-1">Configure your outreach engine and team preferences.</p>
                </div>
                
                {/* Tabs Navigation (Horizontal) */}
                <div className="flex gap-6 border-b border-outline mb-10 overflow-x-auto no-scrollbar">
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Profile</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Workspace</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Team</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Email Config</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Calendar</button>
                    <button className="pb-4 text-sm font-semibold text-primary border-b-2 border-primary">AI Behavior</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Billing</button>
                    <button className="pb-4 text-sm font-semibold text-secondary hover:text-primary transition-colors">Notifications</button>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-12 gap-6">
                    {/* AI Behavior Hero (Active Tab Section) */}
                    <section className="col-span-12 lg:col-span-8 space-y-6">
                        <div className="bg-surface rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-outline/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="material-symbols-outlined text-tertiary text-6xl opacity-10" data-icon="auto_awesome">auto_awesome</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-tertiary" data-icon="psychology">psychology</span>
                                <h2 className="text-xl font-extrabold tracking-tight">AI Behavior Core</h2>
                            </div>
                            
                            <div className="space-y-8">
                                {/* ICP Definition */}
                                <div>
                                    <h3 className="text-sm font-bold text-on-surface-variant mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs" data-icon="target">target</span>
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
                                
                                {/* Qualification & Tone */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs" data-icon="fact_check">fact_check</span>
                                            QUALIFICATION CRITERIA
                                        </h3>
                                        <textarea className="w-full bg-surface-container-low border-outline rounded-lg text-sm h-24 focus:ring-primary focus:border-primary" placeholder="Define logic for lead qualification... e.g. 'Must use Salesforce and have a team of > 10 reps'"></textarea>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs" data-icon="forum">forum</span>
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

                        {/* Email & Calendar Status Cards (Horizontal Row) */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Email Configuration */}
                            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-500" data-icon="alternate_email">alternate_email</span>
                                        <h3 className="font-bold">Email Config</h3>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">Connected</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-secondary">Daily Send Limit</span>
                                        <span className="font-bold">142 / 200</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[71%]"></div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-sm font-medium">Signature Toggle</span>
                                        <button className="w-10 h-5 bg-primary rounded-full relative transition-colors">
                                            <div className="absolute right-1 top-1 bg-white w-3 h-3 rounded-full"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Configuration */}
                            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-purple-500" data-icon="event_available">event_available</span>
                                        <h3 className="font-bold">Calendar</h3>
                                    </div>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">Nylas Auth</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs text-secondary">Working Hours: <span className="text-on-surface font-semibold">09:00 - 18:00</span></p>
                                    <p className="text-xs text-secondary">Meeting Buffer: <span className="text-on-surface font-semibold">15 mins</span></p>
                                    <button className="w-full mt-2 py-1.5 border border-outline rounded-lg text-xs font-bold text-on-surface hover:bg-slate-50">Adjust Availability</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sidebar Content Sections (Team & Billing) */}
                    <aside className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Team Management */}
                        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm" data-icon="groups">groups</span>
                                    Team
                                </h3>
                                <button className="text-xs font-bold text-primary hover:underline">Invite +</button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-primary">JD</div>
                                        <div>
                                            <p className="text-sm font-bold">John Doe</p>
                                            <p className="text-[10px] text-secondary">john@revenos.ai</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-secondary uppercase">Owner</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-xs font-bold text-tertiary">SA</div>
                                        <div>
                                            <p className="text-sm font-bold">Sarah Adams</p>
                                            <p className="text-[10px] text-secondary">sarah@revenos.ai</p>
                                        </div>
                                    </div>
                                    <select className="text-[10px] font-bold text-secondary uppercase bg-transparent border-none p-0 focus:ring-0 cursor-pointer">
                                        <option>Member</option>
                                        <option>Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Minimalist Billing */}
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-full blur-3xl opacity-20"></div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Usage Stats</h3>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div>
                                    <p className="text-2xl font-extrabold tracking-tight">2.4k</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Emails Sent</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold tracking-tight">42</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Meetings</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs text-slate-300">You're at 80% of your current plan limit.</p>
                                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-extrabold text-sm hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    Upgrade Plan
                                    <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Help Center Link */}
                        <div className="p-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline flex flex-col items-center text-center">
                            <span className="material-symbols-outlined text-secondary mb-2" data-icon="support_agent">support_agent</span>
                            <p className="text-sm font-bold">Need assistance?</p>
                            <p className="text-xs text-secondary mb-4">Our strategy team is ready to help tune your AI behavior.</p>
                            <a className="text-xs font-extrabold text-primary uppercase tracking-wider hover:underline" href="#">Book a Strategy Session</a>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}