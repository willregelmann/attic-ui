import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import GoogleSignInScreen from '../screens/auth/GoogleSignInScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  GoogleSignIn: undefined;
  CompleteProfile: { user: any };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="GoogleSignIn" component={GoogleSignInScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;