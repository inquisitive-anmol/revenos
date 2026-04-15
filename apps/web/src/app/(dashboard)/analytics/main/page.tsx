import PageMetadata from "../../../../components/shared/PageMetadata";

export default function AnalyticsPage() {
    return (
        <div>
            <PageMetadata 
              title="Sales Analytics | RevenOs" 
              description="Deep dive into your sales performance metrics, agent efficiency, and revenue forecasting."
            />
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Workspace Intelligence</h2>
                        <p className="text-on-surface-variant mt-1">Real-time performance tracking for RevenOs campaigns</p>
                    </div>
                    <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all">
                        <span>Export Report</span>
                        <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                </div>

                {/* KPI Cards Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KPI 1 */}
                    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                                +12.5% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface-variant">Total Prospects</p>
                        <h3 className="text-2xl font-extrabold mt-1">24,592</h3>
                        <div className="mt-4 h-8 w-full flex items-end gap-1">
                            <div className="flex-1 bg-primary/20 h-4 rounded-t-sm"></div>
                            <div className="flex-1 bg-primary/20 h-6 rounded-t-sm"></div>
                            <div className="flex-1 bg-primary h-8 rounded-t-sm"></div>
                            <div className="flex-1 bg-primary/40 h-5 rounded-t-sm"></div>
                            <div className="flex-1 bg-primary h-7 rounded-t-sm"></div>
                        </div>
                    </div>
                    {/* KPI 2 */}
                    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                                <span className="material-symbols-outlined">forward_to_inbox</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                                +8.2% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface-variant">Emails Sent</p>
                        <h3 className="text-2xl font-extrabold mt-1">112,804</h3>
                        <div className="mt-4 h-8 w-full flex items-end gap-1">
                            <div className="flex-1 bg-violet-500/20 h-5 rounded-t-sm"></div>
                            <div className="flex-1 bg-violet-500/40 h-4 rounded-t-sm"></div>
                            <div className="flex-1 bg-violet-500 h-6 rounded-t-sm"></div>
                            <div className="flex-1 bg-violet-500/30 h-8 rounded-t-sm"></div>
                            <div className="flex-1 bg-violet-500 h-5 rounded-t-sm"></div>
                        </div>
                    </div>
                    {/* KPI 3 */}
                    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                                +14.1% <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface-variant">Meetings Booked</p>
                        <h3 className="text-2xl font-extrabold mt-1">428</h3>
                        <div className="mt-4 h-8 w-full flex items-end gap-1">
                            <div className="flex-1 bg-amber-500/20 h-3 rounded-t-sm"></div>
                            <div className="flex-1 bg-amber-500 h-5 rounded-t-sm"></div>
                            <div className="flex-1 bg-amber-500/40 h-7 rounded-t-sm"></div>
                            <div className="flex-1 bg-amber-500 h-6 rounded-t-sm"></div>
                            <div className="flex-1 bg-amber-500/30 h-4 rounded-t-sm"></div>
                        </div>
                    </div>
                    {/* KPI 4 */}
                    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <span className="material-symbols-outlined">forum</span>
                            </div>
                            <span className="text-xs font-bold text-rose-600 flex items-center bg-rose-50 px-2 py-0.5 rounded-full">
                                -0.4% <span className="material-symbols-outlined text-[14px]">trending_down</span>
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-on-surface-variant">Overall Reply Rate</p>
                        <h3 className="text-2xl font-extrabold mt-1">3.8%</h3>
                        <div className="mt-4 h-8 w-full flex items-end gap-1">
                            <div className="flex-1 bg-emerald-500 h-6 rounded-t-sm"></div>
                            <div className="flex-1 bg-emerald-500/40 h-8 rounded-t-sm"></div>
                            <div className="flex-1 bg-emerald-500/20 h-5 rounded-t-sm"></div>
                            <div className="flex-1 bg-emerald-500 h-4 rounded-t-sm"></div>
                            <div className="flex-1 bg-emerald-500/30 h-7 rounded-t-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Domain Health & Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Domain Health Card */}
                    <div className="lg:col-span-1 bg-surface rounded-2xl shadow-sm border border-outline p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-lg text-on-surface">Domain Reputation</h4>
                            <span className="material-symbols-outlined text-on-surface-variant">verified_user</span>
                        </div>
                        <div className="bg-surface-container-low border border-primary/20 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-extrabold tracking-tight text-primary">contact.leadxai.in</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-extrabold text-on-surface">98/100</p>
                                    <p className="text-xs font-bold text-emerald-600 uppercase">Status: Good</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Risk Level</p>
                                    <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="w-1/12 h-full bg-emerald-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center py-2 border-b border-surface-container">
                                <span className="text-sm text-on-surface-variant font-medium">Bounce Rate</span>
                                <span className="text-sm font-bold text-on-surface">0.82%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-surface-container">
                                <span className="text-sm text-on-surface-variant font-medium">Spam Complaints</span>
                                <span className="text-sm font-bold text-on-surface">0.01%</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-on-surface-variant font-medium">Daily Send Volume</span>
                                <span className="text-sm font-bold text-on-surface">2,450 / 3,000</span>
                            </div>
                            <div className="mt-4 pt-4">
                                <div className="h-24 w-full flex items-end gap-1.5">
                                    <div className="w-full bg-primary/10 h-8 rounded-t"></div>
                                    <div className="w-full bg-primary/10 h-12 rounded-t"></div>
                                    <div className="w-full bg-primary/20 h-16 rounded-t"></div>
                                    <div className="w-full bg-primary/40 h-20 rounded-t"></div>
                                    <div className="w-full bg-primary/60 h-14 rounded-t"></div>
                                    <div className="w-full bg-primary/80 h-18 rounded-t"></div>
                                    <div className="w-full bg-primary h-22 rounded-t shadow-[0_-4px_12px_rgba(60,131,246,0.3)]"></div>
                                </div>
                                <p className="text-[10px] text-center text-on-surface-variant mt-2 font-semibold">Volume Trend (Last 7 Days)</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Over Time Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Meetings Bar Chart Placeholder */}
                        <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-on-surface">Meetings booked per week</h4>
                                <select className="text-xs font-bold border-none bg-surface-container rounded-lg focus:ring-0">
                                    <option>Current Quarter</option>
                                    <option>Last Quarter</option>
                                </select>
                            </div>
                            <div className="flex items-end justify-between h-48 gap-4 px-2">
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-24 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W24</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-32 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W25</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-primary/80 rounded-t-lg h-40 transition-all hover:bg-primary"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W26</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-28 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W27</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-36 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W28</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-20 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W29</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full bg-slate-100 rounded-t-lg h-32 transition-all hover:bg-primary/20"></div>
                                    <span className="text-[10px] font-bold text-on-surface-variant">W30</span>
                                </div>
                            </div>
                        </div>

                        {/* Emails Sent Line Chart Placeholder */}
                        <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-on-surface">Emails sent per day</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span className="text-xs font-bold text-on-surface-variant">Active</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                        <span className="text-xs font-bold text-on-surface-variant">Projection</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-40 w-full mt-4">
                                <svg className="w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 1000 200">
                                    <path d="M0,180 Q100,160 200,100 T400,120 T600,60 T800,80 T1000,20" fill="none" stroke="#3c83f6" strokeLinecap="round" strokeWidth="4"></path>
                                    <path d="M0,180 Q100,160 200,100 T400,120 T600,60 T800,80 T1000,20 V200 H0 Z" fill="url(#gradient)" opacity="0.1"></path>
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                            <stop offset="0%" style={{stopColor: "#3c83f6", stopOpacity: 1}}></stop>
                                            <stop offset="100%" style={{stopColor: "#3c83f6", stopOpacity: 0}}></stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campaign Comparison Table */}
                <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden">
                    <div className="px-6 py-5 border-b border-surface-container flex justify-between items-center">
                        <h4 className="font-bold text-lg text-on-surface">Campaign Comparison</h4>
                        <button className="text-primary text-sm font-bold flex items-center gap-1">
                            View All Campaigns <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low">
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Leads</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Emails</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Replies</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Meetings</th>
                                    <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                <tr className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-on-surface">Enterprise SaaS Q3</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md uppercase">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">1,240</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">4,960</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">184</td>
                                    <td className="px-6 py-4 text-sm text-on-surface font-bold">42</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-on-surface">3.3%</span>
                                            <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[33%] h-full bg-primary"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-on-surface">FinTech Outreach</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md uppercase">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">850</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">3,400</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">112</td>
                                    <td className="px-6 py-4 text-sm text-on-surface font-bold">28</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-on-surface">3.2%</span>
                                            <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[32%] h-full bg-primary"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-on-surface">Growth Agency Cold</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-md uppercase">Paused</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">2,100</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">6,300</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">42</td>
                                    <td className="px-6 py-4 text-sm text-on-surface font-bold">8</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-on-surface">0.4%</span>
                                            <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[4%] h-full bg-amber-500"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-surface-container-low transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-on-surface">Seed Series Lookalike</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md uppercase">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface">500</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">1,500</td>
                                    <td className="px-6 py-4 text-sm text-on-surface">95</td>
                                    <td className="px-6 py-4 text-sm text-on-surface font-bold">19</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-on-surface">3.8%</span>
                                            <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[38%] h-full bg-primary"></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}