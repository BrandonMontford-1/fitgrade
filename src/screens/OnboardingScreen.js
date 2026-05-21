import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateTrainerProfile } from '../services/firebaseService';
import { PALETTE, MODES } from '../ui/theme';

const { width: W } = Dimensions.get('window');

const SPECIALTIES = [
  'General Fitness', 'Strength & Conditioning', 'Sports Performance',
  'Rehabilitation', 'Weight Loss', 'Bodybuilding', 'CrossFit', 'Yoga & Mobility',
];

const STEPS = [
  {
    key: 'what',
    title: 'Meet FitGrade',
    icon: 'lightning-bolt',
    color: PALETTE.accent,
    subtitle: 'The simplest way to track health and performance.',
    content: 'how_it_works',
  },
  {
    key: 'account_type',
    title: 'Who are you?',
    icon: 'account-question-outline',
    color: '#f59e0b',
    subtitle: 'This shapes your entire experience.',
    content: 'account_type',
  },
  {
    key: 'mode',
    title: 'How will you use FitGrade?',
    icon: 'tune-variant',
    color: '#f59e0b',
    subtitle: 'This customizes the app language and features for you.',
    content: 'mode_select',
  },
  {
    key: 'grade',
    title: 'Health Grades',
    icon: 'clipboard-pulse-outline',
    color: '#22c55e',
    subtitle: 'Every client gets a grade from 0-100% for 5 body parts.',
    content: 'grades',
  },
  {
    key: 'name',
    title: "What's your name?",
    icon: 'account-outline',
    color: '#a78bfa',
    subtitle: 'This is how your clients and colleagues will know you.',
    content: 'name_input',
  },
  {
    key: 'specialty',
    title: "Your specialty",
    icon: 'dumbbell',
    color: '#f59e0b',
    subtitle: "We'll use this to tailor your experience.",
    content: 'specialty_input',
    trainerOnly: true,
  },
  {
    key: 'ready',
    title: "You're all set!",
    icon: 'check-circle-outline',
    color: PALETTE.accent,
    subtitle: "Here's how to get started in 3 steps.",
    content: 'get_started',
  },
];

const HOW_IT_WORKS = [
  { icon: 'clipboard-plus-outline', color: PALETTE.accent, text: 'Log sessions and enter health grades after each workout' },
  { icon: 'human', color: '#22c55e', text: 'Track 5 body parts — Head, Arm, Core, Leg, Foot' },
  { icon: 'lightning-bolt', color: '#f59e0b', text: 'Get AI-powered weekly training plans based on real data' },
  { icon: 'account-group-outline', color: '#a78bfa', text: 'Share access with athletes and coaches' },
];

const GRADE_PARTS = [
  { part: 'Head', color: '#60a5fa', desc: 'Focus & cognitive readiness' },
  { part: 'Arm', color: '#a78bfa', desc: 'Upper body power & stability' },
  { part: 'Core', color: '#34d399', desc: 'Midline control & posture' },
  { part: 'Leg', color: '#fbbf24', desc: 'Drive, force & sprint capacity' },
  { part: 'Foot', color: '#f87171', desc: 'Balance & push-off control' },
];

const GET_STARTED = [
  { num: '1', icon: 'account-plus-outline', color: PALETTE.accent, title: 'Add a client', desc: 'Tap the + button on the roster screen' },
  { num: '2', icon: 'clipboard-plus-outline', color: '#22c55e', title: 'Log a session', desc: 'Enter grades for each body part after training' },
  { num: '3', icon: 'lightning-bolt', color: '#f59e0b', title: 'Generate AI plan', desc: 'Tap AI Plan tab for a personalized weekly schedule' },
];

