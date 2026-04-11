import { useState } from "react";
import { Link } from "react-router-dom";
import PageMetadata from "../../../components/shared/PageMetadata";
import { useUIStore } from "../../../stores/ui.store";
import { NotificationPanel } from "../../../components/shared/NotificationPanel";

export default function AgentBuilderPage() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans overflow-hidden">
      <PageMetadata 
        title="AI Agents | RevenOs" 
        description="Build and deploy autonomous AI agents to handle your sales outreach." 
      />
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-outline bg-surface px-4 md:px-6 h-16 shrink-0 z-20 relative">
        {/* Left: Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                rocket_launch
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-on-surface hidden sm:block">RevenOS Agents</h2>
          </div>
        </div>

        {/* Center Nav - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 justify-center max-w-xl mx-auto h-full">
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
            <Link to="/pipeline" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
              Pipeline
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative text-secondary hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-low ${isNotificationsOpen ? 'text-primary bg-surface-container-low' : ''}`}
            >
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isNotificationsOpen ? "'FILL' 1" : "" }}>
                notifications
              </span>
            </button>
            {isNotificationsOpen && <NotificationPanel onClose={() => setIsNotificationsOpen(false)} />}
          </div>

          <button className="flex items-center justify-center rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 transition-all shadow-sm active:scale-95 whitespace-nowrap">
            Deploy Agents
          </button>
          <div className="bg-[#5c7a6b] rounded-full w-9 h-9 flex items-center justify-center overflow-hidden border border-outline shadow-sm cursor-pointer hover:opacity-90 shrink-0">
             <div className="w-full h-full opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Palette Sidebar - Responsive Drawer */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 2xl:w-80 bg-surface border-r border-outline flex flex-col p-6 gap-6 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 overflow-y-auto shrink-0
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between lg:block">
            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-0 lg:mb-4">Builder Palette</h3>
            <button 
              onClick={closeMobileMenu}
              className="lg:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div>
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
          
          <div className="relative flex-1 p-4 md:p-10 overflow-auto">
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
          <footer className="bg-surface/90 backdrop-blur-sm border-t border-outline px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 absolute bottom-0 w-full z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Flow Online
              </div>
              <span className="text-secondary text-[10px] font-medium hidden xs:block">Last saved 4 mins ago</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center">
              <button title="Save Draft" className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-surface border border-outline text-xs md:text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 flex-1 sm:flex-none">
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span className="hidden md:inline">Save Draft</span>
              </button>
              <button title="Test Flow" className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-surface border border-outline text-xs md:text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 flex-1 sm:flex-none">
                <span className="material-symbols-outlined text-[18px]">science</span>
                <span className="hidden md:inline">Test Leads</span>
              </button>
              
              <div className="w-px h-6 bg-outline mx-1 hidden sm:block"></div>
              
              <button className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-primary text-white text-xs md:text-sm font-bold shadow-sm hover:bg-on-primary-fixed-variant transition-all active:scale-95 flex-1 sm:flex-none">
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