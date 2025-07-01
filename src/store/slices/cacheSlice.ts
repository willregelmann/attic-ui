import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CacheState {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingMutations: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }>;
  lastSyncTime: number | null;
}

const initialState: CacheState = {
  isOnline: true,
  syncStatus: 'idle',
  pendingMutations: [],
  lastSyncTime: null,
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setSyncStatus: (state, action: PayloadAction<'idle' | 'syncing' | 'error'>) => {
      state.syncStatus = action.payload;
    },
    addPendingMutation: (
      state,
      action: PayloadAction<{
        id: string;
        type: string;
        data: any;
      }>
    ) => {
      state.pendingMutations.push({
        ...action.payload,
        timestamp: Date.now(),
      });
    },
    removePendingMutation: (state, action: PayloadAction<string>) => {
      state.pendingMutations = state.pendingMutations.filter(
        (mutation) => mutation.id !== action.payload
      );
    },
    clearPendingMutations: (state) => {
      state.pendingMutations = [];
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncStatus,
  addPendingMutation,
  removePendingMutation,
  clearPendingMutations,
  setLastSyncTime,
} = cacheSlice.actions;

export default cacheSlice.reducer;