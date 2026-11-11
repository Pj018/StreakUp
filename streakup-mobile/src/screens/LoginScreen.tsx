import React, { useState, useEffect } from 'react';
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
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginScreen({ navigation }: any) {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const safeTopPadding = Math.max(insets.top, 46) + 10;

  // Track loading duration to show friendly "waking up" message if cold-start takes > 3s
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setLoadingSeconds(0);
      timer = setInterval(() => {
        setLoadingSeconds(s => s + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter both your email address and password.');
      return;
    }
    triggerHaptic.light();
    await login(email.trim(), password.trim());
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
          {/* Header Branding */}
          <View style={styles.headerSection}>
            <View style={styles.logoBadgeWrap}>
              <View
                style={[
                  styles.logoCircle,
                  isDark && {
                    backgroundColor: '#131D33',
                    borderColor: '#FF6B00',
                    shadowColor: '#FF6B00',
                  },
                ]}
              >
                <Text style={styles.logoEmoji}>🔥</Text>
              </View>
              <View
                style={[
                  styles.communityPill,
                  isDark && { backgroundColor: '#1E293B', borderColor: '#FF6B00' },
                ]}
              >
                <Ionicons name="sparkles" size={12} color="#FF6B00" />
                <Text style={[styles.communityPillText, isDark && { color: '#FF6B00' }]}>
                  STREAK MASTER CLUB
                </Text>
              </View>
            </View>

            <Text style={[styles.appName, { color: colors.textPrimary }]}>StreakUp</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Welcome back! Build discipline, earn XP, and protect your daily streak.
            </Text>
          </View>

          {/* Login Form Card */}
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
              SIGN IN TO YOUR ROUTINE
            </Text>

            {/* Email Input */}
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
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={isDark ? '#64748B' : '#64748B'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="name@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic.light();
                    setShowForgotPassword(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? '#141E33' : '#F8FAFC',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={isDark ? '#64748B' : '#64748B'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="••••••••"
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

            {/* Sign In CTA */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginBtnText}>
                    {loadingSeconds > 3 ? 'Waking up cloud server...' : 'Signing In...'}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Warming Up Notice */}
            {isLoading && loadingSeconds > 2 && (
              <View style={[styles.warmingUpBox, isDark && { backgroundColor: '#131D33', borderColor: '#1E293B' }]}>
                <Ionicons name="cloud-outline" size={16} color="#FF6B00" />
                <Text style={[styles.warmingUpText, isDark && { color: '#94A3B8' }]}>
                  Connecting to Render cloud ({loadingSeconds}s). Server is spinning up, please hold on!
                </Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR INSTANT ACCESS</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Instant Guest / Demo Mode Button */}
            <TouchableOpacity
              style={[
                styles.demoBtn,
                isDark && {
                  backgroundColor: '#131D33',
                  borderColor: '#1E293B',
                },
              ]}
              onPress={() => {
                triggerHaptic.medium();
                quickDemoLogin();
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.demoIconWrap,
                  isDark && { backgroundColor: '#1E293B' },
                ]}
              >
                <Ionicons name="flash" size={18} color="#FF6B00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoBtnTitle, isDark && { color: '#FFFFFF' }]}>
                  🚀 Explore as Guest (Instant Demo)
                </Text>
                <Text style={[styles.demoBtnSub, isDark && { color: '#94A3B8' }]}>
                  No login required • Habits, streaks, dark mode ready
                </Text>
              </View>
            </TouchableOpacity>

            {/* Fast Auto-fill Pills */}
            <View style={styles.quickFillContainer}>
              <Text style={[styles.quickFillHeader, { color: colors.textMuted }]}>
                1-TAP CLOUD TEST ACCOUNTS:
              </Text>
              <View style={styles.quickFillRow}>
                <TouchableOpacity
                  style={[
                    styles.quickFillPill,
                    {
                      backgroundColor: isDark ? '#141E33' : '#F1F5F9',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.light();
                    setEmail('prakashjadhav9380@gmail.com');
                    setPassword('password123');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person" size={12} color="#10B981" />
                  <Text style={[styles.quickFillText, { color: colors.textPrimary }]}>
                    Prakash (Personal)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickFillPill,
                    {
                      backgroundColor: isDark ? '#141E33' : '#F1F5F9',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.light();
                    setEmail('alex@streakup.app');
                    setPassword('password123');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles" size={12} color="#FF6B00" />
                  <Text style={[styles.quickFillText, { color: colors.textPrimary }]}>
                    Alex (Demo)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Social Proof / Gamification Highlights */}
          <View
            style={[
              styles.perksRow,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>🛡️</Text>
              <Text style={[styles.perkLabel, { color: colors.textSecondary }]}>Streak Shields</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>⚡</Text>
              <Text style={[styles.perkLabel, { color: colors.textSecondary }]}>Level & XP</Text>
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkEmoji}>📊</Text>
              <Text style={[styles.perkLabel, { color: colors.textSecondary }]}>8-Week Grid</Text>
            </View>
          </View>

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                navigation.navigate('Register');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLink}>Create Account Free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        initialEmail={email}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={newEmail => {
          setEmail(newEmail);
          setShowForgotPassword(false);
          Alert.alert('Password Updated', 'You can now sign in with your new password.');
        }}
      />
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  logoBadgeWrap: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 40,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
    marginTop: -8,
  },
  communityPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
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
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
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
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
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
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  warmingUpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  warmingUpText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#9A3412',
    lineHeight: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  demoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400E',
  },
  demoBtnSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  quickFillContainer: {
    marginTop: 12,
  },
  quickFillHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  quickFillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFillPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  perkItem: {
    alignItems: 'center',
    gap: 3,
  },
  perkEmoji: {
    fontSize: 18,
  },
  perkLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
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
  signUpLink: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
});


