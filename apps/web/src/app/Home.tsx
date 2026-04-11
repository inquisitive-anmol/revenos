import { Link } from "react-router-dom";
import PageMetadata from "../components/shared/PageMetadata";

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background min-h-screen font-sans selection:bg-primary-container selection:text-on-primary-container">
      <PageMetadata 
        title="RevenOs | Engine of Autonomous Revenue" 
        description="RevenOs is the AI-powered sales platform that automates your entire top-of-funnel lifecycle, from prospecting to meeting booking."
      />
      
      {/* Navigation */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline/50">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <div className="flex items-center gap-10">
            <Link to="/" className="text-xl font-extrabold tracking-tighter text-on-surface">
              RevenOs
            </Link>
            <div className="hidden md:flex items-center gap-7">
              <a href="#features" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200">How it Works</a>
              <a href="#pricing" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200">Pricing</a>
              <a href="#case-studies" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors duration-200">Case Studies</a>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block">
             <Link to="/login">Login</Link>
            </button>
            <button className="bg-primary hover:bg-on-primary-fixed-variant text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm shadow-primary/20 active:scale-[0.98] transition-all duration-200">
              <Link to="/signup">Get Started</Link>
            </button>
          </div>
        </nav>
      </header>

      <main className="relative">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden flex flex-col items-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            
            {/* Version Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-surface shadow-sm rounded-full border border-outline">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                Intelligence Protocol v2.4
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tight text-on-surface max-w-5xl leading-[0.95] mb-8">
              The Engine of <span className="text-primary">Autonomous</span> Revenue
            </h1>
            
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl font-medium leading-relaxed mb-12">
              Deploy AI intelligence that maps, engages, and converts your total addressable market while you sleep.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-24 z-10 w-full sm:w-auto px-6">
              <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-on-primary-fixed-variant hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                <Link to="/dashboard">Initialize System</Link>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-outline text-on-surface rounded-2xl font-bold text-lg hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 shadow-sm">
                Watch Flow
                <span className="material-symbols-outlined text-[20px]">visibility</span>
              </button>
            </div>
            
            {/* Interactive Hero Graphic Area */}
            <div className="relative w-full max-w-6xl aspect-[21/9] md:aspect-[21/7] mt-12 rounded-[3rem] overflow-visible hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent rounded-[3rem]"></div>
              
              {/* Background Network Grid (Using custom CSS provided below) */}
              <div className="absolute inset-0 network-grid opacity-30 rounded-[3rem]"></div>
              
              {/* Animated SVG Connections */}
              <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3c83f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3c83f6" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3c83f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M100 200 Q 300 100 600 200 T 1100 200" stroke="url(#gradient1)" strokeWidth="2" fill="none" opacity="0.6" className="data-stream" />
                <path d="M100 220 Q 400 350 600 200 T 1100 180" stroke="url(#gradient2)" strokeWidth="1.5" fill="none" opacity="0.4" className="data-stream" style={{ animationDelay: '-5s' }} />
                <path d="M50 150 C 200 150 400 300 600 200 S 1000 50 1150 200" stroke="#3c83f6" strokeWidth="1" fill="none" opacity="0.2" style={{ animationDuration: '30s' }} />
                
                {/* Glow Nodes */}
                <circle cx="200" cy="150" r="4" fill="#3c83f6" className="glow-node" />
                <circle cx="450" cy="280" r="3" fill="#3c83f6" className="glow-node" />
                <circle cx="600" cy="200" r="6" fill="#3c83f6" className="glow-node" />
                <circle cx="850" cy="120" r="4" fill="#8b5cf6" className="glow-node" />
                <circle cx="1000" cy="250" r="3" fill="#3c83f6" className="glow-node" />
              </svg>

              {/* Floating Glass Cards */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                
                {/* Card 1 - Left */}
                <div className="absolute left-[5%] top-[10%] bg-surface/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-primary/5 border border-white rotate-[-2deg]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 bg-primary-container text-primary rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Efficiency Gain</span>
                  </div>
                  <div className="text-4xl font-black text-on-surface tracking-tighter">+324%</div>
                  <div className="text-[13px] font-semibold text-primary mt-1">Pipeline Lift</div>
                </div>

                {/* Card 2 - Center Bottom */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-xl px-8 py-5 rounded-full shadow-2xl shadow-primary/10 border border-white flex items-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse"></div>
                    <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-inner">
                      <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">Core Intelligence</div>
                    <div className="text-base font-bold text-on-surface leading-tight">Autonomous Agent Active</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="h-1.5 w-32 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[66%] rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-secondary">Parsing 2.4k Leads</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Right */}
                <div className="absolute right-[8%] top-[15%] bg-surface/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-tertiary/5 border border-white rotate-[3deg]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 bg-tertiary-container text-tertiary rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Autonomous Booking</span>
                  </div>
                  <div className="text-4xl font-black text-on-surface tracking-tighter">142</div>
                  <div className="text-[13px] font-semibold text-tertiary mt-1">Meetings/mo avg.</div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Brand Infrastructure Logos */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-y border-outline/50 mt-10">
          <p className="text-center text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-10">
            The Infrastructure of Choice for Category Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">FORGE</span>
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">QUANTUM</span>
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">VELOCITY</span>
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">NEXUS</span>
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">LUMINA</span>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-surface-container-low" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-6">Built for Unstoppable Scale</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
                Our autonomous nodes handle the entire top-of-funnel lifecycle with zero manual intervention required.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-10 bg-surface border border-outline rounded-[2rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-container text-primary rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">radar</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Autonomous Prospecting</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">
                  AI agents scan the web and internal databases to build perfectly segmented account lists based on your ICP.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="group p-10 bg-surface border border-outline rounded-[2rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-container text-primary rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-white shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">psychology</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Smart Qualification</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">
                  Dynamic conversation agents verify budget, authority, and need through multi-channel outreach without a human touch.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="group p-10 bg-surface border border-outline rounded-[2rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-container text-primary rounded-2xl flex items-center justify-center mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">event_available</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Instant Meeting Booking</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">
                  Leads are automatically routed to your sales team's calendars the moment they express high intent.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Case Studies Section */}
        <section className="py-32 bg-surface" id="case-studies">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container text-primary rounded-full mb-6 text-[10px] font-black uppercase tracking-widest">
                  Verified Intelligence
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-on-surface leading-tight">
                  The Protocol in <span className="text-primary">Action</span>
                </h2>
              </div>
              <p className="text-lg text-on-surface-variant font-medium max-w-md">
                Real-world deployment metrics from category leaders who have successfully automated their revenue infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Case Study 1 */}
              <div className="group relative overflow-hidden rounded-[3rem] border border-outline bg-surface-container-low hover:border-primary/30 transition-all duration-500">
                <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden flex items-center justify-center p-12">
                   <div className="absolute inset-0 network-grid opacity-20"></div>
                   <div className="relative z-10 flex flex-col items-center text-center">
                     <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">FORGE</span>
                     <div className="h-0.5 w-12 bg-primary"></div>
                   </div>
                   {/* Decorative elements */}
                   <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all"></div>
                </div>
                <div className="p-10">
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1">
                      <div className="text-3xl font-black text-on-surface tracking-tighter">5.4x</div>
                      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Pipeline Velocity</div>
                    </div>
                    <div className="w-px h-12 bg-outline"></div>
                    <div className="flex-1 pl-4">
                      <div className="text-3xl font-black text-on-surface tracking-tighter">12d</div>
                      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Avg. Sales Cycle</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4">Autonomous Outbound at Scale</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed mb-8">
                    Forge replaced their 12-person SDR team with 4 RevenOs Delta-nodes, increasing qualified meeting volume by 440% while reducing overhead costs by 70%.
                  </p>
                  <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group-hover:text-on-primary-fixed-variant">
                    Read Intelligence Report
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Case Study 2 */}
              <div className="group relative overflow-hidden rounded-[3rem] border border-outline bg-surface-container-low hover:border-primary/30 transition-all duration-500">
                <div className="aspect-[16/9] bg-slate-950 relative overflow-hidden flex items-center justify-center p-12">
                   <div className="absolute inset-0 network-grid opacity-20"></div>
                   <div className="relative z-10 flex flex-col items-center text-center">
                     <span className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">VELOCITY</span>
                     <div className="h-0.5 w-12 bg-tertiary"></div>
                   </div>
                   <div className="absolute -top-12 -left-12 w-48 h-48 bg-tertiary/10 blur-[60px] rounded-full group-hover:bg-tertiary/20 transition-all"></div>
                </div>
                <div className="p-10">
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1">
                      <div className="text-3xl font-black text-on-surface tracking-tighter">142%</div>
                      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Quota Attainment</div>
                    </div>
                    <div className="w-px h-12 bg-outline"></div>
                    <div className="flex-1 pl-4">
                      <div className="text-3xl font-black text-on-surface tracking-tighter">$2.4M</div>
                      <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">New Pipeline/Mo</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-4">Precision Global Expansion</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed mb-8">
                    Velocity utilized RevenOs to map and engage the entire DACH region within 3 weeks, identifying 4,000+ qualified target accounts with zero localized hiring.
                  </p>
                  <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group-hover:text-on-primary-fixed-variant">
                    Read Intelligence Report
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section (Dark Mode) */}
        <section className="py-24 overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-6">
            {/* Outer Dark Wrapper */}
            <div className="bg-slate-950 rounded-[3rem] p-4 md:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Decorative blurry blobs behind dashboard */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-tertiary/15 blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
              
              {/* Dashboard Container */}
              <div className="relative z-10 border border-slate-800 rounded-[2rem] bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
                
                {/* Mock Browser/Dashboard Header */}
                <div className="border-b border-slate-800/80 px-8 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="h-5 w-px bg-slate-700/50"></div>
                    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Agent Workspace // Delta-9</span>
                  </div>
                  <div className="px-3 py-1 bg-primary/15 rounded-full border border-primary/20">
                    <span className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-wider">Active Engine</span>
                  </div>
                </div>
                
                {/* Dashboard Grid Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Main Chart */}
                  <div className="md:col-span-8">
                    <div className="h-full min-h-[320px] w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-7 flex flex-col relative">
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <h4 className="text-white font-bold text-lg">Revenue Trajectory</h4>
                          <p className="text-slate-500 text-sm mt-0.5">Autonomous growth forecasting</p>
                        </div>
                        <span className="text-primary material-symbols-outlined">trending_up</span>
                      </div>
                      
                      {/* Bar Chart Mockup */}
                      <div className="flex items-end justify-between gap-3 flex-1 px-2">
                        <div className="w-full bg-primary/20 h-[30%] rounded-t-xl hover:bg-primary/30 transition-colors cursor-pointer"></div>
                        <div className="w-full bg-primary/30 h-[45%] rounded-t-xl hover:bg-primary/40 transition-colors cursor-pointer"></div>
                        <div className="w-full bg-primary/40 h-[40%] rounded-t-xl hover:bg-primary/50 transition-colors cursor-pointer"></div>
                        <div className="w-full bg-primary/60 h-[70%] rounded-t-xl hover:bg-primary/70 transition-colors cursor-pointer"></div>
                        <div className="w-full bg-primary/50 h-[60%] rounded-t-xl hover:bg-primary/60 transition-colors cursor-pointer"></div>
                        <div className="w-full bg-primary h-[90%] rounded-t-xl shadow-[0_0_25px_rgba(60,131,246,0.4)] relative cursor-pointer group">
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$42k MRR</div>
                        </div>
                      </div>
                      
                      {/* X-Axis Labels */}
                      <div className="mt-5 flex justify-between text-[11px] font-bold text-slate-600 uppercase px-4">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Side Widgets */}
                  <div className="md:col-span-4 flex flex-col gap-5">
                    
                    {/* Top Segments Widget */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                      <p className="text-slate-500 text-[11px] font-black tracking-widest uppercase mb-5">Top Converting Segments</p>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-white text-sm font-semibold">SaaS Enterprise</span>
                            <span className="text-primary-fixed-dim font-bold">84%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary w-[84%] h-full rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-white text-sm font-semibold">Fintech Scaleup</span>
                            <span className="text-primary-fixed-dim font-bold">62%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary w-[62%] h-full rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metrics Widget */}
                    <div className="bg-primary p-7 rounded-2xl text-white shadow-lg shadow-primary/20 flex-1 flex flex-col justify-center">
                      <p className="text-primary-fixed text-[11px] font-black tracking-widest uppercase mb-2">Weekly Meetings</p>
                      <h4 className="text-5xl font-black tracking-tighter">48</h4>
                      <div className="mt-3 text-sm font-bold text-white/90 bg-white/20 w-fit px-3 py-1 rounded-full">+12% vs last week</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 bg-surface" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-6">The Path to Autonomy</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
                Three steps to disconnect from manual grunt work and focus on high-level strategy.
              </p>
            </div>
            
            <div className="relative">
              {/* Horizontal Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-outline-variant -z-10"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-surface border-[3px] border-primary rounded-full flex items-center justify-center text-primary text-2xl font-black mb-8 shadow-xl shadow-primary/10">1</div>
                  <h3 className="text-xl font-bold text-on-surface mb-4">Connect Integrations</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm">
                    Plug RevenOs into your CRM, LinkedIn, and Email in seconds. Our protocol maps your existing data infrastructure immediately.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-surface border-[3px] border-primary rounded-full flex items-center justify-center text-primary text-2xl font-black mb-8 shadow-xl shadow-primary/10">2</div>
                  <h3 className="text-xl font-bold text-on-surface mb-4">Train Your Agents</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm">
                    Define your ideal customer profile and brand voice. Our LLMs learn your value prop through existing case studies and documentation.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-surface border-[3px] border-primary rounded-full flex items-center justify-center text-primary text-2xl font-black mb-8 shadow-xl shadow-primary/10">3</div>
                  <h3 className="text-xl font-bold text-on-surface mb-4">Go Live & Scale</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm">
                    Deploy your agents. Watch as they start conversations, handle objections, and fill your calendar with qualified opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-32 bg-surface-container-low" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface mb-6">Investment in Autonomy</h2>
              <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium">
                Choose the compute power required to dominate your market. Scale up as your autonomous engine matures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plan 1: Free */}
              <div className="bg-surface border border-outline rounded-[3rem] p-10 flex flex-col hover:shadow-xl transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-on-surface mb-2">Starter Node</h3>
                  <p className="text-on-surface-variant text-sm font-medium">For individual operators and small tests.</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black text-on-surface">$0</span>
                  <span className="text-on-surface-variant font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    100 Emails per Month
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    Basic ICP Mapping
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant font-medium text-sm text-opacity-50">
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    Smart Qualification
                  </li>
                </ul>
                <button className="w-full py-4 bg-surface border border-outline text-on-surface rounded-2xl font-bold hover:bg-surface-container transition-all">
                  Initialize Free Node
                </button>
              </div>

              {/* Plan 2: $99 (Popular) */}
              <div className="bg-primary text-white border border-primary rounded-[3rem] p-10 flex flex-col shadow-2xl shadow-primary/20 scale-105 relative z-10">
                <div className="absolute top-6 right-8 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">Most Deployed</span>
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">Accelerator Engine</h3>
                  <p className="text-white/80 text-sm font-medium">For high-growth teams ready to scale.</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black">$99</span>
                  <span className="text-white/70 font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-white font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Unlimited Emails
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Smart Qualification AI
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    CRM & LinkedIn Sync
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium text-sm">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Multi-channel Outreach
                  </li>
                </ul>
                <button className="w-full py-4 bg-white text-primary rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all">
                  Launch Accelerator
                </button>
              </div>

              {/* Plan 3: $499 */}
              <div className="bg-slate-950 text-white border border-slate-800 rounded-[3rem] p-10 flex flex-col hover:border-primary/50 transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">Sovereign Instance</h3>
                  <p className="text-slate-400 text-sm font-medium">Uncapped compute for category leaders.</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black">$499</span>
                  <span className="text-slate-500 font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    Dedicated Agent Training
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    Custom LLM Fine-tuning
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    Priority Node Access
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                    White-glove Protocol Ops
                  </li>
                </ul>
                <button className="w-full py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                  Initialize Sovereign
                </button>
              </div>
            </div>
            
            <p className="text-center mt-12 text-on-surface-variant text-sm font-medium">
              Need a custom deployment? <a href="#" className="text-primary font-bold underline underline-offset-4">Talk to an Infrastructure Engineer</a>
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="bg-inverse-surface rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
              
              {/* Subtle background grid in dark CTA */}
              <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                  Ready to scale your revenue?
                </h2>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                  Join 200+ high-growth companies using RevenOs to automate their sales development engine.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-on-primary-fixed-variant hover:-translate-y-1 active:translate-y-0 transition-all">
                    Get Started Now
                  </button>
                  <button className="w-full sm:w-auto px-10 py-4 bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all">
                    Schedule Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16">
            
            {/* Brand Col */}
            <div className="col-span-1 md:col-span-2">
              <a href="#" className="text-2xl font-black tracking-tighter text-on-surface mb-6 block">RevenOs</a>
              <p className="text-sm text-secondary max-w-sm leading-relaxed font-medium">
                Pioneering the first truly autonomous sales ecosystem. Designed for high-velocity revenue organizations that demand precision.
              </p>
            </div>
            
            {/* Links Col 1 */}
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-widest text-on-surface mb-6">System</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Protocol Features</a></li>
                <li><a href="#pricing" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#case-studies" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Case Studies</a></li>
              </ul>
            </div>
            
            {/* Links Col 2 */}
            <div>
              <h4 className="font-black text-[11px] uppercase tracking-widest text-on-surface mb-6">Organization</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Security Ops</a></li>
                <li><a href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Global Nodes</a></li>
                <li><a href="#" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Direct Line</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-outline flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-medium text-secondary">
              © 2024 RevenOs. All rights reserved. Precision Intelligence.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">terminal</span>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}