import React from 'react';
import { View } from 'react-native';

// Mock SafeAreaProvider for web
export const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

// Mock SafeAreaView for web
export const SafeAreaView: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
};

// Mock hooks
export const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: typeof window !== 'undefined' ? window.innerWidth : 375,
  height: typeof window !== 'undefined' ? window.innerHeight : 667,
});

// Mock contexts
export const SafeAreaInsetsContext = React.createContext({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const SafeAreaFrameContext = React.createContext({
  x: 0,
  y: 0,
  width: typeof window !== 'undefined' ? window.innerWidth : 375,
  height: typeof window !== 'undefined' ? window.innerHeight : 667,
});

// Mock initial window metrics
export const initialWindowMetrics = {
  frame: {
    x: 0,
    y: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
  },
  insets: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

// Default export
export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  initialWindowMetrics,
};