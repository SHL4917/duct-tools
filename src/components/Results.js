import React, {useState} from "react";
import {useSelector, useDispatch} from 'react-redux';
import { convertToDrawing } from "../functions/utils";
import {components} from "../pipeComponents/components";
import {updatePaths, resetPaths, updateDisplayData} from '../redux/ductPathSlice';
import ResultTable from "./ResultTable"

const branchMapping = {
  cmhMainIn: "Main",
  cmhSideIn: "Branch",
  cmhSideIn2: "Branch 2",
  cmhMainOut: "Main",
  cmhSideOut: "Branch",
  cmhSideOut2: "Branch 2",
}

const getStateWithTempNodes = (nodeState, components) => {
  let {nodes, edges} = convertToDrawing(nodeState, components);
    let nodesObj = {};
    let edgesObj = {};
    for (let key in nodes) {
      nodesObj[nodes[key].id] = nodes[key];
    };
    for (let key in edges) {
      edgesObj[edges[key].id] = edges[key];
    };
    return {nodes: nodesObj, edges: edgesObj};
};

const depthFirstSearch = (node, edgeIn, singlePath, idx, pathways, nodes, edges) => {
  // Terminating condition
  if (nodes[node].id.includes("temp")) {
    singlePath[idx - 1].out = nodes[node].data.fromBranch;
    pathways.push(singlePath);
    return;
  }
  //
  let comp = components[nodes[node].data.comp];
  if (comp.reqInput.hasOwnProperty('cmhMainOut')) {
    let edgeKey = getEdgeFromNode(nodes[node].id, edges, "cmhMainOut");
    singlePath[idx] = {node: nodes[node].id, out: edges[edgeKey].data.from, in: edges[edgeIn].data.to,}
    depthFirstSearch(edges[edgeKey].target, edgeKey, JSON.parse(JSON.stringify(singlePath)), idx + 1, pathways, nodes, edges);
  }
  
  if (comp.reqInput.hasOwnProperty('cmhSideOut')) {
    let edgeKey = getEdgeFromNode(nodes[node].id, edges, "cmhSideOut");
    singlePath[idx] = {node: nodes[node].id, out: edges[edgeKey].data.from, in: edges[edgeIn].data.to,}
    depthFirstSearch(edges[edgeKey].target, edgeKey, JSON.parse(JSON.stringify(singlePath)), idx + 1, pathways, nodes, edges);
  }

  if (comp.reqInput.hasOwnProperty('cmhSideOut2')) {
    let edgeKey = getEdgeFromNode(nodes[node].id, edges, "cmhSideOut2");
    singlePath[idx] = {node: nodes[node].id, out: edges[edgeKey].data.from, in: edges[edgeIn].data.to,}
    depthFirstSearch(edges[edgeKey].target, edgeKey, JSON.parse(JSON.stringify(singlePath)), idx + 1, pathways, nodes, edges);
  }

};

const getEdgeFromNode = (node, edges, branch) => {
  for (let key of Object.keys(edges)) {
    if (edges[key].source == node && edges[key].data.from == branch) {
      return edges[key].id;
    }
  }
  return null;
}

const getPressureLoss = (pathway, nodeState) => {
  let pressureDrop = [];
  for (let pathNode of pathway) {
    let nodeInfo = nodeState.nodeList[pathNode.node];
    let pressureField = "";
    if (pathNode.in == "cmhSideIn" | pathNode.out == "cmhSideOut") {
      pressureField = "pressureLossSide";
    } else if (pathNode.out == "cmhMainOut") {
      pressureField = "pressureLossMain";
    } else if (pathNode.out == "cmhSideOut2") {
      pressureField = "pressureLossSide2";
    }
    pressureDrop.push(nodeInfo.fieldData.hasOwnProperty(pressureField)? nodeInfo.fieldData[pressureField] : 0);
  }
  let totalPressureDrop = pressureDrop.reduce((acc, cv) => acc + cv, 0);
  return {totalPressureDrop, pressureDrop};
}

const Results = (props) => {
  const nodeState = useSelector((state) => state.node);
  const ductPathState = useSelector((state) => state.ductPath)
  const dispatch = useDispatch();

  const getPaths = () => {
    let {nodes, edges} = getStateWithTempNodes(nodeState, components)
    let pathways = [];
    // results in form [[{node: x, out: "x", in: ""}, {}, ...], [], [], ...]
    // results[x] -> One unique pathway, with results[x][j] being a node in that unique pathway
    for (let key of Object.keys(edges)) {
      if (edges[key].id.includes("Temp") && edges[key].source.includes("temp")) {
        let uniquePath = [];
        let nodeNumber = edges[key].target;
        uniquePath[0] = {node: nodeNumber, in: edges[key].data.to, out: null,};
        depthFirstSearch(nodeNumber, key, uniquePath, 0, pathways, nodes, edges);
      }
    }
    dispatch(updatePaths({paths: pathways}))
    let tableData = [];
    let i = 1;
    for (let pathway of pathways) {
      let pathData = {};
      let {totalPressureDrop, pressureDrop} = getPressureLoss(pathway, nodeState);
      pathData.pressureDrop = totalPressureDrop.toFixed(3);
      pathData.nodeID = `Path ${i}`
      pathData.subRows = []
      for (let pathNode of pathway) {
        let tempNodeInfo = {}
        tempNodeInfo.nodeID = pathNode.node;
        tempNodeInfo.comp = nodeState.nodeList[pathNode.node].compData
        tempNodeInfo.in = branchMapping.hasOwnProperty(pathNode.in)? branchMapping[pathNode.in] : pathNode.in;
        tempNodeInfo.inCMH = nodeState.nodeList[pathNode.node].fieldData[pathNode.in] ?? null;
        tempNodeInfo.out = branchMapping.hasOwnProperty(pathNode.out)? branchMapping[pathNode.out] : pathNode.out;
        tempNodeInfo.outCMH = nodeState.nodeList[pathNode.node].fieldData[pathNode.out] ?? null;
        tempNodeInfo.pressureDrop = pressureDrop.shift().toFixed(3);
        pathData.subRows.push(tempNodeInfo);
      }
      tableData.push(pathData);
      i++;
    }
    tableData.sort((a, b) => {
      return b.pressureDrop - a.pressureDrop;
    })
    dispatch(updateDisplayData({displayData: tableData}))
  }
  
  return (
    <div className="flex flex-col grow">
      <button 
        onClick={getPaths} 
        className="ml-8 font-medium text-[12px] text-white bg-orange-300 border-orange-300 border-[1px] rounded w-48 p-2 my-2"
      >
        Generate Path Results
      </button>
      {ductPathState.displayData? <ResultTable displayData={ductPathState.displayData} /> : null}
    </div>
  );
}

export default Results