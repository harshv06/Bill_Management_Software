// store/fleetDataSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Config from "../src/utils/GlobalConfig";

const BASE_URL = "http://192.168.0.106:5000/";
// const BASE_URL = "http://172.20.10.3:5000/";

export const fetchFleetData = createAsyncThunk(
  "fleetData/fetchFleetData",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "car_id",
      sortOrder = "ASC",
      status = "ALL",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
        status,
      }).toString();
      console.log("Query Params:", queryParams); // Log the query parameters
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${Config.API_BASE_URL}/cars?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch fleet data"
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        return {
          ...data.data,
          page,
          search,
          status,
        };
      } else {
        return rejectWithValue(data.message || "Failed to fetch fleet data");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add thunk for adding a car
export const addCar = createAsyncThunk(
  "fleetData/addCar",
  async (carData, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${Config.API_BASE_URL}/cars/AddCar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        throw new Error("Failed to add car");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Refresh the car list after adding
        dispatch(fetchFleetData());
        return data.data;
      } else {
        return rejectWithValue(data.message || "Failed to add car");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add thunk for updating a car
export const updateCar = createAsyncThunk(
  "fleetData/updateCar",
  async ({ carId, carData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/update/${carId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(carData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update car");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Refresh the car list after updating
        dispatch(fetchFleetData());
        return data.data;
      } else {
        return rejectWithValue(data.message || "Failed to update car");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add thunk for deleting a car
export const deleteCar = createAsyncThunk(
  "fleetData/deleteCar",
  async (carId, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(
        `${Config.API_BASE_URL}/cars/delete/${carId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete car");
      }

      const data = await response.json();

      if (data.status === "success") {
        // Refresh the car list after deleting
        dispatch(fetchFleetData());
        return carId;
      } else {
        return rejectWithValue(data.message || "Failed to delete car");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  data: {
    cars: [],
    pagination: {
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    },
  },
  loading: false,
  error: null,
  addCarStatus: "idle",
  updateCarStatus: "idle",
  deleteCarStatus: "idle",
};

const fleetDataSlice = createSlice({
  name: "fleetData",
  initialState: {
    data: null,
    cars: [],
    pagination: {
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    },
    loading: false,
    error: null,
    currentPage: 1,
    search: "",
    status: "ALL",
  },
  reducers: {
    resetStatus: (state) => {
      state.addCarStatus = "idle";
      state.updateCarStatus = "idle";
      state.deleteCarStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch fleet data
      .addCase(fetchFleetData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFleetData.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload.cars;
        state.pagination = action.payload.pagination;
        state.currentPage = action.payload.page;
        state.search = action.payload.search;
        state.status = action.payload.status;
      })
      .addCase(fetchFleetData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cars = [];
      })

      // Add car
      .addCase(addCar.pending, (state) => {
        state.addCarStatus = "loading";
        state.error = null;
      })
      .addCase(addCar.fulfilled, (state) => {
        state.addCarStatus = "succeeded";
      })
      .addCase(addCar.rejected, (state, action) => {
        state.addCarStatus = "failed";
        state.error = action.payload;
      })

      // Update car
      .addCase(updateCar.pending, (state) => {
        state.updateCarStatus = "loading";
        state.error = null;
      })
      .addCase(updateCar.fulfilled, (state) => {
        state.updateCarStatus = "succeeded";
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.updateCarStatus = "failed";
        state.error = action.payload;
      })

      // Delete car
      .addCase(deleteCar.pending, (state) => {
        state.deleteCarStatus = "loading";
        state.error = null;
      })
      .addCase(deleteCar.fulfilled, (state) => {
        state.deleteCarStatus = "succeeded";
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.deleteCarStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = fleetDataSlice.actions;
export default fleetDataSlice.reducer;
