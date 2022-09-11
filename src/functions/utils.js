import {MarkerType,} from 'react-flow-renderer';

const lookUpConnectionNames = {
  cmhMainIn: "Main",
  cmhSideIn: "Branch",
  cmhSideIn2: "Branch2",
  cmhMainOut: "Main",
  cmhSideOut: "Branch",
  cmhSideOut2: "Branch2",
}

const convertToDrawing = (nodeState, compList) => {
  let position = { x: 0, y: 0 };
  let edgeType = "smoothstep";
  // markerEnd: {type: MarkerType.Arrow,},
  // animated: true

  let connectionNamesFrom = ["cmhMainIn", "cmhSideIn", "cmhSideIn2"];

  let connectionNamesTo = ["cmhMainOut", "cmhSideOut", "cmhSideOut2"];


  let nodes = [];
  let edges = [];
  let tempNodeCount = 0;
  let tempEdgeCount = 0;

  let { nodeList, edgeList} = nodeState;

  if (nodeState && Object.keys(nodeState.nodeList).length === 0) {
    return { nodes: nodes, edges: edges };
  }
  for (var edgeKey in edgeList) {
    edges.push({
      id: `e${edgeKey}`,
      type: edgeType,
      markerEnd: { type: MarkerType.Arrow },
      source: `${edgeList[edgeKey].nodes[0]}`,
      target: `${edgeList[edgeKey].nodes[1]}`,
      animated: false,
      label: `${lookUpConnectionNames[edgeList[edgeKey].type[0]]} to ${lookUpConnectionNames[edgeList[edgeKey].type[1]]} | ${edgeKey}`,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: {fill: '#808080', fillOpacity: 0.7},
      labelStyle: { fontsize: '7px',},
      style: { strokeWidth: 2},
      data: {to: edgeList[edgeKey].type[1], from: edgeList[edgeKey].type[0]},
    });
  }

  let connectionConnected = (branch, type, nodeList, edgeList, nodeKey) => {
    let idx = 0;
    if (type == "from") {
      idx = 1;
    }
    for (let edge of nodeList[nodeKey].edges[type]) {
      if (edgeList[edge].type[idx] === branch) {
        return true;
      } 
    }
    return false;
  };

  for (let nodeKey in nodeList) {
    let compName = nodeList[nodeKey].compData;
    let compFields = compList[compName].reqInput;
    nodes.push({
      id: `${nodeKey}`,
      type: "rectangle",
      data: { label: `${compName} | ${nodeKey}`, comp: compName},
      connectable: false,
      position,
    });
    
    for (let branch of connectionNamesFrom) {
      if (branch in compFields && !connectionConnected(branch, "from", nodeList, edgeList, nodeKey)) {
        nodes.push({
          id: `temp${tempNodeCount}`,
          data: { label: "New!", toBranch: branch},
          type: "newNode",
          connectable: false,
          position,
        });
        edges.push({
          id: `eTemp${tempEdgeCount}`,
          type: edgeType,
          markerEnd: { type: MarkerType.Arrow },
          source: `temp${tempNodeCount}`,
          target: `${nodeKey}`,
          animated: true,
          label: `??? to ${lookUpConnectionNames[branch]}`,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: {fill: '#808080', fillOpacity: 0.7},
          labelStyle: { fontsize: '7px',},
          style: { strokeWidth: 2},
          data: {to: branch, from: null,}
        });
        tempNodeCount += 1;
        tempEdgeCount += 1;
      }
    }

    for (let branch of connectionNamesTo) {
      if (branch in compFields && !connectionConnected(branch, "to", nodeList, edgeList, nodeKey)) {
        nodes.push({
          id: `temp${tempNodeCount}`,
          data: { label: "New!" , fromBranch: branch},
          type: "newNode",
          connectable: false,
          position,
        });
        edges.push({
          id: `eTemp${tempEdgeCount}`,
          type: edgeType,
          markerEnd: { type: MarkerType.Arrow },
          source: `${nodeKey}`,
          target: `temp${tempNodeCount}`,
          animated: true,
          label: `${lookUpConnectionNames[branch]} to ???`,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: {fill: '#808080', fillOpacity: 0.7},
          labelStyle: { fontsize: '7px',},
          style: { strokeWidth: 2},
          data: {to: null, from: branch,}
        });
        tempNodeCount += 1;
        tempEdgeCount += 1;
      }
    }
    
  }

  return { nodes: nodes, edges: edges };
};

const get2DArrRow = (arr, n) => arr.map((x) => x[n]);

const interpolate3D = (xArr, yArr, zArr, data, xSel, ySel, zSel) => {
  if (xSel >= xArr[xArr.length - 1]) {
    return interpolate2D(yArr, zArr, data[xArr.length - 1], ySel, zSel);
  } else if (xSel <= xArr[0]) {
    return interpolate2D(yArr, zArr, data[0], ySel, zSel)
  }

  let xInd = 0;
  while (xSel >= xArr[xInd]) {
    xInd += 1;
  }

  let valLow = interpolate2D(yArr, zArr, data[xInd - 1], ySel, zSel);
  let valHigh = interpolate2D(yArr, zArr, data[xInd], ySel, zSel);

  let val = 0;
  val += (xArr[xInd] - xSel) * valLow;
  val += (xSel - xArr[xInd - 1]) * valHigh;
  val = val/(xArr[xInd] - xArr[xInd - 1]);
  return val;

}

const interpolate2D = (xArr, yArr, data, xSel, ySel) => {
  // No interplation past the edges
  // data[x][y] where x is the row value, y is the column value
  if (xSel >= xArr[xArr.length - 1]) {
    return interpolate1D(yArr, data[xArr.length - 1], ySel);
  } else if (xSel <= xArr[0]) {
    return interpolate1D(yArr, data[0], ySel);
  }

  if (ySel >= yArr[yArr.length - 1]) {
    return interpolate1D(xArr, get2DArrRow(data, yArr.length - 1), xSel);
  } else if (ySel <= yArr[0]) {
    return interpolate1D(xArr, get2DArrRow(data, 0), xSel);
  }

  let xInd = 0;
  let yInd = 0;
  while (xSel >= xArr[xInd]) {
    xInd += 1;
  }
  while (ySel >= yArr[yInd]) {
    yInd += 1;
  }

  let val = 0;
  val += (xArr[xInd] - xSel) * (yArr[yInd] - ySel) * data[xInd - 1][yInd - 1];
  val += (xSel - xArr[xInd - 1]) * (yArr[yInd] - ySel) * data[xInd][yInd - 1];
  val += (xArr[xInd] - xSel) * (ySel - yArr[yInd - 1]) * data[xInd - 1][yInd];
  val += (xSel - xArr[xInd - 1]) * (ySel - yArr[yInd - 1]) * data[xInd][yInd];
  val = val/((xArr[xInd] - xArr[xInd - 1]) * (yArr[yInd] - yArr[yInd - 1]));

  return val;
};

const interpolate1D = (xArr, data, xSel) => {
  if (xSel >= xArr[xArr.length - 1]) {
    return data[xArr.length - 1]
  } else if (xSel < xArr[0]) {
    return data[0]
  }

  let xInd = 0;
  while (xSel >= xArr[xInd]) {
    xInd += 1;
  }
  let val = 0;
  val += (xArr[xInd] - xSel) * data[xInd - 1];
  val += (xSel - xArr[xInd - 1]) * data[xInd];
  val = val/(xArr[xInd] - xArr[xInd - 1]);
  return val;
};

export {convertToDrawing, interpolate2D, interpolate1D, interpolate3D};