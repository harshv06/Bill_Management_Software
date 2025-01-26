import { configureStore } from "@reduxjs/toolkit";
import fetchdataReducer from "./fetchdataslice";
import FleetDataReducer from "./FleetDataSlice";
const store = configureStore({
  reducer: {
    fetchData: fetchdataReducer,
    FleetData: FleetDataReducer,
  },
});

export default store;
