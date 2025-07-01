import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { CollectionStackParamList } from '../../navigation/CollectionStack';

type CollectionListScreenNavigationProp = StackNavigationProp<
  CollectionStackParamList,
  'CollectionList'
>;

const CollectionListScreen: React.FC = () => {
  const navigation = useNavigation<CollectionListScreenNavigationProp>();

  const mockCollections = [
    {
      id: 1,
      name: 'Pokemon Cards',
      category: 'Trading Cards',
      totalItems: 245,
      completionPercentage: 78,
      recentItems: 5,
    },
    {
      id: 2,
      name: 'Marvel Action Figures',
      category: 'Action Figures',
      totalItems: 32,
      completionPercentage: 45,
      recentItems: 2,
    },
    {
      id: 3,
      name: 'Vintage Comics',
      category: 'Comic Books',
      totalItems: 89,
      completionPercentage: 92,
      recentItems: 1,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>366</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$2,450</Text>
            <Text style={styles.statLabel}>Est. Value</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-list" size={20} color="#6366f1" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewToggle}>
            <Icon name="grid-view" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.collectionsContainer}>
        {mockCollections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={styles.collectionCard}
            onPress={() =>
              navigation.navigate('CollectionDetail', {
                collectionId: collection.id,
                collectionName: collection.name,
              })
            }
          >
            <View style={styles.collectionHeader}>
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionName}>{collection.name}</Text>
                <Text style={styles.collectionCategory}>{collection.category}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${collection.completionPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {collection.completionPercentage}% complete
              </Text>
            </View>

            <View style={styles.collectionStats}>
              <View style={styles.statItem}>
                <Icon name="inventory" size={16} color="#6b7280" />
                <Text style={styles.statItemText}>{collection.totalItems} items</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="add-circle-outline" size={16} color="#10b981" />
                <Text style={styles.statItemText}>
                  {collection.recentItems} added recently
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
      >
        <Icon name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    color: '#6366f1',
    marginLeft: 8,
    fontWeight: '500',
  },
  viewToggle: {
    padding: 8,
  },
  collectionsContainer: {
    padding: 20,
  },
  collectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  collectionCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  collectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItemText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default CollectionListScreen;