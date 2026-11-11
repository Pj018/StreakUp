import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import PaywallModal from './PaywallModal';
import CustomTimePickerModal from './CustomTimePickerModal';
import EditHabitModal from './EditHabitModal';
import soundEffects from '../utils/soundEffects';
import notificationService from '../utils/notificationService';
import { triggerHaptic } from '../utils/haptics';

interface ReminderItem {
  id: string;
  label: string;
  hour: number;
  minute: number;
  timeStr: string;
}

const REMINDER_PRESETS: ReminderItem[] = [
  { id: 'r1', label: '🌅 08:00 AM', hour: 8, minute: 0, timeStr: '08:00:00' },
  { id: 'r2', label: '☀️ 01:00 PM', hour: 13, minute: 0, timeStr: '13:00:00' },
  { id: 'r3', label: '🌆 06:00 PM', hour: 18, minute: 0, timeStr: '18:00:00' },
  { id: 'r4', label: '🌙 09:00 PM', hour: 21, minute: 0, timeStr: '21:00:00' },
  { id: 'r0', label: 'None', hour: -1, minute: -1, timeStr: '' },
];

const CATEGORIES: Category[] = [
  'HEALTH',
  'FITNESS',
  'STUDY',
  'MINDFULNESS',
  'PRODUCTIVITY',
  'FINANCE',
  'OTHER',
];

const COLORS = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#0284C7', '#8B5CF6', '#DC2626'];

