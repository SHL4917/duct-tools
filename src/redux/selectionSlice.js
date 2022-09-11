import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  nodeNumber: null,
  update: false,
  connection: null,
  nodeSelected: false,
  tempNode: null,
};
/*
nodeSelected: the node number referring to the node in the directed graph
  If nothing selected, default is null
  If selected - nodeSelected: nodeNumber
update: determines if selection is on an existing node (true) or a new node (false)
  If false, connection type now determines how the new node connects to the nodeSelected
connection: determines the type of connection to/from the nodeSelected
  connection: {toNew: true/false, branch: cmhMainIn/cmhMainOut etc...}
*/

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    update: (state, action) => {
      let payload = action.payload
      state.nodeNumber = payload.nodeNumber;
      state.update = payload.update;
      state.connection = payload.connection;
      state.tempNode = payload.tempNode ?? null;
    },
    nodeClicked: (state) => {
      state.nodeSelected = true;
    },
    nodeNotClicked: (state) => {
      state.nodeSelected = false;
    },
    resetSelection: (state) => {
      state.nodeNumber = null;
      state.update = false;
      state.connection = null;
      state.nodeSelected = false;
      state.tempNode = null;
    }
  },
});

// Uncomment when filling out the state changing functions;
export const {update, nodeClicked, nodeNotClicked, resetSelection} = selectionSlice.actions;

export default selectionSlice.reducer;