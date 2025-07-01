import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthStackParamList } from '../../navigation/AuthStack';

type CompleteProfileScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'CompleteProfile'
>;
type CompleteProfileScreenRouteProp = RouteProp<AuthStackParamList, 'CompleteProfile'>;

const CompleteProfileScreen: React.FC = () => {
  const navigation = useNavigation<CompleteProfileScreenNavigationProp>();
  const route = useRoute<CompleteProfileScreenRouteProp>();
  const { user } = route.params;

  const [formData, setFormData] = useState({
    username: '',
    location: '',
    interests: [],
    privacy: 'private',
    notifications: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const collectionInterests = [
    'Trading Cards',
    'Action Figures',
    'Comic Books',
    'Vintage Toys',
    'Sports Memorabilia',
    'Video Games',
    'Stamps',
    'Coins',
    'Art & Prints',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Here you would normally make an API call to update the user profile
      // For now, we'll simulate the completion
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Welcome!', 'Your profile has been set up successfully.', [
          { text: 'Get Started', onPress: () => {/* Navigate to main app */} },
        ]);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to complete profile setup. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.google_avatar ? (
            <Image source={{ uri: user.google_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color="#6b7280" />
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="edit" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalize your Will's Attic experience
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            value={formData.username}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, username: text }))
            }
            placeholder="Choose a unique username"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, location: text }))
            }
            placeholder="City, State or Country"
            autoCapitalize="words"
          />
          <Text style={styles.helperText}>
            This helps us show you local trading opportunities
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Collection Interests</Text>
          <Text style={styles.helperText}>
            Select the types of collectibles you're interested in
          </Text>
          <View style={styles.interestsContainer}>
            {collectionInterests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  formData.interests.includes(interest) && styles.interestChipSelected,
                ]}
                onPress={() => handleInterestToggle(interest)}
              >
                <Text
                  style={[
                    styles.interestChipText,
                    formData.interests.includes(interest) && styles.interestChipTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Privacy Settings</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'public', label: 'Public', description: 'Anyone can see your profile and collections' },
              { value: 'friends-only', label: 'Friends Only', description: 'Only approved friends can see your profile' },
              { value: 'private', label: 'Private', description: 'Only you can see your profile' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setFormData(prev => ({ ...prev, privacy: option.value }))}
              >
                <View style={styles.radioButton}>
                  {formData.privacy === option.value && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchContent}>
              <Text style={styles.label}>Push Notifications</Text>
              <Text style={styles.helperText}>
                Get notified about trade matches and messages
              </Text>
            </View>
            <Switch
              value={formData.notifications}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, notifications: value }))
              }
              trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
              thumbColor={formData.notifications ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Setting up...</Text>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Complete Setup</Text>
              <Icon name="arrow-forward" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  interestChipSelected: {
    backgroundColor: '#6366f1',
  },
  interestChipText: {
    fontSize: 14,
    color: '#1f2937',
  },
  interestChipTextSelected: {
    color: '#ffffff',
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default CompleteProfileScreen;