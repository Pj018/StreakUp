import axios from 'axios';
import { Platform } from 'react-native';

// Permanent 24/7 Production Cloud Backend on Render + Cloud PostgreSQL
export const API_BASE_URL = 'https://streakup-backend-02pl.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 40000, // 40s cold-start buffer for cloud spin-up
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

// Response Interceptor for 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
