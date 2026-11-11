import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { useTheme } from '../context/ThemeContext';
import { Habit, Category } from '../types';
import StreakReviveModal from './StreakReviveModal';
import PaywallModal from './PaywallModal';
import RoutineSettingsModal from './RoutineSettingsModal';
import ShareStreakModal from './ShareStreakModal';
import { PRESET_AVATARS } from './AvatarPickerModal';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

type StatusFilter = 'ALL' | 'PENDING' | 'DONE';
type CategoryFilter = 'ALL' | 'HEALTH' | 'FITNESS' | 'STUDY' | 'MINDFULNESS';

const DISCIPLINE_QUOTES = [
  { quote: "Discipline is choosing between what you want now, and what you want most.", author: "Abraham Lincoln" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { quote: "It’s not what we do once in a while that shapes our lives. It’s what we do consistently.", author: "Tony Robbins" },
];

export default function TodayScreen() {
  const { user } = useAuth();
  const { habits, completeHabit, undoHabitCompletion } = useHabits();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [revivingHabit, setRevivingHabit] = useState<Habit | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryFilter>('ALL');
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  const todayQuote = DISCIPLINE_QUOTES[new Date().getDate() % DISCIPLINE_QUOTES.length];

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highestStreak = Math.max(0, ...habits.map(h => h.currentStreak));

  const formatReminderDisplay = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  };

  const filteredHabits = habits.filter(h => {
    // Status filter
    if (activeStatusFilter === 'PENDING' && h.completedToday) return false;
    if (activeStatusFilter === 'DONE' && !h.completedToday) return false;
    // Category filter
    if (activeCategoryFilter !== 'ALL' && h.category !== activeCategoryFilter) return false;
    return true;
  });

  const handleComplete = async (habit: Habit) => {
    if (habit.completedToday) return;
    soundEffects.playCompleteSound();
    const res = await completeHabit(habit.id);
    if (res.success) {
      if (res.levelUp) {
        setTimeout(() => soundEffects.playLevelUpSound(), 350);
      }
      setCelebrationToast(`🎉 +10 XP! "${habit.title}" completed!`);
      setTimeout(() => setCelebrationToast(null), 3500);
    }
  };

  const handleUndo = (habit: Habit) => {
    triggerHaptic.light();
    Alert.alert(
      'Undo Habit Completion?',
      `Mark "${habit.title}" as uncompleted for today? This will revert 10 XP.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo Completion',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic.medium();
            const res = await undoHabitCompletion(habit.id);
            if (res.success) {
              setCelebrationToast(`↩️ "${habit.title}" uncompleted.`);
              setTimeout(() => setCelebrationToast(null), 3000);
            }
          },
        },
      ]
    );
  };

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header with Guaranteed Safe Inset */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: safeTopPadding,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => {
            triggerHaptic.light();
            setShowSettings(true);
          }}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: isDark ? '#141E33' : '#EEF2FF',
                borderColor: isDark ? colors.flamePrimary : '#4F46E5',
              },
            ]}
          >
            {user?.avatarUrl && (user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('file:') || user.avatarUrl.startsWith('http')) ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>
                {PRESET_AVATARS.find(a => a.id === user?.avatarUrl)?.emoji || '⚡'}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>STREAK MASTER</Text>
            <Text style={[styles.userNameText, { color: colors.textPrimary }]}>{user?.fullName || 'Hero'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightPills}>
          {/* Quick Theme Toggle (🌙 / ☀️) */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark ? '#141E33' : '#F1F5F9',
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              triggerHaptic.light();
              toggleTheme();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={15}
              color={isDark ? '#F59E0B' : '#6366F1'}
            />
          </TouchableOpacity>

          {/* Level Pill */}
          <View
            style={[
              styles.levelPill,
              {
                backgroundColor: isDark ? '#1F180A' : '#FEF3C7',
                borderColor: isDark ? '#78350F' : '#FDE68A',
              },
            ]}
          >
            <Ionicons name="star" size={13} color="#D97706" />
            <Text style={[styles.levelPillText, { color: isDark ? '#FCD34D' : '#B45309' }]}>
              Lv. {user?.currentLevel ?? 1}
            </Text>
          </View>

          {/* Streak Shields Pill */}
          <TouchableOpacity
            style={[
              styles.shieldPill,
              {
                backgroundColor: isDark ? '#082333' : '#E0F2FE',
                borderColor: isDark ? '#0369A1' : '#BAE6FD',
              },
            ]}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
            <Text style={[styles.shieldPillText, { color: isDark ? '#38BDF8' : '#0369A1' }]}>
              {user?.streakShields ?? 1}
            </Text>
          </TouchableOpacity>

          {/* Pro Pill */}
          <TouchableOpacity
            style={[
              styles.proBadge,
              user?.isPro ? styles.proActiveBadge : {},
              !user?.isPro && { backgroundColor: colors.flamePrimary },
            ]}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.proBadgeText}>{user?.isPro ? '★ PRO' : 'UPGRADE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Celebration Toast */}
      {celebrationToast && (
        <View
          style={[
            styles.celebrationBanner,
            {
              backgroundColor: isDark ? '#1B1405' : '#FEF3C7',
              borderColor: isDark ? '#B45309' : '#F59E0B',
            },
          ]}
        >
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <Text style={[styles.celebrationText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
            {celebrationToast}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* ================= HERO STREAK & PROGRESS CARD ================= */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#0D1527' : '#FFF7ED',
              borderColor: isDark ? colors.border : '#FED7AA',
            },
          ]}
        >
          <View style={styles.flameRow}>
            <View
              style={[
                styles.flameCircleLarge,
                {
                  backgroundColor: isDark ? 'rgba(255, 107, 0, 0.16)' : '#FFEDD5',
                  borderColor: isDark ? 'rgba(255, 107, 0, 0.4)' : '#FDBA74',
                },
              ]}
            >
              <Text style={styles.giantFlame}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={[
                  styles.streakBadgeMini,
                  {
                    backgroundColor: isDark ? 'rgba(255, 107, 0, 0.2)' : '#FFEDD5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.streakBadgeMiniText,
                    { color: isDark ? '#FF8A00' : '#C2410C' },
                  ]}
                >
                  {highestStreak > 0 ? 'DISCIPLINE STREAK' : 'NEW ROUTINE'}
                </Text>
              </View>
              <Text
                style={[
                  styles.streakDaysTitle,
                  { color: isDark ? colors.textPrimary : '#9A3412' },
                ]}
              >
                {highestStreak > 0
                  ? `${highestStreak} ${highestStreak === 1 ? 'DAY' : 'DAYS'} ON FIRE`
                  : 'DAY 1 - READY TO IGNITE'}
              </Text>
              <Text
                style={[
                  styles.streakDaysSubtitle,
                  { color: isDark ? colors.textSecondary : '#C2410C' },
                ]}
              >
                {highestStreak === 0
                  ? 'Complete your first task today to ignite your streak!'
                  : completionPercentage === 100
                  ? '🏆 Daily goals crushed! Streak extended.'
                  : `Complete all tasks to keep your flame glowing!`}
              </Text>
            </View>
          </View>

          {/* Progress Bar & Percentage */}
          <View
            style={[
              styles.gaugeContainer,
              {
                backgroundColor: isDark ? '#131D33' : '#FFFFFF',
                borderColor: isDark ? colors.border : '#FED7AA',
              },
            ]}
          >
            <View style={styles.gaugeHeader}>
              <Text style={[styles.gaugeLabel, { color: colors.textSecondary }]}>Today's Routine Progress</Text>
              <Text style={[styles.gaugeValue, { color: colors.textPrimary }]}>
                {completedCount}/{totalCount} Completed ({completionPercentage}%)
              </Text>
            </View>
            <View
              style={[
                styles.gaugeTrack,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${completionPercentage}%`,
                    backgroundColor: completionPercentage === 100 ? '#10B981' : colors.flamePrimary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Share Streak Banner */}
          <TouchableOpacity
            style={[
              styles.shareStreakBtn,
              {
                backgroundColor: isDark ? '#141E33' : '#FFFFFF',
                borderColor: isDark ? colors.border : '#FED7AA',
              },
            ]}
            onPress={() => {
              triggerHaptic.light();
              setShowShareModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.shareLeft}>
              <Ionicons name="share-social" size={15} color={colors.flamePrimary} />
              <Text style={[styles.shareStreakBtnText, { color: colors.textPrimary }]}>
                Share Streak to WhatsApp
              </Text>
            </View>
            <View style={styles.shareRight}>
              <Text
                style={[
                  styles.sharePillText,
                  {
                    color: colors.flamePrimary,
                    backgroundColor: isDark ? 'rgba(255, 107, 0, 0.16)' : '#FFF7ED',
                  },
                ]}
              >
                Story Card
              </Text>
              <Ionicons name="chevron-forward" size={13} color={colors.flamePrimary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= DAILY MORNING SPARK ================= */}
        <View
          style={[
            styles.dailySparkCard,
            {
              backgroundColor: colors.quoteBg,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sparkHeaderRow}>
            <Ionicons name="bulb-outline" size={15} color="#D97706" />
            <Text style={styles.sparkLabel}>DAILY DISCIPLINE SPARK</Text>
          </View>
          <Text style={[styles.sparkQuote, { color: colors.textPrimary }]}>
            "{todayQuote.quote}"
          </Text>
          <Text style={[styles.sparkAuthor, { color: colors.textSecondary }]}>
            — {todayQuote.author}
          </Text>
        </View>

        {/* ================= STATUS FILTER CHIPS ================= */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeStatusFilter === 'ALL' ? colors.flamePrimary : colors.surfaceCard,
                borderColor: activeStatusFilter === 'ALL' ? colors.flamePrimary : colors.border,
              },
            ]}
            onPress={() => setActiveStatusFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeStatusFilter === 'ALL' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeStatusFilter === 'PENDING' ? colors.flamePrimary : colors.surfaceCard,
                borderColor: activeStatusFilter === 'PENDING' ? colors.flamePrimary : colors.border,
              },
            ]}
            onPress={() => setActiveStatusFilter('PENDING')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeStatusFilter === 'PENDING' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              ⚡ Remaining ({totalCount - completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: activeStatusFilter === 'DONE' ? colors.flamePrimary : colors.surfaceCard,
                borderColor: activeStatusFilter === 'DONE' ? colors.flamePrimary : colors.border,
              },
            ]}
            onPress={() => setActiveStatusFilter('DONE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeStatusFilter === 'DONE' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              ✅ Done ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= CATEGORY HORIZONTAL FILTER ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {(['ALL', 'HEALTH', 'FITNESS', 'STUDY', 'MINDFULNESS'] as CategoryFilter[]).map(cat => {
            const isSelected = activeCategoryFilter === cat;
            const emoji =
              cat === 'HEALTH'
                ? '💧'
                : cat === 'FITNESS'
                ? '🏋️'
                : cat === 'STUDY'
                ? '📚'
                : cat === 'MINDFULNESS'
                ? '🧘'
                : '🎯';
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryFilterChip,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#6366F1'
                        : '#4F46E5'
                      : colors.surfaceCard,
                    borderColor: isSelected ? '#6366F1' : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.light();
                  setActiveCategoryFilter(cat);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryFilterEmoji}>{emoji}</Text>
                <Text
                  style={[
                    styles.categoryFilterText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {cat === 'ALL' ? 'All Routine' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= HABITS LIST ================= */}
        <View style={styles.habitsWrapper}>
          {filteredHabits.length === 0 ? (
            <View
              style={[
                styles.emptyStateCard,
                { backgroundColor: colors.surfaceCard, borderColor: colors.border },
              ]}
            >
              <Text style={{ fontSize: 32 }}>🎯</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>
                No habits found
              </Text>
              <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>
                Try changing your filter or add a new daily routine in the Habits tab.
              </Text>
            </View>
          ) : (
            filteredHabits.map(habit => (
              <View
                key={habit.id}
                style={[
                  styles.habitCard,
                  {
                    backgroundColor: habit.completedToday
                      ? isDark
                        ? '#052219'
                        : '#F0FDF4'
                      : colors.surfaceCard,
                    borderColor: habit.completedToday
                      ? isDark
                        ? '#059669'
                        : '#A7F3D0'
                      : habit.streakStatus === 'BROKEN'
                      ? isDark
                        ? '#7F1D1D'
                        : '#FECACA'
                      : colors.border,
                  },
                ]}
              >
                <View style={[styles.accentStrip, { backgroundColor: habit.color || '#4F46E5' }]} />

                <View style={styles.habitBody}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View
                        style={[
                          styles.categoryBadge,
                          {
                            backgroundColor: isDark
                              ? (habit.color || '#4F46E5') + '25'
                              : (habit.color || '#4F46E5') + '15',
                          },
                        ]}
                      >
                        <Text style={[styles.categoryBadgeText, { color: habit.color || '#4F46E5' }]}>
                          {habit.category}
                        </Text>
                      </View>
                      {habit.reminderTime ? (
                        <View
                          style={[
                            styles.reminderBadge,
                            {
                              backgroundColor: isDark ? '#141E33' : '#EEF2FF',
                              borderColor: isDark ? colors.border : '#E0E7FF',
                            },
                          ]}
                        >
                          <Ionicons
                            name="notifications"
                            size={10}
                            color={isDark ? '#818CF8' : '#4F46E5'}
                          />
                          <Text
                            style={[
                              styles.reminderBadgeText,
                              { color: isDark ? '#818CF8' : '#4F46E5' },
                            ]}
                          >
                            {formatReminderDisplay(habit.reminderTime)}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.streakIndicator}>
                      <Text style={{ fontSize: 13 }}>🔥</Text>
                      <Text
                        style={[
                          styles.streakCountNumber,
                          { color: isDark ? colors.flamePrimary : '#EA580C' },
                        ]}
                      >
                        {habit.currentStreak}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.habitTitle,
                      { color: habit.completedToday ? colors.textMuted : colors.textPrimary },
                      habit.completedToday && styles.habitTitleDone,
                    ]}
                  >
                    {habit.title}
                  </Text>
                  {habit.description ? (
                    <Text
                      style={[styles.habitDesc, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {habit.description}
                    </Text>
                  ) : null}

                  {/* Rewarded Video Ad Revive Button */}
                  {habit.streakStatus === 'BROKEN' && (
                    <TouchableOpacity
                      style={[
                        styles.reviveAdButton,
                        {
                          backgroundColor: isDark ? '#2D1212' : '#FEE2E2',
                          borderColor: isDark ? '#991B1B' : '#FCA5A5',
                        },
                      ]}
                      onPress={() => setRevivingHabit(habit)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.adVideoIconCircle}>
                        <Ionicons name="play" size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reviveAdTitle, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                          Watch Video Ad to Save Streak
                        </Text>
                        <Text style={[styles.reviveAdSub, { color: isDark ? '#F87171' : '#B91C1C' }]}>
                          10s Video • Restores {Math.max(1, habit.longestStreak || habit.currentStreak)}-Day Streak
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    habit.completedToday && styles.checkButtonDone,
                    habit.streakStatus === 'BROKEN' && styles.checkButtonDisabled,
                  ]}
                  onPress={() => {
                    if (habit.completedToday) {
                      handleUndo(habit);
                    } else {
                      handleComplete(habit);
                    }
                  }}
                  disabled={habit.streakStatus === 'BROKEN'}
                  activeOpacity={0.7}
                >
                  {habit.completedToday ? (
                    <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                  ) : (
                    <View
                      style={[
                        styles.uncheckRing,
                        { borderColor: isDark ? '#475569' : '#CBD5E1' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Free Plan Pro Promotion Card */}
        {!user?.isPro && (
          <TouchableOpacity
            style={[
              styles.proPromoCard,
              {
                backgroundColor: isDark ? '#141E33' : '#FFFFFF',
                borderColor: isDark ? '#B45309' : '#FCD34D',
              },
            ]}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.proCrownCircle,
                { backgroundColor: isDark ? '#2B1E07' : '#FEF3C7' },
              ]}
            >
              <Text style={{ fontSize: 22 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.proPromoTitle,
                  { color: isDark ? '#FCD34D' : '#B45309' },
                ]}
              >
                Unlock StreakUp PRO
              </Text>
              <Text
                style={[
                  styles.proPromoDesc,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                Unlimited Habits • 5 Streak Shields • Advanced AI Insights
              </Text>
            </View>
            <View style={styles.upgradeArrow}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Revive Streak Modal */}
      {revivingHabit && (
        <StreakReviveModal
          visible={!!revivingHabit}
          habit={revivingHabit}
          onClose={() => setRevivingHabit(null)}
        />
      )}

      {/* Paywall Upgrade Modal */}
      <Modal visible={showPaywall} animationType="slide">
        <PaywallModal onClose={() => setShowPaywall(false)} />
      </Modal>

      {/* Routine & Profile Settings Modal */}
      <RoutineSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenPaywall={() => setShowPaywall(true)}
      />

      {/* WhatsApp / Social Streak Card Modal */}
      <ShareStreakModal
        visible={showShareModal}
        streakCount={highestStreak}
        userName={user?.fullName || 'Hero'}
        level={user?.currentLevel ?? 1}
        xpPoints={user?.xpPoints ?? 0}
        completedToday={completedCount}
        totalHabits={totalCount}
        onClose={() => setShowShareModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  greetingText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeToggleBtn: {
    padding: 7,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  levelPillText: {
    fontWeight: '800',
    fontSize: 11,
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  shieldPillText: {
    fontWeight: '800',
    fontSize: 11,
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proActiveBadge: {
    backgroundColor: '#10B981',
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    gap: 8,
    justifyContent: 'center',
    elevation: 3,
  },
  celebrationText: {
    fontWeight: '800',
    fontSize: 13,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    elevation: 3,
  },
  flameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  flameCircleLarge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giantFlame: {
    fontSize: 32,
  },
  streakBadgeMini: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  streakBadgeMiniText: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  streakDaysTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  streakDaysSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  gaugeContainer: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  gaugeValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  gaugeTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
  },
  shareStreakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  shareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareStreakBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sharePillText: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dailySparkCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
  },
  sparkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sparkLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  sparkQuote: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  sparkAuthor: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  categoryFilterEmoji: {
    fontSize: 13,
  },
  categoryFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  habitsWrapper: {
    gap: 12,
  },
  emptyStateCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  habitCard: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    elevation: 2,
  },
  accentStrip: {
    width: 6,
    height: '100%',
  },
  habitBody: {
    flex: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  reminderBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakCountNumber: {
    fontSize: 13,
    fontWeight: '900',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  habitTitleDone: {
    textDecorationLine: 'line-through',
  },
  habitDesc: {
    fontSize: 12,
  },
  reviveAdButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adVideoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviveAdTitle: {
    fontWeight: '800',
    fontSize: 12,
  },
  reviveAdSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  checkButton: {
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonDone: {
    backgroundColor: '#10B981',
    borderRadius: 50,
    marginRight: 14,
    padding: 8,
  },
  uncheckRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
  },
  checkButtonDisabled: {
    opacity: 0.3,
  },
  proPromoCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 3,
  },
  proCrownCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proPromoTitle: {
    fontWeight: '900',
    fontSize: 14,
  },
  proPromoDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  upgradeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
