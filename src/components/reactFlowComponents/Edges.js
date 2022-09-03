import React from 'react';
import { getBezierPath, getMarkerEnd, getSmoothStepPath  } from 'react-flow-renderer';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label,
}) {
  let borderRadius = 5;
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius, // optional
  })

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: '8px' }}
          startOffset="50%"
          textAnchor="middle"
        >
          {label}
        </textPath>
      </text>
    </>
  );
  }


export const edgeTypes = {
  custom: CustomEdge,
};