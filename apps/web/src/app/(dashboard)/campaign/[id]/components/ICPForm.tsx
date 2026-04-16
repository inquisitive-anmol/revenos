import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../../../../lib/api";

interface ICPFormProps {
  campaignId: string;
}

export function ICPForm({ campaignId }: ICPFormProps) {
  const api = useApi();

  const [industriesStr, setIndustriesStr] = useState("");
  const [titlesStr, setTitlesStr] = useState("");
  
  const [companySizeMin, setCompanySizeMin] = useState<number | ''>('');
  const [companySizeMax, setCompanySizeMax] = useState<number | ''>('');
  const [enableSize, setEnableSize] = useState(false);

  const [locationsStr, setLocationsStr] = useState("");
  const [enableLocations, setEnableLocations] = useState(false);

  const [keywordsStr, setKeywordsStr] = useState("");
  const [enableKeywords, setEnableKeywords] = useState(false);

  const [excludeDomainsStr, setExcludeDomainsStr] = useState("");
  const [enableExcludeDomains, setEnableExcludeDomains] = useState(false);

  const [maxLeads, setMaxLeads] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [is402, setIs402] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  const parseCSVString = (val: string) => val.split(",").map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIs402(false);
    setSuccess(null);

    const industries = parseCSVString(industriesStr);
    const titles = parseCSVString(titlesStr);

    if (industries.length === 0 || titles.length === 0) {
      setError("Industries and Titles are required (comma separated).");
      setLoading(false);
      return;
    }

    const payload: any = {
      industries,
      titles,
      maxLeads
    };

    if (enableSize && companySizeMin !== '') payload.companySizeMin = Number(companySizeMin);
    if (enableSize && companySizeMax !== '') payload.companySizeMax = Number(companySizeMax);
    
    if (enableLocations) {
      const locations = parseCSVString(locationsStr);
      if (locations.length > 0) payload.locations = locations;
    }

    if (enableKeywords) {
      const keywords = parseCSVString(keywordsStr);
      if (keywords.length > 0) payload.keywords = keywords;
    }

    if (enableExcludeDomains) {
      const domains = parseCSVString(excludeDomainsStr);
      if (domains.length > 0) payload.excludeDomains = domains;
    }

    try {
      await api.post(`/api/v1/campaigns/${campaignId}/prospect/icp`, payload);
      setSuccess("Sourcing started — leads will appear shortly");
    } catch (err: any) {
      if (err.response?.status === 402) {
        setIs402(true);
        setError("Insufficient credits");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to start ICP sourcing.");
      }
    } finally {
      setLoading(false);
    }
  };

  const estimatedCredits = maxLeads * 10; // LEAD_SOURCED cost is 10

  return (
    <div className="bg-surface p-8 rounded-2xl shadow-sm border border-outline mt-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">target</span>
          Find Leads via ICP
        </h2>
        <span className="bg-primary-container/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Mode 2 Sourcing</span>
      </div>

      {error && (
        <div className="mb-6 flex flex-col gap-2 bg-error/10 border border-error/20 text-error rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
          {is402 && (
            <Link to="/billing" className="text-sm font-bold text-error underline hover:text-error/80 mt-1 ml-8">
              Go to Billing Page →
            </Link>
          )}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">
              Industries <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={industriesStr}
              onChange={(e) => setIndustriesStr(e.target.value)}
              placeholder="e.g. SaaS, Healthcare"
              className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
            />
            <p className="text-[10px] text-secondary">Comma separated</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface">
              Job Titles <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={titlesStr}
              onChange={(e) => setTitlesStr(e.target.value)}
              placeholder="e.g. CTO, VP Sales"
              className="w-full bg-surface-container-low border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all p-3 text-sm outline-none placeholder:text-secondary"
            />
            <p className="text-[10px] text-secondary">Comma separated</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Company Size */}
          <div className="flex items-start gap-4">
            <input type="checkbox" checked={enableSize} onChange={() => setEnableSize(!enableSize)} className="mt-1" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-on-surface">Company Size</label>
              {enableSize && (
                <div className="flex gap-4">
                  <input type="number" value={companySizeMin} onChange={e => setCompanySizeMin(e.target.value ? Number(e.target.value) : '')} placeholder="Min" className="w-full bg-surface-container-low border border-outline rounded-lg p-2 text-sm" />
                  <input type="number" value={companySizeMax} onChange={e => setCompanySizeMax(e.target.value ? Number(e.target.value) : '')} placeholder="Max" className="w-full bg-surface-container-low border border-outline rounded-lg p-2 text-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="flex items-start gap-4">
            <input type="checkbox" checked={enableLocations} onChange={() => setEnableLocations(!enableLocations)} className="mt-1" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-on-surface">Locations</label>
              {enableLocations && (
                <input type="text" value={locationsStr} onChange={e => setLocationsStr(e.target.value)} placeholder="e.g. New York, London" className="w-full bg-surface-container-low border border-outline rounded-lg p-2 text-sm" />
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="flex items-start gap-4">
            <input type="checkbox" checked={enableKeywords} onChange={() => setEnableKeywords(!enableKeywords)} className="mt-1" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-on-surface">Keywords</label>
              {enableKeywords && (
                <input type="text" value={keywordsStr} onChange={e => setKeywordsStr(e.target.value)} placeholder="e.g. AI, Machine Learning" className="w-full bg-surface-container-low border border-outline rounded-lg p-2 text-sm" />
              )}
            </div>
          </div>

          {/* Exclude Domains */}
          <div className="flex items-start gap-4">
            <input type="checkbox" checked={enableExcludeDomains} onChange={() => setEnableExcludeDomains(!enableExcludeDomains)} className="mt-1" />
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-on-surface">Exclude Domains</label>
              {enableExcludeDomains && (
                <input type="text" value={excludeDomainsStr} onChange={e => setExcludeDomainsStr(e.target.value)} placeholder="e.g. competitor.com" className="w-full bg-surface-container-low border border-outline rounded-lg p-2 text-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Max Leads */}
        <div className="pt-4 border-t border-outline">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-on-surface">Max Leads</label>
              <span className="bg-surface-container border border-outline text-on-surface font-bold text-sm px-3 py-1.5 rounded-lg">{maxLeads}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="500" 
              value={maxLeads} 
              onChange={e => setMaxLeads(Number(e.target.value))}
              className="w-full accent-primary" 
            />
            {/* Note: The UI for ranges up to 500 can be used here. Defaulting back to 500 since API supports max 500 */}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 p-4 bg-surface-container-low rounded-xl border border-outline">
          <div>
            <p className="text-xs text-secondary font-semibold uppercase tracking-widest mb-1">Estimated Cost</p>
            <p className="font-extrabold text-on-surface text-lg flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">monetization_on</span>
              {estimatedCredits} Credits
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-on-primary-fixed-variant active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Processsing..." : "Find Leads"}
            <span className="material-symbols-outlined text-[18px]">person_search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
