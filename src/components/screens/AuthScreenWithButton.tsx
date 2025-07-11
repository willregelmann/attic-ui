import React from 'react';
import { apiService } from '../../services/ApiService';
import { config } from '../../config';
import GoogleSignInButton, { GoogleSignInButtonRef } from '../GoogleSignInButton';
import type { User } from '../../types';

interface AuthScreenWithButtonProps {
  isAuthenticated: boolean;
  user: User | null;
  googleProfile?: { name: string; picture: string; email: string } | null;
  googleReady: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setAuthToken: (token: string) => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setGoogleProfile: (profile: any) => void;
  handleSignOut: () => void;
}

const AuthScreenWithButton: React.FC<AuthScreenWithButtonProps> = ({
  isAuthenticated,
  user,
  googleProfile,
  googleReady,
  isLoading,
  setIsLoading,
  setCurrentScreen,
  setAuthToken,
  setUser,
  setIsAuthenticated,
  setGoogleProfile,
  handleSignOut,
}) => {
  const googleButtonRef = React.useRef<GoogleSignInButtonRef>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    console.log('Google credential received:', credentialResponse);
    
    try {
      const response = await apiService.authenticateWithGoogleToken(credentialResponse.credential);
      console.log('API authentication response:', response);
      
      if (response.success) {
        apiService.setAuthToken(response.token);
        setAuthToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Decode Google JWT to get profile info
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        const googleProfileData = {
          name: payload.name,
          picture: payload.picture,
          email: payload.email,
        };
        setGoogleProfile(googleProfileData);
        
        // Store in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('google_profile', JSON.stringify(googleProfileData));
        
        setCurrentScreen('home');
        console.log('Authentication successful');
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(`Sign-in error: ${error instanceof Error ? error.message : 'Failed to authenticate'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google Sign-In error:', error);
    setIsLoading(false);
  };

  // Clean up Google button when user becomes authenticated
  React.useEffect(() => {
    if (isAuthenticated && googleButtonRef.current) {
      googleButtonRef.current.cleanup();
    }
  }, [isAuthenticated]);

  if (isAuthenticated && user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome, {googleProfile?.name}!
        </h1>
        
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {googleProfile?.picture && (
                <img 
                  src={googleProfile.picture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-semibold">{googleProfile?.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Successfully authenticated with Google</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected to Laravel API</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Session persisted locally</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready to manage collections</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={() => setCurrentScreen('home')}
              >
                <span>🔍</span>
                Go to Dashboard
              </button>
              <button 
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-4 rounded-lg transition-colors"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        Sign In to Will's Attic
      </h1>
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in with your Google account to access your collectibles and start managing your collection.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sync collections across devices</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Track progress and value</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Connect with other collectors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure authentication with Google</span>
            </div>
          </div>
          
          <div className="text-center">
            {!config.auth.googleClientId ? (
              <div>
                <div className="text-4xl mb-3">⚠️</div>
                <h4 className="font-semibold text-red-600 mb-2">OAuth Configuration Required</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Google OAuth credentials need to be configured. Please contact the administrator.
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-400 mb-4">
                  <strong>For developers:</strong> Set VITE_GOOGLE_CLIENT_ID in your environment variables.
                </div>
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const response = await apiService.testLogin();
                      if (response.success) {
                        apiService.setAuthToken(response.token);
                        setAuthToken(response.token);
                        setUser(response.user);
                        setIsAuthenticated(true);
                        
                        const mockProfile = {
                          name: 'Test User',
                          picture: 'https://via.placeholder.com/150',
                          email: 'test@example.com',
                        };
                        setGoogleProfile(mockProfile);
                        
                        localStorage.setItem('auth_token', response.token);
                        localStorage.setItem('user', JSON.stringify(response.user));
                        localStorage.setItem('google_profile', JSON.stringify(mockProfile));
                        
                        setCurrentScreen('home');
                      }
                    } catch (error) {
                      alert('Test login failed: ' + error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : '🧪 Test Login (Dev Only)'}
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Signing in...</span>
              </div>
            ) : !googleReady ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading Google Sign-In...</span>
              </div>
            ) : (
              <div className="mb-4">
                <GoogleSignInButton
                  ref={googleButtonRef}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isLoading}
                />
              </div>
            )}
            
            {config.auth.googleClientId && googleReady && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreenWithButton;