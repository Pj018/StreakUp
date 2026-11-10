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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { Habit } from '../types';
import StreakReviveModal from './StreakReviveModal';
import PaywallModal from './PaywallModal';
import RoutineSettingsModal from './RoutineSettingsModal';
import ShareStreakModal from './ShareStreakModal';
import { PRESET_AVATARS } from './AvatarPickerModal';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

type FilterType = 'ALL' | 'PENDING' | 'DONE';

const DISCIPLINE_QUOTES = [
  { quote: "Discipline is choosing between what you want now, and what you want most.", author: "Abraham Lincoln" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { quote: "It’s not what we do once in a while that shapes our lives. It’s what we do consistently.", author: "Tony Robbins" },
];

export default function TodayScreen() {
  const { user } = useAuth();
  const { habits, completeHabit } = useHabits();
  const insets = useSafeAreaInsets();
  const [revivingHabit, setRevivingHabit] = useState<Habit | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  const todayQuote = DISCIPLINE_QUOTES[new Date().getDate() % DISCIPLINE_QUOTES.length];

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highestStreak = Math.max(0, ...habits.map(h => h.currentStreak));

  const filteredHabits = habits.filter(h => {
    if (activeFilter === 'PENDING') return !h.completedToday;
    if (activeFilter === 'DONE') return h.completedToday;
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

  // Guaranteed safe top padding that completely clears phone status bar, clock, battery & notch
  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={styles.container}>
      {/* Top Header with Guaranteed Safe Inset */}
      <View style={[styles.topBar, { paddingTop: safeTopPadding }]}>
        <TouchableOpacity
          style={styles.profileRow}
          onPress={() => {
            triggerHaptic.light();
            setShowSettings(true);
          }}
          activeOpacity={0.75}
        >
          <View style={styles.avatarCircle}>
            {user?.avatarUrl && (user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('file:') || user.avatarUrl.startsWith('http')) ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>
                {PRESET_AVATARS.find(a => a.id === user?.avatarUrl)?.emoji || '⚡'}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.greetingText}>STREAK MASTER</Text>
            <Text style={styles.userNameText}>{user?.fullName || 'Hero'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.topRightPills}>
          {/* Level Pill */}
          <View style={styles.levelPill}>
            <Ionicons name="star" size={13} color="#D97706" />
            <Text style={styles.levelPillText}>Lv. {user?.currentLevel ?? 1}</Text>
          </View>

          {/* Streak Shields Pill */}
          <TouchableOpacity
            style={styles.shieldPill}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
            <Text style={styles.shieldPillText}>{user?.streakShields ?? 1}</Text>
          </TouchableOpacity>

          {/* Pro Pill */}
          <TouchableOpacity
            style={[styles.proBadge, user?.isPro ? styles.proActiveBadge : {}]}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.proBadgeText}>{user?.isPro ? '★ PRO' : 'UPGRADE'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Celebration Toast */}
      {celebrationToast && (
        <View style={styles.celebrationBanner}>
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <Text style={styles.celebrationText}>{celebrationToast}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* ================= HERO STREAK & PROGRESS CARD ================= */}
        <View style={styles.heroCard}>
          <View style={styles.flameRow}>
            <View style={styles.flameCircleLarge}>
              <Text style={styles.giantFlame}>🔥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.streakBadgeMini}>
                <Text style={styles.streakBadgeMiniText}>
                  {highestStreak > 0 ? 'DISCIPLINE STREAK' : 'NEW ROUTINE'}
                </Text>
              </View>
              <Text style={styles.streakDaysTitle}>
                {highestStreak > 0
                  ? `${highestStreak} ${highestStreak === 1 ? 'DAY' : 'DAYS'} ON FIRE`
                  : 'DAY 1 - READY TO IGNITE'}
              </Text>
              <Text style={styles.streakDaysSubtitle}>
                {highestStreak === 0
                  ? 'Complete your first task today to ignite your streak!'
                  : completionPercentage === 100
                  ? '🏆 Daily goals crushed! Streak extended.'
                  : `Complete all tasks to keep your flame glowing!`}
              </Text>
            </View>
          </View>

          {/* Progress Bar & Percentage */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeLabel}>Today's Routine Progress</Text>
              <Text style={styles.gaugeValue}>
                {completedCount}/{totalCount} Completed ({completionPercentage}%)
              </Text>
            </View>
            <View style={styles.gaugeTrack}>
              <View
                style={[
                  styles.gaugeFill,
                  {
                    width: `${completionPercentage}%`,
                    backgroundColor: completionPercentage === 100 ? '#10B981' : '#EA580C',
                  },
                ]}
              />
            </View>
          </View>

          {/* Share Streak Banner */}
          <TouchableOpacity
            style={styles.shareStreakBtn}
            onPress={() => {
              triggerHaptic.light();
              setShowShareModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.shareLeft}>
              <Ionicons name="share-social" size={15} color="#EA580C" />
              <Text style={styles.shareStreakBtnText}>Share Streak to WhatsApp</Text>
            </View>
            <View style={styles.shareRight}>
              <Text style={styles.sharePillText}>Story Card</Text>
              <Ionicons name="chevron-forward" size={13} color="#EA580C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= DAILY MORNING SPARK ================= */}
        <View style={styles.dailySparkCard}>
          <View style={styles.sparkHeaderRow}>
            <Ionicons name="bulb-outline" size={15} color="#D97706" />
            <Text style={styles.sparkLabel}>DAILY DISCIPLINE SPARK</Text>
          </View>
          <Text style={styles.sparkQuote}>"{todayQuote.quote}"</Text>
          <Text style={styles.sparkAuthor}>— {todayQuote.author}</Text>
        </View>

        {/* ================= FILTER CHIPS ================= */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'ALL' && styles.filterTextActive]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'PENDING' && styles.filterChipActive]}
            onPress={() => setActiveFilter('PENDING')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'PENDING' && styles.filterTextActive]}>
              ⚡ Remaining ({totalCount - completedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'DONE' && styles.filterChipActive]}
            onPress={() => setActiveFilter('DONE')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, activeFilter === 'DONE' && styles.filterTextActive]}>
              ✅ Done ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= HABITS LIST ================= */}
        <View style={styles.habitsWrapper}>
          {filteredHabits.map(habit => (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                habit.completedToday && styles.habitCardDone,
                habit.streakStatus === 'BROKEN' && styles.habitCardBroken,
              ]}
            >
              <View style={[styles.accentStrip, { backgroundColor: habit.color || '#4F46E5' }]} />

              <View style={styles.habitBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: (habit.color || '#4F46E5') + '15' }]}>
                    <Text style={[styles.categoryBadgeText, { color: habit.color || '#4F46E5' }]}>
                      {habit.category}
                    </Text>
                  </View>

                  <View style={styles.streakIndicator}>
                    <Text style={{ fontSize: 13 }}>🔥</Text>
                    <Text style={styles.streakCountNumber}>{habit.currentStreak}</Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.habitTitle,
                    habit.completedToday && styles.habitTitleDone,
                  ]}
                >
                  {habit.title}
                </Text>
                {habit.description ? (
                  <Text style={styles.habitDesc} numberOfLines={1}>
                    {habit.description}
                  </Text>
                ) : null}

                {/* Rewarded Video Ad Revive Button */}
                {habit.streakStatus === 'BROKEN' && (
                  <TouchableOpacity
                    style={styles.reviveAdButton}
                    onPress={() => setRevivingHabit(habit)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.adVideoIconCircle}>
                      <Ionicons name="play" size={14} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviveAdTitle}>Watch Video Ad to Save Streak</Text>
                      <Text style={styles.reviveAdSub}>
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
                onPress={() => handleComplete(habit)}
                disabled={habit.completedToday || habit.streakStatus === 'BROKEN'}
                activeOpacity={0.7}
              >
                {habit.completedToday ? (
                  <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                ) : (
                  <View style={styles.uncheckRing} />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Free Plan Pro Promotion Card */}
        {!user?.isPro && (
          <TouchableOpacity
            style={styles.proPromoCard}
            onPress={() => setShowPaywall(true)}
            activeOpacity={0.85}
          >
            <View style={styles.proCrownCircle}>
              <Text style={{ fontSize: 22 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.proPromoTitle}>Unlock StreakUp PRO</Text>
              <Text style={styles.proPromoDesc}>
                Unlimited Habits • 5 Streak Shields • Advanced AI Insights
              </Text>
            </View>
            <View style={styles.upgradeArrow}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Rewarded Video Ad Modal */}
      {revivingHabit && (
        <StreakReviveModal
          habit={revivingHabit}
          visible={!!revivingHabit}
          onClose={() => setRevivingHabit(null)}
        />
      )}

      {/* Pro Paywall Modal */}
      <Modal visible={showPaywall} animationType="slide">
        <PaywallModal onClose={() => setShowPaywall(false)} />
      </Modal>

      {/* Routine & Reminder Settings Modal */}
      <RoutineSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenPaywall={() => setShowPaywall(true)}
      />

      {/* Social Streak Story Card Modal */}
      <ShareStreakModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        streakCount={highestStreak}
        userName={user?.fullName || 'Streak Master'}
        level={user?.currentLevel ?? 1}
        xpPoints={user?.xpPoints ?? 0}
        completedToday={completedCount}
        totalHabits={totalCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
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
    color: '#64748B',
    letterSpacing: 1,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  topRightPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  levelPillText: {
    color: '#B45309',
    fontWeight: '800',
    fontSize: 11,
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  shieldPillText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 11,
  },
  proBadge: {
    backgroundColor: '#EA580C',
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
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    gap: 8,
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  celebrationText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 13,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
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
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giantFlame: {
    fontSize: 32,
  },
  streakBadgeMini: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  streakBadgeMiniText: {
    color: '#C2410C',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  streakDaysTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#9A3412',
    letterSpacing: 0.5,
  },
  streakDaysSubtitle: {
    fontSize: 12,
    color: '#C2410C',
    marginTop: 2,
    fontWeight: '500',
  },
  gaugeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  gaugeValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '800',
  },
  gaugeTrack: {
    height: 10,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
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
    color: '#0F172A',
  },
  sharePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dailySparkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    color: '#1E293B',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  sparkAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  filterText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  habitsWrapper: {
    gap: 12,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  habitCardDone: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  habitCardBroken: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
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
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakCountNumber: {
    color: '#EA580C',
    fontSize: 13,
    fontWeight: '900',
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  habitTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  habitDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  reviveAdButton: {
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
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
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 12,
  },
  reviveAdSub: {
    color: '#B91C1C',
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
    borderColor: '#CBD5E1',
  },
  checkButtonDisabled: {
    opacity: 0.3,
  },
  proPromoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  proCrownCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proPromoTitle: {
    color: '#B45309',
    fontWeight: '900',
    fontSize: 14,
  },
  proPromoDesc: {
    color: '#64748B',
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
