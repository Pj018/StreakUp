import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// Permanent 24/7 Production Cloud Backend on Render + Cloud PostgreSQL
export const API_BASE_URL = 'https://streakup-backend-02pl.onrender.com/api/v1';

// Extended request config with retry count
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 65000, // 65s generous buffer for free cloud spin-ups
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Response Interceptor: Auto-retry for cold starts & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as CustomRequestConfig | undefined;

    // Retry transient network drops or Render cold-start 502/503/504/timeout up to 2 times
    if (config && (config._retryCount || 0) < 2) {
      const isNetworkError = !error.response || error.message === 'Network Error';
      const isTimeout = error.code === 'ECONNABORTED';
      const isServerWarmingUp = error.response && [502, 503, 504].includes(error.response.status);

      if (isNetworkError || isTimeout || isServerWarmingUp) {
        config._retryCount = (config._retryCount || 0) + 1;
        const delayMs = config._retryCount === 1 ? 2500 : 4000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return apiClient(config);
      }
    }

    if (error.response && error.response.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
