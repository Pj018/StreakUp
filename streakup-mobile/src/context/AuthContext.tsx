import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'demo-user-1',
    email: 'alex@streakup.app',
    fullName: 'Alex Hunter',
    xpPoints: 140,
    currentLevel: 2,
    streakShields: 2,
    isPro: false,
    totalHabits: 3,
    totalCompletions: 14,
  });
  const [token, setToken] = useState<string | null>('demo-jwt-token');
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: jwt, userId, email: userEmail, fullName, xpPoints, currentLevel, streakShields, isPro } = res.data;
      setToken(jwt);
      setAuthToken(jwt);
      setUser({
        id: userId,
        email: userEmail,
        fullName,
        xpPoints,
        currentLevel,
        streakShields,
        isPro,
      });
    } catch (err) {
      console.warn('Backend login unavailable, switching to demo mode');
      quickDemoLogin();
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
      setUser({
        id: userId,
        email: userEmail,
        fullName: name,
        xpPoints,
        currentLevel,
        streakShields,
        isPro,
      });
    } catch (err) {
      console.warn('Backend register unavailable, using local session');
      quickDemoLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = () => {
    const demoUser: User = {
      id: 'demo-user-1',
      email: 'alex@streakup.app',
      fullName: 'Alex Hunter',
      xpPoints: 180,
      currentLevel: 2,
      streakShields: 2,
      isPro: false,
      totalHabits: 3,
      totalCompletions: 18,
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
