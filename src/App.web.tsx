import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store, RootState, AppDispatch } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import AppNavigator from './navigation/AppNavigator';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Try to restore auth session on app start
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Will's Attic...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '500',
  },
});

export default App;