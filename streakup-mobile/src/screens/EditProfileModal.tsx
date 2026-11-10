import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/haptics';
import soundEffects from '../utils/soundEffects';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const safeTopPadding = Math.max(insets.top, 46) + 8;

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      triggerHaptic.warning();
      return;
    }

    setIsLoading(true);
    triggerHaptic.medium();

    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
      });
      setIsLoading(false);

      if (res.success) {
        soundEffects.playCompleteSound();
        triggerHaptic.success();
        Alert.alert('Saved! ✨', 'Your profile details have been updated.');
        onClose();
      } else {
        triggerHaptic.error();
        Alert.alert('Error', res.message || 'Failed to update profile.');
      }
    } catch (e: any) {
      setIsLoading(false);
      triggerHaptic.error();
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: safeTopPadding }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>EDIT PROFILE</Text>
              <Text style={styles.headerSub}>Personalize your identity & discipline motto</Text>
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
            {/* Input 1: Full Name */}
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Input 2: Email (Read Only) */}
            <Text style={styles.inputLabel}>ACCOUNT EMAIL</Text>
            <View style={[styles.inputWrap, styles.inputWrapDisabled]}>
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <Text style={styles.inputDisabledText}>{user?.email || 'N/A'}</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            {/* Input 3: Discipline Motto / Bio */}
            <Text style={styles.inputLabel}>DISCIPLINE MOTTO / BIO</Text>
            <View style={[styles.inputWrap, { height: 90, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="flame-outline" size={18} color="#EA580C" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="e.g. 1% better every day. Never break the chain!"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                maxLength={200}
                value={bio}
                onChangeText={setBio}
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/200 characters</Text>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputDisabledText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    marginTop: 28,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
