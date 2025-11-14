import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Icon from 'components/AppIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const { signIn, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    clearAuthError();

    const { user, error } = await signIn(email, password);

    if (user && !error) {
      navigate('/sales-dashboard');
    }

    setIsLoading(false);
  };

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    clearAuthError();

    try {
      // Get Microsoft auth URL from backend
      const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/login`);
      if (!response.ok) {
        throw new Error('Failed to get Microsoft login URL');
      }

      const { auth_url } = await response.json();

      // Direct redirect to Microsoft (no popup)
      window.location.href = auth_url;
    } catch (error) {
      setIsMicrosoftLoading(false);
    }
  };


  // Auto-login effect for SharePoint seamless SSO
  useEffect(() => {
    const autoParam = searchParams.get('auto');

    if (autoParam === 'microsoft') {
      // Automatically redirect to Microsoft (no popup needed)
      const autoLogin = async () => {
        try {
          const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/microsoft/login`);
          if (!response.ok) {
            throw new Error('Failed to get Microsoft login URL');
          }

          const { auth_url } = await response.json();

          // Direct redirect to Microsoft
          window.location.href = auth_url;
        } catch (error) {
          setIsAutoLoggingIn(false);
        }
      };

      setIsAutoLoggingIn(true);
      autoLogin();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Auto-login overlay */}
      {isAutoLoggingIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Signing you in...
              </h2>
              <p className="text-text-secondary">
                Connecting with Microsoft to authenticate your account
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="BarChart3" size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-secondary mt-2">Sign in to your SalesFlow account</p>
          </div>


          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {authError && (
              <div className="bg-error-50 border border-error-200 text-error rounded-lg p-4 flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{authError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const errorText = authError;
                      navigator.clipboard?.writeText(errorText);
                    }}
                    className="text-xs text-error-600 hover:text-error-700 underline mt-1"
                  >
                    Copy error message
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="text-error hover:text-error-600"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Mail" size={18} className="text-text-tertiary" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Lock" size={18} className="text-text-tertiary" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-600">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={18} />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Microsoft SSO Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-text-secondary">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Microsoft Sign-In Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={isLoading || isMicrosoftLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMicrosoftLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
                  <span>Signing in with Microsoft...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                  <span>Sign in with Microsoft</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-tertiary">
            © 2025 SalesFlow Pro. Built with React & Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;