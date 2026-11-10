import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';

export default function RegisterScreen({ navigation }: any) {
  const { register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const safeTopPadding = Math.max(insets.top, 46) + 12;

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please complete all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Security', 'Password must be at least 6 characters.');
      return;
    }
    triggerHaptic.light();
    await register(fullName.trim(), email.trim(), password.trim());
  };

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subTitle}>Start building lifelong daily discipline today</Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Alex Hunter"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="alex@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={isLoading} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>{isLoading ? 'Creating Account...' : 'Get Started Free'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 26,
    marginTop: 4,
  },
  form: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
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
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 13,
  },
  loginLink: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 13,
  },
});
