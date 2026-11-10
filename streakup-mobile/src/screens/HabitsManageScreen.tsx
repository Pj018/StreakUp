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
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCreate = async () => {
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
    });

    if (!result.success) {
      if (result.requiresPro) {
        setShowPaywall(true);
      } else {
        Alert.alert('Notice', result.error || 'Failed to create habit');
      }
      return;
    }

    setTitle('');
    setDescription('');
    Alert.alert('Success 🎉', 'New habit created! Track it daily to level up.');
  };

  const handleArchive = (habitId: string, habitTitle: string) => {
    Alert.alert(
      'Archive Habit',
      `Are you sure you want to archive "${habitTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => archiveHabit(habitId) },
      ]
    );
  };

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: safeTopPadding }]}>
        <View>
          <Text style={styles.headerTitle}>MANAGE ROUTINE</Text>
          <Text style={styles.headerSub}>Create & organize your daily habits</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.habitsCounter}>
            {habits.length} {user?.isPro ? 'Habits' : '/ 4 Free'}
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

          <TouchableOpacity style={styles.addBtn} onPress={handleCreate} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add to Daily Routine</Text>
          </TouchableOpacity>
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
                </Text>
              </View>
              <TouchableOpacity
                style={styles.archiveBtn}
                onPress={() => handleArchive(habit.id, habit.title)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showPaywall} animationType="slide">
        <PaywallModal onClose={() => setShowPaywall(false)} />
      </Modal>
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  habitsCounter: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '800',
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
  },
});
