/**
 * Microsoft Authentication Service
 *
 * Handles Microsoft SSO authentication flows:
 * 1. Popup OAuth flow for "Sign in with Microsoft" button
 * 2. Silent SSO for SharePoint integration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/';

class MicrosoftAuthService {
  constructor() {
    this.popup = null;
    this.popupCheckInterval = null;
  }

  /**
   * Initiate Microsoft login with popup window
   * @returns {Promise<{token: string, user: object}>} Authentication result
   */
  async initiateMicrosoftLogin() {
    try {
      // Get authorization URL from backend
      const response = await fetch(`${API_BASE_URL}api/v1/auth/microsoft/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to initiate Microsoft login');
      }

      const { auth_url, state } = await response.json();

      // Open Microsoft login in popup
      return await this.openLoginPopup(auth_url, state);
    } catch (error) {
      console.error('❌ Microsoft login initiation failed:', error);
      throw error;
    }
  }

  /**
   * Open Microsoft login popup and monitor for callback
   * @param {string} authUrl - Microsoft authorization URL
   * @param {string} state - CSRF state token
   * @returns {Promise<{token: string, user: object}>}
   */
  async openLoginPopup(authUrl, state) {
    return new Promise((resolve, reject) => {
      // Calculate popup position (centered on screen)
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Open popup
      this.popup = window.open(
        authUrl,
        'Microsoft Login',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );

      if (!this.popup) {
        reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
        return;
      }

      // Monitor popup for completion
      this.popupCheckInterval = setInterval(() => {
        try {
          // Check if popup was closed by user
          if (!this.popup || this.popup.closed) {
            clearInterval(this.popupCheckInterval);
            reject(new Error('Login cancelled by user'));
            return;
          }

          // Try to read popup URL (will throw if different origin)
          const popupUrl = this.popup.location.href;

          // Check if we've been redirected to our callback page
          if (popupUrl.includes('/auth/microsoft/success')) {
            clearInterval(this.popupCheckInterval);

            // Extract token and user from URL
            const url = new URL(popupUrl);
            const token = url.searchParams.get('token');
            const userJson = url.searchParams.get('user');

            if (token && userJson) {
              const user = JSON.parse(decodeURIComponent(userJson));

              // Close popup
              this.popup.close();
              this.popup = null;

              resolve({ token, user });
            } else {
              this.popup.close();
              this.popup = null;
              reject(new Error('Invalid callback parameters'));
            }
          }

          // Check for error
          if (popupUrl.includes('/login?error=')) {
            clearInterval(this.popupCheckInterval);
            const url = new URL(popupUrl);
            const error = url.searchParams.get('error');

            this.popup.close();
            this.popup = null;
            reject(new Error(decodeURIComponent(error)));
          }
        } catch (e) {
          // Cross-origin error is expected while popup is on Microsoft domain
          // We'll keep checking until it redirects back to our domain
        }
      }, 500); // Check every 500ms
    });
  }

  /**
   * Attempt silent SSO login for SharePoint integration
   * @param {string} microsoftAccessToken - Microsoft access token from SharePoint context
   * @param {object} userInfo - User information from Microsoft
   * @returns {Promise<{token: string, user: object}>}
   */
  async silentSSOLogin(microsoftAccessToken, userInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/auth/microsoft/silent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: microsoftAccessToken,
          email: userInfo.email,
          microsoft_id: userInfo.microsoft_id,
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Silent SSO failed');
      }

      const data = await response.json();
      return {
        token: data.access_token,
        user: data.user,
      };
    } catch (error) {
      console.error('❌ Silent SSO failed:', error);
      throw error;
    }
  }

  /**
   * Check if SharePoint SSO should be attempted
   * @returns {boolean}
   */
  shouldAttemptSharePointSSO() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const ssoParam = urlParams.get('sso');

    return ssoParam === 'auto';
  }

  /**
   * Cancel ongoing authentication
   */
  cancel() {
    if (this.popupCheckInterval) {
      clearInterval(this.popupCheckInterval);
      this.popupCheckInterval = null;
    }

    if (this.popup && !this.popup.closed) {
      this.popup.close();
      this.popup = null;
    }
  }
}

// Export singleton instance
export const microsoftAuthService = new MicrosoftAuthService();
export default microsoftAuthService;
