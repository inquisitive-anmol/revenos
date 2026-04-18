'use client';
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
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../../../../lib/api';
import {
  ProspectorNode,
  QualifierNode,
  BookerNode,
  HumanNode,
  ConditionNode,
} from '../../../../../components/canvas/nodes/AgentNodes';
import { HandoffEdge } from '../../../../../components/canvas/HandoffEdge';
import toast from 'react-hot-toast';

const nodeTypes: NodeTypes = {
  prospector: ProspectorNode,
  qualifier:  QualifierNode,
  booker:     BookerNode,
  human:      HumanNode,
  condition:  ConditionNode,
};

const edgeTypes: EdgeTypes = {
  handoff: HandoffEdge,
};

type NodeType = 'prospector' | 'qualifier' | 'booker' | 'human' | 'condition';

const NODE_PALETTE: { type: NodeType; label: string; color: string; icon: string }[] = [
  { type: 'prospector', label: 'Prospector', color: 'bg-blue-50 text-blue-700 border-blue-200',     icon: 'person_search' },
  { type: 'qualifier',  label: 'Qualifier',  color: 'bg-amber-50 text-amber-700 border-amber-200',   icon: 'mark_email_read' },
  { type: 'booker',     label: 'Booker',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'calendar_month' },
  { type: 'human',      label: 'Human Loop', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'person' },
  { type: 'condition',  label: 'Condition',  color: 'bg-rose-50 text-rose-700 border-rose-200',      icon: 'call_split' },
];

function validateWorkflow(nodes: Node[], edges: Edge[]): string | null {
  if (nodes.length === 0) return 'Add at least one node.';
  const entryNodes = nodes.filter((n) => !edges.some((e) => e.target === n.id));
  if (entryNodes.length !== 1) return 'Workflow must have exactly one entry node (a node with no incoming connections).';
  if (nodes.length > 1) {
    for (const node of nodes) {
      const hasIn  = edges.some((e) => e.target === node.id);
      const hasOut = edges.some((e) => e.source === node.id);
      if (!hasIn && !hasOut) return `Node "${node.type}" is disconnected. Connect all nodes.`;
    }
  }
  for (const node of nodes) {
    if (node.type === 'condition') {
      const out = edges.filter((e) => e.source === node.id);
      if (out.length !== 2) return 'Condition node must have exactly two outgoing connections (true & false).';
      if (!out.some((e) => e.sourceHandle === 'true') || !out.some((e) => e.sourceHandle === 'false'))
        return 'Condition node must have one "true" and one "false" output connection.';
    }
  }
  return null;
}

let idCounter = 100;
const newId = () => `node_${++idCounter}`;

