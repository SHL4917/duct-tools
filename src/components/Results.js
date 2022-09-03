import React from "react";
import {useSelector, useDispatch} from 'react-redux';
import { convertToDrawing } from "../functions/utils";
import {components} from "../pipeComponents/components";

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

const Results = (props) => {
  const nodeState = useSelector((state) => state.node);

  const getPaths = () => {
    let {nodes, edges} = getStateWithTempNodes(nodeState, components)
    console.log(edges);
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
    console.log(pathways);
  }


  
  return (
    <div>
      <button onClick={getPaths}>Get Routes</button>
    </div>
  );
}

export default Results