export default function OnboardingScreen({ trainer, onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(trainer?.name || '');
  const [specialty, setSpecialty] = useState('');
  const [mode, setMode] = useState('training');
  const [accountType, setAccountType] = useState('trainer'); // trainer | athlete
  const [saving, setSaving] = useState(false);

  // Filter steps based on account type
  const visibleSteps = STEPS.filter((s) => {
    if (s.trainerOnly && accountType === 'athlete') return false;
    if (s.key === 'mode' && accountType === 'athlete') return false;
    return true;
  });

  const current = visibleSteps[step];
  const isLast = step === visibleSteps.length - 1;

  const handleNext = async () => {
    if (current.key === 'name' && !name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (isLast) {
      setSaving(true);
      await updateTrainerProfile(trainer.uid, {
        name: name.trim(),
        specialty: accountType === 'trainer' ? specialty : '',
        mode: accountType === 'trainer' ? mode : 'parent',
        accountType,
        onboarded: true,
      });
      setSaving(false);
      onComplete({ name: name.trim(), specialty, mode, accountType });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <View style={styles.root}>
      {/* FitGrade logo at top */}
      <View style={styles.logoBar}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color={PALETTE.accent} />
        <Text style={styles.logoText}>FitGrade</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {visibleSteps.map((_, i) => (
          <View key={i} style={[
            styles.dot,
            i === step && { backgroundColor: current.color, width: 24 },
            i < step && { backgroundColor: current.color + '66' },
          ]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: current.color + '18', borderColor: current.color + '44' }]}>
          <MaterialCommunityIcons name={current.icon} size={40} color={current.color} />
        </View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {/* Account type select */}
        {current.content === 'account_type' && (
          <View style={styles.featureList}>
            {[
              { key: 'trainer', icon: 'clipboard-edit-outline', color: PALETTE.accent, label: 'Trainer / Coach', desc: 'I track and manage clients or athletes' },
              { key: 'athlete', icon: 'account-outline', color: '#22c55e', label: 'Athlete / Client', desc: 'My trainer set this up and I want to see my own stats' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setAccountType(t.key)}
                style={[styles.modeCard, accountType === t.key && { borderColor: t.color, backgroundColor: t.color + '18' }]}
                activeOpacity={0.85}
              >
                <View style={[styles.modeIcon, { backgroundColor: t.color + '22' }]}>
                  <MaterialCommunityIcons name={t.icon} size={26} color={t.color} />
                </View>
                <View style={styles.modeInfo}>
                  <Text style={[styles.modeLabel, accountType === t.key && { color: t.color }]}>{t.label}</Text>
                  <Text style={styles.modeDesc}>{t.desc}</Text>
                </View>
                {accountType === t.key && <MaterialCommunityIcons name="check-circle" size={22} color={t.color} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mode select */}
        {current.content === 'mode_select' && (
          <View style={styles.featureList}>
            {Object.values(MODES).map((m) => (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.modeCard,
                  mode === m.key && { borderColor: m.color, backgroundColor: m.color + '18' },
                ]}
                activeOpacity={0.85}
              >
                <View style={[styles.modeIcon, { backgroundColor: m.color + '22' }]}>
                  <MaterialCommunityIcons name={m.icon} size={26} color={m.color} />
                </View>
                <View style={styles.modeInfo}>
                  <Text style={[styles.modeLabel, mode === m.key && { color: m.color }]}>{m.label}</Text>
                  <Text style={styles.modeDesc}>{m.description}</Text>
                </View>
                {mode === m.key && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={m.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* How it works */}
        {current.content === 'how_it_works' && (
          <View style={styles.featureList}>
            {HOW_IT_WORKS.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                  <MaterialCommunityIcons name={f.icon} size={20} color={f.color} />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Grade breakdown */}
        {current.content === 'grades' && (
          <View style={styles.gradeList}>
            {GRADE_PARTS.map((p) => (
              <View key={p.part} style={styles.gradeRow}>
                <View style={[styles.gradeLetter, { backgroundColor: p.color + '22', borderColor: p.color + '44' }]}>
                  <Text style={[styles.gradeLetterText, { color: p.color }]}>{p.part[0]}</Text>
                </View>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradePart}>{p.part}</Text>
                  <Text style={styles.gradeDesc}>{p.desc}</Text>
                </View>
                <Text style={[styles.gradeNum, { color: p.color }]}>100%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Name input */}
        {current.content === 'name_input' && (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            placeholderTextColor={PALETTE.muted}
            autoCapitalize="words"
            autoFocus
            color={PALETTE.text}
          />
        )}

        {/* Specialty picker */}
        {current.content === 'specialty_input' && (
          <View style={styles.specialtyGrid}>
            {SPECIALTIES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSpecialty(s)}
                style={[styles.specialtyPill, specialty === s && { backgroundColor: PALETTE.accentSoft, borderColor: PALETTE.accent }]}
              >
                <Text style={[styles.specialtyText, specialty === s && { color: PALETTE.accent }]}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setStep((s) => s + 1)} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Get started steps */}
        {current.content === 'get_started' && (
          <View style={styles.startList}>
            {GET_STARTED.map((s) => (
              <View key={s.num} style={styles.startRow}>
                <View style={[styles.startNum, { backgroundColor: s.color + '22', borderColor: s.color + '44' }]}>
                  <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                </View>
                <View style={styles.startInfo}>
                  <Text style={styles.startTitle}>{s.title}</Text>
                  <Text style={styles.startDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Nav buttons */}
      <View style={styles.btnRow}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={PALETTE.silver} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: current.color }, saving && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
              <MaterialCommunityIcons name={isLast ? 'check' : 'arrow-right'} size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 20, paddingBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PALETTE.border },

  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { color: PALETTE.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: PALETTE.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 24 },

  logoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  logoText: {
    color: PALETTE.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featureList: { width: '100%', gap: 12 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1.5, borderColor: PALETTE.border, padding: 16,
    width: '100%',
  },
  modeIcon: {
    width: 52, height: 52, borderRadius: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  modeInfo: { flex: 1 },
  modeLabel: { color: PALETTE.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  modeDesc: { color: PALETTE.muted, fontSize: 12, lineHeight: 17 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.border, padding: 14,
  },
  featureIcon: { width: 40, height: 40, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  featureText: { color: PALETTE.text, fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },

  gradeList: { width: '100%', gap: 10 },
  gradeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.border, padding: 12,
  },
  gradeLetter: {
    width: 44, height: 44, borderRadius: 0,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  gradeLetterText: { fontSize: 20, fontWeight: '900' },
  gradeInfo: { flex: 1 },
  gradePart: { color: PALETTE.text, fontSize: 14, fontWeight: '800' },
  gradeDesc: { color: PALETTE.muted, fontSize: 11, marginTop: 2 },
  gradeNum: { fontSize: 16, fontWeight: '800' },

  input: {
    width: '100%', backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.border,
    fontSize: 18, fontWeight: '700', paddingHorizontal: 18, paddingVertical: 14,
  },

  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  specialtyPill: {
    backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  specialtyText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  skipBtn: { width: '100%', alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  skipText: { color: PALETTE.muted, fontSize: 13, fontWeight: '600' },

  startList: { width: '100%', gap: 12 },
  startRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PALETTE.panel,
    borderRadius: 0,
    borderWidth: 1, borderColor: PALETTE.border, padding: 16,
  },
  startNum: {
    width: 52, height: 52, borderRadius: 0,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  startInfo: { flex: 1 },
  startTitle: { color: PALETTE.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  startDesc: { color: PALETTE.muted, fontSize: 12, lineHeight: 17 },

  btnRow: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12, gap: 12 },
  backBtn: {
    width: 48, height: 52, borderRadius: 0,
    backgroundColor: PALETTE.panel, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtn: {
    flex: 1, height: 52, borderRadius: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
