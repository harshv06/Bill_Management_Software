import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reducer from "./fetchdataslice";

const BASE_URL = "http://192.168.0.106:5000/";

export const fetchFleetData = createAsyncThunk(
  "fleetData/fetchFleetData",
  async () => {
    const response = await fetch(`${BASE_URL}api/cars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Request sent");
      const data = await response.json();
      console.log(data);
      return data;
    } else {
      console.log(response);
      throw new Error("Failed to fetch data");
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};
const fleetDataSlice = createSlice({
  name: "fleetData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFleetData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFleetData.fulfilled, (state, action) => {
        state.loading = false;
        // console.log(action.payload);
        state.data = action.payload;
      })
      .addCase(fetchFleetData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default fleetDataSlice.reducer;
