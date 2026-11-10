import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgradePress: () => void;
}

export default function PlanComparisonModal({ visible, onClose, onUpgradePress }: Props) {
  const insets = useSafeAreaInsets();
  const safeTopPadding = Math.max(insets.top, 46) + 8;

  const comparisonRows = [
    { feature: 'Habit Tracking Limit', free: 'Max 4 Habits', pro: 'Unlimited Habits', highlight: true },
    { feature: 'Streak Freeze Shields', free: '1 Shield', pro: '5 Shields + Auto-Refill', highlight: true },
    { feature: 'Consistency Heatmap', free: 'Basic 8-Week', pro: 'Full Year AI Analytics', highlight: false },
    { feature: 'Sensory Audio Engine', free: 'Standard Chime', pro: 'HD Chimes & Fanfares', highlight: false },
    { feature: 'Custom Avatars & Themes', free: 'Standard', pro: 'All Premium Badges', highlight: false },
    { feature: 'Emergency Streak Revive', free: '1x Video Ad', pro: 'Instant Unlimited Revives', highlight: true },
    { feature: 'Cloud Sync & PostgreSQL', free: 'Included', pro: 'Priority Real-Time Sync', highlight: false },
    { feature: 'Ad-Free Experience', free: 'Minimal Ads', pro: '100% Ad-Free Forever', highlight: true },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>PLAN COMPARISON</Text>
            <Text style={styles.headerSub}>Free Plan vs StreakUp PRO Superpowers</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              triggerHaptic.light();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colTitle, { flex: 1.5 }]}>SUPERPOWER</Text>
            <Text style={[styles.colTitle, { flex: 1, textAlign: 'center' }]}>FREE</Text>
            <Text style={[styles.colTitle, { flex: 1.2, textAlign: 'right', color: '#EA580C' }]}>
              ★ PRO
            </Text>
          </View>

          {/* Table Rows */}
          {comparisonRows.map((row, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
                row.highlight && styles.rowHighlight,
              ]}
            >
              <View style={{ flex: 1.5 }}>
                <Text style={styles.featureName}>{row.feature}</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.freeVal}>{row.free}</Text>
              </View>

              <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                <View style={styles.proValBadge}>
                  <Text style={styles.proVal}>{row.pro}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Upgrade Banner Button */}
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => {
              triggerHaptic.success();
              onClose();
              onUpgradePress();
            }}
            activeOpacity={0.85}
          >
            <View style={styles.flameIcon}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeBtnTitle}>Upgrade to StreakUp PRO</Text>
              <Text style={styles.upgradeBtnSub}>Starting at ₹99/mo • Cancel anytime</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginBottom: 8,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 3,
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#F8FAFC',
  },
  rowHighlight: {
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
  },
  featureName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  freeVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  proValBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    textAlign: 'right',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginTop: 24,
    shadowColor: '#EA580C',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  flameIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBtnTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  upgradeBtnSub: {
    fontSize: 11,
    color: '#FED7AA',
    marginTop: 2,
  },
});