export default function HabitsManageScreen() {
  const { habits, createHabit, archiveHabit } = useHabits();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('HEALTH');
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem>(REMINDER_PRESETS[0]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);

  // Free Tier Limit: Free users can only add up to 4 active habits
  const isLimitReached = !user?.isPro && habits.length >= 4;

  const handleCustomTimeConfirm = (result: {
    hour: number;
    minute: number;
    time12: string;
    time24: string;
  }) => {
    const customItem: ReminderItem = {
      id: 'custom',
      label: `⏰ ${result.time12}`,
      hour: result.hour,
      minute: result.minute,
      timeStr: result.time24,
    };
    setSelectedReminder(customItem);
  };

  const handleCreate = async () => {
    // If free limit reached, block immediately and show Paywall
    if (isLimitReached) {
      triggerHaptic.heavy();
      setShowPaywall(true);
      return;
    }

    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a habit title.');
      return;
    }

    const result = await createHabit({
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      frequencyType: 'DAILY',
      color: selectedColor,
      icon: 'flame',
      reminderTime: selectedReminder.timeStr || undefined,
    });

    if (!result.success) {
      if (result.requiresPro) {
        setShowPaywall(true);
      } else {
        Alert.alert('Notice', result.error || 'Failed to create habit');
      }
      return;
    }

    if (selectedReminder.hour >= 0) {
      notificationService.scheduleHabitReminder(
        'habit-' + Date.now(),
        title.trim(),
        selectedReminder.hour,
        selectedReminder.minute
      );
    }
    soundEffects.playCompleteSound();

    setTitle('');
    setDescription('');
    Alert.alert(
      'Success 🎉',
      selectedReminder.hour >= 0
        ? `New habit created with daily reminder at ${selectedReminder.label.replace(/^.*?(\d{2}:\d{2}\s?(?:AM|PM))/, '$1')}!`
        : 'New habit created! Track it daily to level up.'
    );
  };

  const handleArchive = (habitId: string, habitTitle: string) => {
    Alert.alert(
      'Archive Habit',
      `Are you sure you want to archive "${habitTitle}"? This will free up a habit slot.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => archiveHabit(habitId) },
      ]
    );
  };

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

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeTopPadding }]}>
        <View>
          <Text style={styles.headerTitle}>MANAGE ROUTINE</Text>
          <Text style={styles.headerSub}>Create & organize your daily habits</Text>
        </View>
        <View
          style={[
            styles.counterBadge,
            user?.isPro
              ? styles.counterBadgePro
              : isLimitReached
              ? styles.counterBadgeLimit
              : styles.counterBadgeNormal,
          ]}
        >
          {isLimitReached ? (
            <Ionicons name="lock-closed" size={12} color="#DC2626" style={{ marginRight: 4 }} />
          ) : user?.isPro ? (
            <Ionicons name="sparkles" size={12} color="#7C3AED" style={{ marginRight: 4 }} />
          ) : null}
          <Text
            style={[
              styles.habitsCounter,
              user?.isPro
                ? styles.habitsCounterPro
                : isLimitReached
                ? styles.habitsCounterLimit
                : styles.habitsCounterNormal,
            ]}
          >
            {user?.isPro
              ? `${habits.length} Habits (PRO)`
              : isLimitReached
              ? '4 / 4 Limit Reached'
              : `${habits.length} / 4 Free`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Create Habit Card */}
        <View style={styles.createCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="add-circle" size={20} color="#4F46E5" />
            <Text style={styles.cardHeader}>ADD NEW DAILY GOAL</Text>
          </View>

          {/* Free Limit Warning Banner when 4 habits already reached */}
          {isLimitReached && (
            <View style={styles.limitWarningCard}>
              <View style={styles.limitWarningIcon}>
                <Ionicons name="lock-closed" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.limitWarningTitle}>Free Limit Reached (4/4 Habits)</Text>
                <Text style={styles.limitWarningDesc}>
                  Free tier allows up to 4 daily habits. Upgrade to StreakUp PRO for unlimited routines, cloud sync & streak freeze!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.limitUpgradeBtn}
                onPress={() => {
                  triggerHaptic.medium();
                  setShowPaywall(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.limitUpgradeBtnText}>GO PRO ⚡</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={[styles.input, isLimitReached && styles.inputDisabled]}
            placeholder="e.g. Read 20 mins, Cold Shower, Gym Workout"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            editable={!isLimitReached}
          />

          <Text style={styles.label}>Daily Target / Cue</Text>
          <TextInput
            style={[styles.input, isLimitReached && styles.inputDisabled]}
            placeholder="e.g. 7:00 AM right after morning tea"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            editable={!isLimitReached}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catPill,
                  selectedCategory === cat && styles.catPillSelected,
                  isLimitReached && { opacity: 0.6 },
                ]}
                onPress={() => {
                  if (isLimitReached) {
                    setShowPaywall(true);
                  } else {
                    setSelectedCategory(cat);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.catText,
                    selectedCategory === cat && styles.catTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Accent Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorDotSelected,
                  isLimitReached && { opacity: 0.6 },
                ]}
                onPress={() => {
                  if (isLimitReached) {
                    setShowPaywall(true);
                  } else {
                    setSelectedColor(c);
                  }
                }}
                activeOpacity={0.7}
              />
            ))}
          </View>

          {/* Daily Reminder Sound & Alert with Custom Time Picker */}
          <View style={styles.reminderHeaderRow}>
            <Text style={styles.label}>Daily Reminder Sound & Alert</Text>
            {selectedReminder.id === 'custom' && (
              <TouchableOpacity
                style={styles.editTimeBtn}
                onPress={() => setShowTimePickerModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={13} color="#4F46E5" />
                <Text style={styles.editTimeText}>Change Time</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {REMINDER_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.catPill,
                  selectedReminder.id === preset.id && styles.catPillSelected,
                  isLimitReached && { opacity: 0.6 },
                ]}
                onPress={() => {
                  if (isLimitReached) {
                    setShowPaywall(true);
                    return;
                  }
                  triggerHaptic.light();
                  setSelectedReminder(preset);
                  if (preset.hour >= 0) {
                    soundEffects.playCompleteSound();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.catText,
                    selectedReminder.id === preset.id && styles.catTextSelected,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Custom Time Selector Pill */}
            <TouchableOpacity
              style={[
                styles.catPill,
                styles.customPill,
                selectedReminder.id === 'custom' && styles.customPillSelected,
                isLimitReached && { opacity: 0.6 },
              ]}
              onPress={() => {
                if (isLimitReached) {
                  setShowPaywall(true);
                  return;
                }
                triggerHaptic.light();
                setShowTimePickerModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={selectedReminder.id === 'custom' ? '#FFFFFF' : '#4F46E5'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.catText,
                  selectedReminder.id === 'custom'
                    ? styles.catTextSelected
                    : styles.customPillText,
                ]}
              >
                {selectedReminder.id === 'custom' ? selectedReminder.label : '+ Custom Time'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Button: Changes dynamically if limit reached */}
          {isLimitReached ? (
            <TouchableOpacity
              style={styles.proLockedBtn}
              onPress={() => {
                triggerHaptic.heavy();
                setShowPaywall(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.proLockedBtnText}>Free Limit (4/4) — Unlock Unlimited with PRO</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>+ Add to Daily Routine</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Existing Habits */}
        <Text style={styles.subSectionTitle}>ACTIVE HABITS ({habits.length})</Text>
        <View style={styles.habitsList}>
          {habits.map(habit => (
            <View key={habit.id} style={styles.habitItem}>
              <View style={[styles.itemDot, { backgroundColor: habit.color || '#4F46E5' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{habit.title}</Text>
                <Text style={styles.itemMeta}>
                  {habit.category} • Streak: {habit.currentStreak} Days 🔥
                  {habit.reminderTime ? ` • 🔔 ${formatReminderDisplay(habit.reminderTime)}` : ''}
                </Text>
              </View>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    triggerHaptic.light();
                    setEditingHabit(habit);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={17} color="#4F46E5" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.archiveBtn}
                  onPress={() => handleArchive(habit.id, habit.title)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={17} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Paywall Upgrade Modal */}
      <Modal visible={showPaywall} animationType="slide">
        <PaywallModal onClose={() => setShowPaywall(false)} />
      </Modal>

      {/* Custom Time Picker Modal */}
      <CustomTimePickerModal
        visible={showTimePickerModal}
        initialHour={selectedReminder.hour >= 0 ? selectedReminder.hour : 8}
        initialMinute={selectedReminder.minute >= 0 ? selectedReminder.minute : 0}
        onConfirm={handleCustomTimeConfirm}
        onClose={() => setShowTimePickerModal(false)}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        habit={editingHabit}
        visible={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterBadgeNormal: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  counterBadgeLimit: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  counterBadgePro: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  habitsCounter: {
    fontSize: 12,
    fontWeight: '800',
  },
  habitsCounterNormal: {
    color: '#B45309',
  },
  habitsCounterLimit: {
    color: '#DC2626',
  },
  habitsCounterPro: {
    color: '#7C3AED',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  limitWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    gap: 10,
    marginBottom: 16,
  },
  limitWarningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  limitWarningDesc: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
    lineHeight: 15,
  },
  limitUpgradeBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  limitUpgradeBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    borderColor: '#E2E8F0',
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 12,
  },
  catPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  customPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  customPillSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  customPillText: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  reminderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  editTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  catText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  catTextSelected: {
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  proLockedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#EA580C',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  proLockedBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  habitsList: {
    gap: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  archiveBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
});
