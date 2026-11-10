import axios from 'axios';
import { Platform } from 'react-native';

// Live HTTPS Cloudflare tunnel pointing to local Spring Boot backend (port 8088)
// This works everywhere: on 5G mobile data, Wi-Fi, and bypasses Android cleartext restrictions
export const API_BASE_URL = 'https://distinct-deviant-embassy-pounds.trycloudflare.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
