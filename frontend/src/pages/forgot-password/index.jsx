import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import Icon from '../../components/AppIcon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.post('/api/v1/auth/forgot-password', {
        email: email.trim()
      });

      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.detail || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-text-primary">Forgot Password?</h2>
            <p className="text-text-secondary mt-2">No worries, we'll send you reset instructions</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                <Icon name="Mail" size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Check Your Email</h3>
              <p className="text-text-secondary mb-4">
                If an account exists with the email you provided, you will receive a password reset link shortly.
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="btn-secondary w-full flex justify-center items-center space-x-2 mb-3"
              >
                <Icon name="ArrowLeft" size={18} />
                <span>Send Another Link</span>
              </button>
              <Link
                to="/login"
                className="block text-center text-primary hover:text-primary-600 font-medium transition-colors duration-150"
              >
                Back to Login
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

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Mail" size={20} className="text-text-tertiary" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-150 outline-none text-text-primary placeholder-text-tertiary"
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-2 text-sm text-text-tertiary">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full flex justify-center items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Mail" size={18} />
                      <span>Send Reset Link</span>
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

export default ForgotPassword;
