import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from '@xyflow/react';

export function HandoffEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // data is Record<string,unknown> in @xyflow/react v12
  const label = typeof (data as Record<string, unknown>)?.label === 'string'
    ? (data as Record<string, unknown>).label as string
    : undefined;

  const onEdgeDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: label === 'true' ? '#22c55e' : label === 'false' ? '#ef4444' : selected ? '#4f46e5' : '#6366f1',
          strokeDasharray: '6 3',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex items-center gap-1 group"
        >
          {label && (
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-shadow ${
                label === 'true'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              } ${selected ? 'shadow-md ring-2 ring-primary/20' : ''}`}
            >
              {label}
            </div>
          )}

          {/* Delete button (visible on hover over the edge label area, or when edge is selected) */}
          <button
            onClick={onEdgeDelete}
            className={`w-5 h-5 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center transition-opacity shadow-sm ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            title="Delete custom edge"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
