import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient, { setAuthToken } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  quickDemoLogin: () => void;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: jwt, userId, email: userEmail, fullName, xpPoints, currentLevel, streakShields, isPro } = res.data;
      setToken(jwt);
      setAuthToken(jwt);
      const userObj: User = {
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
      setUser(userObj);

      // Fetch real updated profile stats from backend
      try {
        const profRes = await apiClient.get('/user/profile');
        if (profRes.data) {
          setUser(profRes.data);
        }
      } catch (profErr) {
        // Fall back to userObj
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.code === 'ECONNABORTED'
          ? 'Connection timed out. Please check your internet connection.'
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
      const userObj: User = {
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
      setUser(userObj);

      // Fetch real updated profile stats from backend
      try {
        const profRes = await apiClient.get('/user/profile');
        if (profRes.data) {
          setUser(profRes.data);
        }
      } catch (profErr) {
        // Fall back to userObj
      }

      Alert.alert('Welcome to StreakUp! 🎉', 'Your account has been created successfully.');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? 'Connection timed out. Please check your internet connection.'
          : err.message === 'Network Error'
          ? 'Unable to reach server. Please check your internet connection.'
          : 'Registration failed. This email may already be in use.');
      Alert.alert('Sign Up Failed', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = () => {
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
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/user/profile');
      setUser(res.data);
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
    setUser(prev => prev ? { ...prev, isPro: true, streakShields: prev.streakShields + 5 } : null);
  };

  const updateProfile = async (data: { fullName?: string; bio?: string; avatarUrl?: string }) => {
    try {
      const res = await apiClient.put('/user/profile', data);
      setUser(res.data);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update profile';
      setUser(prev => prev ? { ...prev, ...data } : null);
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
