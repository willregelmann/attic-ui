import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { config } from '../config';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export interface GoogleSignInButtonRef {
  cleanup: () => void;
}

const GoogleSignInButton = forwardRef<GoogleSignInButtonRef, GoogleSignInButtonProps>(
  ({ onSuccess, onError, disabled = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isRendered = useRef(false);
    const buttonId = useRef(`google-signin-${Math.random().toString(36).substr(2, 9)}`);

    const cleanup = () => {
      try {
        // Cancel any pending Google operations
        if (window.google?.accounts?.id?.cancel) {
          window.google.accounts.id.cancel();
        }
        
        // Don't try to remove Google elements - let them be orphaned
        // This prevents DOM conflicts with React
        isRendered.current = false;
      } catch (error) {
        console.warn('Google cleanup warning:', error);
      }
    };

    useImperativeHandle(ref, () => ({
      cleanup
    }), []);

    useEffect(() => {
      if (!config.auth.googleClientId || disabled) return;

      let timeoutId: NodeJS.Timeout;

      const renderButton = () => {
        const container = containerRef.current;
        if (!window.google?.accounts?.id || !container || isRendered.current) {
          return;
        }

        try {
          // Initialize Google if not already done
          if (!window.google._initialized) {
            window.google.accounts.id.initialize({
              client_id: config.auth.googleClientId,
              callback: onSuccess,
              auto_select: false,
            });
            window.google._initialized = true;
          }

          // Use a portal-like approach to render completely outside React's control
          const portalContainer = document.createElement('div');
          portalContainer.id = buttonId.current;
          portalContainer.setAttribute('data-google-signin', 'true');
          portalContainer.style.cssText = 'width: 100%; display: flex; justify-content: center;';
          
          // Replace the container content with our portal
          container.innerHTML = '';
          container.appendChild(portalContainer);
          
          // Immediately detach from React's management
          Object.defineProperty(container, '_reactInternalFiber', { value: null, writable: false });
          Object.defineProperty(container, '_reactInternalInstance', { value: null, writable: false });
          Object.defineProperty(container, '__reactInternalFiber', { value: null, writable: false });
          Object.defineProperty(container, '__reactInternalInstance', { value: null, writable: false });

          // Render the button in the isolated container
          window.google.accounts.id.renderButton(portalContainer, {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'signin_with',
          });

          isRendered.current = true;
          console.log('Google Sign-In button rendered in isolated container');
        } catch (error) {
          console.error('Error rendering Google button:', error);
          if (onError) onError(error);
        }
      };

      // Check if Google is ready
      if (window.google?.accounts?.id) {
        // Use a small delay to ensure React has finished its reconciliation
        timeoutId = setTimeout(renderButton, 0);
      } else {
        // Wait for Google to load
        const checkGoogle = () => {
          if (window.google?.accounts?.id) {
            timeoutId = setTimeout(renderButton, 0);
          } else {
            timeoutId = setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      }

      // Cleanup function
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        cleanup();
      };
    }, [config.auth.googleClientId, onSuccess, onError, disabled]);

    // Cleanup on unmount
    useEffect(() => {
      return cleanup;
    }, []);

    if (!config.auth.googleClientId) {
      return (
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600">Google Client ID not configured</p>
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <div 
          ref={containerRef}
          style={{ minHeight: '44px' }}
          className="flex items-center justify-center"
        >
          {!isRendered.current && !disabled && (
            <div className="animate-pulse bg-gray-200 rounded h-11 w-80"></div>
          )}
        </div>
      </div>
    );
  }
);

GoogleSignInButton.displayName = 'GoogleSignInButton';

export default GoogleSignInButton;