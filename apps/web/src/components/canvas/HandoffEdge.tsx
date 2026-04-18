import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
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
}: EdgeProps) {
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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: label === 'true' ? '#22c55e' : label === 'false' ? '#ef4444' : '#6366f1',
          strokeDasharray: '6 3',
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              label === 'true'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
