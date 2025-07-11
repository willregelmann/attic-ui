import React from 'react';
import { apiService } from '../../services/ApiService';
import { config } from '../../config';
import type { User } from '../../types';

interface AuthScreenFixedProps {
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

const AuthScreenFixed: React.FC<AuthScreenFixedProps> = ({
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
  const googleSignInRef = React.useRef<HTMLDivElement>(null);
  const [buttonRendered, setButtonRendered] = React.useState(false);

  // Cleanup function to safely clear the Google button
  const cleanupGoogleButton = () => {
    if (googleSignInRef.current) {
      try {
        const container = googleSignInRef.current;
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      } catch (error) {
        console.warn('Error cleaning up Google button:', error);
      }
    }
  };

  // Render Google Sign-In button when Google is ready
  React.useEffect(() => {
    const renderButton = () => {
      if (googleReady && window.google && googleSignInRef.current && !isAuthenticated && config.auth.googleClientId && !buttonRendered) {
        try {
          cleanupGoogleButton();
          
          setTimeout(() => {
            if (googleSignInRef.current && !buttonRendered) {
              window.google.accounts.id.renderButton(googleSignInRef.current, {
                theme: 'outline',
                size: 'large',
                width: 400,
                text: 'signin_with',
              });
              setButtonRendered(true);
              console.log('Google Sign-In button rendered successfully');
            }
          }, 50);
        } catch (error) {
          console.error('Error rendering Google Sign-In button:', error);
          setButtonRendered(false);
        }
      }
    };

    if (googleReady && !isAuthenticated) {
      renderButton();
    }
  }, [googleReady, isAuthenticated, buttonRendered, config.auth.googleClientId]);

  React.useEffect(() => {
    setButtonRendered(false);
    return () => {
      cleanupGoogleButton();
    };
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      cleanupGoogleButton();
      setButtonRendered(false);
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
              <img 
                src={googleProfile?.picture} 
                alt="Profile" 
                className="w-16 h-16 rounded-full"
              />
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
              <div className="flex justify-center">
                <div ref={googleSignInRef}>
                  {!buttonRendered && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-600 rounded-lg h-12 w-80"></div>
                    </div>
                  )}
                </div>
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

export default AuthScreenFixed;