import React from "react";
import { Handle } from "react-flow-renderer";

const baseStyle = 'px-3 py-1 font-medium rounded-sm text-xs border'

const RectangleNode = ({ data }) => {
  let handleStyle = { background: '#999999', height: '5px', width: '5px', padding: '3px', borderColor: '#FCFCFC', borderWidth: '2px'  };
  return (
    <div className={`${baseStyle} bg-gray-100 border-gray-500 text-gray-500 hover:border-orange-300 hover:text-orange-300`}>
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
  let handleStyle = { background: '#FF7E33', height: '5px', width: '5px', padding: '3px', borderColor: '#FCFCFC', borderWidth: '2px'  };
  return (
    <div className={`${baseStyle} bg-orange-300 border-orange-300 text-gray-100 hover:border-gray-500`}>
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
    <div className={`${baseStyle} border-gray-400 text-gray-400 bg-white-100 border-dashed hover:border-gray-500 hover:text-gray-500`}>
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