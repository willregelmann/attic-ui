import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { RootState } from '../store';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;