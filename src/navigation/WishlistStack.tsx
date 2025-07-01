import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WishlistScreen from '../screens/wishlist/WishlistScreen';
import TradeMatchesScreen from '../screens/wishlist/TradeMatchesScreen';
import AddToWishlistScreen from '../screens/wishlist/AddToWishlistScreen';

export type WishlistStackParamList = {
  Wishlist: undefined;
  TradeMatches: undefined;
  AddToWishlist: undefined;
};

const Stack = createStackNavigator<WishlistStackParamList>();

const WishlistStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ec4899',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'My Wishlist' }}
      />
      <Stack.Screen
        name="TradeMatches"
        component={TradeMatchesScreen}
        options={{ title: 'Trade Matches' }}
      />
      <Stack.Screen
        name="AddToWishlist"
        component={AddToWishlistScreen}
        options={{ title: 'Add to Wishlist' }}
      />
    </Stack.Navigator>
  );
};

export default WishlistStack;