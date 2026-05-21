import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE, setAppTheme, setLargeText, isDarkTheme, isLargeText } from '../ui/theme';
import { updateTrainerProfile } from '../services/firebaseService';

const MODES = [
  { key: 'training', label: 'Personal Trainer', icon: 'dumbbell', color: '#3b82f6' },
  { key: 'rehab', label: 'Physical Therapist', icon: 'medical-bag', color: '#22c55e' },
  { key: 'parent', label: 'Parent / Youth Coach', icon: 'account-child-outline', color: '#f59e0b' },
];

export default function ProfileSettingsScreen({
  trainer,
  onBack,
  onUpdate,
  onSignOut,
  onPrivacy,
  onTerms,
  onUpgrade,
}) {
  const [name, setName] = useState(trainer?.name || '');
  const [specialty, setSpecialty] = useState(trainer?.specialty || '');
  const [selectedMode, setSelectedMode] = useState(trainer?.mode || 'training');
  const [darkMode, setDarkMode] = useState(isDarkTheme());
  const [largeText, setLargeTextState] = useState(isLargeText());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) return setError('Name cannot be empty.');
    setSaving(true);
    const result = await updateTrainerProfile(trainer.uid, {
      name: name.trim(),
      specialty: specialty.trim(),
      mode: selectedMode,
    });
    setSaving(false);
    if (result.success) {
      onUpdate?.({ name: name.trim(), specialty: specialty.trim(), mode: selectedMode });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError('Failed to save. Try again.');
    }
  };

  const handleThemeToggle = async (val) => {
    setDarkMode(val);
    setAppTheme(val);
    await AsyncStorage.setItem('fitgrade_theme', val ? 'dark' : 'light');
  };

  const handleLargeTextToggle = async (val) => {
    setLargeTextState(val);
    setLargeText(val);
    await AsyncStorage.setItem('fitgrade_large_text', val ? 'true' : 'false');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onSignOut },
    ]);
  };

  const modeColor = MODES.find(m => m.key === selectedMode)?.color || PALETTE.accent;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: modeColor + '33' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: modeColor }, (saving || saved) && { opacity: 0.75 }]}
          onPress={handleSave}
          disabled={saving || saved}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : saved ? (
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: modeColor + '22', borderColor: modeColor + '55' }]}>
            {trainer?.profileUrl ? (
              <Image source={{ uri: trainer.profileUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarInitial, { color: modeColor }]}>
                {(trainer?.name || 'T').charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.avatarName, { color: modeColor }]}>{trainer?.name || 'Trainer'}</Text>
          <Text style={styles.avatarEmail}>{trainer?.email || ''}</Text>
          {trainer?.isPro ? (
            <View style={[styles.proBadge, { backgroundColor: modeColor + '22', borderColor: modeColor + '44' }]}>
              <MaterialCommunityIcons name="crown" size={12} color={modeColor} />
              <Text style={[styles.proBadgeText, { color: modeColor }]}>Pro</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={onUpgrade}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="crown-outline" size={13} color={PALETTE.warning} />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile info */}
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="account-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={PALETTE.muted}
            autoCapitalize="words"
            color={PALETTE.text}
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="briefcase-outline" size={18} color={PALETTE.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={specialty}
            onChangeText={setSpecialty}
            placeholder="Specialty (e.g. Strength & Conditioning)"
            placeholderTextColor={PALETTE.muted}
            color={PALETTE.text}
          />
        </View>

        {/* Mode selector */}
        <Text style={styles.sectionLabel}>TRAINER MODE</Text>
        <Text style={styles.sectionHint}>Changes how grades and labels appear to your clients.</Text>
        <View style={styles.modeList}>
          {MODES.map((mode) => {
            const active = selectedMode === mode.key;
            return (
              <TouchableOpacity
                key={mode.key}
                onPress={() => setSelectedMode(mode.key)}
                style={[
                  styles.modeCard,
                  active && { borderColor: mode.color, backgroundColor: mode.color + '18' },
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.modeIcon, { backgroundColor: mode.color + '22' }]}>
                  <MaterialCommunityIcons name={mode.icon} size={18} color={mode.color} />
                </View>
                <Text style={[styles.modeLabel, active && { color: mode.color }]}>{mode.label}</Text>
                {active && <MaterialCommunityIcons name="check-circle" size={18} color={mode.color} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Display settings */}
        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <MaterialCommunityIcons name="weather-night" size={18} color={PALETTE.muted} />
            <Text style={styles.toggleLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: PALETTE.border, true: PALETTE.accent }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: PALETTE.divider }]}>
            <MaterialCommunityIcons name="format-size" size={18} color={PALETTE.muted} />
            <Text style={styles.toggleLabel}>Large Text</Text>
            <Switch
              value={largeText}
              onValueChange={handleLargeTextToggle}
              trackColor={{ false: PALETTE.border, true: PALETTE.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account info */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={16} color={PALETTE.muted} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{trainer?.email || '—'}</Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: PALETTE.divider }]}>
            <MaterialCommunityIcons name="calendar-outline" size={16} color={PALETTE.muted} />
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {trainer?.createdAt
                ? new Date(trainer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '—'}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: PALETTE.divider }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={PALETTE.muted} />
            <Text style={styles.infoLabel}>Account type</Text>
            <Text style={styles.infoValue}>{trainer?.isPro ? 'Pro' : 'Free'}</Text>
          </View>
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.legalCard}>
          <TouchableOpacity style={styles.legalRow} onPress={onPrivacy} activeOpacity={0.8}>
            <MaterialCommunityIcons name="shield-outline" size={16} color={PALETTE.muted} />
            <Text style={styles.legalLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={PALETTE.muted} />
          </TouchableOpacity>
          <View style={[styles.legalRow, { borderTopWidth: 1, borderTopColor: PALETTE.divider }]}>
            <TouchableOpacity style={styles.legalRowInner} onPress={onTerms} activeOpacity={0.8}>
              <MaterialCommunityIcons name="file-document-outline" size={16} color={PALETTE.muted} />
              <Text style={styles.legalLabel}>Terms of Service</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={PALETTE.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={PALETTE.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={18} color={PALETTE.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FitGrade v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: PALETTE.text, fontSize: 18, fontWeight: '800', flex: 1 },
  saveBtn: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: 10, minWidth: 60, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  scroll: { flex: 1 },

  avatarSection: {
    alignItems: 'center', paddingVertical: 28,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider, marginBottom: 24,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontSize: 36, fontWeight: '900' },
  avatarName: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  avatarEmail: { color: PALETTE.muted, fontSize: 13, marginBottom: 10 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  proBadgeText: { fontSize: 12, fontWeight: '800' },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PALETTE.warningSoft, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.warning + '44',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  upgradeBtnText: { color: PALETTE.warning, fontSize: 13, fontWeight: '800' },

  sectionLabel: {
    color: PALETTE.muted, fontSize: 9, fontWeight: '800',
    letterSpacing: 1.5, marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
  sectionHint: {
    color: PALETTE.muted, fontSize: 12,
    marginHorizontal: 16, marginBottom: 10, lineHeight: 17,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.panel, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, marginHorizontal: 16,
    marginBottom: 10, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: PALETTE.text },

  modeList: { marginHorizontal: 16, gap: 8, marginBottom: 24 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, padding: 14,
  },
  modeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '700', flex: 1 },

  toggleCard: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  toggleLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '600', flex: 1 },

  infoCard: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  infoLabel: { color: PALETTE.muted, fontSize: 13, fontWeight: '600', flex: 1 },
  infoValue: { color: PALETTE.text, fontSize: 13, fontWeight: '700', maxWidth: 160 },

  legalCard: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, overflow: 'hidden',
  },
  legalRow: { paddingHorizontal: 14, paddingVertical: 14 },
  legalRowInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legalLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '600', flex: 1 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PALETTE.dangerSoft, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.danger + '44',
    padding: 10, marginHorizontal: 16, marginBottom: 14,
  },
  errorText: { color: PALETTE.danger, fontSize: 12, flex: 1 },

  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.dangerSoft, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.danger + '44',
    paddingVertical: 14,
  },
  signOutText: { color: PALETTE.danger, fontSize: 15, fontWeight: '800' },

  version: {
    color: PALETTE.muted, fontSize: 11,
    textAlign: 'center', marginBottom: 8,
  },
});
