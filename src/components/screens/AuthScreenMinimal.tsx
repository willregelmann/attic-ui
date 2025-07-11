import React from 'react';
import type { User } from '../../types';

interface AuthScreenMinimalProps {
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

const AuthScreenMinimal: React.FC<AuthScreenMinimalProps> = ({
  isAuthenticated,
  user,
  googleProfile,
  setCurrentScreen,
  handleSignOut,
}) => {
  console.log('AuthScreenMinimal rendering:', { isAuthenticated, user: !!user, googleProfile: !!googleProfile });

  if (isAuthenticated && user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome back!</h1>
        <p>Hello, {googleProfile?.name || user.email}!</p>
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => setCurrentScreen('home')}
            style={{ 
              padding: '1rem 2rem', 
              marginRight: '1rem',
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
              padding: '1rem 2rem', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sign In Required</h1>
      <p>Please sign in to access your collections.</p>
      <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <p>Google Sign-In would normally appear here</p>
        <p>Debug: Google Ready = {String(!!window.google)}</p>
        <button 
          onClick={() => {
            console.log('Test button clicked');
            alert('This is just a test. Real Google sign-in would happen here.');
          }}
          style={{ 
            padding: '1rem 2rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Button (No Google API)
        </button>
      </div>
    </div>
  );
};

export default AuthScreenMinimal;