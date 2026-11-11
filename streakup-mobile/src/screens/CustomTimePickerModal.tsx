import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

interface CustomTimePickerModalProps {
  visible: boolean;
  initialHour?: number; // 0 - 23
  initialMinute?: number; // 0 - 59
  onConfirm: (result: {
    hour: number;
    minute: number;
    time12: string;
    time24: string;
  }) => void;
  onClose: () => void;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const QUICK_TIMES = [
  { label: '🌅 06:00 AM', h: 6, m: 0, p: 'AM' as const },
  { label: '☀️ 07:15 AM', h: 7, m: 15, p: 'AM' as const },
  { label: '☕ 08:30 AM', h: 8, m: 30, p: 'AM' as const },
  { label: '🥗 01:15 PM', h: 1, m: 15, p: 'PM' as const },
  { label: '🌆 05:45 PM', h: 5, m: 45, p: 'PM' as const },
  { label: '🌙 09:30 PM', h: 9, m: 30, p: 'PM' as const },
  { label: '⭐ 10:15 PM', h: 10, m: 15, p: 'PM' as const },
];

export default function CustomTimePickerModal({
  visible,
  initialHour = 8,
  initialMinute = 0,
  onConfirm,
  onClose,
}: CustomTimePickerModalProps) {
  const [hour12, setHour12] = useState(8);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (visible) {
      if (initialHour >= 0 && initialHour <= 23) {
        const isPm = initialHour >= 12;
        let h = initialHour % 12;
        if (h === 0) h = 12;
        setHour12(h);
        setMinute(Math.max(0, Math.min(59, initialMinute)));
        setPeriod(isPm ? 'PM' : 'AM');
      } else {
        setHour12(8);
        setMinute(0);
        setPeriod('AM');
      }
    }
  }, [visible, initialHour, initialMinute]);

  const handleHourSelect = (h: number) => {
    triggerHaptic.light();
    setHour12(h);
  };

  const handleMinuteSelect = (m: number) => {
    triggerHaptic.light();
    setMinute(m);
  };

  const handleMinuteStep = (delta: number) => {
    triggerHaptic.light();
    setMinute(prev => {
      let next = prev + delta;
      if (next < 0) next = 59;
      if (next > 59) next = 0;
      return next;
    });
  };

  const handlePeriodToggle = (p: 'AM' | 'PM') => {
    triggerHaptic.medium();
    setPeriod(p);
  };

  const handleQuickSelect = (q: typeof QUICK_TIMES[0]) => {
    triggerHaptic.medium();
    setHour12(q.h);
    setMinute(q.m);
    setPeriod(q.p);
  };

  const handleTestSound = () => {
    triggerHaptic.medium();
    soundEffects.playCompleteSound();
  };

  const handleSave = () => {
    triggerHaptic.success();
    soundEffects.playCompleteSound();

    let h24 = hour12 % 12;
    if (period === 'PM') {
      h24 += 12;
    }

    const time12Str = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
    const time24Str = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    onConfirm({
      hour: h24,
      minute,
      time12: time12Str,
      time24: time24Str,
    });
    onClose();
  };

  const formattedDisplayHour = String(hour12).padStart(2, '0');
  const formattedDisplayMinute = String(minute).padStart(2, '0');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>CUSTOM REMINDER TIME</Text>
              <Text style={styles.subtitle}>Set your exact daily habit reminder & alert</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Clock Big Display */}
            <View style={styles.clockCard}>
              <View style={styles.timeDisplayRow}>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{formattedDisplayHour}</Text>
                  <Text style={styles.timeUnitLabel}>HOUR</Text>
                </View>
                <Text style={styles.timeColon}>:</Text>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{formattedDisplayMinute}</Text>
                  <Text style={styles.timeUnitLabel}>MINUTE</Text>
                </View>
                <View style={styles.periodPillColumn}>
                  <TouchableOpacity
                    style={[styles.periodBtn, period === 'AM' && styles.periodBtnActive]}
                    onPress={() => handlePeriodToggle('AM')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.periodBtnText, period === 'AM' && styles.periodBtnTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.periodBtn, period === 'PM' && styles.periodBtnActive]}
                    onPress={() => handlePeriodToggle('PM')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.periodBtnText, period === 'PM' && styles.periodBtnTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.clockFooterNote}>
                <Ionicons name="notifications-outline" size={14} color="#4F46E5" />
                <Text style={styles.clockFooterText}>
                  Reminder set for {formattedDisplayHour}:{formattedDisplayMinute} {period} Daily
                </Text>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={styles.sectionLabel}>⚡ POPULAR TIME PRESETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {QUICK_TIMES.map(q => {
                const isSelected = hour12 === q.h && minute === q.m && period === q.p;
                return (
                  <TouchableOpacity
                    key={q.label}
                    style={[styles.quickChip, isSelected && styles.quickChipActive]}
                    onPress={() => handleQuickSelect(q)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Hour Picker (1 - 12) */}
            <Text style={styles.sectionLabel}>🕐 SELECT HOUR (1 - 12)</Text>
            <View style={styles.gridRow}>
              {HOURS.map(h => {
                const isSelected = hour12 === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.hourChip, isSelected && styles.hourChipActive]}
                    onPress={() => handleHourSelect(h)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.hourChipText, isSelected && styles.hourChipTextActive]}>
                      {String(h).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Minute Stepper & Quick Intervals */}
            <View style={styles.minuteHeaderRow}>
              <Text style={styles.sectionLabel}>⏱️ SELECT MINUTE (00 - 59)</Text>
              {/* Stepper +/- */}
              <View style={styles.stepperWrap}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleMinuteStep(-1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{formattedDisplayMinute}m</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => handleMinuteStep(1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Minute Presets */}
            <View style={styles.gridRow}>
              {MINUTE_PRESETS.map(m => {
                const isSelected = minute === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.minuteChip, isSelected && styles.minuteChipActive]}
                    onPress={() => handleMinuteSelect(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.minuteChipText, isSelected && styles.minuteChipTextActive]}>
                      :{String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Test Sound Button */}
            <TouchableOpacity style={styles.soundTestRow} onPress={handleTestSound} activeOpacity={0.7}>
              <Ionicons name="volume-high" size={18} color="#6366F1" />
              <Text style={styles.soundTestText}>Test Notification Sound Effect</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Confirm & Set Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmBtnText}>
                Set Reminder Time ({formattedDisplayHour}:{formattedDisplayMinute} {period})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  subtitle: {
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
    paddingBottom: 24,
  },
  clockCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeDigitBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    minWidth: 80,
  },
  timeDigitText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: 1,
  },
  timeUnitLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  timeColon: {
    fontSize: 32,
    fontWeight: '900',
    color: '#4F46E5',
    marginHorizontal: 2,
  },
  periodPillColumn: {
    marginLeft: 6,
    gap: 6,
  },
  periodBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  periodBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  periodBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
  },
  clockFooterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  clockFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  quickRow: {
    gap: 8,
    paddingBottom: 16,
  },
  quickChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  hourChip: {
    flexBasis: '14.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  hourChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  hourChipTextActive: {
    color: '#FFFFFF',
  },
  minuteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 6,
  },
  minuteChip: {
    flexBasis: '14.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  minuteChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0369A1',
  },
  minuteChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  minuteChipTextActive: {
    color: '#FFFFFF',
  },
  soundTestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: 10,
  },
  soundTestText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  bottomBar: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
