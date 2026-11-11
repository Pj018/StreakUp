import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setAuthToken } from '../api/client';
import { User } from '../types';

const STORAGE_KEY_TOKEN = '@streakup_auth_token';
const STORAGE_KEY_USER = '@streakup_auth_user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  quickDemoLogin: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  upgradeToPro: (planType: 'PRO_MONTHLY' | 'PRO_ANNUAL') => Promise<void>;
  updateProfile: (data: { fullName?: string; bio?: string; avatarUrl?: string }) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: () => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore saved session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUserJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_TOKEN),
          AsyncStorage.getItem(STORAGE_KEY_USER),
        ]);

        if (savedToken && savedUserJson) {
          const parsedUser = JSON.parse(savedUserJson) as User;
          setToken(savedToken);
          setAuthToken(savedToken);
          setUser(parsedUser);

          // Silently refresh profile from backend to get fresh XP/streaks
          if (parsedUser.id !== 'demo-user-1') {
            apiClient.get('/user/profile')
              .then(res => {
                if (res.data) {
                  setUser(res.data);
                  AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.data)).catch(() => {});
                }
              })
              .catch(() => {
                // Keep local offline user state
              });
          }
        }
      } catch (err) {
        // Fallback to fresh login
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: jwt, userId, email: userEmail, fullName, xpPoints, currentLevel, streakShields, isPro } = res.data;
      setToken(jwt);
      setAuthToken(jwt);
      let userObj: User = {
        id: userId,
        email: userEmail,
        fullName: fullName || 'Hero',
        xpPoints: xpPoints ?? 0,
        currentLevel: currentLevel ?? 1,
        streakShields: streakShields ?? 1,
        isPro: isPro ?? false,
        totalHabits: 3,
        totalCompletions: 0,
      };

      // Fetch real updated profile stats from backend
      try {
        const profRes = await apiClient.get('/user/profile');
        if (profRes.data) {
          userObj = profRes.data;
        }
      } catch (profErr) {
        // Fall back to userObj
      }

      setUser(userObj);

      // Persist session to AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEY_TOKEN, jwt],
        [STORAGE_KEY_USER, JSON.stringify(userObj)],
      ]);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.code === 'ECONNABORTED'
          ? 'Server connection timed out (Render cloud warming up). Please try once more.'
          : err.message === 'Network Error'
          ? 'Unable to connect to server. Please check your internet connection.'
          : 'Invalid email or password. Please verify your credentials.');
      Alert.alert('Sign In Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', { fullName, email, password });
      const { token: jwt, userId, email: userEmail, fullName: name, xpPoints, currentLevel, streakShields, isPro } = res.data;
      setToken(jwt);
      setAuthToken(jwt);
      let userObj: User = {
        id: userId,
        email: userEmail,
        fullName: name || fullName || 'Hero',
        xpPoints: xpPoints ?? 0,
        currentLevel: currentLevel ?? 1,
        streakShields: streakShields ?? 1,
        isPro: isPro ?? false,
        totalHabits: 3,
        totalCompletions: 0,
      };

      // Fetch real updated profile stats from backend
      try {
        const profRes = await apiClient.get('/user/profile');
        if (profRes.data) {
          userObj = profRes.data;
        }
      } catch (profErr) {
        // Fall back to userObj
      }

      setUser(userObj);

      // Persist session to AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEY_TOKEN, jwt],
        [STORAGE_KEY_USER, JSON.stringify(userObj)],
      ]);

      Alert.alert('Welcome to StreakUp! 🎉', 'Your account has been created successfully.');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.code === 'ECONNABORTED'
          ? 'Server connection timed out (Render cloud warming up). Please try once more.'
          : err.message === 'Network Error'
          ? 'Unable to reach server. Please check your internet connection.'
          : 'Registration failed. This email may already be in use.');
      Alert.alert('Sign Up Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    const demoUser: User = {
      id: 'demo-user-1',
      email: 'demo@streakup.app',
      fullName: 'Streak User',
      xpPoints: 0,
      currentLevel: 1,
      streakShields: 1,
      isPro: false,
      totalHabits: 3,
      totalCompletions: 0,
    };
    setUser(demoUser);
    setToken('demo-token');
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEY_TOKEN, 'demo-token'],
        [STORAGE_KEY_USER, JSON.stringify(demoUser)],
      ]);
    } catch (e) {}
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    } catch (e) {}
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/user/profile');
      if (res.data) {
        setUser(res.data);
        AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.data)).catch(() => {});
      }
    } catch (err) {
      // Keep existing user state
    }
  };

  const upgradeToPro = async (planType: 'PRO_MONTHLY' | 'PRO_ANNUAL') => {
    try {
      await apiClient.post('/subscriptions/upgrade', { planType });
    } catch (e) {
      // Fallback local upgrade
    }
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, isPro: true, streakShields: prev.streakShields + 5 };
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const updateProfile = async (data: { fullName?: string; bio?: string; avatarUrl?: string }) => {
    try {
      const res = await apiClient.put('/user/profile', data);
      const updatedUser = res.data;
      setUser(updatedUser);
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser)).catch(() => {});
      return { success: true, message: 'Profile updated successfully!' };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile';
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...data };
        AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
      return { success: true, message: 'Profile updated' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await apiClient.post('/user/change-password', { currentPassword, newPassword });
      return { success: true, message: res.data?.message || 'Password changed successfully!' };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to change password. Please verify current password.';
      return { success: false, message: errMsg };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await apiClient.delete('/user/account');
      await logout();
      return { success: true, message: res.data?.message || 'Account successfully deleted.' };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to delete account.';
      await logout();
      return { success: true, message: errMsg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
        refreshProfile,
        upgradeToPro,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
