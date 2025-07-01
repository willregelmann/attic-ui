import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthStackParamList } from '../../navigation/AuthStack';
import { RootState, AppDispatch } from '../../store';
import { loginWithGoogle, clearError } from '../../store/slices/authSlice';

type GoogleSignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'GoogleSignIn'>;

const GoogleSignInScreen: React.FC = () => {
  const navigation = useNavigation<GoogleSignInScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '367613908045-rf0s4f2dg19spkhflo5dmbr0muikvfgd.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.idToken) {
        dispatch(loginWithGoogle(userInfo.idToken));
      } else {
        Alert.alert('Error', 'Failed to get Google authentication token');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        // User cancelled the sign-in
        return;
      }
      
      Alert.alert(
        'Sign In Failed',
        'There was an error signing in with Google. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#6366f1" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="account-circle" size={80} color="#6366f1" />
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Sign in with your Google account to get started
          </Text>
        </View>

        <View style={styles.signInContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Signing you in...</Text>
            </View>
          ) : (
            <>
              <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
              />
              
              <Text style={styles.orText}>or</Text>
              
              <TouchableOpacity
                style={styles.customGoogleButton}
                onPress={handleGoogleSignIn}
              >
                <Icon name="login" size={24} color="#ffffff" />
                <Text style={styles.customGoogleButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Why sign in?</Text>
          <View style={styles.benefitItem}>
            <Icon name="cloud-sync" size={20} color="#6366f1" />
            <Text style={styles.benefitText}>Sync your collection across devices</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="security" size={20} color="#6366f1" />
            <Text style={styles.benefitText}>Secure trading with verified users</Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="notification-important" size={20} color="#6366f1" />
            <Text style={styles.benefitText}>Get notified about trade matches</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  signInContainer: {
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 16,
  },
  customGoogleButton: {
    backgroundColor: '#4285f4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customGoogleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  benefits: {
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#6366f1',
    fontWeight: '500',
  },
});

export default GoogleSignInScreen;