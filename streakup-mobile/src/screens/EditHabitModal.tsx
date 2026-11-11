import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitContext';
import { Habit, Category } from '../types';
import CustomTimePickerModal from './CustomTimePickerModal';
import soundEffects from '../utils/soundEffects';
import notificationService from '../utils/notificationService';
import { triggerHaptic } from '../utils/haptics';

interface EditHabitModalProps {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
}

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

export default function EditHabitModal({ habit, visible, onClose }: EditHabitModalProps) {
  const { updateHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('HEALTH');
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  const [selectedReminder, setSelectedReminder] = useState<ReminderItem>(REMINDER_PRESETS[0]);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (habit && visible) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      setSelectedCategory(habit.category || 'HEALTH');
      setSelectedColor(habit.color || '#4F46E5');

      if (habit.reminderTime) {
        const parts = habit.reminderTime.split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        const time12 = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

        const matchingPreset = REMINDER_PRESETS.find(p => p.timeStr === habit.reminderTime);
        if (matchingPreset) {
          setSelectedReminder(matchingPreset);
        } else {
          setSelectedReminder({
            id: 'custom',
            label: `⏰ ${time12}`,
            hour: h,
            minute: m,
            timeStr: habit.reminderTime,
          });
        }
      } else {
        setSelectedReminder(REMINDER_PRESETS.find(p => p.id === 'r0') || REMINDER_PRESETS[0]);
      }
    }
  }, [habit, visible]);

  const handleCustomTimeConfirm = (result: {
    hour: number;
    minute: number;
    time12: string;
    time24: string;
  }) => {
    setSelectedReminder({
      id: 'custom',
      label: `⏰ ${result.time12}`,
      hour: result.hour,
      minute: result.minute,
      timeStr: result.time24,
    });
  };

  const handleSave = async () => {
    if (!habit) return;
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a habit title.');
      return;
    }

    setIsSaving(true);
    triggerHaptic.medium();

    const res = await updateHabit(habit.id, {
      title: title.trim(),
      description: description.trim(),
      category: selectedCategory,
      color: selectedColor,
      reminderTime: selectedReminder.timeStr || undefined,
    });

    setIsSaving(false);

    if (res.success) {
      if (selectedReminder.hour >= 0) {
        notificationService.scheduleHabitReminder(
          'habit-' + habit.id,
          title.trim(),
          selectedReminder.hour,
          selectedReminder.minute
        );
      }
      soundEffects.playCompleteSound();
      triggerHaptic.success();
      onClose();
      Alert.alert('Success 🎉', 'Habit updated successfully!');
    } else {
      Alert.alert('Error', res.error || 'Failed to update habit');
    }
  };

  if (!habit) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>EDIT HABIT</Text>
            <Text style={styles.headerSub}>Update daily target, reminder & routine details</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Read 20 mins, Cold Shower, Gym Workout"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Daily Target / Cue</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7:00 AM right after morning tea"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    selectedCategory === cat && styles.catPillSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
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
                  ]}
                  onPress={() => setSelectedColor(c)}
                  activeOpacity={0.7}
                />
              ))}
            </View>

            {/* Reminder Section */}
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
                  ]}
                  onPress={() => {
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

              <TouchableOpacity
                style={[
                  styles.catPill,
                  styles.customPill,
                  selectedReminder.id === 'custom' && styles.customPillSelected,
                ]}
                onPress={() => {
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

            {/* Save Changes Button */}
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>{isSaving ? 'Saving Changes...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Custom Time Picker Modal */}
        <CustomTimePickerModal
          visible={showTimePickerModal}
          initialHour={selectedReminder.hour >= 0 ? selectedReminder.hour : 8}
          initialMinute={selectedReminder.minute >= 0 ? selectedReminder.minute : 0}
          onConfirm={handleCustomTimeConfirm}
          onClose={() => setShowTimePickerModal(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 16,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
  saveBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
