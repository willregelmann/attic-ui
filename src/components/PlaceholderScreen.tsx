import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
  iconName?: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  subtitle = 'Coming Soon...',
  iconName = 'construction',
}) => {
  return (
    <View style={styles.container}>
      <Icon name={iconName} size={64} color="#6366f1" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default PlaceholderScreen;