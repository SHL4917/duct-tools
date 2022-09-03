import {configureStore} from '@reduxjs/toolkit';
import nodeReducer from './nodeSlice';
import selectionReducer from './selectionSlice';

export const store = configureStore({
  reducer: {
    node: nodeReducer,
    selection: selectionReducer,
  },
})