import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PremiumUpgradeScreen from '../screens/profile/PremiumUpgradeScreen';
import AnalyticsScreen from '../screens/profile/AnalyticsScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  PremiumUpgrade: undefined;
  Analytics: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="PremiumUpgrade"
        component={PremiumUpgradeScreen}
        options={{ title: 'Premium Upgrade' }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;