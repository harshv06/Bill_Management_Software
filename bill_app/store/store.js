import { configureStore } from "@reduxjs/toolkit";
import fetchdataReducer from "./fetchdataslice";
const store=configureStore({
    reducer:{
        fetchData:fetchdataReducer
    }
})

export default store