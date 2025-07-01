// Mock Google Sign-In for web
declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface GoogleUser {
  user: {
    id: string;
    email: string;
    name: string;
    photo: string;
    familyName: string;
    givenName: string;
  };
  idToken: string;
  accessToken: string;
}

export class GoogleSignin {
  static configure(config: any): void {
    console.log('GoogleSignin.configure called with:', config);
  }

  static async hasPlayServices(): Promise<boolean> {
    return true;
  }

  static async signIn(): Promise<GoogleUser> {
    // Simulate Google sign-in flow
    return new Promise((resolve, reject) => {
      // For web, we'll use the actual Google Sign-In library
      if (typeof window !== 'undefined' && window.google) {
        // Use Google Identity Services
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google Sign-In was cancelled'));
          }
        });
        
        // This is a simplified mock - in real implementation, you'd handle the actual Google response
        setTimeout(() => {
          resolve({
            user: {
              id: '123456789',
              email: 'will@example.com',
              name: 'Will Regelmann',
              photo: 'https://via.placeholder.com/150',
              familyName: 'Regelmann',
              givenName: 'Will',
            },
            idToken: 'mock_id_token_' + Date.now(),
            accessToken: 'mock_access_token_' + Date.now(),
          });
        }, 1000);
      } else {
        // Fallback mock for development
        setTimeout(() => {
          resolve({
            user: {
              id: '123456789',
              email: 'will@example.com',
              name: 'Will Regelmann',
              photo: 'https://via.placeholder.com/150',
              familyName: 'Regelmann',
              givenName: 'Will',
            },
            idToken: 'mock_id_token_' + Date.now(),
            accessToken: 'mock_access_token_' + Date.now(),
          });
        }, 1000);
      }
    });
  }

  static async signOut(): Promise<void> {
    console.log('GoogleSignin.signOut called');
  }

  static async isSignedIn(): Promise<boolean> {
    return false;
  }

  static async getCurrentUser(): Promise<GoogleUser | null> {
    return null;
  }
}

export default GoogleSignin;