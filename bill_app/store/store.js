import { configureStore } from "@reduxjs/toolkit";
import fetchdataReducer from "./fetchdataslice";
import FleetDataReducer from "./FleetDataSlice";
import CompanyDataReducer from "./CompanyDataSlice";
const store = configureStore({
  reducer: {
    fetchData: fetchdataReducer,
    FleetData: FleetDataReducer,
    CompanyData: CompanyDataReducer,
  },
});

export default store;
