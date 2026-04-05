import { Link } from "react-router-dom";

export default function LeadDetailsPage() {
  return (
    <div className="bg-background text-on-background min-h-screen font-sans flex flex-col">
      
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-outline bg-surface-container-low/30 flex flex-col z-50">
        
        {/* Brand/Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20 flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
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
          <Link to="/leads" className="flex items-center gap-3 px-4 py-3 bg-surface text-primary font-semibold text-sm shadow-sm border-r-[4px] border-primary transition-all relative left-4 -ml-4 pr-8 rounded-l-lg">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            Leads
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-surface rounded-lg active:scale-[0.98] transition-all font-semibold text-sm">
            <span className="material-symbols-outlined text-[22px]">settings</span>
            Settings
          </Link>
        </nav>
        
        {/* User Profile Footer */}
        <div className="p-4 mt-auto border-t border-outline">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[#115e59] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all flex-shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover scale-110 translate-y-1" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-on-surface truncate leading-tight">Alex Sterling</p>
              <p className="text-[11px] font-medium text-secondary truncate mt-0.5">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 ml-64 bg-surface/90 backdrop-blur-md border-b border-outline flex items-center px-8">
        <div className="flex-1 max-w-2xl relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search leads, agents, or activities..." 
            className="w-full bg-surface-container-low border border-outline rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium placeholder:text-secondary shadow-sm"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8 bg-background overflow-x-hidden min-h-[calc(100vh-64px)]">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
            
            {/* Lead Title Block */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-[88px] h-[88px] rounded-2xl bg-slate-900 border-2 border-surface shadow-md overflow-hidden flex-shrink-0">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=transparent" alt="Marcus Thorne" className="w-full h-full object-cover scale-110 translate-y-2" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-surface p-[3px] rounded-full shadow-sm">
                  <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface"></div>
                </div>
              </div>
              
              <div className="pt-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-on-surface leading-none">Marcus Thorne</h1>
                  <span className="px-2.5 py-1 bg-primary-container/60 text-primary text-[10px] font-black rounded-md tracking-widest uppercase">
                    Lead Score: 98
                  </span>
                </div>
                <p className="text-secondary font-medium text-[15px]">
                  VP of Engineering at <span className="text-on-surface font-bold">CloudScale Dynamics</span>
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button className="px-5 py-2.5 bg-surface border border-outline text-on-surface font-bold text-sm rounded-xl shadow-sm hover:bg-surface-container-low transition-all active:scale-[0.98]">
                Edit Lead
              </button>
              <button className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant transition-all active:scale-[0.98] flex items-center gap-2">
                Send Message 
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Meta Data) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Contact Details Card */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-outline bg-surface-container-low/30">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">Contact Details</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Email */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline flex items-center justify-center text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Email Address</p>
                      <p className="text-sm font-bold text-on-surface truncate">m.thorne@cloudscale.io</p>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline flex items-center justify-center text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Phone Number</p>
                      <p className="text-sm font-bold text-on-surface truncate">+1 (555) 012-9934</p>
                    </div>
                  </div>
                  {/* LinkedIn */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline flex items-center justify-center text-secondary flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]">link</span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">LinkedIn Profile</p>
                      <a href="#" className="text-sm font-bold text-primary hover:underline truncate block">linkedin.com/in/mthorne</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Tags Card */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary mb-5">Focus Tags</h3>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1.5 bg-surface-container border border-outline text-on-surface-variant text-[11px] font-bold rounded-lg shadow-sm">Enterprise AI</span>
                  <span className="px-3 py-1.5 bg-surface-container border border-outline text-on-surface-variant text-[11px] font-bold rounded-lg shadow-sm">DevOps Strategy</span>
                  <span className="px-3 py-1.5 bg-primary-container text-primary border border-primary/20 text-[11px] font-bold rounded-lg shadow-sm">High Intent</span>
                  <span className="px-3 py-1.5 bg-surface-container border border-outline text-on-surface-variant text-[11px] font-bold rounded-lg shadow-sm">Series D</span>
                </div>
              </div>

              {/* Assigned Agent Card */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline p-6 flex flex-col">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary mb-4">Assigned Agent</h3>
                <div className="flex items-center gap-4 p-3 bg-surface-container-low border border-outline rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-on-surface truncate">Agent Alpha</p>
                    <p className="text-[11px] font-medium text-secondary truncate mt-0.5">Outreach Specialist v2.4</p>
                  </div>
                  <div className="flex-shrink-0 pr-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 block border-2 border-surface-container-low shadow-sm"></span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Timeline & Chat) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Activity Timeline Card */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-outline flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-secondary">Activity Timeline</h3>
                  <button className="text-primary text-xs font-bold hover:underline">View History</button>
                </div>
                
                <div className="p-8">
                  {/* Timeline Container */}
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-outline before:via-outline before:to-transparent">
                    
                    {/* Item 1 */}
                    <div className="relative flex gap-6">
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-surface border-2 border-outline flex items-center justify-center z-10 shadow-sm text-secondary">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      </div>
                      <div className="ml-16 pt-1 flex-1">
                        <p className="text-sm font-bold text-on-surface leading-tight">Meeting Booked</p>
                        <p className="text-[13px] font-medium text-secondary mt-1 max-w-lg">Strategy Consultation scheduled for next Tuesday at 2:00 PM</p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2.5">Today, 10:45 AM</p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="relative flex gap-6">
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center z-10 shadow-sm text-green-600">
                        <span className="material-symbols-outlined text-[18px]">reply</span>
                      </div>
                      <div className="ml-16 pt-1 flex-1">
                        <p className="text-sm font-bold text-on-surface leading-tight">Reply Received</p>
                        <p className="text-[13px] font-medium text-secondary mt-1 max-w-lg">Marcus responded to the second follow-up email</p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2.5">Yesterday, 4:12 PM</p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="relative flex gap-6">
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-surface border-2 border-outline flex items-center justify-center z-10 shadow-sm text-secondary">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <div className="ml-16 pt-1 flex-1">
                        <p className="text-sm font-bold text-on-surface leading-tight">Email Sent by Agent Alpha</p>
                        <p className="text-[13px] font-medium text-secondary mt-1 max-w-lg">Second follow-up regarding infrastructure scale</p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2.5">Oct 24, 09:15 AM</p>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="relative flex gap-6">
                      <div className="absolute left-0 w-10 h-10 rounded-full bg-surface border-2 border-outline flex items-center justify-center z-10 shadow-sm text-secondary">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                      </div>
                      <div className="ml-16 pt-1 flex-1">
                        <p className="text-sm font-bold text-on-surface leading-tight">Lead Created</p>
                        <p className="text-[13px] font-medium text-secondary mt-1 max-w-lg">Imported from LinkedIn Campaign "Tech Giants 2024"</p>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-2.5">Oct 22, 11:30 AM</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Chat Interface Card */}
              <div className="bg-surface rounded-2xl shadow-sm border border-outline overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-outline bg-surface-container-low/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    <h3 className="text-[11px] font-extrabold uppercase tracking-widest">Active Conversation</h3>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary-container/50 px-2 py-0.5 rounded uppercase tracking-wider border border-primary/20">
                    AI Handled
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    
                    {/* Lead Message (Left) */}
                    <div className="flex gap-4 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 border border-outline overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=transparent" alt="Marcus Thorne" className="w-full h-full object-cover scale-125 translate-y-1" />
                      </div>
                      <div className="bg-surface-container-low rounded-2xl rounded-tl-none p-4 border border-outline">
                        <div className="flex justify-between items-center mb-2 gap-6">
                          <span className="text-[13px] font-bold text-on-surface">Marcus Thorne</span>
                          <span className="text-[10px] font-bold text-secondary">Yesterday, 4:12 PM</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          Thanks for the reach out. I'm actually curious how RevenOs handles multi-cloud latency issues. If your tool can help us map that accurately, I'd be interested in a brief chat next week. Does Tuesday work?
                        </p>
                      </div>
                    </div>

                    {/* Agent Response (Right) */}
                    <div className="flex flex-row-reverse gap-4 max-w-[85%] ml-auto">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
                        <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                      </div>
                      <div className="bg-primary text-white rounded-2xl rounded-tr-none p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-2 gap-6">
                          <span className="text-[10px] font-bold text-primary-fixed-dim/80">Today, 10:45 AM</span>
                          <span className="text-[13px] font-bold">Agent Alpha</span>
                        </div>
                        <p className="text-sm text-white/95 leading-relaxed">
                          Absolutely, Marcus. Latency mapping across hybrid and multi-cloud environments is one of our core strengths. I've gone ahead and blocked off 2:00 PM next Tuesday for a session. I'll send over the invite and some preliminary technical docs now. Looking forward to it!
                        </p>
                      </div>
                    </div>

                  </div>
                  
                  {/* Expand Thread Link */}
                  <div className="mt-8 flex justify-center">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors group">
                      View Entire Conversation Thread
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-y-0.5">expand_more</span>
                    </button>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-outline bg-surface-container-low/20">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        placeholder="Intervene as Admin..." 
                        className="w-full bg-surface border border-outline rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-medium placeholder:text-secondary shadow-sm"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button className="text-secondary hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
                        <button className="text-secondary hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">mood</span></button>
                      </div>
                    </div>
                    <button className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-95 transition-all flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}