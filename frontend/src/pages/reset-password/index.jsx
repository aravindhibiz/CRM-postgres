import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import Icon from '../../components/AppIcon';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract token from URL
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (password.length < 5) {
      setError('Password must be at least 5 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token: token,
        new_password: password
      });

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to reset password. The link may be expired or invalid.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-error-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertCircle" size={28} className="text-error" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-3">Invalid Reset Link</h2>
              <p className="text-text-secondary mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="btn-primary w-full flex justify-center items-center space-x-2 mb-3"
              >
                <Icon name="Mail" size={18} />
                <span>Request New Link</span>
              </Link>
              <Link
                to="/login"
                className="block text-center text-primary hover:text-primary-600 font-medium transition-colors duration-150"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Key" size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Reset Password</h2>
            <p className="text-text-secondary mt-2">Enter your new password below</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                <Icon name="CheckCircle" size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Password Reset Successful!</h3>
              <p className="text-text-secondary mb-4">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/login"
                className="btn-primary w-full flex justify-center items-center space-x-2"
              >
                <Icon name="LogIn" size={18} />
                <span>Go to Login</span>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="bg-error-50 border border-error-200 text-error px-4 py-3 rounded-lg flex items-start space-x-3">
                    <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* New Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Lock" size={20} className="text-text-tertiary" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={5}
                      className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-150 outline-none text-text-primary placeholder-text-tertiary"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <Icon
                        name={showPassword ? 'EyeOff' : 'Eye'}
                        size={20}
                        className="text-text-tertiary hover:text-text-secondary"
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-text-tertiary">
                    Must be at least 5 characters long
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Lock" size={20} className="text-text-tertiary" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={5}
                      className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-150 outline-none text-text-primary placeholder-text-tertiary"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <Icon
                        name={showConfirmPassword ? 'EyeOff' : 'Eye'}
                        size={20}
                        className="text-text-tertiary hover:text-text-secondary"
                      />
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {password && confirmPassword && (
                  <div className={`flex items-center space-x-2 text-sm ${
                    password === confirmPassword ? 'text-green-600' : 'text-error'
                  }`}>
                    <Icon
                      name={password === confirmPassword ? 'CheckCircle' : 'XCircle'}
                      size={16}
                    />
                    <span>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="btn-primary w-full flex justify-center items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Key" size={18} />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary-600 font-medium transition-colors duration-150"
                >
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
