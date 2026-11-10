export type Category = 
  | 'HEALTH'
  | 'FITNESS'
  | 'STUDY'
  | 'MINDFULNESS'
  | 'PRODUCTIVITY'
  | 'FINANCE'
  | 'OTHER';

export type FrequencyType = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';

export type StreakStatus = 'ACTIVE' | 'SHIELDED' | 'BROKEN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  xpPoints: number;
  currentLevel: number;
  streakShields: number;
  isPro: boolean;
  totalHabits?: number;
  totalCompletions?: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: Category;
  frequencyType: FrequencyType;
  targetPerDay: number;
  reminderTime?: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  currentStreak: number;
  longestStreak: number;
  streakStatus: StreakStatus;
  completedToday: boolean;
  lastCompletedDate?: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl?: string;
  requiredStreak: number;
  requiredXp: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}
