import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

interface Props {
  onClose: () => void;
}

export default function PaywallModal({ onClose }: Props) {
  const { user, upgradeToPro } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'PRO_ANNUAL' | 'PRO_MONTHLY'>('PRO_ANNUAL');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const safeTopPadding = Math.max(insets.top, 46) + 6;

  const handlePurchase = async () => {
    setIsUpgrading(true);
    triggerHaptic.heavy();
    await upgradeToPro(selectedPlan);
    setIsUpgrading(false);
    Alert.alert(
      '🎉 Welcome to PRO!',
      'You are now a StreakUp PRO member with unlimited habits and 5 bonus streak shields!',
      [{ text: 'Start Crushing Goals', onPress: onClose }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      {/* Close button */}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Crown Header Icon */}
        <View style={styles.crownGlowCircle}>
          <Text style={{ fontSize: 36 }}>👑</Text>
        </View>

        <Text style={styles.title}>Supercharge Your Daily Habits</Text>
        <Text style={styles.subTitle}>
          Build unbreakable discipline with unlimited habits, AI analytics, and instant streak shield protection.
        </Text>

        {/* Feature Highlights Grid */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="infinite" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Unlimited Daily Habits</Text>
              <Text style={styles.featureDesc}>Remove the 4-habit cap. Track morning, afternoon, and night routines.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>5 Instant Streak Shields</Text>
              <Text style={styles.featureDesc}>Never lose your hard-earned streak if you get sick or have an emergency.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="stats-chart" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Advanced AI Consistency Forecast</Text>
              <Text style={styles.featureDesc}>Get weekly PDF reports, peak focus hours, and smart AI tips.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="cloud-done" size={20} color="#7E22CE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>Automatic Cloud Backup</Text>
              <Text style={styles.featureDesc}>Sync your streaks across all your devices seamlessly.</Text>
            </View>
          </View>
        </View>

        {/* Pricing Selection */}
        <View style={styles.pricingSection}>
          {/* Annual Plan (Best Value) */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'PRO_ANNUAL' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('PRO_ANNUAL')}
            activeOpacity={0.85}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>BEST VALUE • SAVE 47%</Text>
            </View>
            <View style={styles.planCardHeader}>
              <View>
                <Text style={styles.planName}>Annual Membership</Text>
                <Text style={styles.planPriceSub}>Just ₹41 / month (Billed yearly)</Text>
              </View>
              <Text style={styles.planPrice}>₹499 / yr</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'PRO_MONTHLY' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('PRO_MONTHLY')}
            activeOpacity={0.85}
          >
            <View style={styles.planCardHeader}>
              <View>
                <Text style={styles.planName}>Monthly Membership</Text>
                <Text style={styles.planPriceSub}>Billed monthly, cancel anytime</Text>
              </View>
              <Text style={styles.planPrice}>₹79 / mo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Purchase CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePurchase}
          disabled={isUpgrading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {isUpgrading ? 'Activating Pro...' : selectedPlan === 'PRO_ANNUAL' ? 'Start 7-Day Free Trial' : 'Unlock PRO Membership'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.guaranteeText}>
          🔒 Secure Google Play / App Store checkout. Cancel anytime with 1 tap in store settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure clean white
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  crownGlowCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 18,
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  pricingSection: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  planPriceSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