function WorkflowCanvas() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const isNew = workflowId === 'new';
  const api = useApi();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [isEditingName, setIsEditingName] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedConditionNode, setSelectedConditionNode] = useState<Node | null>(null);
  const [conditionConfig, setConditionConfig] = useState({ field: 'score', operator: 'gte', value: '7' });

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load existing workflow
  useEffect(() => {
    if (isNew) return;
    api.get(`/api/v1/workflows/${workflowId}`)
      .then((res: { data: { data: { name: string; description?: string; nodes: Array<{ id: string; type: string; position: { x: number; y: number }; config: Record<string, unknown> }>; edges: Array<{ id: string; source: string; target: string; condition?: string }> } } }) => {
        const wf = res.data.data;
        if (wf) {
          setFlowName(wf.name);
          setFlowDescription(wf.description ?? '');
          setNodes(wf.nodes.map((n: { id: string; type: string; position: { x: number; y: number }; config: Record<string, unknown> }) => ({
            id: n.id, type: n.type, position: n.position, data: { config: n.config },
          })));
          setEdges(wf.edges.map((e: { id: string; source: string; target: string; condition?: string }) => ({
            id: e.id, source: e.source, target: e.target,
            sourceHandle: e.condition ?? undefined,
            type: 'handoff',
            data: { label: e.condition },
            markerEnd: { type: MarkerType.ArrowClosed },
          })));
        }
      })
      .catch(() => toast.error('Failed to load workflow'))
      .finally(() => setLoading(false));
  }, [workflowId]);

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

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type') as NodeType;
    if (!type || !reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: e.clientX - bounds.left - 80, y: e.clientY - bounds.top - 40 };
    setNodes((nds) => [...nds, { id: newId(), type, position, data: { config: {} } }]);
  }, [setNodes]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'condition') {
      setSelectedConditionNode(node);
      const existing = (node.data as Record<string, unknown>)?.config;
      setConditionConfig(
        existing && typeof existing === 'object' && 'field' in existing
          ? existing as { field: string; operator: string; value: string }
          : { field: 'score', operator: 'gte', value: '7' }
      );
    } else {
      setSelectedConditionNode(null);
    }
  }, []);

  const applyConditionConfig = () => {
    if (!selectedConditionNode) return;
    setNodes((nds) => nds.map((n) =>
      n.id === selectedConditionNode.id ? { ...n, data: { ...n.data, config: conditionConfig } } : n
    ));
    setSelectedConditionNode(null);
  };

  const buildPayload = () => ({
    name: flowName.trim(),
    description: flowDescription.trim(),
    nodes: nodes.map((n) => ({
      id: n.id, type: n.type, position: n.position,
      config: (n.data as Record<string, unknown>)?.config ?? {},
    })),
    edges: edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      condition: e.sourceHandle ?? undefined,
    })),
  });

  const handleSave = async () => {
    if (!flowName.trim()) { setValidationError('Please give this flow a name.'); setIsEditingName(true); return; }
    const error = validateWorkflow(nodes, edges);
    if (error) { setValidationError(error); return; }
    setValidationError(null);
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/api/v1/workflows', buildPayload());
        const newWfId: string = res.data.data.workflowId;
        toast.success('Flow created!');
        navigate(`/agents/builder/${newWfId}`, { replace: true });
      } else {
        await api.put(`/api/v1/workflows/${workflowId}`, buildPayload());
        toast.success('Flow saved!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      toast.error(msg);
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
        {/* Header */}
        <div className="p-5 border-b border-outline">
          <Link to="/agents" className="flex items-center gap-1.5 text-secondary text-xs font-semibold hover:text-primary transition-colors mb-3">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            All Agent Flows
          </Link>

          {/* Editable flow name */}
          {isEditingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="Flow name..."
                className="w-full bg-surface-container-low border border-outline rounded-lg px-3 py-2 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <textarea
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                placeholder="Short description (optional)"
                rows={2}
                className="w-full bg-surface-container-low border border-outline rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Done
              </button>
            </div>
          ) : (
            <button className="text-left group w-full" onClick={() => setIsEditingName(true)}>
              <h1 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors truncate">
                {flowName || 'Untitled Flow'}
              </h1>
              <p className="text-[10px] text-secondary mt-0.5 group-hover:text-primary/70 flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">edit</span>
                Click to edit name
              </p>
            </button>
          )}
        </div>

        {/* Node palette */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Drag to Canvas</p>
          <div className="flex flex-col gap-2">
            {NODE_PALETTE.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/reactflow-type', item.type)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing ${item.color} transition-all hover:shadow-sm select-none`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="material-symbols-outlined text-[14px] ml-auto opacity-40">drag_indicator</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save footer */}
        <div className="p-4 border-t border-outline space-y-2">
          {validationError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {validationError}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-on-primary-fixed-variant active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Saving...' : isNew ? 'Create Flow' : 'Save Flow'}
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
            nodeColor={(n) => ({ prospector: '#3b82f6', qualifier: '#f59e0b', booker: '#10b981', human: '#8b5cf6', condition: '#f43f5e' })[n.type ?? ''] ?? '#94a3b8'}
          />
          <Panel position="top-right">
            <div className="bg-surface border border-outline rounded-xl px-3 py-2 text-xs font-semibold text-secondary shadow-sm">
              {nodes.length} nodes · {edges.length} edges
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Condition Config Modal */}
      {selectedConditionNode && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setSelectedConditionNode(null)}>
          <div className="bg-surface rounded-2xl border border-outline shadow-xl p-6 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold text-on-surface mb-4">Configure Condition</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Field</label>
                <select value={conditionConfig.field} onChange={(e) => setConditionConfig((c) => ({ ...c, field: e.target.value }))} className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary">
                  <option value="score">Lead Score</option>
                  <option value="status">Lead Status</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Operator</label>
                <select value={conditionConfig.operator} onChange={(e) => setConditionConfig((c) => ({ ...c, operator: e.target.value }))} className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary">
                  <option value="gte">≥ Greater or Equal</option>
                  <option value="lte">≤ Less or Equal</option>
                  <option value="eq">= Equals</option>
                  <option value="neq">≠ Not Equals</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">Value</label>
                <input type="text" value={conditionConfig.value} onChange={(e) => setConditionConfig((c) => ({ ...c, value: e.target.value }))} className="w-full border border-outline rounded-lg p-2.5 text-sm bg-surface-container-low outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 7" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedConditionNode(null)} className="flex-1 px-4 py-2 border border-outline text-secondary text-sm font-semibold rounded-xl hover:bg-surface-container-low transition-colors">Cancel</button>
                <button onClick={applyConditionConfig} className="flex-1 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-on-primary-fixed-variant transition-colors">Apply</button>
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
