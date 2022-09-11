import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  nodeList: {},
  edgeList: {},
  nodeCount: 0,
  edgeCount: 0,
  error: null,
  branchSwitch: 0,
  deleting: false,
};
/*
nodeList structure to be built:
nodeList = {
  n_0: {
    fieldData: {specific component field info}, 
    compData: {name of the component - Instance name of GenericComponent class},
    edges: {to: [e_i, ...], from: [e_k, ...]}, - "from" edges are upstream, "to" edges are downstream
  },
  ...
}

edgeList = {
  // Directed, first object in array is the origin, second object is the destination
  e_0: {nodes: [n_i, n_j], type: ['toBranch', 'fromBranch']},
  ...
}

Payload (action) structure expected:
payload = {
  data: {fieldData: {specific component field info}, compData: {name of the component - Instance name of GenericComponent class}},
  newNode: {branch: connection (cmhMainIn/cmhSideIn/cmhMainOut/cmhSideOut etc.) field name}, - Connection to the newNode
  to: {nodeNum: node number, branch: connection field name},
  from: {nodeNum: node number, branch: connection field name},
}

*/

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    create: (state, action) => {
      let payload = action.payload;
      let nodeCount = state.nodeCount;
      state.nodeList[nodeCount] = {'fieldData': payload.data.fieldData, 'compData': payload.data.compData, edges: {to: [], from: []}};

      let connection = payload.newNode.branch;
      
      if ('to' in payload) {
        // Appending a new node 'upstream' of an existing node
        let toNode = payload.to.nodeNum;
        let toConnection = payload.to.branch;
        state.edgeList[state.edgeCount] = {nodes: [parseInt(state.nodeCount), parseInt(toNode)], type: [connection, toConnection],};
        state.nodeList[nodeCount].edges.to.push(state.edgeCount);
        state.nodeList[toNode].edges.from.push(state.edgeCount);
        state.edgeCount += 1;
      }

      if ('from' in payload) {
        // Appending a new node 'downstream' of an existing node
        let fromNode = payload.from.nodeNum;
        let fromConnection = payload.from.branch;
        state.edgeList[state.edgeCount] = {nodes: [parseInt(fromNode), parseInt(state.nodeCount)], type: [fromConnection, connection]};
        state.nodeList[nodeCount].edges.from.push(state.edgeCount);
        state.nodeList[fromNode].edges.to.push(state.edgeCount);
        state.edgeCount += 1;
      }
      state.nodeCount += 1;
    },
    insertAfter: (state, action) => {
      //  Only allows inserting after if component is not a tempNode!
      let payload = action.payload;
      let nodeCount = state.nodeCount;
      state.nodeList[nodeCount] = {'fieldData': payload.data.fieldData, 'compData': payload.data.compData, edges: {to: [], from: []}};

      let fromNode = payload.from.nodeNum;
      let fromConnection = payload.from.branch;
      state.edgeList[state.edgeCount] = {nodes: [parseInt(fromNode), parseInt(state.nodeCount)], type: [fromConnection, 'cmhMainIn']};
      state.nodeList[nodeCount].edges.from.push(state.edgeCount);
      state.nodeList[fromNode].edges.to.push(state.edgeCount);
      state.nodeList[fromNode].edges.to = state.nodeList[fromNode].edges.to.filter(item => item != payload.edgeKey);
      
      state.edgeList[payload.edgeKey].nodes[0] = nodeCount;
      state.edgeList[payload.edgeKey].type[0] = 'cmhMainOut';
      state.nodeList[nodeCount].edges.to.push(payload.edgeKey);

      state.edgeCount += 1;
      state.nodeCount += 1;
    },
    insertBefore: (state, action) => {
      let payload = action.payload;
      let nodeCount = state.nodeCount;
      state.nodeList[nodeCount] = {'fieldData': payload.data.fieldData, 'compData': payload.data.compData, edges: {to: [], from: []}};

      let toNode = payload.to.nodeNum;
      let toConnection = payload.to.branch;
      state.edgeList[state.edgeCount] = {nodes: [parseInt(state.nodeCount), parseInt(toNode)], type: ['cmhMainOut', toConnection]};
      state.nodeList[nodeCount].edges.to.push(state.edgeCount);
      state.nodeList[toNode].edges.from.push(state.edgeCount);
      state.nodeList[toNode].edges.from = state.nodeList[toNode].edges.from.filter(item => item != payload.edgeKey);

      state.edgeList[payload.edgeKey].nodes[1] = nodeCount;
      state.edgeList[payload.edgeKey].type[0] = 'cmhMainOut';
      state.nodeList[nodeCount].edges.from.push(payload.edgeKey);

      state.edgeCount += 1;
      state.nodeCount += 1;
    },
    updateData: (state, action) => {
      state.nodeList[action.payload.nodeNumber].fieldData = action.payload.data.fieldData; 
    },
    switchAfter: (state, action) => {
      let branches = ["cmhMainOut", "cmhSideOut", "cmhSideOut2"];
      let switch2Branch = {
        cmhMainOut: "cmhSideOut",
        cmhSideOut: "cmhMainOut",
      };
      let permute3Branch = [
        [0, 1, 2],
        [1, 0, 2],
        [1, 2, 0],
        [2, 1, 0],
        [2, 0, 1],
        [0, 2, 1]
      ]
      let payload = action.payload;
      let nodeNumber = payload.nodeNumber;
      let reqInput = payload.component
      let numBranches = ("cmhSideOut2" in reqInput) ? 3 : 2;

      if (numBranches == 2) {
        state.nodeList[nodeNumber].edges.to.forEach(edge => {
          state.edgeList[edge].type[0] = switch2Branch[state.edgeList[edge].type[0]];
        })
        state.branchSwitch = (state.branchSwitch == 5) ? 0 : state.branchSwitch + 1;
      }
      
      if (numBranches == 3) {
        let switch3Branch = {};
        let oldBranchSwitch = state.branchSwitch;
        state.branchSwitch = (state.branchSwitch == 5) ? 0 : state.branchSwitch + 1;
        for (let i = 0; i < 3; i++) {
          switch3Branch[branches[permute3Branch[oldBranchSwitch][i]]] = branches[permute3Branch[state.branchSwitch][i]];
        }

        state.nodeList[nodeNumber].edges.to.forEach(edge => {
          state.edgeList[edge].type[0] = switch3Branch[state.edgeList[edge].type[0]];
        })
      }

    },
    switchBefore: (state, action) => {
      let switch2Branch = {
        cmhMainIn: "cmhSideIn",
        cmhSideIn: "cmhMainIn",
      };
      let payload = action.payload;
      let nodeNumber = payload.nodeNumber;
      let reqInput = payload.component
      let numBranches = ("cmhSideIn2" in reqInput) ? 3 : 2;

      if (numBranches == 2) {
        state.nodeList[nodeNumber].edges.from.forEach(edge => {
          state.edgeList[edge].type[1] = switch2Branch[state.edgeList[edge].type[1]]
        })
        state.branchSwitch = (state.branchSwitch == 5) ? 0 : state.branchSwitch + 1;
      }
    },
    deleteNode: (state, action) => {
      state.deleting = true;
      let deletedNode = state.nodeList[action.payload.nodeNumber];
      if (deletedNode.edges.to.length == 0 && deletedNode.edges.from.length == 0) {
        delete state.nodeList[action.payload.nodeNumber];
        state.deleting = false;
        return;
      }
      if (deletedNode.edges.to.length == 0 && deletedNode.edges.from.length == 1) {
        delete state.nodeList[action.payload.nodeNumber];
        let fromNode = state.edgeList[deletedNode.edges.from[0]].nodes[0];
        let fromEdge = deletedNode.edges.from[0];
        state.nodeList[fromNode].edges.to = state.nodeList[fromNode].edges.to.filter(item => item != fromEdge);
        delete state.edgeList[deletedNode.edges.from[0]];
        state.deleting = false;
        return;
      }
      if (deletedNode.edges.to.length == 1 && deletedNode.edges.from.length == 0) {
        delete state.nodeList[action.payload.nodeNumber];
        let toNode = state.edgeList[deletedNode.edges.to[0]].nodes[1];
        let toEdge = deletedNode.edges.to[0];
        state.nodeList[toNode].edges.from = state.nodeList[toNode].edges.from.filter(item => item != toEdge);
        delete state.edgeList[deletedNode.edges.to[0]];
        state.deleting = false;
        return;
      }
      if (deletedNode.edges.to.length == 1 && deletedNode.edges.from.length == 1) {
        delete state.nodeList[action.payload.nodeNumber];
        state.edgeList[deletedNode.edges.from[0]].nodes[1] = state.edgeList[deletedNode.edges.to[0]].nodes[1];
        state.edgeList[deletedNode.edges.from[0]].type[1] = state.edgeList[deletedNode.edges.to[0]].type[1];
        let toNode = state.edgeList[deletedNode.edges.to[0]].nodes[1];
        let toEdge = deletedNode.edges.to[0];
        state.nodeList[toNode].edges.from = state.nodeList[toNode].edges.from.filter(item => item != toEdge);
        state.nodeList[toNode].edges.from.push(deletedNode.edges.from[0]);
        delete state.edgeList[deletedNode.edges.to[0]];
        state.deleting = false;
        return;
      }
    },
    deleteAllNodes: (state) => {
      state.nodeList = {};
      state.edgeList = {};
      state.nodeCount = 0;
      state.edgeCount = 0;
      state.error = null;
      state.branchSwitch = 0;
      state.deleting = false;
    }
  },
});

// Uncomment when filling out the state changing functions;
export const {create, remove, updateData, insertAfter, insertBefore, switchAfter, switchBefore, deleteNode, deleteAllNodes} = nodeSlice.actions;

export default nodeSlice.reducer;