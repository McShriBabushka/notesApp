// src/store/slices/locationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  provider?: string;
}

interface LocationState {
  currentLocation: LocationData | null;
  isTracking: boolean;
  error: string | null;
  loading: boolean;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  error: null,
  loading: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.error = null;
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLocationTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentLocation,
  setLocationError,
  setLocationLoading,
  setLocationTracking,
  clearLocationError,
} = locationSlice.actions;

export default locationSlice.reducer;