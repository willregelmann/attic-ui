import React from 'react';
import { apiService } from '../../services/ApiService';
import { config } from '../../config';
import type { User } from '../../types';

interface AuthScreenSimpleProps {
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

const AuthScreenSimple: React.FC<AuthScreenSimpleProps> = ({
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
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
          Welcome, {googleProfile?.name}!
        </h1>
        
        <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {googleProfile?.picture && (
              <img 
                src={googleProfile.picture} 
                alt="Profile" 
                style={{ width: '64px', height: '64px', borderRadius: '50%' }}
              />
            )}
            <div>
              <h2 style={{ margin: 0, color: '#333' }}>{googleProfile?.name}</h2>
              <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Successfully authenticated with Google</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Connected to Laravel API</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Session persisted locally</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span>Ready to manage collections</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentScreen('home')}
              style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
            <button 
              onClick={handleSignOut}
              style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: 'transparent', 
                color: '#6b7280', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        Sign In to Will's Attic
      </h1>
      
      <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>Welcome!</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Sign in with your Google account to access your collectibles and start managing your collection.
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span>Sync collections across devices</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span>Track progress and value</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span>Connect with other collectors</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
            <span>Secure authentication with Google</span>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {!config.auth.googleClientId ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h4 style={{ color: '#dc2626', marginBottom: '1rem' }}>OAuth Configuration Required</h4>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Google OAuth credentials need to be configured. Please contact the administrator.
              </p>
              <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '4px', borderLeft: '4px solid #fbbf24', marginBottom: '1rem' }}>
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
                style={{ 
                  padding: '0.75rem 1rem', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : '🧪 Test Login (Dev Only)'}
              </button>
            </div>
          ) : isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ marginRight: '0.5rem' }}>Signing in...</div>
            </div>
          ) : !googleReady ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div>Loading Google Sign-In...</div>
            </div>
          ) : (
            <div>
              <div ref={googleSignInRef}>
                {!buttonRendered && (
                  <div style={{ padding: '1rem' }}>
                    <div style={{ height: '48px', backgroundColor: '#e5e7eb', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {config.auth.googleClientId && googleReady && (
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreenSimple;