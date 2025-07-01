import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationItem {
  id: string;
  type: 'trade_match' | 'price_alert' | 'trade_offer' | 'showcase_interaction' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  preferences: {
    tradeMatches: boolean;
    priceAlerts: boolean;
    tradeOffers: boolean;
    showcaseInteractions: boolean;
    systemAnnouncements: boolean;
  };
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  preferences: {
    tradeMatches: true,
    priceAlerts: true,
    tradeOffers: true,
    showcaseInteractions: true,
    systemAnnouncements: true,
  },
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp' | 'read'>>) => {
      const notification: NotificationItem = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.items.unshift(notification);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        const notification = state.items[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.items.splice(index, 1);
      }
    },
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
    updatePreferences: (state, action: PayloadAction<Partial<NotificationsState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updatePreferences,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;