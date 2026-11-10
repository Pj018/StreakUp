import React, { useState } from 'react';
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
  initialTab?: 'terms' | 'privacy';
}

export default function TermsAndPrivacyModal({ visible, onClose, initialTab = 'terms' }: Props) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const insets = useSafeAreaInsets();
  const safeTopPadding = Math.max(insets.top, 46) + 8;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: safeTopPadding }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>LEGAL & POLICIES</Text>
            <Text style={styles.headerSub}>StreakUp Transparency & Trust</Text>
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

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
            onPress={() => {
              triggerHaptic.selection();
              setActiveTab('terms');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={activeTab === 'terms' ? '#4F46E5' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
            onPress={() => {
              triggerHaptic.selection();
              setActiveTab('privacy');
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={activeTab === 'privacy' ? '#4F46E5' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'terms' ? (
            <View style={styles.contentWrap}>
              <View style={styles.versionBadge}>
                <Ionicons name="time-outline" size={14} color="#4F46E5" />
                <Text style={styles.versionText}>Effective Date: November 2026 • Version 1.0</Text>
              </View>

              <Text style={styles.sectionTitle}>1. Welcome & Acceptance</Text>
              <Text style={styles.paragraph}>
                Welcome to StreakUp! By registering, downloading, or using the StreakUp mobile application or backend services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
              </Text>

              <Text style={styles.sectionTitle}>2. Gamification & Streak Integrity</Text>
              <Text style={styles.paragraph}>
                StreakUp is built on the psychological science of atomic daily habits. Streaks are automatically calculated based on your device local time and calendar completions.
              </Text>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Midnight Reset:</Text> Streaks advance when all daily scheduled tasks are marked completed before 11:59 PM.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Streak Shields:</Text> Streak shields protect uncompleted streaks from breaking when life happens. Free accounts start with 1 shield; Pro members receive 5 monthly shields.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Honest Logging:</Text> Streaks represent personal growth. Any automated tampering or unauthorized script generation may result in leaderboard resets.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>3. Subscriptions & In-App Upgrades</Text>
              <Text style={styles.paragraph}>
                StreakUp offers a Free Tier (up to 4 habits, standard analytics) and a StreakUp PRO Tier (unlimited habits, 5 shields, custom heatmaps, advanced sounds). Subscriptions can be managed or cancelled at any time through your Google Play or Apple ID account settings.
              </Text>

              <Text style={styles.sectionTitle}>4. User Content & Intellectual Property</Text>
              <Text style={styles.paragraph}>
                You retain ownership of the titles and notes you input into your habits. StreakUp owns all rights, trademarks, graphics, badges, sound design, and proprietary code in the app.
              </Text>

              <Text style={styles.sectionTitle}>5. Disclaimer & Health Guidance</Text>
              <Text style={styles.paragraph}>
                StreakUp provides behavioral accountability tools and does not constitute medical, psychological, or dietary advice. Always consult certified healthcare professionals before beginning intense physical workout regimens.
              </Text>
            </View>
          ) : (
            <View style={styles.contentWrap}>
              <View style={styles.versionBadgeGreen}>
                <Ionicons name="lock-closed-outline" size={14} color="#059669" />
                <Text style={styles.versionTextGreen}>End-to-End Encrypted • Zero Data Selling</Text>
              </View>

              <Text style={styles.sectionTitle}>1. Data We Collect</Text>
              <Text style={styles.paragraph}>
                We collect only the minimum data required to power your daily streak tracking and synchronization across devices:
              </Text>
              <View style={styles.bulletItem}>
                <Ionicons name="shield" size={18} color="#4F46E5" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Account Credentials:</Text> Your full name, email address, and securely salted BCrypt password hash. We never store plain-text passwords.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="shield" size={18} color="#4F46E5" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Habit & Analytics Logs:</Text> Habit titles, colors, completion timestamps, streaks, and XP points.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="shield" size={18} color="#4F46E5" />
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Device Notifications Token:</Text> Used solely to deliver your morning kickstart and evening streak reminder alerts.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>2. How We Protect Your Data</Text>
              <Text style={styles.paragraph}>
                All network communication with our Spring Boot cloud backend is secured using modern TLS 1.3 encryption. Your account is guarded with JSON Web Tokens (JWT) that expire automatically.
              </Text>

              <Text style={styles.sectionTitle}>3. No Ads Tracking & No Third-Party Sales</Text>
              <Text style={styles.paragraph}>
                StreakUp will never sell, lease, or monetize your personal habit routines or contact details to third-party data brokers or marketing firms.
              </Text>

              <Text style={styles.sectionTitle}>4. Right to Deletion (GDPR & CCPA)</Text>
              <Text style={styles.paragraph}>
                You have full control over your digital footprint. You can delete individual habits at any time or permanently delete your account and all associated completion archives directly from the Settings menu.
              </Text>

              <Text style={styles.sectionTitle}>5. Contact Privacy Officer</Text>
              <Text style={styles.paragraph}>
                Have questions regarding our privacy architecture? Contact our developer support team at <Text style={styles.bold}>support@streakup.app</Text>.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => {
              triggerHaptic.success();
              onClose();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptBtnText}>I Understand & Agree</Text>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#4F46E5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  contentWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  versionBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  versionTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 6,
    paddingLeft: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  acceptBtn: {
    marginTop: 24,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
