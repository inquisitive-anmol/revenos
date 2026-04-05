import { Link } from "react-router-dom";

export default function AgentBuilderPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-outline bg-surface px-6 h-16 shrink-0 z-20 relative">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-on-surface">SalesForge AI</h2>
        </div>

        {/* Center Nav */}
        <div className="flex flex-1 justify-center max-w-xl mx-auto h-full">
          <nav className="flex items-center gap-8 h-full">
            <Link to="/dashboard" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/agents" className="text-primary text-sm font-semibold border-b-2 border-primary h-full flex items-center pt-[2px]">
              Agents
            </Link>
            <Link to="/leads" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
              Leads
            </Link>
            <Link to="/analytics" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
              Analytics
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-white text-sm font-bold px-4 py-2 transition-all shadow-sm active:scale-95">
            Deploy Agents
          </button>
          <div className="bg-[#5c7a6b] rounded-full w-9 h-9 flex items-center justify-center overflow-hidden border border-outline shadow-sm cursor-pointer hover:opacity-90">
             {/* Simple placeholder for the green avatar from screenshot */}
             <div className="w-full h-full opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Palette Sidebar */}
        <aside className="w-72 2xl:w-80 border-r border-outline bg-surface flex flex-col p-6 gap-6 overflow-y-auto shrink-0 z-10">
          <div>
            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-4">Builder Palette</h3>
            <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-bold py-2.5 mb-2 shadow-sm hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Agent
            </button>
          </div>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Campaign Goal</label>
              <input 
                className="w-full rounded-lg border border-outline bg-surface-container-low text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2.5 outline-none transition-all" 
                type="text" 
                defaultValue="Book 20 qualified meetings per month"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface">Templates</label>
              <div className="relative">
                <select className="w-full rounded-lg border border-outline bg-surface-container-low text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2.5 outline-none transition-all appearance-none cursor-pointer">
                  <option>B2B SaaS Outreach</option>
                  <option>Real Estate Lead Gen</option>
                  <option>LinkedIn Retargeting</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
          
          <hr className="border-outline my-2" />
          
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">Node Types</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-outline bg-surface-container-low/50 cursor-grab hover:bg-surface hover:border-primary/50 transition-colors group">
                <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[28px] mb-2">person_search</span>
                <span className="text-[11px] font-semibold text-on-surface-variant group-hover:text-primary">Prospector</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-outline bg-surface-container-low/50 cursor-grab hover:bg-surface hover:border-primary/50 transition-colors group">
                <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[28px] mb-2">verified</span>
                <span className="text-[11px] font-semibold text-on-surface-variant group-hover:text-primary">Qualifier</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-outline bg-surface-container-low/50 cursor-grab hover:bg-surface hover:border-primary/50 transition-colors group">
                <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[28px] mb-2">calendar_today</span>
                <span className="text-[11px] font-semibold text-on-surface-variant group-hover:text-primary">Booker</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-outline bg-surface-container-low/50 cursor-grab hover:bg-surface hover:border-primary/50 transition-colors group">
                <span className="material-symbols-outlined text-secondary group-hover:text-primary text-[28px] mb-2">mail</span>
                <span className="text-[11px] font-semibold text-on-surface-variant group-hover:text-primary">Messenger</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative bg-background overflow-hidden flex flex-col">
          
          {/* Canvas Grid Background */}
          <div 
            className="absolute inset-0 opacity-40 mix-blend-multiply" 
            style={{ 
              backgroundImage: 'radial-gradient(var(--color-outline-variant) 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }}
          />
          
          <div className="relative flex-1 p-10 overflow-auto">
            {/* Draggable Canvas Surface */}
            <div className="min-w-[1200px] min-h-[800px] relative">
              
              {/* Node 1: Prospector Agent */}
              <div className="absolute top-32 left-16 w-[280px] bg-surface rounded-xl shadow-sm border border-outline border-l-[4px] border-l-emerald-500 overflow-visible group hover:shadow-md transition-all cursor-move">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
                    </span>
                    <button className="text-outline-variant hover:text-secondary">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">person_search</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface leading-tight">Prospector Agent</h4>
                      <p className="text-xs text-secondary mt-0.5">Scanning LinkedIn Leads</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3.5 border-t border-outline rounded-b-xl flex justify-between items-center text-xs">
                  <span className="text-secondary font-medium">Processed Today</span>
                  <span className="font-bold text-on-surface">142</span>
                </div>
                {/* Out Port */}
                <div className="absolute -right-2 top-[70px] w-4 h-4 bg-primary rounded-full border-2 border-surface z-10 shadow-sm cursor-crosshair"></div>
              </div>

              {/* Flow Arrow 1 */}
              <svg className="absolute top-[182px] left-[304px] w-[140px] h-[40px] pointer-events-none" fill="none">
                <path d="M0 20 H120 M120 20 L112 14 M120 20 L112 26" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <text x="45" y="10" className="text-[10px] fill-secondary font-semibold uppercase tracking-wider">New Lead</text>
              </svg>

              {/* Node 2: Qualifier Agent */}
              <div className="absolute top-32 left-[444px] w-[280px] bg-surface rounded-xl shadow-sm border border-outline border-l-[4px] border-l-emerald-500 overflow-visible group hover:shadow-md transition-all cursor-move">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ACTIVE
                    </span>
                    <button className="text-outline-variant hover:text-secondary">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface leading-tight">Qualifier Agent</h4>
                      <p className="text-xs text-secondary mt-0.5">Intent Analysis v2</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3.5 border-t border-outline rounded-b-xl flex justify-between items-center text-xs">
                  <span className="text-secondary font-medium">Handoff Success</span>
                  <span className="font-bold text-on-surface">28%</span>
                </div>
                {/* In Port */}
                <div className="absolute -left-2 top-[70px] w-4 h-4 bg-primary rounded-full border-2 border-surface z-10 shadow-sm cursor-crosshair"></div>
                {/* Out Port */}
                <div className="absolute -right-2 top-[70px] w-4 h-4 bg-primary rounded-full border-2 border-surface z-10 shadow-sm cursor-crosshair"></div>
              </div>

              {/* Flow Arrow 2 */}
              <svg className="absolute top-[182px] left-[724px] w-[140px] h-[40px] pointer-events-none" fill="none">
                <path d="M0 20 H120 M120 20 L112 14 M120 20 L112 26" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <text x="45" y="10" className="text-[10px] fill-secondary font-semibold uppercase tracking-wider">Qualified</text>
              </svg>

              {/* Node 3: Booker Agent */}
              <div className="absolute top-32 left-[864px] w-[280px] bg-surface rounded-xl shadow-sm border border-outline border-l-[4px] border-l-slate-300 opacity-70 hover:opacity-100 overflow-visible group hover:shadow-md transition-all cursor-move">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1.5 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> PAUSED
                    </span>
                    <button className="text-outline-variant hover:text-secondary">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface-container border border-outline rounded-lg text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface leading-tight">Booker Agent</h4>
                      <p className="text-xs text-secondary mt-0.5">Calendly Automation</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-3.5 border-t border-outline rounded-b-xl flex justify-between items-center text-xs">
                  <span className="text-secondary font-medium">Last Active</span>
                  <span className="font-bold text-on-surface">2 days ago</span>
                </div>
                {/* In Port */}
                <div className="absolute -left-2 top-[70px] w-4 h-4 bg-slate-300 rounded-full border-2 border-surface z-10 shadow-sm cursor-crosshair group-hover:bg-primary transition-colors"></div>
              </div>

            </div>
          </div>
          
          {/* Bottom Toolbar */}
          <footer className="h-[72px] bg-surface/90 backdrop-blur-sm border-t border-outline px-8 flex items-center justify-between absolute bottom-0 w-full z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Flow Online
              </div>
              <span className="text-secondary text-xs font-medium">Last saved 4 mins ago</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-outline text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Draft
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-outline text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[18px]">science</span>
                Test with Sample Leads
              </button>
              
              <div className="w-px h-6 bg-outline mx-1.5"></div>
              
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-on-primary-fixed-variant transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Run Agents
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}