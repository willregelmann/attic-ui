import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ActiveTradesScreen from '../screens/trade/ActiveTradesScreen';
import TradeOffersScreen from '../screens/trade/TradeOffersScreen';
import TradeHistoryScreen from '../screens/trade/TradeHistoryScreen';
import CreateTradeOfferScreen from '../screens/trade/CreateTradeOfferScreen';
import TradeDetailScreen from '../screens/trade/TradeDetailScreen';

export type TradeStackParamList = {
  ActiveTrades: undefined;
  TradeOffers: undefined;
  TradeHistory: undefined;
  CreateTradeOffer: undefined;
  TradeDetail: { tradeId: number };
};

const Stack = createStackNavigator<TradeStackParamList>();

const TradeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#059669',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ActiveTrades"
        component={ActiveTradesScreen}
        options={{ title: 'Active Trades' }}
      />
      <Stack.Screen
        name="TradeOffers"
        component={TradeOffersScreen}
        options={{ title: 'Trade Offers' }}
      />
      <Stack.Screen
        name="TradeHistory"
        component={TradeHistoryScreen}
        options={{ title: 'Trade History' }}
      />
      <Stack.Screen
        name="CreateTradeOffer"
        component={CreateTradeOfferScreen}
        options={{ title: 'Create Trade Offer' }}
      />
      <Stack.Screen
        name="TradeDetail"
        component={TradeDetailScreen}
        options={{ title: 'Trade Details' }}
      />
    </Stack.Navigator>
  );
};

export default TradeStack;