import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';

export default function RegisterScreen({ navigation }: any) {
  const { register, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const safeTopPadding = Math.max(insets.top, 46) + 10;

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Security', 'Password must be at least 6 characters long.');
      return;
    }
    triggerHaptic.light();
    await register(fullName.trim(), email.trim(), password.trim());
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: safeTopPadding }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={[
                styles.backBtn,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                triggerHaptic.light();
                navigation.navigate('Login');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            <View
              style={[
                styles.topBadge,
                isDark && { backgroundColor: '#052219', borderColor: '#059669' },
              ]}
            >
              <Ionicons name="gift" size={13} color="#10B981" />
              <Text style={[styles.topBadgeText, isDark && { color: '#34D399' }]}>
                FREE ACCOUNT
              </Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Join StreakUp 🚀</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start with 4 free daily habits, claim +10 XP rewards, and never lose momentum.
            </Text>
          </View>

          {/* Perks Feature Ticker */}
          <View style={styles.perksBanner}>
            <View
              style={[
                styles.perkChip,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.perkChipText, { color: colors.textPrimary }]}>
                Instant Level 1 Access
              </Text>
            </View>
            <View
              style={[
                styles.perkChip,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={14} color="#0284C7" />
              <Text style={[styles.perkChipText, { color: colors.textPrimary }]}>
                Free Streak Shields
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.cardHeader, { color: colors.textMuted }]}>
              CREATE YOUR PROFILE
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? '#141E33' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Alex Hunter"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? '#141E33' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="alex@streakup.app"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? '#141E33' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Security Guarantee */}
            <View
              style={[
                styles.securityBox,
                isDark && { backgroundColor: '#052219', borderColor: '#059669' },
              ]}
            >
              <Ionicons name="lock-closed" size={14} color="#10B981" />
              <Text style={[styles.securityText, isDark && { color: '#34D399' }]}>
                Your passwords are encrypted with industry-standard BCrypt security.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Creating Account...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Get Started Free</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                navigation.navigate('Login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 10,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  headerSection: {
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 19,
  },
  perksBanner: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  perkChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.75,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
});


