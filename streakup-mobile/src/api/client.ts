import axios from 'axios';
import { Platform } from 'react-native';

// For Web: localhost:8080
// For Physical Mobile Phone: Change localhost to your computer's Wi-Fi IP (e.g., http://192.168.1.X:8080/api/v1)
export const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8088/api/v1'
  : 'http://192.168.0.7:8088/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
