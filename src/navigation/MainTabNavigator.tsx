import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CollectionStack from './CollectionStack';
import WishlistStack from './WishlistStack';
import ShowcaseStack from './ShowcaseStack';
import TradeStack from './TradeStack';
import ProfileStack from './ProfileStack';

export type MainTabParamList = {
  CollectionTab: undefined;
  WishlistTab: undefined;
  ShowcaseTab: undefined;
  TradeTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'CollectionTab':
              iconName = 'collections';
              break;
            case 'WishlistTab':
              iconName = 'favorite';
              break;
            case 'ShowcaseTab':
              iconName = 'photo-library';
              break;
            case 'TradeTab':
              iconName = 'swap-horiz';
              break;
            case 'ProfileTab':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="CollectionTab"
        component={CollectionStack}
        options={{ tabBarLabel: 'Collection' }}
      />
      <Tab.Screen
        name="WishlistTab"
        component={WishlistStack}
        options={{ tabBarLabel: 'Wishlist' }}
      />
      <Tab.Screen
        name="ShowcaseTab"
        component={ShowcaseStack}
        options={{ tabBarLabel: 'Showcase' }}
      />
      <Tab.Screen
        name="TradeTab"
        component={TradeStack}
        options={{ tabBarLabel: 'Trade' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;