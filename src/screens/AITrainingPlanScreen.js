import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { generateAITrainingPlan } from '../services/aiService';
import { saveAIPlan, loadAIPlan } from '../services/firebaseService';
import { PALETTE } from '../ui/theme';

const DAY_COLORS = {
  Rest:     { bg: '#1a1a2a', border: '#3b82f633', text: '#6b7890', icon: 'sleep' },
  Recovery: { bg: '#1a2a1a', border: '#22c55e33', text: '#22c55e', icon: 'heart-pulse' },
  Light:    { bg: '#1a2a2a', border: '#60a5fa33', text: '#60a5fa', icon: 'walk' },
  Moderate: { bg: '#2a2a1a', border: '#f59e0b33', text: '#f59e0b', icon: 'run' },
  Intense:  { bg: '#2a1a1a', border: '#ef444433', text: '#ef4444', icon: 'lightning-bolt' },
};

function DayCard({ day }) {
  const [expanded, setExpanded] = useState(false);
  const meta = DAY_COLORS[day.type] || DAY_COLORS.Rest;

  return (
    <TouchableOpacity
      style={[styles.dayCard, { backgroundColor: meta.bg, borderColor: meta.border }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.85}
    >
      <View style={styles.dayCardHeader}>
        <View style={styles.dayCardLeft}>
          <Text style={styles.dayName}>{day.day}</Text>
          <View style={styles.dayTypeBadge}>
            <MaterialCommunityIcons name={meta.icon} size={12} color={meta.text} />
            <Text style={[styles.dayType, { color: meta.text }]}>{day.type}</Text>
          </View>
        </View>
        <View style={styles.dayCardRight}>
          <Text style={[styles.dayFocus, { color: meta.text }]}>{day.focus}</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16} color={PALETTE.muted}
          />
        </View>
      </View>
      {expanded && (
        <Text style={styles.dayNotes}>{day.notes}</Text>
      )}
    </TouchableOpacity>
  );
}

function RiskFlag({ text }) {
  return (
    <View style={styles.riskFlag}>
      <MaterialCommunityIcons name="alert-circle-outline" size={14} color={PALETTE.danger} />
      <Text style={styles.riskFlagText}>{text}</Text>
    </View>
  );
}

