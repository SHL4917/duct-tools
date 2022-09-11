import {createSlice} from '@reduxjs/toolkit';

const initialState = {
<<<<<<< HEAD
  paths: [],
  displayData: null,
=======
  paths: []
>>>>>>> 26f64102955d1b168b0c55746cc4693fc4004a38
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
<<<<<<< HEAD
      let payload = action.payload;
=======
      let payload = action.payload
>>>>>>> 26f64102955d1b168b0c55746cc4693fc4004a38
      state.paths = payload.paths;
    },
    resetPaths: (state) => {
      state.paths = [];
<<<<<<< HEAD
      state.displayData = null;
    },
    updateDisplayData: (state, action) => {
      let payload = action.payload;
      state.displayData = payload.displayData;
    }
=======
    },
>>>>>>> 26f64102955d1b168b0c55746cc4693fc4004a38
  },
});

// Uncomment when filling out the state changing functions;
<<<<<<< HEAD
export const {updatePaths, resetPaths, updateDisplayData} = ductPathSlice.actions;
=======
export const {updatePaths, resetPaths} = ductPathSlice.actions;
>>>>>>> 26f64102955d1b168b0c55746cc4693fc4004a38

export default ductPathSlice.reducer;