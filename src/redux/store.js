import {configureStore} from '@reduxjs/toolkit';
import nodeReducer from './nodeSlice';
import selectionReducer from './selectionSlice';
import ductPathReducer from './ductPathSlice'

export const store = configureStore({
  reducer: {
    node: nodeReducer,
    selection: selectionReducer,
    ductPath: ductPathReducer,
  },
})