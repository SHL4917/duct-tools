import { useCallback, useState } from "react";
import {useEffect} from 'react';
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
  getConnectedEdges,
  isNode,
} from "react-flow-renderer";
import { useSelector, useDispatch } from "react-redux";
import { create, remove } from "../redux/nodeSlice";
import { update, nodeClicked } from "../redux/selectionSlice";
import dagre from "dagre";
import { convertToDrawing } from "../functions/utils";
import * as trialComponents from "../pipeComponents/trialComponents";
import {components} from "../pipeComponents/components"; 
import { nodeTypes } from "./reactFlowComponents/Nodes";
import {edgeTypes} from './reactFlowComponents/Edges';

const nodeWidth = 180;
const nodeHeight = 50;

const getLayoutedElements = (nodeState, components, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  let { nodes: nodes, edges: edges } = convertToDrawing(
    nodeState,
    components
  );

  dagreGraph.setGraph({ rankdir: direction,});

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    let nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = "left";
    node.sourcePosition = "right";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    
    node.position = {
      x: nodeWithPosition.x - nodeWidth/2,
      y: nodeWithPosition.y - nodeHeight/2,
    };
    
    return node;
  });

  return { nodes, edges };
};

const setSelected = (layoutedNodes, selectionState) => {
  if (!selectionState.nodeSelected && !selectionState.nodeNumber) {
    return
  }
  if (selectionState.update) {
    layoutedNodes.map((node) => {
      if (node.id == selectionState.nodeNumber) {
        node.type = "selected";
        return
      }
    })
  } else {
    layoutedNodes.map((node) => {
      if (node.id == selectionState.tempNode) {
        node.type = "selected";
        return
      }
    })
  }
};

function NodeDrawing() {
  const nodeState = useSelector((state) => state.node);
  const selectionState = useSelector((state) => state.selection);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodeState,
    components
  );
  setSelected(layoutedNodes, selectionState);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const dispatch = useDispatch()

  useEffect(() => {
    if (!nodeState.deleting) {
      setSelected(layoutedNodes, selectionState);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [selectionState, nodeState.branchSwitch, nodeState.deleting])
  

  const onNodeClick = useCallback((evt, node) => {
    dispatch(nodeClicked());
    if (node.id.includes("temp")) {
      for (let edge of layoutedEdges) {
        if (edge.source == node.id) {
          dispatch(update({
            nodeNumber: edge.target,
            update: false,
            connection: {toNew: false, branch: edge.data.to},
            tempNode: node.id,
          }))
          return
        } else if (edge.target == node.id) {
          dispatch(update({
            nodeNumber: edge.source,
            update: false,
            connection: {toNew: true, branch: edge.data.from},
            tempNode: node.id,
          }))
          return
        }
      }
    }

    dispatch(update({
      nodeNumber: node.id,
      update: true,
      connection: null,
    }))
  })

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Controls />
      <Background variant="dots" gap={18} size={0.7} style={{fillOpacity:0.9}}/>
    </ReactFlow>
  );
}

export default NodeDrawing;
