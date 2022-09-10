import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  paths: []
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

export const ductPathSlice = createSlice({
  name: 'ductPath',
  initialState,
  reducers: {
    updatePaths: (state, action) => {
      let payload = action.payload
      state.paths = payload.paths;
    },
    resetPaths: (state) => {
      state.paths = [];
    },
  },
});

// Uncomment when filling out the state changing functions;
export const {updatePaths, resetPaths} = ductPathSlice.actions;

export default ductPathSlice.reducer;