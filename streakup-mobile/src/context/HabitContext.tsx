import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { Habit, Badge, HeatmapDay } from '../types';
import { useAuth } from './AuthContext';

const STORAGE_KEY_HABITS = '@streakup_cached_habits';

interface HabitContextType {
  habits: Habit[];
  badges: Badge[];
  heatmap: HeatmapDay[];
  isLoading: boolean;
  refreshHabits: () => Promise<void>;
  createHabit: (habitData: Partial<Habit>) => Promise<{ success: boolean; error?: string; requiresPro?: boolean }>;
  updateHabit: (habitId: string, habitData: Partial<Habit>) => Promise<{ success: boolean; error?: string }>;
  completeHabit: (habitId: string) => Promise<{ success: boolean; xpEarned: number; levelUp: boolean; message: string }>;
  undoHabitCompletion: (habitId: string) => Promise<{ success: boolean; message?: string }>;
  archiveHabit: (habitId: string) => Promise<void>;
  reviveStreakWithAd: (habitId: string) => Promise<boolean>;
  applyShield: (habitId: string) => Promise<boolean>;
}

const STARTER_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Morning 2L Water',
    description: 'Drink 2 liters of water before noon',
    category: 'HEALTH',
    frequencyType: 'DAILY',
    targetPerDay: 1,
    color: '#06B6D4',
    icon: 'water',
    isArchived: false,
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    streakStatus: 'ACTIVE',
    completedToday: false,
  },
  {
    id: 'h2',
    title: 'Workout / Cardio 30m',
    description: 'High intensity workout or 5km run',
    category: 'FITNESS',
    frequencyType: 'DAILY',
    targetPerDay: 1,
    color: '#EF4444',
    icon: 'fitness',
    isArchived: false,
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    streakStatus: 'ACTIVE',
    completedToday: false,
  },
  {
    id: 'h3',
    title: 'Read 15 Pages',
    description: 'Read self-improvement or tech book',
    category: 'STUDY',
    frequencyType: 'DAILY',
    targetPerDay: 1,
    color: '#8B5CF6',
    icon: 'book',
    isArchived: false,
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    streakStatus: 'ACTIVE',
    completedToday: false,
  },
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', code: 'FIRST_STEP', name: 'First Step', description: 'Complete your first habit', requiredStreak: 0, requiredXp: 10, unlocked: false },
  { id: 'b2', code: 'STREAK_3', name: 'Spark of Discipline', description: 'Achieve a 3-day streak', requiredStreak: 3, requiredXp: 0, unlocked: false },
  { id: 'b3', code: 'STREAK_7', name: '7-Day Warrior', description: 'Maintain a 7-day streak', requiredStreak: 7, requiredXp: 0, unlocked: false },
  { id: 'b4', code: 'STREAK_21', name: 'Habit Builder', description: 'Hit the 21-day psychological habit milestone', requiredStreak: 21, requiredXp: 0, unlocked: false },
  { id: 'b5', code: 'STREAK_30', name: '30-Day Master', description: 'Dominate your routine for 30 consecutive days', requiredStreak: 30, requiredXp: 0, unlocked: false },
  { id: 'b6', code: 'LEVEL_5', name: 'Rising Star', description: 'Earn 500 XP and reach Level 5', requiredStreak: 0, requiredXp: 500, unlocked: false },
  { id: 'b7', code: 'LEVEL_10', name: 'Discipline Icon', description: 'Earn 1000 XP and reach Level 10', requiredStreak: 0, requiredXp: 1000, unlocked: false },
];

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshProfile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(STARTER_HABITS);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshHabits = async () => {
    if (!user || user.id === 'demo-user-1') return;
    setIsLoading(true);
    try {
      const [habitsRes, badgesRes, heatmapRes] = await Promise.allSettled([
        apiClient.get('/habits'),
        apiClient.get('/gamification/badges'),
        apiClient.get('/gamification/heatmap'),
      ]);

      if (habitsRes.status === 'fulfilled' && Array.isArray(habitsRes.value.data) && habitsRes.value.data.length > 0) {
        setHabits(habitsRes.value.data);
        AsyncStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habitsRes.value.data)).catch(() => {});
      } else if (habitsRes.status === 'fulfilled' && Array.isArray(habitsRes.value.data) && habitsRes.value.data.length === 0) {
        setHabits([]);
        AsyncStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify([])).catch(() => {});
      }

      if (badgesRes.status === 'fulfilled' && Array.isArray(badgesRes.value.data) && badgesRes.value.data.length > 0) {
        setBadges(badgesRes.value.data);
      }

      if (heatmapRes.status === 'fulfilled' && Array.isArray(heatmapRes.value.data)) {
        setHeatmap(heatmapRes.value.data);
      }
    } catch (err) {
      // Keep existing state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.id === 'demo-user-1') {
        setHabits(STARTER_HABITS.map(h => ({ ...h, currentStreak: 0, longestStreak: 0, completedToday: false })));
        setBadges(DEFAULT_BADGES);
        setHeatmap([]);
      } else {
        // First restore from local offline cache for instant UI
        AsyncStorage.getItem(STORAGE_KEY_HABITS).then(cached => {
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setHabits(parsed);
              }
            } catch (e) {}
          }
        }).catch(() => {});

        refreshHabits();
      }
    } else {
      setHabits(STARTER_HABITS);
      setBadges(DEFAULT_BADGES);
      setHeatmap([]);
      AsyncStorage.removeItem(STORAGE_KEY_HABITS).catch(() => {});
    }
  }, [user?.id]);

  const createHabit = async (habitData: Partial<Habit>) => {
    // Check Free limit (Max 4 habits)
    if (!user?.isPro && habits.length >= 4) {
      return { success: false, error: 'Free limit reached (max 4 habits). Upgrade to Pro for unlimited habits!', requiresPro: true };
    }

    try {
      const res = await apiClient.post('/habits', habitData);
      setHabits(prev => [res.data, ...prev]);
      return { success: true };
    } catch (err: any) {
      // Local fallback
      const newHabit: Habit = {
        id: 'h_' + Date.now(),
        title: habitData.title || 'New Habit',
        description: habitData.description || '',
        category: habitData.category || 'OTHER',
        frequencyType: habitData.frequencyType || 'DAILY',
        targetPerDay: 1,
        color: habitData.color || '#6366F1',
        icon: habitData.icon || 'flame',
        isArchived: false,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        streakStatus: 'ACTIVE',
        completedToday: false,
      };
      setHabits(prev => [newHabit, ...prev]);
      return { success: true };
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const res = await apiClient.post(`/habits/${habitId}/complete`);
      setHabits(prev =>
        prev.map(h => (h.id === habitId ? { ...h, completedToday: true, currentStreak: res.data.currentStreak, longestStreak: Math.max(res.data.currentStreak, h.longestStreak) } : h))
      );
      await Promise.allSettled([
        refreshProfile(),
        refreshHabits(),
      ]);
      return {
        success: true,
        xpEarned: res.data.xpEarned,
        levelUp: res.data.levelUp,
        message: res.data.message,
      };
    } catch (err) {
      // Local completion fallback
      setHabits(prev =>
        prev.map(h => {
          if (h.id === habitId && !h.completedToday) {
            const nextStreak = h.currentStreak + 1;
            return {
              ...h,
              completedToday: true,
              currentStreak: nextStreak,
              longestStreak: Math.max(nextStreak, h.longestStreak),
              streakStatus: 'ACTIVE',
            };
          }
          return h;
        })
      );
      return {
        success: true,
        xpEarned: 10,
        levelUp: false,
        message: 'Habit completed! +10 XP 🔥',
      };
    }
  };

  const updateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    try {
      const res = await apiClient.put(`/habits/${habitId}`, habitData);
      setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, ...res.data } : h)));
      return { success: true };
    } catch (err: any) {
      setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, ...habitData } : h)));
      return { success: true };
    }
  };

  const undoHabitCompletion = async (habitId: string) => {
    try {
      const res = await apiClient.post(`/habits/${habitId}/undo`);
      setHabits(prev =>
        prev.map(h =>
          h.id === habitId
            ? { ...h, completedToday: false, currentStreak: res.data.currentStreak }
            : h
        )
      );
      await Promise.allSettled([refreshProfile(), refreshHabits()]);
      return { success: true, message: 'Habit marked uncompleted.' };
    } catch (err) {
      setHabits(prev =>
        prev.map(h =>
          h.id === habitId
            ? {
                ...h,
                completedToday: false,
                currentStreak: Math.max(0, h.currentStreak - 1),
              }
            : h
        )
      );
      return { success: true, message: 'Habit marked uncompleted.' };
    }
  };

  const archiveHabit = async (habitId: string) => {
    try {
      await apiClient.delete(`/habits/${habitId}`);
    } catch (err) {
      // Ignore
    }
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const reviveStreakWithAd = async (habitId: string) => {
    try {
      await apiClient.post('/streaks/revive-with-ad', {
        habitId,
        adVerificationToken: 'ADMOB_REWARDED_VERIFIED_' + Date.now(),
      });
    } catch (err) {
      // Fallback
    }

    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            streakStatus: 'ACTIVE',
            currentStreak: Math.max(1, h.longestStreak),
          };
        }
        return h;
      })
    );
    return true;
  };

  const applyShield = async (habitId: string) => {
    try {
      await apiClient.post(`/streaks/${habitId}/shield`);
    } catch (err) {
      // Fallback
    }
    setHabits(prev =>
      prev.map(h => (h.id === habitId ? { ...h, streakStatus: 'SHIELDED' } : h))
    );
    return true;
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        badges,
        heatmap,
        isLoading,
        refreshHabits,
        createHabit,
        updateHabit,
        completeHabit,
        undoHabitCompletion,
        archiveHabit,
        reviveStreakWithAd,
        applyShield,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within HabitProvider');
  return context;
};
