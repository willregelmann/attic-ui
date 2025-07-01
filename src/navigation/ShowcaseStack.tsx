import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MyShowcasesScreen from '../screens/showcase/MyShowcasesScreen';
import BrowseShowcasesScreen from '../screens/showcase/BrowseShowcasesScreen';
import ShowcaseDetailScreen from '../screens/showcase/ShowcaseDetailScreen';
import CreateShowcaseScreen from '../screens/showcase/CreateShowcaseScreen';

export type ShowcaseStackParamList = {
  MyShowcases: undefined;
  BrowseShowcases: undefined;
  ShowcaseDetail: { showcaseId: number };
  CreateShowcase: undefined;
};

const Stack = createStackNavigator<ShowcaseStackParamList>();

const ShowcaseStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#8b5cf6',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MyShowcases"
        component={MyShowcasesScreen}
        options={{ title: 'My Showcases' }}
      />
      <Stack.Screen
        name="BrowseShowcases"
        component={BrowseShowcasesScreen}
        options={{ title: 'Browse Showcases' }}
      />
      <Stack.Screen
        name="ShowcaseDetail"
        component={ShowcaseDetailScreen}
        options={{ title: 'Showcase' }}
      />
      <Stack.Screen
        name="CreateShowcase"
        component={CreateShowcaseScreen}
        options={{ title: 'Create Showcase' }}
      />
    </Stack.Navigator>
  );
};

export default ShowcaseStack;