import { useState } from "react";
import { Link } from "react-router-dom";

export default function AgentDetailPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agentStatus, setAgentStatus] = useState<"Active" | "Paused">("Active");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">

      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-outline px-6 py-4 bg-surface flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <h2 className="text-lg font-bold text-on-surface tracking-tight">SalesForge AI</h2>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
          </button>
          <button className="text-secondary hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          </button>

          <div className="w-9 h-9 rounded-full bg-[#d6ccb6] flex items-center justify-center overflow-hidden shadow-sm border border-outline">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=transparent" alt="User Avatar" className="w-full h-full object-cover scale-110 translate-y-1" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 md:p-8">

        {/* Back Link */}
        <Link to="/agents" className="flex items-center gap-2 text-primary font-medium hover:underline text-sm mb-6 w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Agents
        </Link>

        {/* Agent Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-6 bg-surface p-6 rounded-xl border border-outline shadow-sm mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                polyline
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Lead Qualifier Alpha</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">Active</span>
              </div>
              <p className="text-secondary font-medium text-sm">Last deployed 2 hours ago • Version 2.4.1</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline">
              <button
                onClick={() => setAgentStatus("Active")}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${agentStatus === "Active" ? "bg-surface shadow-sm text-on-surface" : "text-secondary hover:text-on-surface"}`}
              >
                Active
              </button>
              <button
                onClick={() => setAgentStatus("Paused")}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${agentStatus === "Paused" ? "bg-surface shadow-sm text-on-surface" : "text-secondary hover:text-on-surface"}`}
              >
                Paused
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container transition-colors border border-outline">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Agent
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-outline shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-secondary text-sm font-semibold">Emails Sent</p>
              <span className="material-symbols-outlined text-outline-variant text-[20px]">mail</span>
            </div>
            <p className="text-on-surface text-3xl font-extrabold tracking-tight mt-1">1,284</p>
            <p className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +12.4% vs last week
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-outline shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-secondary text-sm font-semibold">Replies Received</p>
              <span className="material-symbols-outlined text-outline-variant text-[20px]">reply</span>
            </div>
            <p className="text-on-surface text-3xl font-extrabold tracking-tight mt-1">342</p>
            <p className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +5.2% vs last week
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-outline shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-secondary text-sm font-semibold">Qual. Rate %</p>
              <span className="material-symbols-outlined text-outline-variant text-[20px]">verified_user</span>
            </div>
            <p className="text-on-surface text-3xl font-extrabold tracking-tight mt-1">26.6%</p>
            <p className="text-green-600 text-xs font-bold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +2.1% vs last week
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface border border-outline shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-secondary text-sm font-semibold">Booked Meetings</p>
              <span className="material-symbols-outlined text-outline-variant text-[20px]">event_available</span>
            </div>
            <p className="text-on-surface text-3xl font-extrabold tracking-tight mt-1">42</p>
            <p className="text-error text-xs font-bold flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">trending_down</span>
              -0.8% vs last week
            </p>
          </div>
        </div>

        {/* Conversation History Section */}
        <div className="flex flex-col bg-surface rounded-xl border border-outline shadow-sm overflow-hidden">

          {/* Table Toolbar */}
          <div className="px-6 py-4 border-b border-outline flex flex-wrap gap-4 justify-between items-center">
            <h3 className="text-on-surface text-base font-bold">Conversation History</h3>
            <div className="flex gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leads..."
                  className="pl-9 pr-4 py-2 w-64 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-secondary font-medium"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-secondary text-xs uppercase tracking-wider font-semibold border-b border-outline">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Lead</th>
                  <th className="px-6 py-4">Message Preview</th>
                  <th className="px-6 py-4 text-center">Action</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">

                {/* Row 1 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-secondary whitespace-nowrap font-medium">Oct 24, 14:20</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">Sarah Jenkins</span>
                      <span className="text-xs text-secondary mt-0.5">CTO at TechFlow</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant max-w-sm truncate italic">
                    "I'm interested in how your AI handles complex lead..."
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container/60 text-primary">Replied</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ml-auto active:scale-95">
                      <span className="material-symbols-outlined text-[16px]">person_alert</span>
                      Escalate to Human
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-secondary whitespace-nowrap font-medium">Oct 24, 11:05</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">Michael Ross</span>
                      <span className="text-xs text-secondary mt-0.5">VP Sales at GigaCorp</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant max-w-sm truncate italic">
                    "Let's book a meeting for Thursday at 10 AM EST."
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Booked</span>
                  </td>
                  <td className="px-6 py-4 text-right pr-10">
                    <button className="text-outline-variant hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-secondary whitespace-nowrap font-medium">Oct 23, 16:45</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">Elena Rodriguez</span>
                      <span className="text-xs text-secondary mt-0.5">Founder at StealthStartup</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant max-w-sm truncate italic">
                    "Checking in if you saw my previous email regardin..."
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">Sent</span>
                  </td>
                  <td className="px-6 py-4 text-right pr-10">
                    <button className="text-outline-variant hover:text-secondary transition-colors">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-secondary whitespace-nowrap font-medium">Oct 23, 09:12</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface">David Chen</span>
                      <span className="text-xs text-secondary mt-0.5">Marketing Lead at PixelScale</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant max-w-sm truncate italic">
                    "Wait, are you a bot? Some of these answers seem..."
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container/60 text-primary">Replied</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 ml-auto active:scale-95">
                      <span className="material-symbols-outlined text-[16px]">person_alert</span>
                      Escalate to Human
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-outline flex items-center justify-between bg-surface">
            <span className="text-sm text-secondary font-medium">Showing 1-10 of 342 replies</span>
            <div className="flex items-center gap-1.5">
              <button className="flex items-center justify-center w-8 h-8 rounded border border-outline bg-surface text-secondary hover:text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded border border-primary bg-primary-container/50 text-primary text-sm font-bold">1</button>
              <button className="w-8 h-8 rounded border border-outline bg-surface text-on-surface-variant text-sm font-medium hover:border-primary hover:text-primary transition-colors">2</button>
              <button className="w-8 h-8 rounded border border-outline bg-surface text-on-surface-variant text-sm font-medium hover:border-primary hover:text-primary transition-colors">3</button>
              <button className="flex items-center justify-center w-8 h-8 rounded border border-outline bg-surface text-secondary hover:text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}