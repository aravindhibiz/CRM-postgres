import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    console.log('ApiClient initialized with BASE_URL:', BASE_URL);
    
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken() {
    return localStorage.getItem('access_token');
  }

  setToken(token) {
    localStorage.setItem('access_token', token);
  }

  removeToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
  }

  // User management
  getCurrentUser() {
    const userProfile = localStorage.getItem('user_profile');
    return userProfile ? JSON.parse(userProfile) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem('user_profile', JSON.stringify(user));
  }

  // Auth API calls
  async login(email, password) {
    try {
      console.log('Attempting login with:', { email, baseURL: this.client.defaults.baseURL });
      
      const response = await this.client.post('/api/v1/auth/login', {
        email,
        password,
      });

      console.log('Login response received:', response.status, response.data);

      const { access_token, user } = response.data;
      this.setToken(access_token);
      this.setCurrentUser(user);

      console.log('Login successful, token set:', access_token ? 'Yes' : 'No');
      return { user, error: null };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      return { user: null, error: { message: errorMessage } };
    }
  }

  async register(email, password, userData = {}) {
    try {
      const response = await this.client.post('/api/v1/auth/register', {
        email,
        password,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        role: userData.role || 'sales_rep',
      });

      const { user } = response.data;

      return { user, error: null };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      return { user: null, error: { message: errorMessage } };
    }
  }

  async logout() {
    this.removeToken();
    return { error: null };
  }

  // Generic CRUD operations
  async get(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async post(endpoint, data, config = {}) {
    try {
      const response = await this.client.post(endpoint, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async patch(endpoint, data) {
    try {
      const response = await this.client.patch(endpoint, data);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      let message = 'An error occurred';
      
      // Handle FastAPI validation errors (422)
      if (error.response.status === 422 && error.response.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // FastAPI validation errors format
          message = error.response.data.detail.map(err => {
            const location = err.loc ? err.loc.join('.') : '';
            return location ? `${location}: ${err.msg}` : err.msg;
          }).join(', ');
        } else {
          message = error.response.data.detail;
        }
      } else if (error.response.data?.detail) {
        message = error.response.data.detail;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
      
      return {
        message: message,
        status: error.response.status,
        detail: error.response.data?.detail || null
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;