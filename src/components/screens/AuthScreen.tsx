import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { apiService } from '../../services/ApiService';
import { config } from '../../config';
import type { User } from '../../types';

interface AuthScreenProps {
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

const AuthScreen: React.FC<AuthScreenProps> = ({
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
        // Safely clear the container
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
          // Clean up any existing content safely
          cleanupGoogleButton();
          
          // Small delay to ensure DOM is ready
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

  // Reset button rendered state when component mounts
  React.useEffect(() => {
    setButtonRendered(false);
    return () => {
      // Cleanup on unmount
      cleanupGoogleButton();
    };
  }, []);

  // Clean up when user becomes authenticated
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
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img 
                src={googleProfile?.picture} 
                alt="Profile" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle className="text-2xl">{googleProfile?.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
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
            
            <div className="pt-4 space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setCurrentScreen('home')}
              >
                <Search className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        Sign In to Will's Attic
      </h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>
            Sign in with your Google account to access your collectibles and start managing your collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
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
          
          <div className="pt-4">
            {!config.auth.googleClientId ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">⚠️</div>
                <h4 className="font-semibold text-red-600 mb-2">OAuth Configuration Required</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Google OAuth credentials need to be configured. Please contact the administrator.
                </p>
                <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded border-l-4 border-yellow-400 mb-4">
                  <strong>For developers:</strong> Set VITE_GOOGLE_CLIENT_ID in your environment variables.
                </div>
                <Button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const response = await apiService.testLogin();
                      if (response.success) {
                        apiService.setAuthToken(response.token);
                        setAuthToken(response.token);
                        setUser(response.user);
                        setIsAuthenticated(true);
                        
                        // Set mock Google profile for display
                        const mockProfile = {
                          name: 'Test User',
                          picture: 'https://via.placeholder.com/150',
                          email: 'test@example.com',
                        };
                        setGoogleProfile(mockProfile);
                        
                        // Store in localStorage
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
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : '🧪 Test Login (Dev Only)'}
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Signing in...</span>
              </div>
            ) : !googleReady ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading Google Sign-In...</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <div ref={googleSignInRef}>
                  {!buttonRendered && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-80"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {config.auth.googleClientId && googleReady && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;