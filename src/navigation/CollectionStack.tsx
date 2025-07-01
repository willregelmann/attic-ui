import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import CollectionListScreen from '../screens/collection/CollectionListScreen';
import CollectionDetailScreen from '../screens/collection/CollectionDetailScreen';
import ItemDetailScreen from '../screens/collection/ItemDetailScreen';
import AddItemScreen from '../screens/collection/AddItemScreen';
import EditItemScreen from '../screens/collection/EditItemScreen';

export type CollectionStackParamList = {
  CollectionList: undefined;
  CollectionDetail: { collectionId: number; collectionName: string };
  ItemDetail: { itemId: number };
  AddItem: { collectionId?: number };
  EditItem: { itemId: number };
};

const Stack = createStackNavigator<CollectionStackParamList>();

const CollectionStack: React.FC = () => {
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
        name="CollectionList"
        component={CollectionListScreen}
        options={{ title: 'My Collections' }}
      />
      <Stack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={({ route }) => ({ title: route.params.collectionName })}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Add Item' }}
      />
      <Stack.Screen
        name="EditItem"
        component={EditItemScreen}
        options={{ title: 'Edit Item' }}
      />
    </Stack.Navigator>
  );
};

export default CollectionStack;