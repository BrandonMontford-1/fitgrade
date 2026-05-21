import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signUp } from '../services/firebaseService';
import { PALETTE } from '../ui/theme';

export default function SignupScreen({ onNavigateLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (!result.success) {
      Alert.alert('Sign Up Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateLogin} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color={PALETTE.accent} />
          </View>
          <Text style={styles.brandName}>FitGrade</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSub}>Start managing your clients today</Text>

          {/* Name */}
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="account-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Brandon Montford"
              placeholderTextColor={PALETTE.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={PALETTE.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={PALETTE.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={PALETTE.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm */}
          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="lock-check-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={PALETTE.muted}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Signup button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateLogin} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={{ color: PALETTE.accent }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>FitGrade · For personal trainers</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 48 },

  header: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  backBtn: { position: 'absolute', left: 0, top: 8, padding: 4 },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PALETTE.accentSoft,
    borderWidth: 1.5,
    borderColor: PALETTE.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandName: { color: PALETTE.text, fontSize: 26, fontWeight: '800' },

  card: {
    backgroundColor: PALETTE.panel,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  cardTitle: { color: PALETTE.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: PALETTE.muted, fontSize: 14, marginBottom: 24 },

  label: { color: PALETTE.silver, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.input,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: PALETTE.text, fontSize: 15 },
  eyeBtn: { padding: 4 },

  primaryBtn: {
    backgroundColor: PALETTE.accent,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginLinkText: { color: PALETTE.muted, fontSize: 14 },

  footer: { color: PALETTE.muted, fontSize: 12, textAlign: 'center', marginTop: 32 },
});
