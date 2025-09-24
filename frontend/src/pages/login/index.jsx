import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

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

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    clearAuthError();

    const demoCredentials = {
      admin: { email: 'admin@salesflow.com', password: 'password123' },
      sales_rep: { email: 'john.smith@salesflow.com', password: 'password123' },
      manager: { email: 'sarah.johnson@salesflow.com', password: 'password123' }
    };

    const credentials = demoCredentials?.[role];
    if (credentials) {
      setEmail(credentials?.email);
      setPassword(credentials?.password);
      
      const { user, error } = await signIn(credentials?.email, credentials?.password);
      
      if (user && !error) {
        navigate('/sales-dashboard');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
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

          {/* Demo Login Buttons */}
          <div className="mb-6">
            <p className="text-sm text-text-secondary text-center mb-3">Quick Demo Access:</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm border border-primary text-primary rounded-lg hover:bg-primary-50 transition-colors duration-150 disabled:opacity-50"
              >
                Demo as Admin
              </button>
              <button
                onClick={() => handleDemoLogin('sales_rep')}
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm border border-primary text-primary rounded-lg hover:bg-primary-50 transition-colors duration-150 disabled:opacity-50"
              >
                Demo as Sales Rep
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-text-secondary">Or sign in manually</span>
            </div>
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
                <a href="#" className="font-medium text-primary hover:text-primary-600">
                  Forgot your password?
                </a>
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

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary-600">
                Sign up here
              </Link>
            </p>
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