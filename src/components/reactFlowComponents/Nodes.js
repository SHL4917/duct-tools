import React from "react";
import { Handle } from "react-flow-renderer";

const baseStyle = 'px-3 py-1 font-serif rounded-sm text-xs'

const RectangleNode = ({ data }) => {
  let handleStyle = { background: 'black', height: '5px', width: '5px', padding: '3px', borderColor: '#EBF6FF', borderWidth: '2px'  };
  return (
    <div className={`${baseStyle}  border border-[#000] bg-white-200 hover:border-red-300`}>
      <Handle
        type="target"
        position="left"
        style={handleStyle}
      />
      <div id={data.id}>{data.label}</div>
      <Handle
        type="source"
        position="right"
        style={handleStyle}
      />
    </div>
  );
};

const RectangleNodeSelected = ({ data }) => {
  let handleStyle = { background: 'black', height: '5px', width: '5px', padding: '3px', borderColor: '#EBF6FF', borderWidth: '2px'  };
  return (
    <div className={`${baseStyle} bg-[#000] border border-white-200 text-white-200 hover:border-red-300`}>
      <Handle
        type="target"
        position="left"
        style={handleStyle}
      />
      <div id={data.id}>{data.label}</div>
      <Handle
        type="source"
        position="right"
        style={handleStyle}
      />
    </div>
  );
};

const UnknownNode = ({ data }) => {
  
  return (
    <div className={`${baseStyle} border border-[#000] bg-white-200 border-dashed`}>
      <Handle
        type="target"
        position="left"
      />
      <div id={data.id}>{data.label}</div>
      <Handle
        type="source"
        position="right"
      />
    </div>
  );
};

const CircleNode = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: "#9ca8b3",
        padding: "14px",
        borderRadius: "50px"
      }}
    >
      <Handle
        type="target"
        position="left"
        id={`${data.id}.left`}
        style={{ borderRadius: "0" }}
      />
      <div id={data.id}>{data.label}</div>
      <Handle
        type="source"
        position="right"
        id={`${data.id}.right1`}
        style={{ top: "30%", borderRadius: 0 }}
      />
      <Handle
        type="source"
        position="right"
        id={`${data.id}.right2`}
        style={{ top: "70%", borderRadius: 0 }}
      />
    </div>
  );
};

export const nodeTypes = {
  circle: CircleNode,
  rectangle: RectangleNode,
  selected: RectangleNodeSelected,
  newNode: UnknownNode
};