import { type NodeProps, Handle, Position, NodeToolbar, useReactFlow } from '@xyflow/react';

// ─── Shared Node Deletion Toolbar ─────────────────────────────────────────────
function NodeDeleteToolbar({ nodeId }: { nodeId: string }) {
  const { deleteElements } = useReactFlow();
  
  return (
    <NodeToolbar isVisible={true} position={Position.Top} offset={8}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          deleteElements({ nodes: [{ id: nodeId }] });
        }}
        className="w-8 h-8 bg-surface-container-high hover:bg-red-50 border border-outline hover:border-red-200 text-secondary hover:text-red-600 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
        title="Delete Node"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
      </button>
    </NodeToolbar>
  );
}

// ─── Prospector Node ─────────────────────────────────────────────────────────
export function ProspectorNode({ id, selected }: NodeProps) {
  return (
    <>
      <NodeDeleteToolbar nodeId={id} />
      <div className={`min-w-[160px] rounded-xl border-2 ${selected ? 'border-blue-500' : 'border-blue-300'} bg-gradient-to-br from-blue-50 to-blue-100 shadow-md px-4 py-3 text-center`}>
        <Handle type="target" position={Position.Top} className="!bg-blue-400" />
        <div className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">Prospector</div>
        <div className="text-blue-900 font-semibold text-sm">Find Leads</div>
        <div className="text-blue-500 text-[10px] mt-1">Enriches + scores leads</div>
        <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
      </div>
    </>
  );
}

// ─── Qualifier Node ───────────────────────────────────────────────────────────
export function QualifierNode({ id, selected }: NodeProps) {
  return (
    <>
      <NodeDeleteToolbar nodeId={id} />
      <div className={`min-w-[160px] rounded-xl border-2 ${selected ? 'border-amber-500' : 'border-amber-300'} bg-gradient-to-br from-amber-50 to-amber-100 shadow-md px-4 py-3 text-center`}>
        <Handle type="target" position={Position.Top} className="!bg-amber-400" />
        <div className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-1">Qualifier</div>
        <div className="text-amber-900 font-semibold text-sm">Send Emails</div>
        <div className="text-amber-500 text-[10px] mt-1">Personalised cold outreach</div>
        <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
      </div>
    </>
  );
}

// ─── Booker Node ──────────────────────────────────────────────────────────────
export function BookerNode({ id, selected }: NodeProps) {
  return (
    <>
      <NodeDeleteToolbar nodeId={id} />
      <div className={`min-w-[160px] rounded-xl border-2 ${selected ? 'border-emerald-500' : 'border-emerald-300'} bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md px-4 py-3 text-center`}>
        <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
        <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">Booker</div>
        <div className="text-emerald-900 font-semibold text-sm">Book Meetings</div>
        <div className="text-emerald-500 text-[10px] mt-1">Slot picker + calendar</div>
        <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />
      </div>
    </>
  );
}

// ─── Human Node ───────────────────────────────────────────────────────────────
export function HumanNode({ id, selected }: NodeProps) {
  return (
    <>
      <NodeDeleteToolbar nodeId={id} />
      <div className={`min-w-[160px] rounded-xl border-2 ${selected ? 'border-purple-500' : 'border-purple-300'} bg-gradient-to-br from-purple-50 to-purple-100 shadow-md px-4 py-3 text-center`}>
        <Handle type="target" position={Position.Top} className="!bg-purple-400" />
        <div className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-1">Human Loop</div>
        <div className="text-purple-900 font-semibold text-sm">Human Takeover</div>
        <div className="text-purple-500 text-[10px] mt-1">Pauses AI automation</div>
        {/* No source handle — terminal node */}
      </div>
    </>
  );
}

// ─── Condition Node ───────────────────────────────────────────────────────────
interface ConditionConfig {
  field: string;
  operator: string;
  value: string | number;
}

export function ConditionNode({ id, data, selected }: NodeProps) {
  const config = (data as { config?: ConditionConfig }).config;
  const label = config ? `${config.field} ${config.operator} ${config.value}` : 'Configure...';

  return (
    <>
      <NodeDeleteToolbar nodeId={id} />
      <div className={`relative w-[160px] h-[80px] flex items-center justify-center`}>
        <div
          className={`absolute inset-0 rounded-lg border-2 ${selected ? 'border-rose-500' : 'border-rose-300'} bg-gradient-to-br from-rose-50 to-rose-100 shadow-md`}
          style={{ transform: 'rotate(45deg)', borderRadius: '8px' }}
        />
        <div className="relative z-10 text-center px-2">
          <div className="text-rose-600 font-bold text-[9px] uppercase tracking-widest">Condition</div>
          <div className="text-rose-900 font-semibold text-[10px] mt-0.5 leading-tight">{label}</div>
        </div>

        <Handle type="target" position={Position.Top} className="!bg-rose-400" />
        <Handle type="source" position={Position.Right} id="true" className="!bg-green-400" style={{ right: -8 }} />
        <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-400" style={{ bottom: -8 }} />
      </div>
    </>
  );
}
