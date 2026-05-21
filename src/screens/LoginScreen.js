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
import { logIn } from '../services/firebaseService';
import { PALETTE } from '../ui/theme';

export default function LoginScreen({ onNavigateSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await logIn(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo / Brand */}
        <View style={styles.brandWrap}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="lightning-bolt" size={36} color={PALETTE.accent} />
          </View>
          <Text style={styles.brandName}>FitGrade</Text>
          <Text style={styles.brandTagline}>Track. Train. Perform.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to your trainer account</Text>

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
              placeholder="••••••••"
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

          {/* Login button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up link */}
          <TouchableOpacity onPress={onNavigateSignup} style={styles.secondaryBtn} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Create a new account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>FitGrade · For personal trainers</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },

  brandWrap: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PALETTE.accentSoft,
    borderWidth: 1.5,
    borderColor: PALETTE.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  brandName: { color: PALETTE.text, fontSize: 36, fontWeight: '900', letterSpacing: 1 },
  brandTagline: { color: PALETTE.muted, fontSize: 14, marginTop: 6, letterSpacing: 0.5 },

  card: {
    backgroundColor: PALETTE.panel,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: PALETTE.border,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
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
    marginBottom: 20,
    shadowColor: PALETTE.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: PALETTE.divider },
  dividerText: { color: PALETTE.muted, fontSize: 13, marginHorizontal: 12 },

  secondaryBtn: {
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: PALETTE.panelAlt,
  },
  secondaryBtnText: { color: PALETTE.silver, fontSize: 15, fontWeight: '700' },

  footer: { color: PALETTE.muted, fontSize: 12, textAlign: 'center', marginTop: 32 },
});
