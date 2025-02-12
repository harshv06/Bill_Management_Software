// CompanyDataSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Config from "../src/utils/GlobalConfig";

export const fetchCompanyData = createAsyncThunk(
  "CompanyData/fetchCompanyData",
  async ({ page = 1, limit = 5 } = {}) => {
    const response = await fetch(
      `${Config.API_BASE_URL}/getAllCompanies?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      return {
        ...data,
        currentPage: page,
        pages: Math.ceil(data.total / limit),
      };
    } else {
      throw new Error("Failed to fetch companies");
    }
  }
);

const initialState = {
  data: {
    companies: [],
    total: 0,
    currentPage: 1,
    pages: 1,
  },
  loading: false,
  error: null,
};

const CompanyDataSlice = createSlice({
  name: "CompanyData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCompanyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default CompanyDataSlice.reducer;
