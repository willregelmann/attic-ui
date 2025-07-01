import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  searchQuery: string;
  activeModal: string | null;
  notifications: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
}

const initialState: UIState = {
  theme: 'light',
  isLoading: false,
  searchQuery: '',
  activeModal: null,
  notifications: {
    visible: false,
    message: '',
    type: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
      }>
    ) => {
      state.notifications = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideNotification: (state) => {
      state.notifications.visible = false;
    },
  },
});

export const {
  setTheme,
  setLoading,
  setSearchQuery,
  setActiveModal,
  showNotification,
  hideNotification,
} = uiSlice.actions;

export default uiSlice.reducer;