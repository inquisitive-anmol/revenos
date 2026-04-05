import { useState } from "react";
import { Link } from "react-router-dom";

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-outline bg-surface-container-low/30 flex flex-col z-50">
        
        {/* Brand/Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              fort
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tighter text-primary leading-none">RevenOs</span>
            <span className="text-[9px] font-bold tracking-widest text-secondary uppercase mt-1">Precision Velocity</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">grid_view</span>
            Dashboard
          </Link>
          <Link to="/agents" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            Agents
          </Link>
          <Link to="/campaigns" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            Campaigns
          </Link>
          <Link to="/pipeline" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">alt_route</span>
            Pipeline
          </Link>
          {/* Active State Link */}
          <Link to="/leads" className="flex items-center gap-3 px-4 py-3 bg-surface text-primary font-semibold text-sm shadow-sm border-r-[4px] border-primary transition-all relative left-4 -ml-4 pr-8">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            Leads
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">settings</span>
            Settings
          </Link>
        </nav>
        
        {/* Storage Widget */}
        <div className="p-4 mt-auto border-t border-outline">
          <div className="bg-primary-container/30 rounded-xl p-4 border border-outline">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Storage Usage</p>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-primary h-full w-[75%] rounded-full"></div>
            </div>
            <p className="text-[11px] text-secondary font-medium">75% of 10k leads used</p>
          </div>
        </div>
      </aside>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 ml-64 bg-surface/80 backdrop-blur-md border-b border-outline flex justify-between items-center px-8">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center bg-surface-container-low rounded-lg px-4 py-2 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
            <span className="material-symbols-outlined text-secondary text-[20px] mr-2">search</span>
            <input 
              type="text" 
              placeholder="Search across RevenOs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-secondary font-medium"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-5 ml-4">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center text-secondary hover:text-primary transition-colors rounded-full active:scale-95 relative">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-secondary hover:text-primary transition-colors rounded-full active:scale-95">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
          </div>
          
          <div className="h-8 w-px bg-outline mx-1"></div>
          
          <button className="flex items-center gap-3 text-left group">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-on-surface leading-none group-hover:text-primary transition-colors">Alex Rivera</span>
              <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider mt-1">Precision Velocity</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#fde0d9] flex items-center justify-center overflow-hidden border border-outline shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover scale-110 translate-y-1" />
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8 bg-background overflow-x-hidden min-h-[calc(100vh-64px)]">
        
        {/* Header & Stats Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          
          {/* Header Card */}
          <div className="xl:col-span-1 bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-1.5">Leads Inventory</h1>
              <p className="text-sm font-medium text-secondary leading-relaxed">Manage and nurture your high-velocity pipeline.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-primary text-white text-sm font-bold py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Lead
              </button>
              <button className="flex-1 bg-surface text-on-surface border border-outline text-sm font-bold py-2.5 rounded-xl hover:bg-surface-container-low active:scale-[0.98] transition-all">
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards Wrapper */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Qualified Leads Card (Blue) */}
            <div className="bg-primary p-6 rounded-2xl shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <p className="text-primary-fixed text-[10px] font-bold uppercase tracking-widest mb-1.5">Qualified Leads</p>
                  <h3 className="text-4xl font-black text-white tracking-tight">1,284</h3>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-primary-fixed text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  +12% from last week
                </div>
              </div>
              {/* Background Icon */}
              <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[140px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>

            {/* Conversion Rate Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
              <div>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Conversion Rate</p>
                <h3 className="text-4xl font-black text-on-surface tracking-tight">24.8%</h3>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mt-6 overflow-hidden">
                <div className="bg-tertiary h-full w-[24.8%] rounded-full"></div>
              </div>
            </div>

            {/* Active Outreach Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-outline flex flex-col justify-between">
              <div>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1.5">Active Outreach</p>
                <h3 className="text-4xl font-black text-on-surface tracking-tight">452</h3>
              </div>
              <div className="flex -space-x-2 mt-6">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=J&backgroundColor=0f172a" alt="Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover relative z-30" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=S&backgroundColor=334155" alt="Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover relative z-20" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=M&backgroundColor=0f172a" alt="Member" className="w-8 h-8 rounded-full border-2 border-surface object-cover relative z-10" />
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-[9px] font-bold text-secondary relative z-0">
                  +12
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-outline flex flex-wrap items-center justify-between gap-4 bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              {/* Dropdown 1 */}
              <div className="relative">
                <select className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Nurturing</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>
              {/* Dropdown 2 */}
              <div className="relative">
                <select className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm">
                  <option>High Score (80+)</option>
                  <option>Med Score (40-79)</option>
                  <option>Low Score (&lt;40)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>
              {/* Dropdown 3 */}
              <div className="relative">
                <select className="appearance-none bg-surface border border-outline rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container-low transition-colors shadow-sm">
                  <option>All Industries</option>
                  <option>SaaS</option>
                  <option>Fintech</option>
                  <option>HealthTech</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-xs font-semibold text-secondary">Showing 10 of 1,284 results</p>
              <div className="flex items-center border border-outline rounded-lg overflow-hidden bg-surface shadow-sm">
                <button className="p-2 hover:bg-surface-container-low transition-colors text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <div className="w-px h-5 bg-outline"></div>
                <button className="p-2 hover:bg-surface-container-low transition-colors text-secondary hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low/30">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Name & Persona</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Company & Industry</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Lead Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline">Last Activity</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary border-b border-outline text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/50">
                
                {/* Lead 1 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=0f172a" alt="Jordan Smith" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-900" />
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none mb-1.5">Jordan Smith</p>
                        <p className="text-xs font-medium text-secondary">VP of Growth</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-on-surface leading-none mb-2">CloudScale AI</p>
                    <span className="text-[10px] font-bold text-primary bg-primary-container/40 px-2.5 py-0.5 rounded-md">SaaS</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 text-xs font-black rounded-lg">98</div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-3.5 bg-green-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-green-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-primary text-[11px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                      Qualified
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-on-surface leading-none mb-1.5">2 hours ago</p>
                    <p className="text-[11px] text-secondary font-medium italic">Opened "Proposal v2"</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Lead 2 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=0f172a" alt="Sarah Chen" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-900" />
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none mb-1.5">Sarah Chen</p>
                        <p className="text-xs font-medium text-secondary">Chief Technology Officer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-on-surface leading-none mb-2">Lumina Fintech</p>
                    <span className="text-[10px] font-bold text-tertiary bg-tertiary-container/50 px-2.5 py-0.5 rounded-md">Fintech</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black rounded-lg">62</div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-3.5 bg-amber-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-amber-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-surface-container-highest rounded-full"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-outline text-secondary text-[11px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                      Nurturing
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-on-surface leading-none mb-1.5">Yesterday</p>
                    <p className="text-[11px] text-secondary font-medium italic">Replied to sequence</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Lead 3 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-secondary text-sm border border-outline">MA</div>
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none mb-1.5">Marcus Aurelius</p>
                        <p className="text-xs font-medium text-secondary">Director of Ops</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-on-surface leading-none mb-2">Heritage Brands</p>
                    <span className="text-[10px] font-bold text-secondary bg-surface-container-high px-2.5 py-0.5 rounded-md border border-outline">Retail</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 text-xs font-black rounded-lg">24</div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-3.5 bg-red-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-surface-container-highest rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-surface-container-highest rounded-full"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 text-[11px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-on-surface leading-none mb-1.5">Oct 24, 2023</p>
                    <p className="text-[11px] text-secondary font-medium italic">Demo requested</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>

                {/* Lead 4 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3.5">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=0f172a" alt="Elena Rodriguez" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-900" />
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none mb-1.5">Elena Rodriguez</p>
                        <p className="text-xs font-medium text-secondary">Sales Enablement</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-on-surface leading-none mb-2">SwiftLogistics</p>
                    <span className="text-[10px] font-bold text-primary-container bg-primary-fixed-dim/20 text-on-primary-container px-2.5 py-0.5 rounded-md border border-primary-fixed-dim">Transport</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 bg-green-50 border border-green-100 text-green-700 text-xs font-black rounded-lg">84</div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-3.5 bg-green-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-green-500 rounded-full"></div>
                        <div className="w-1.5 h-3.5 bg-surface-container-highest rounded-full"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 text-[11px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                      Contacted
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-on-surface leading-none mb-1.5">4 mins ago</p>
                    <p className="text-[11px] text-secondary font-medium italic">Clicked "Pricing Link"</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-5 bg-surface-container-low/30 border-t border-outline flex items-center justify-between">
            <div className="flex gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface shadow-sm text-xs font-bold text-primary border border-outline">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface hover:shadow-sm text-xs font-bold text-secondary hover:text-on-surface transition-all">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface hover:shadow-sm text-xs font-bold text-secondary hover:text-on-surface transition-all">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-secondary font-bold text-xs tracking-widest">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface hover:shadow-sm text-xs font-bold text-secondary hover:text-on-surface transition-all">12</button>
            </div>
            <div className="text-[11px] font-bold text-secondary uppercase tracking-widest">
              Showing 10 of 1,284
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}