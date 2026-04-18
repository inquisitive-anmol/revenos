import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../../lib/api";

import PageMetadata from "../../../components/shared/PageMetadata";
import toast from "react-hot-toast";

interface WorkflowTemplate {
  workflowId: string;
  name: string;
  description?: string;
  nodes: Array<{ type: string }>;
  edges: Array<unknown>;
  updatedAt: string;
}

const NODE_ICONS: Record<string, { icon: string; color: string }> = {
  prospector: { icon: "person_search",    color: "text-blue-500 bg-blue-50" },
  qualifier:  { icon: "mark_email_read",  color: "text-amber-500 bg-amber-50" },
  booker:     { icon: "calendar_month",   color: "text-emerald-500 bg-emerald-50" },
  human:      { icon: "person",           color: "text-purple-500 bg-purple-50" },
  condition:  { icon: "call_split",       color: "text-rose-500 bg-rose-50" },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function FlowCard({
  flow,
  onDelete,
}: {
  flow: WorkflowTemplate;
  onDelete: (id: string) => void;
}) {
  const nodeTypes = [...new Set(flow.nodes.map((n) => n.type))];

  return (
    <div className="bg-surface rounded-2xl border border-outline shadow-sm hover:shadow-md transition-all group flex flex-col">
      {/* Card Body */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
              {flow.name}
            </h3>
            <p className="text-xs text-secondary mt-0.5 line-clamp-2">
              {flow.description || "No description"}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${flow.name}"? This cannot be undone.`)) {
                onDelete(flow.workflowId);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>

        {/* Node type pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {nodeTypes.map((type) => {
            const meta = NODE_ICONS[type] ?? { icon: "circle", color: "text-secondary bg-surface-container" };
            return (
              <span
                key={type}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.color}`}
              >
                <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                {type}
              </span>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-secondary">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">hub</span>
            {flow.nodes.length} node{flow.nodes.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            {flow.edges.length} connection{flow.edges.length !== 1 ? "s" : ""}
          </span>
          <span className="ml-auto">{timeAgo(flow.updatedAt)}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-outline px-5 py-3 flex items-center gap-2">
        <Link
          to={`/agents/builder/${flow.workflowId}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Edit Flow
        </Link>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const api = useApi();
  const [flows, setFlows] = useState<WorkflowTemplate[]>([]);

  const [loading, setLoading] = useState(true);

  const loadFlows = () => {
    setLoading(true);
    api
      .get("/api/v1/workflows")
      .then((res) => setFlows(res.data.data ?? []))
      .catch(() => toast.error("Failed to load agent flows"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleDelete = async (workflowId: string) => {
    try {
      await api.delete(`/api/v1/workflows/${workflowId}`);
      setFlows((prev) => prev.filter((f) => f.workflowId !== workflowId));
      toast.success("Flow deleted");
    } catch {
      toast.error("Failed to delete flow");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <PageMetadata
        title="Agent Flows | RevenOS"
        description="Build and manage reusable AI agent workflows for your campaigns."
      />

      {/* Page Header */}
      <div className="border-b border-outline bg-surface px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">Agent Flows</h1>
          <p className="text-sm text-secondary mt-0.5">
            Build reusable agent pipelines — assign them to campaigns at creation time.
          </p>
        </div>
        <Link
          to="/agents/builder/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Flow
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-2xl border border-outline h-52 animate-pulse" />
            ))}
          </div>
        ) : flows.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-primary">account_tree</span>
            </div>
            <h2 className="text-lg font-bold text-on-surface mb-2">No agent flows yet</h2>
            <p className="text-sm text-secondary max-w-sm mb-6">
              Create your first reusable agent flow. Assign it to any campaign to control exactly how leads move through your pipeline.
            </p>
            <Link
              to="/agents/builder/new"
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Your First Flow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {flows.map((flow) => (
              <FlowCard key={flow.workflowId} flow={flow} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}