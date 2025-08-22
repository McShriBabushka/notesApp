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
  downloadLoading: boolean;
  locationHistoryCount: number;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  error: null,
  loading: false,
  downloadLoading: false,
  locationHistoryCount: 0,
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
      state.downloadLoading = false;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLocationTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setDownloadLoading: (state, action: PayloadAction<boolean>) => {
      state.downloadLoading = action.payload;
    },
    setLocationHistoryCount: (state, action: PayloadAction<number>) => {
      state.locationHistoryCount = action.payload;
    },
    clearLocationError: (state) => {
      state.error = null;
    },
    resetLocationHistory: (state) => {
      state.locationHistoryCount = 0;
    },
  },
});

export const {
  setCurrentLocation,
  setLocationError,
  setLocationLoading,
  setLocationTracking,
  setDownloadLoading,
  setLocationHistoryCount,
  clearLocationError,
  resetLocationHistory,
} = locationSlice.actions;

export default locationSlice.reducer;