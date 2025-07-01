import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AppSimple: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  const WelcomeScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Will's Attic</Text>
      <Text style={styles.subtitle}>Your personal collectibles manager</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentScreen('collections')}
      >
        <Text style={styles.buttonText}>View Collections</Text>
      </TouchableOpacity>
    </View>
  );

  const CollectionsScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>Collections</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pokemon Cards</Text>
        <Text style={styles.cardSubtitle}>78% Complete</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Star Wars Figures</Text>
        <Text style={styles.cardSubtitle}>45% Complete</Text>
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentScreen('welcome')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('welcome')}>
          <Text style={styles.navItem}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentScreen('collections')}>
          <Text style={styles.navItem}>Collections</Text>
        </TouchableOpacity>
      </View>
      
      {currentScreen === 'welcome' ? <WelcomeScreen /> : <CollectionsScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 20,
    gap: 20,
  },
  navItem: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  screen: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default AppSimple;