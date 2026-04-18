import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../../../../lib/api';
import {
  ProspectorNode,
  QualifierNode,
  BookerNode,
  HumanNode,
  ConditionNode,
} from '../../../../components/canvas/nodes/AgentNodes';
import { HandoffEdge } from '../../../../components/canvas/HandoffEdge';
import toast from 'react-hot-toast';

const nodeTypes: NodeTypes = {
  prospector: ProspectorNode,
  qualifier: QualifierNode,
  booker: BookerNode,
  human: HumanNode,
  condition: ConditionNode,
};

const edgeTypes: EdgeTypes = {
  handoff: HandoffEdge,
};

type NodeType = 'prospector' | 'qualifier' | 'booker' | 'human' | 'condition';

const NODE_PALETTE: { type: NodeType; label: string; color: string; icon: string }[] = [
  { type: 'prospector', label: 'Prospector', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'person_search' },
  { type: 'qualifier', label: 'Qualifier', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'mark_email_read' },
  { type: 'booker', label: 'Booker', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'calendar_month' },
  { type: 'human', label: 'Human Loop', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'person' },
  { type: 'condition', label: 'Condition', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: 'call_split' },
];

function validateWorkflow(nodes: Node[], edges: Edge[]): string | null {
  if (nodes.length === 0) return 'Add at least one node.';

  // Find entry node (no incoming edges)
  const entryNodes = nodes.filter(
    (n) => !edges.some((e) => e.target === n.id)
  );
  if (entryNodes.length !== 1) return 'Workflow must have exactly one entry node (a node with no incoming connections).';

  // Disconnected check
  for (const node of nodes) {
    const hasIn = edges.some((e) => e.target === node.id);
    const hasOut = edges.some((e) => e.source === node.id);
    if (!hasIn && !hasOut && nodes.length > 1) return `Node "${node.data?.label ?? node.type}" is disconnected.`;
  }

  // Condition nodes must have exactly two outgoing edges
  for (const node of nodes) {
    if (node.type === 'condition') {
      const out = edges.filter((e) => e.source === node.id);
      if (out.length !== 2) return 'Condition node must have exactly two outgoing connections (true & false).';
      const hasTrue = out.some((e) => e.sourceHandle === 'true');
      const hasFalse = out.some((e) => e.sourceHandle === 'false');
      if (!hasTrue || !hasFalse) return 'Condition node connections must include one "true" and one "false" branch.';
    }
  }

  return null;
}

let idCounter = 100;
const newId = () => `node_${++idCounter}`;

function WorkflowCanvas() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const api = useApi();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedConditionNode, setSelectedConditionNode] = useState<Node | null>(null);
  const [conditionConfig, setConditionConfig] = useState({ field: 'score', operator: 'gte', value: '7' });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load existing workflow on mount
  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    api.get(`/api/v1/workflows/${campaignId}`)
      .then((res) => {
        const wf = res.data.data;
        if (wf) {
          setNodes(wf.nodes.map((n: any) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: { config: n.config },
          })));
          setEdges(wf.edges.map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.condition ?? undefined,
            type: 'handoff',
            data: { label: e.condition },
            markerEnd: { type: MarkerType.ArrowClosed },
          })));
        }
      })
      .catch(() => { /* No workflow yet — blank canvas */ })
      .finally(() => setLoading(false));
  }, [campaignId]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge({
        ...connection,
        type: 'handoff',
        data: { label: connection.sourceHandle ?? undefined },
        markerEnd: { type: MarkerType.ArrowClosed },
      }, eds)
    );
  }, []);

  // Drag-from-sidebar onto canvas
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow-type') as NodeType;
      if (!type || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = { x: e.clientX - bounds.left - 80, y: e.clientY - bounds.top - 40 };

      const newNode: Node = {
        id: newId(),
        type,
        position,
        data: { config: {} },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'condition') {
      setSelectedConditionNode(node);
      const existingConfig = (node.data as Record<string, unknown>)?.config;
      setConditionConfig(existingConfig && typeof existingConfig === 'object' && 'field' in existingConfig
        ? existingConfig as { field: string; operator: string; value: string }
        : { field: 'score', operator: 'gte', value: '7' });
    } else {
      setSelectedConditionNode(null);
    }
  }, []);

  const applyConditionConfig = () => {
    if (!selectedConditionNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedConditionNode.id
          ? { ...n, data: { ...n.data, config: conditionConfig } }
          : n
      )
    );
    setSelectedConditionNode(null);
  };

  const handleSave = async () => {
    const error = validateWorkflow(nodes, edges);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setSaving(true);

    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        config: (n.data as any)?.config ?? {},
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        condition: e.sourceHandle ?? undefined,
      })),
    };

    try {
      // Try update first, fall back to create
      try {
        await api.put(`/api/v1/workflows/${campaignId}`, payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          await api.post('/api/v1/workflows', { campaignId, ...payload });
        } else {
          throw err;
        }
      }
      toast.success('Workflow saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-3 text-secondary font-semibold">
          <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
          Loading canvas...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-outline flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-outline">
          <Link to={`/campaigns/${campaignId}`} className="flex items-center gap-2 text-secondary text-sm font-semibold hover:text-primary transition-colors mb-3">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Campaign
          </Link>
          <h1 className="text-base font-extrabold text-on-surface">Agent Builder</h1>
          <p className="text-xs text-secondary font-medium mt-0.5">Drag nodes onto the canvas</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Node Types</p>
          <div className="flex flex-col gap-2">
            {NODE_PALETTE.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/reactflow-type', item.type)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing ${item.color} transition-all hover:shadow-sm`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-outline">
          {validationError && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {validationError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              const colors: Record<string, string> = {
                prospector: '#3b82f6',
                qualifier: '#f59e0b',
                booker: '#10b981',
                human: '#8b5cf6',
                condition: '#f43f5e',
              };
              return colors[n.type ?? ''] ?? '#94a3b8';
            }}
          />
          <Panel position="top-right">
            <div className="bg-surface border border-outline rounded-xl px-3 py-2 text-xs font-semibold text-secondary shadow-sm">
              {nodes.length} nodes · {edges.length} edges
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Condition Config Panel */}
      {selectedConditionNode && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setSelectedConditionNode(null)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl p-6 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold text-on-surface mb-4">Configure Condition</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Field</label>
                <select
                  value={conditionConfig.field}
                  onChange={(e) => setConditionConfig((c) => ({ ...c, field: e.target.value }))}
                  className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="score">Lead Score</option>
                  <option value="status">Lead Status</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Operator</label>
                <select
                  value={conditionConfig.operator}
                  onChange={(e) => setConditionConfig((c) => ({ ...c, operator: e.target.value }))}
                  className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="gte">≥ (Greater or Equal)</option>
                  <option value="lte">≤ (Less or Equal)</option>
                  <option value="eq">= (Equals)</option>
                  <option value="neq">≠ (Not Equals)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Value</label>
                <input
                  type="text"
                  value={conditionConfig.value}
                  onChange={(e) => setConditionConfig((c) => ({ ...c, value: e.target.value }))}
                  className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 7"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedConditionNode(null)}
                  className="flex-1 px-4 py-2 border border-outline text-secondary text-sm font-semibold rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyConditionConfig}
                  className="flex-1 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-on-primary-fixed-variant transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}
