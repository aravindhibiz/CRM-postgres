import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';

/**
 * Microsoft OAuth Callback Handler
 *
 * This page handles the callback from Microsoft OAuth flow.
 * It extracts the token and user data from URL parameters,
 * stores them, and redirects to the dashboard.
 */
const MicrosoftCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUserPermissions } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract token and user from URL parameters
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');
        const error = searchParams.get('error');

        // Handle error from backend
        if (error) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          console.error('❌ Microsoft callback error:', error);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!token || !userJson) {
          setStatus('error');
          setErrorMessage('Missing authentication data. Please try again.');
          console.error('❌ Missing token or user data in callback');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userJson));


        // Store token and user in localStorage
        apiClient.setToken(token);
        apiClient.setCurrentUser(user);

        // Load user permissions
        await loadUserPermissions();

        // Update status
        setStatus('success');

        // Redirect to dashboard
        navigate('/sales-dashboard', { replace: true });

      } catch (error) {
        console.error('❌ Error processing Microsoft callback:', error);
        setStatus('error');
        setErrorMessage('Failed to process authentication. Please try again.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, loadUserPermissions]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Completing sign in...
              </h2>
              <p className="text-text-secondary">
                Please wait while we set up your session
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Sign in successful!
              </h2>
              <p className="text-text-secondary">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-error mb-2">
                Sign in failed
              </h2>
              <p className="text-text-secondary mb-4">
                {errorMessage || 'An error occurred during authentication'}
              </p>
              <p className="text-sm text-text-tertiary">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