export default function AITrainingPlanScreen({ client, role, trainerId, onBack, hideHeader }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [trainerNotes, setTrainerNotes] = useState('');
  const [athleteGoals, setAthleteGoals] = useState('');
  const [athleteFeel, setAthleteFeel] = useState('');
  const [generated, setGenerated] = useState(false);
  const [compDays, setCompDays] = useState(7);
  const [expandedDay, setExpandedDay] = useState(null);

  // Load compDays from AsyncStorage — stays in sync with roster screen
  useEffect(() => {
    AsyncStorage.getItem('fitgrade_comp_days').then((val) => {
      if (val !== null) setCompDays(parseInt(val));
    });
  }, []);

  // Load existing saved plan on mount
  useEffect(() => {
    const fetchSaved = async () => {
      if (!trainerId || !client?.id) { setLoadingExisting(false); return; }
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 4000)
        );
        const result = await Promise.race([loadAIPlan(trainerId, client.id), timeout]);
        if (result.success) {
          setPlan(result.data);
          setGenerated(true);
        }
      } catch {
        // No plan found or timed out — show generate screen
      }
      setLoadingExisting(false);
    };
    fetchSaved();
  }, [client?.id, trainerId]);

  const canEnterGoals = role === 'athlete' || role === 'trainer';
  const canEnterNotes = role === 'trainer';
  const isCoach = role === 'coach';
  const [coachNotes, setCoachNotes] = useState('');

  if (loadingExisting) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.accent} />
        <Text style={{ color: PALETTE.muted, marginTop: 12, fontSize: 14 }}>Loading saved plan...</Text>
      </View>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setGenerated(false);

    const messages = [
      'Analyzing health grades...',
      'Reviewing injury flags...',
      'Building weekly schedule...',
      'Calibrating intensity levels...',
      'Finalizing your plan...',
    ];
    let msgIndex = 0;
    setLoadingMsg(messages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = Math.min(msgIndex + 1, messages.length - 1);
      setLoadingMsg(messages[msgIndex]);
    }, 1200);

    try {
      const result = await generateAITrainingPlan({
        client,
        compDays,
        trainerNotes,
        athleteGoals,
        athleteFeel,
        coachNotes: client?.lastCoachNote || '',
      });
      clearInterval(msgInterval);
      if (result.success) {
        setPlan(result.plan);
        setGenerated(true);
        if (trainerId && client?.id) {
          await saveAIPlan(trainerId, client.id, result.plan);
        }
      } else {
        Alert.alert('AI Error', result.message || 'Could not generate plan.');
      }
    } catch (error) {
      clearInterval(msgInterval);
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
    setLoading(false);
    setLoadingMsg('');
  };

  const isSportPlayer = !!client?.sport && client.sport.toLowerCase() !== 'general';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}><View style={{flex:1}}>
      {/* Header */}
      {!hideHeader && (
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Training Plan</Text>
          <Text style={styles.headerSub}>{client?.name}</Text>
        </View>
        <View style={[styles.aiBadge]}>
          <MaterialCommunityIcons name="lightning-bolt" size={14} color={PALETTE.accent} />
          <Text style={styles.aiBadgeText}>AI Powered</Text>
        </View>
      </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Context inputs */}
        {!generated && (
          <View style={styles.inputSection}>
            {/* Comp days — inline stepper */}
            <View style={styles.compCard}>
              <MaterialCommunityIcons name="flag-checkered" size={20} color={
                compDays <= 3 ? PALETTE.danger : compDays <= 7 ? PALETTE.warning : PALETTE.accent
              } />
              <View style={{ flex: 1 }}>
                <Text style={styles.compLabel}>
                  {isSportPlayer ? 'Next competition' : 'Next event / target date'}
                </Text>
                <Text style={[styles.compDays, {
                  color: compDays <= 3 ? PALETTE.danger : compDays <= 7 ? PALETTE.warning : PALETTE.accent
                }]}>
                  {compDays === 0 ? 'Game day!' : `${compDays} days away`}
                </Text>
              </View>
              <View style={styles.compStepper}>
                <TouchableOpacity
                  style={styles.compStepBtn}
                  onPress={() => {
                    const n = Math.max(0, compDays - 1);
                    setCompDays(n);
                    AsyncStorage.setItem('fitgrade_comp_days', String(n));
                  }}
                >
                  <MaterialCommunityIcons name="minus" size={16} color={PALETTE.text} />
                </TouchableOpacity>
                <Text style={[styles.compStepNum, {
                  color: compDays <= 3 ? PALETTE.danger : compDays <= 7 ? PALETTE.warning : PALETTE.accent
                }]}>{compDays}</Text>
                <TouchableOpacity
                  style={styles.compStepBtn}
                  onPress={() => {
                    const n = Math.min(365, compDays + 1);
                    setCompDays(n);
                    AsyncStorage.setItem('fitgrade_comp_days', String(n));
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={16} color={PALETTE.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Trainer notes — FIRST so always visible */}
            {canEnterNotes && (
              <>
                <Text style={styles.inputLabel}>Your notes & targets for this client</Text>
                <TextInput
                  style={[styles.input, { color: PALETTE.text }]}
                  placeholder="e.g. Focus on leg recovery, reduce intensity, prep for Saturday game..."
                  placeholderTextColor={PALETTE.muted}
                  value={trainerNotes}
                  onChangeText={setTrainerNotes}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {trainerNotes.length > 0 && (
                  <TouchableOpacity style={styles.doneBtn} onPress={() => Keyboard.dismiss()}>
                    <MaterialCommunityIcons name="keyboard-close" size={14} color={PALETTE.accent} />
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* How athlete feels */}
            {canEnterGoals && (
              <>
                <Text style={styles.inputLabel}>
                  {role === 'athlete' ? 'How do you feel today? (1-10)' : 'Athlete self-reported feel (1-10)'}
                </Text>
                <View style={styles.feelRow}>
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <TouchableOpacity
                      key={n}
                      onPress={() => setAthleteFeel(String(n))}
                      style={[styles.feelBtn, athleteFeel === String(n) && styles.feelBtnActive]}
                    >
                      <Text style={[styles.feelBtnText, athleteFeel === String(n) && styles.feelBtnTextActive]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>
                  {role === 'athlete' ? 'Your personal goals' : 'Athlete personal goals'}
                </Text>
                <TextInput
                  style={[styles.input, { color: PALETTE.text }]}
                  placeholder={role === 'athlete'
                    ? "e.g. Run a 5k, lose 10lbs, improve flexibility..."
                    : "Goals the athlete has shared..."}
                  placeholderTextColor={PALETTE.muted}
                  value={athleteGoals}
                  onChangeText={setAthleteGoals}
                  multiline
                  numberOfLines={3}
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.generateBtn, loading && { opacity: 0.7 }]}
              onPress={handleGenerate}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="lightning-bolt" size={20} color="#fff" />
                  <Text style={styles.generateBtnText}>Generate AI Plan</Text>
                </>
              )}
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingWrap}>
                <Text style={styles.loadingMsg}>{loadingMsg}</Text>
                <View style={styles.loadingDots}>
                  {['Analyzing health grades...','Reviewing injury flags...','Building weekly schedule...','Calibrating intensity levels...','Finalizing your plan...'].map((m, i) => (
                    <View key={i} style={[
                      styles.loadingDot,
                      m === loadingMsg && { backgroundColor: PALETTE.accent, width: 16 },
                      ['Analyzing health grades...','Reviewing injury flags...','Building weekly schedule...','Calibrating intensity levels...','Finalizing your plan...'].indexOf(loadingMsg) > i && { backgroundColor: PALETTE.success },
                    ]} />
                  ))}
                </View>
                <Text style={styles.loadingHint}>Usually takes 5-10 seconds</Text>
              </View>
            )}
          </View>
        )}

        {/* Generated plan */}
        {plan && (
          <View style={styles.planSection}>
            {/* Regenerate button */}
            <TouchableOpacity
              onPress={() => { setGenerated(false); setPlan(null); }}
              style={styles.regenerateBtn}
            >
              <MaterialCommunityIcons name="refresh" size={14} color={PALETTE.accent} />
              <Text style={styles.regenerateBtnText}>Regenerate</Text>
            </TouchableOpacity>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <MaterialCommunityIcons name="brain" size={18} color={PALETTE.accent} />
                <Text style={styles.summaryTitle}>AI Assessment</Text>
              </View>
              <Text style={styles.summaryText}>{plan.summary}</Text>
            </View>

            {/* Risk flags */}
            {plan.riskFlags?.length > 0 && (
              <View style={styles.riskSection}>
                <Text style={styles.sectionLabel}>⚠ RISK FLAGS</Text>
                {plan.riskFlags.map((flag, i) => (
                  <RiskFlag key={i} text={flag} />
                ))}
              </View>
            )}

            {/* Weekly schedule — visual calendar grid */}
            <Text style={styles.sectionLabel}>WEEKLY SCHEDULE</Text>
            <View style={styles.calendarGrid}>
              {plan.weeklySchedule?.map((day) => {
                const meta = DAY_COLORS[day.type] || DAY_COLORS.Rest;
                return (
                  <TouchableOpacity
                    key={day.day}
                    style={[styles.calendarCell, { backgroundColor: meta.bg, borderColor: meta.border }]}
                    onPress={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.calendarDayName}>{day.day.slice(0, 3).toUpperCase()}</Text>
                    <MaterialCommunityIcons name={meta.icon} size={20} color={meta.text} />
                    <Text style={[styles.calendarDayType, { color: meta.text }]}>{day.type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expanded day — editable */}
            {expandedDay && plan.weeklySchedule && (() => {
              const dayIndex = plan.weeklySchedule.findIndex(d => d.day === expandedDay);
              const day = plan.weeklySchedule[dayIndex];
              const meta = DAY_COLORS[day?.type] || DAY_COLORS.Rest;
              return (
                <View style={[styles.dayDetail, { borderColor: meta.border }]}>
                  <Text style={[styles.dayDetailTitle, { color: meta.text }]}>{day?.day}</Text>

                  {/* Editable focus */}
                  <TextInput
                    style={styles.dayEditInput}
                    value={day?.focus || ''}
                    onChangeText={(v) => {
                      const updated = [...plan.weeklySchedule];
                      updated[dayIndex] = { ...updated[dayIndex], focus: v };
                      setPlan((prev) => ({ ...prev, weeklySchedule: updated }));
                    }}
                    placeholder="Focus / workout type..."
                    placeholderTextColor={PALETTE.muted}
                    color={PALETTE.text}
                  />

                  {/* Editable notes */}
                  <TextInput
                    style={[styles.dayEditInput, { minHeight: 60 }]}
                    value={day?.notes || ''}
                    onChangeText={(v) => {
                      const updated = [...plan.weeklySchedule];
                      updated[dayIndex] = { ...updated[dayIndex], notes: v };
                      setPlan((prev) => ({ ...prev, weeklySchedule: updated }));
                    }}
                    placeholder="Session details, exercises, notes..."
                    placeholderTextColor={PALETTE.muted}
                    multiline
                    color={PALETTE.text}
                  />

                  {/* Day type selector */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.dayTypeRow}>
                      {Object.keys(DAY_COLORS).map((type) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            const updated = [...plan.weeklySchedule];
                            updated[dayIndex] = { ...updated[dayIndex], type };
                            setPlan((prev) => ({ ...prev, weeklySchedule: updated }));
                          }}
                          style={[styles.dayTypeBtn,
                            day.type === type && { backgroundColor: DAY_COLORS[type].border, borderColor: DAY_COLORS[type].text }
                          ]}
                        >
                          <MaterialCommunityIcons name={DAY_COLORS[type].icon} size={13} color={DAY_COLORS[type].text} />
                          <Text style={[styles.dayTypeBtnText, { color: DAY_COLORS[type].text }]}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })()}

            {/* Next session focus */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>NEXT SESSION FOCUS</Text>
              <Text style={styles.infoCardText}>{plan.nextSessionFocus}</Text>
            </View>

            {/* Goal progress */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>GOAL PROGRESS</Text>
              <Text style={styles.infoCardText}>{plan.goalProgress}</Text>
            </View>

            {/* Comp readiness */}
            <View style={[styles.infoCard, { borderColor: PALETTE.accent + '44' }]}>
              <Text style={styles.infoCardLabel}>
                {isSportPlayer ? '🏆 COMPETITION READINESS' : '🎯 COMPLETION PROGRESS'}
              </Text>
              <Text style={styles.infoCardText}>{plan.compReadiness}</Text>
            </View>

            <Text style={styles.disclaimer}>
              AI-generated plan. Always consult a medical professional for injury-related decisions.
            </Text>
          </View>
        )}
      </ScrollView>
      </View></TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider, gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { color: PALETTE.text, fontSize: 18, fontWeight: '800' },
  headerSub: { color: PALETTE.muted, fontSize: 12, marginTop: 2 },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PALETTE.accentSoft, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: PALETTE.accent,
  },
  aiBadgeText: { color: PALETTE.accent, fontSize: 11, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  inputSection: { gap: 12 },
  compStepper: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  compStepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: PALETTE.panelAlt, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  compStepNum: {
    fontSize: 20, fontWeight: '900', minWidth: 32, textAlign: 'center',
  },
  compCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 14,
  },
  compLabel: { color: PALETTE.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  compDays: { fontSize: 20, fontWeight: '800', marginTop: 2 },

  inputLabel: {
    color: PALETTE.silver, fontSize: 13, fontWeight: '700',
    marginTop: 4, marginBottom: 4,
  },
  feelRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  feelBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: PALETTE.panel, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  feelBtnActive: { backgroundColor: PALETTE.accentSoft, borderColor: PALETTE.accent },
  feelBtnText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  feelBtnTextActive: { color: PALETTE.accent },

  input: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, padding: 14, fontSize: 14,
    minHeight: 90, textAlignVertical: 'top',
    includeFontPadding: false,
  },

  doneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end', marginTop: 4, marginBottom: 8,
    backgroundColor: PALETTE.accentSoft, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.accent,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  doneBtnText: { color: PALETTE.accent, fontSize: 12, fontWeight: '800' },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 14,
    paddingVertical: 14, marginTop: 4,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loadingWrap: {
    alignItems: 'center', paddingVertical: 16, gap: 10,
  },
  loadingMsg: {
    color: PALETTE.text, fontSize: 14, fontWeight: '700', textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
  },
  loadingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: PALETTE.border,
  },
  loadingHint: {
    color: PALETTE.muted, fontSize: 12, textAlign: 'center',
    lineHeight: 18, marginTop: 4,
  },

  planSection: { gap: 10 },
  regenerateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: PALETTE.accentSoft, borderRadius: 999,
    borderWidth: 1, borderColor: PALETTE.accent,
  },
  regenerateBtnText: { color: PALETTE.accent, fontSize: 12, fontWeight: '700' },

  summaryCard: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.accent + '44',
    padding: 14,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryTitle: { color: PALETTE.accent, fontSize: 14, fontWeight: '800' },
  summaryText: { color: PALETTE.text, fontSize: 14, lineHeight: 21 },

  sectionLabel: {
    color: PALETTE.muted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginTop: 4, marginBottom: 4,
  },

  riskSection: { gap: 8 },
  riskFlag: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PALETTE.dangerSoft, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.danger + '33',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  riskFlagText: { color: PALETTE.danger, fontSize: 13, fontWeight: '600', flex: 1 },

  dayCard: {
    borderRadius: 14, borderWidth: 1,
    padding: 12, marginBottom: 6,
    backgroundColor: PALETTE.panel, borderColor: PALETTE.border,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  calendarCell: {
    width: '13%',
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
  },
  calendarDayName: {
    color: PALETTE.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  calendarDayType: {
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  dayEditInput: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 10, fontSize: 13, color: PALETTE.text,
    marginBottom: 8,
  },
  dayTypeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dayTypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: PALETTE.panelAlt,
  },
  dayTypeBtnText: { fontSize: 11, fontWeight: '700' },
  dayDetail: {
    backgroundColor: PALETTE.panel,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  dayDetailTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  dayDetailNotes: {
    color: PALETTE.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  dayCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayCardLeft: { gap: 4 },
  dayName: { color: PALETTE.text, fontSize: 14, fontWeight: '800' },
  dayTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dayType: { fontSize: 11, fontWeight: '700' },
  dayCardRight: { flex: 1, alignItems: 'flex-end', gap: 4 },
  dayFocus: { fontSize: 12, fontWeight: '600', textAlign: 'right', flex: 1 },
  dayNotes: {
    color: PALETTE.muted, fontSize: 12, lineHeight: 18,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: PALETTE.divider,
  },

  infoCard: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, padding: 14,
  },
  infoCardLabel: {
    color: PALETTE.muted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.2, marginBottom: 8,
  },
  infoCardText: { color: PALETTE.text, fontSize: 14, lineHeight: 21 },

  disclaimer: {
    color: PALETTE.muted, fontSize: 11,
    textAlign: 'center', lineHeight: 16, marginTop: 8,
  },
});
