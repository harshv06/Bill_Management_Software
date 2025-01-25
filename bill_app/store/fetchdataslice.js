import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const BASE_URL = "http://192.168.0.106:5000/";

export const fetchMainData = createAsyncThunk(
  "MainData/fetchMainData",
  async () => {
    const response = await fetch(`${BASE_URL}getAllCompanies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Failed to fetch data");
    }
  }
);

export const fetchCompanyPaymentRecordData = async (id) => {
  const response = await fetch(`${BASE_URL}getPaymentHistory/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch data");
  }
};

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const fetchdataSlice = createSlice({
  name: "fetchdata",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMainData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMainData.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.data = action.payload;
      })
      .addCase(fetchMainData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default fetchdataSlice.reducer;
