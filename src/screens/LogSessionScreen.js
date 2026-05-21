import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveSession, setAthleteCanEdit } from '../services/firebaseService';
import Toast from '../components/Toast';
import SessionTemplateModal from '../components/SessionTemplateModal';
import FloatingNoteInput from '../components/FloatingNoteInput';
import { getRecommendations, getRecommendationLevel } from '../data/recommendations';
import {
  BODY_PARTS,
  PALETTE,
  PART_META,
  getNumericGrade,
  getSeverityMeta,
  gradeColor,
} from '../ui/theme';

const INJURY_SEVERITY = ['Mild', 'Moderate', 'Severe'];

// ─── Single body part row ─────────────────────────────────────────────────────
function GradeRow({ part, grade, target, injured, injuryNote, injurySeverity,
  onGradeChange, onTargetChange, onInjuryToggle, onInjuryNoteChange,
  onSeverityChange, canEdit, simpleMode = false, onPerformanceChange }) {

  const color = gradeColor(grade);
  const severity = getSeverityMeta(grade);
  const [expanded, setExpanded] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const recs = getRecommendations(part, grade);
  const recLevel = getRecommendationLevel(grade);

  return (
    <View style={[
      styles.partCard,
      injured && { borderColor: PALETTE.danger + '55' },
      grade < 70 && !injured && { borderColor: PALETTE.danger + '44', shadowColor: PALETTE.danger, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
      grade >= 70 && grade < 90 && { borderColor: PALETTE.warning + '33' },
    ]}>
      {/* Urgency strip */}
      <View style={[styles.partUrgencyStrip, {
        backgroundColor: grade < 70 ? PALETTE.danger : grade < 90 ? PALETTE.warning : PALETTE.success
      }]} />
      {/* Always visible row — icon, name, stepper, injury flag */}
      <View style={styles.partHeader}>
        <View style={[styles.partIconWrap, { backgroundColor: severity.soft }]}>
          <MaterialCommunityIcons name={PART_META[part].icon} size={18} color={color} />
        </View>
        <Text style={styles.partName}>{part}</Text>

        <View style={styles.partRight}>
          {/* Stepper — always visible */}
          {canEdit ? (
            <View style={styles.stepperWrap}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onGradeChange(part, String(Math.max(0, grade - 5)))}
              >
                <MaterialCommunityIcons name="minus" size={16} color={PALETTE.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.numInput, { color }]}
                value={String(grade)}
                onChangeText={(v) => onGradeChange(part, v)}
                keyboardType="numeric"
                maxLength={3}
                selectTextOnFocus
              />
              <Text style={[styles.pct, { color }]}>%</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onGradeChange(part, String(Math.min(100, grade + 5)))}
              >
                <MaterialCommunityIcons name="plus" size={16} color={PALETTE.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.partGradeText, { color }]}>{grade}%</Text>
          )}

          {/* Injury flag */}
          {canEdit && (
            <TouchableOpacity
              onPress={() => onInjuryToggle(part, !injured)}
              style={[styles.injuryBtn, injured && { backgroundColor: PALETTE.danger, borderColor: PALETTE.danger }]}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={13} color={injured ? '#fff' : PALETTE.muted} />
              <Text style={[styles.injuryBtnText, injured && { color: '#fff' }]}>
                {injured ? 'Injured' : 'Flag'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Expand for details */}
          <TouchableOpacity onPress={() => setExpanded(!expanded)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18} color={PALETTE.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${grade}%`, backgroundColor: color }]} />
        {target > 0 && <View style={[styles.targetMarker, { left: `${target}%` }]} />}
      </View>

      {/* Expanded — target, injury details, recommendations */}
      {expanded && (
        <View style={styles.expanded}>
          {canEdit && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Target grade</Text>
              <View style={styles.numInputWrap}>
                <TextInput
                  style={[styles.numInput, { color: PALETTE.accent }]}
                  value={target > 0 ? String(target) : ''}
                  onChangeText={(v) => onTargetChange(part, v)}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="—"
                  placeholderTextColor={PALETTE.muted}
                  selectTextOnFocus
                />
                <Text style={[styles.pct, { color: PALETTE.accent }]}>%</Text>
              </View>
            </View>
          )}

          {injured && (
            <View style={styles.injuryBox}>
              <Text style={styles.injuryBoxLabel}>INJURY DETAILS</Text>
              {canEdit ? (
                <>
                  {!simpleMode && (
                    <View style={styles.severityRow}>
                      {INJURY_SEVERITY.map((s) => (
                        <TouchableOpacity key={s} onPress={() => onSeverityChange(part, s)}
                          style={[styles.sevBtn, injurySeverity === s && styles.sevBtnActive]}>
                          <Text style={[styles.sevBtnText, injurySeverity === s && styles.sevBtnTextActive]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <TextInput
                    style={styles.injuryNoteInput}
                    placeholder={simpleMode ? "What hurts? Describe in plain English..." : "Describe injury, symptoms, restrictions..."}
                    placeholderTextColor={PALETTE.muted}
                    value={injuryNote}
                    onChangeText={(v) => onInjuryNoteChange(part, v)}
                    multiline
                    color={PALETTE.text}
                  />
                </>
              ) : (
                <>
                  {injurySeverity && !simpleMode && (
                    <View style={styles.readOnlyRow}>
                      <MaterialCommunityIcons name="medical-bag" size={14} color={PALETTE.danger} />
                      <Text style={[styles.readOnlyText, { color: PALETTE.danger }]}>{injurySeverity} severity</Text>
                    </View>
                  )}
                  {injuryNote ? <Text style={styles.injuryNoteReadOnly}>{injuryNote}</Text> : null}
                </>
              )}
            </View>
          )}

          {/* Performance tracking — weight/reps for strength mode */}
          {canEdit && !simpleMode && expanded && (
            <View style={styles.performanceSection}>
              <Text style={styles.performanceLabel}>PERFORMANCE TRACKING</Text>
              <View style={styles.performanceRow}>
                <View style={styles.performanceField}>
                  <Text style={styles.performanceFieldLabel}>Weight (lbs/kg)</Text>
                  <TextInput
                    style={styles.performanceInput}
                    placeholder="e.g. 225"
                    placeholderTextColor={PALETTE.muted}
                    keyboardType="numeric"
                    maxLength={6}
                    color={PALETTE.text}
                    onChangeText={(v) => onPerformanceChange?.(part, 'weight', v)}
                  />
                </View>
                <View style={styles.performanceField}>
                  <Text style={styles.performanceFieldLabel}>Reps</Text>
                  <TextInput
                    style={styles.performanceInput}
                    placeholder="e.g. 8"
                    placeholderTextColor={PALETTE.muted}
                    keyboardType="numeric"
                    maxLength={3}
                    color={PALETTE.text}
                    onChangeText={(v) => onPerformanceChange?.(part, 'reps', v)}
                  />
                </View>
                <View style={styles.performanceField}>
                  <Text style={styles.performanceFieldLabel}>Sets</Text>
                  <TextInput
                    style={styles.performanceInput}
                    placeholder="e.g. 3"
                    placeholderTextColor={PALETTE.muted}
                    keyboardType="numeric"
                    maxLength={2}
                    color={PALETTE.text}
                    onChangeText={(v) => onPerformanceChange?.(part, 'sets', v)}
                  />
                </View>
              </View>
            </View>
          )}
          {!simpleMode && (
            <TouchableOpacity
              style={[styles.recToggle, { borderColor: recLevel.color + '44' }]}
              onPress={() => setShowRecs(!showRecs)}
              activeOpacity={0.8}
            >
              <View style={styles.recToggleLeft}>
                <MaterialCommunityIcons name="dumbbell" size={13} color={recLevel.color} />
                <Text style={[styles.recToggleLabel, { color: recLevel.color }]}>{recLevel.label} Recommendations</Text>
              </View>
              <MaterialCommunityIcons name={showRecs ? 'chevron-up' : 'chevron-down'} size={15} color={PALETTE.muted} />
            </TouchableOpacity>
          )}

          {!simpleMode && showRecs && (
            <View style={styles.recList}>
              {recs.map((rec, i) => (
                <View key={i} style={styles.recItem}>
                  <View style={[styles.recDot, { backgroundColor: recLevel.color }]} />
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LogSessionScreen({ client, trainerId, onBack, onSaved, role = 'trainer', trainerMode = 'training' }) {
  const isSimpleMode = trainerMode === 'parent';
  const canEdit = role === 'trainer' || (role === 'athlete' && client?.athleteCanEdit);

  const [grades, setGrades] = useState(() =>
    Object.fromEntries(BODY_PARTS.map((p) => [p, getNumericGrade(client?.[p], 100)]))
  );
  const [targets, setTargets] = useState(() =>
    Object.fromEntries(BODY_PARTS.map((p) => [p, client?.targets?.[p] ?? 0]))
  );
  const [injuries, setInjuries] = useState(() =>
    Object.fromEntries(BODY_PARTS.map((p) => [p, client?.injuries?.[p] ?? false]))
  );
  const [injuryNotes, setInjuryNotes] = useState(() =>
    Object.fromEntries(BODY_PARTS.map((p) => [p, client?.injuryNotes?.[p] ?? '']))
  );
  const [injurySeverities, setInjurySeverities] = useState(() =>
    Object.fromEntries(BODY_PARTS.map((p) => [p, client?.injurySeverities?.[p] ?? 'Mild']))
  );
  const [sessionNote, setSessionNote] = useState('');
  const [athleteCanEdit, setAthleteCanEditLocal] = useState(client?.athleteCanEdit ?? false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [performance, setPerformance] = useState({});
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  const handlePerformanceChange = (part, field, val) => {
    setPerformance((prev) => ({
      ...prev,
      [part]: { ...(prev[part] || {}), [field]: val },
    }));
  };

  const handleGradeChange = (part, val) => {
    const parsed = Math.max(0, Math.min(100, parseInt(val) || 0));
    setGrades((prev) => ({ ...prev, [part]: parsed }));
  };

  const handleTargetChange = (part, val) => {
    const parsed = Math.max(0, Math.min(100, parseInt(val) || 0));
    setTargets((prev) => ({ ...prev, [part]: parsed }));
  };

  const handleSave = async () => {
    if (!trainerId || !client?.id) {
      Alert.alert('Error', 'Missing trainer or client info.');
      return;
    }

    // ⚠️ Grade change alert — flag 20%+ jumps with no note
    const bigJumps = BODY_PARTS.filter((part) => {
      const prev = getNumericGrade(client?.[part], 100);
      const curr = grades[part];
      return Math.abs(curr - prev) >= 20;
    });
    if (bigJumps.length > 0 && !sessionNote.trim()) {
      Alert.alert(
        '⚠️ Significant Change Detected',
        `${bigJumps.join(', ')} changed by 20% or more.\n\nPlease add a session note explaining why before saving.`,
        [{ text: 'Add Note', style: 'default' }]
      );
      return;
    }

    // Clearance check — if avg drops below 60 require explanation
    const newAvg = Math.round(BODY_PARTS.reduce((sum, p) => sum + grades[p], 0) / BODY_PARTS.length);
    const prevAvg = getNumericGrade(client ? Math.round(BODY_PARTS.reduce((sum, p) => sum + getNumericGrade(client[p], 100), 0) / BODY_PARTS.length) : 100);
    if (newAvg < 60 && !sessionNote.trim()) {
      Alert.alert(
        '🚫 Clearance Required',
        `This athlete's overall score is ${newAvg}% — below the clearance threshold of 60%.\n\nPlease add a session note before saving. This protects you legally.`,
        [{ text: 'Add Note', style: 'default' }]
      );
      return;
    }

    setSaving(true);

    // Save session to Firebase
    const result = await saveSession(trainerId, client.id, {
      grades,
      targets,
      injuries,
      injuryNotes,
      injurySeverities,
      sessionNote,
      performance,
    });

    // Save athlete edit permission if changed
    if (role === 'trainer' && athleteCanEdit !== client?.athleteCanEdit) {
      await setAthleteCanEdit(trainerId, client.id, athleteCanEdit);
    }

    setSaving(false);

    if (!result.success) {
      Alert.alert('Save Failed', result.message || 'Could not save session.');
      return;
    }

    // Return updated client data to parent
    onSaved?.({
      ...grades,
      targets,
      injuries,
      injuryNotes,
      injurySeverities,
      athleteCanEdit,
    });

    setToastMsg('Session saved ✓');
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      onBack();
    }, 1800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <Toast message={toastMsg} visible={toastVisible} type="success" />
          <SessionTemplateModal
            visible={showTemplates}
            onClose={() => setShowTemplates(false)}
            currentGrades={grades}
            currentTargets={targets}
            onLoad={(t) => {
              setGrades(t.grades);
              setTargets(t.targets);
            }}
          />
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {role === 'trainer' ? 'Log Session' : role === 'athlete' ? 'My Status' : 'View Only'}
              </Text>
              <Text style={styles.headerSub}>{client?.name}</Text>
            </View>
            {canEdit && (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowTemplates(true)} style={styles.templateBtn}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={PALETTE.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>Save</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Role banner */}
          <View style={[styles.roleBanner, {
            backgroundColor: role === 'trainer' ? PALETTE.accentSoft : role === 'athlete' ? '#162316' : PALETTE.panelAlt,
            borderColor: role === 'trainer' ? PALETTE.accent : role === 'athlete' ? PALETTE.success : PALETTE.muted,
          }]}>
            <MaterialCommunityIcons
              name={role === 'trainer' ? 'clipboard-edit-outline' : role === 'athlete' ? 'account-outline' : 'eye-outline'}
              size={14}
              color={role === 'trainer' ? PALETTE.accent : role === 'athlete' ? PALETTE.success : PALETTE.muted}
            />
            <Text style={[styles.roleBannerText, {
              color: role === 'trainer' ? PALETTE.accent : role === 'athlete' ? PALETTE.success : PALETTE.muted,
            }]}>
              {role === 'trainer' ? 'Trainer — full edit + saves to Firebase' :
               role === 'athlete' ? canEdit ? 'Athlete — edit enabled by trainer' : 'Athlete — read only' :
               'Coach — read only'}
            </Text>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {BODY_PARTS.map((part) => (
              <GradeRow
                key={part}
                part={part}
                grade={grades[part]}
                target={targets[part]}
                injured={injuries[part]}
                injuryNote={injuryNotes[part]}
                injurySeverity={injurySeverities[part]}
                canEdit={canEdit}
                simpleMode={isSimpleMode}
                onGradeChange={handleGradeChange}
                onTargetChange={handleTargetChange}
                onInjuryToggle={(p, v) => setInjuries((prev) => ({ ...prev, [p]: v }))}
                onInjuryNoteChange={(p, v) => setInjuryNotes((prev) => ({ ...prev, [p]: v }))}
                onSeverityChange={(p, v) => setInjurySeverities((prev) => ({ ...prev, [p]: v }))}
                onPerformanceChange={handlePerformanceChange}
              />
            ))}

            {/* Session note — pops to top when focused */}
            {role === 'trainer' && (
              <View style={styles.noteSection}>
                <Text style={styles.sectionLabel}>SESSION NOTES</Text>
                <TouchableOpacity
                  style={styles.notePreview}
                  onPress={() => { setNoteDraft(sessionNote); setNoteModalVisible(true); }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={15} color={PALETTE.muted} />
                  <Text style={[styles.notePreviewText, sessionNote && { color: PALETTE.text }]} numberOfLines={2}>
                    {sessionNote || 'Tap to add session notes...'}
                  </Text>
                  {sessionNote.length > 0 && (
                    <View style={styles.noteCharCount}>
                      <Text style={styles.noteCharCountText}>{sessionNote.length} chars</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Full screen note editor */}
                <Modal visible={noteModalVisible} animationType="slide" transparent={false} onRequestClose={() => setNoteModalVisible(false)}>
                  <SafeAreaView style={styles.noteModalRoot}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                      {/* Header */}
                      <View style={styles.noteModalHeader}>
                        <TouchableOpacity onPress={() => { setNoteDraft(sessionNote); setNoteModalVisible(false); }}>
                          <Text style={styles.noteModalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.noteModalTitle}>Session Notes</Text>
                        <TouchableOpacity onPress={() => { setSessionNote(noteDraft); Keyboard.dismiss(); setNoteModalVisible(false); }}>
                          <Text style={styles.noteModalDoneText}>Save</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Input at top */}
                      <TextInput
                        style={styles.noteModalInput}
                        placeholder="Overall observations, next steps, injury updates, how the session went..."
                        placeholderTextColor={PALETTE.muted}
                        value={noteDraft}
                        onChangeText={setNoteDraft}
                        multiline
                        autoFocus
                        textAlignVertical="top"
                        color={PALETTE.text}
                      />

                      {/* Quick suggestions */}
                      <View style={styles.noteSuggestions}>
                        <Text style={styles.noteSuggestLabel}>Quick add:</Text>
                        <View style={styles.noteSuggestRow}>
                          {[
                            'Great session',
                            'Needs recovery',
                            'Cleared for intensity',
                            'Monitor closely',
                            'Reduce load next session',
                            'Ready for game day',
                          ].map((s) => (
                            <TouchableOpacity
                              key={s}
                              style={styles.noteSuggestPill}
                              onPress={() => setNoteDraft((prev) => prev ? `${prev}. ${s}` : s)}
                            >
                              <Text style={styles.noteSuggestText}>{s}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </KeyboardAvoidingView>
                  </SafeAreaView>
                </Modal>
              </View>
            )}

            {/* Athlete edit permission */}
            {role === 'trainer' && (
              <View style={styles.permRow}>
                <View style={styles.permLeft}>
                  <MaterialCommunityIcons name="account-edit-outline" size={18} color={PALETTE.silver} />
                  <View>
                    <Text style={styles.permLabel}>Allow athlete to edit</Text>
                    <Text style={styles.permHint}>Athlete can update their own grades</Text>
                  </View>
                </View>
                <Switch
                  value={athleteCanEdit}
                  onValueChange={setAthleteCanEditLocal}
                  trackColor={{ false: PALETTE.panelAlt, true: PALETTE.accentSoft }}
                  thumbColor={athleteCanEdit ? PALETTE.accent : PALETTE.silverDark}
                />
              </View>
            )}

          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
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
  saveBtn: {
    backgroundColor: PALETTE.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8, minWidth: 60, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  roleBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1,
  },
  roleBannerText: { fontSize: 12, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  partCard: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    marginBottom: 10, overflow: 'hidden', position: 'relative',
  },
  partUrgencyStrip: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0, width: 3,
    borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
  },
  partHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  partIconWrap: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  partInfo: { flex: 1 },
  partName: { color: PALETTE.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  partHint: { color: PALETTE.muted, fontSize: 11 },
  partRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partGradeText: { fontSize: 18, fontWeight: '800' },
  templateBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PALETTE.accentSoft,
    borderWidth: 1, borderColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  recToggle: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9,
    marginTop: 8,
  },
  recToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recToggleLabel: { fontSize: 12, fontWeight: '700' },
  recList: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    padding: 10, marginTop: 4, gap: 8,
  },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  recDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  recText: { color: PALETTE.text, fontSize: 12, lineHeight: 18, flex: 1 },
  injuryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: PALETTE.panelAlt,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  injuryBtnText: {
    color: PALETTE.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  barTrack: {
    height: 4, backgroundColor: PALETTE.panelAlt,
    marginHorizontal: 14, marginBottom: 2, borderRadius: 999, overflow: 'visible',
  },
  barFill: { height: '100%', borderRadius: 999 },
  targetMarker: {
    position: 'absolute', top: -4, width: 2, height: 12,
    backgroundColor: PALETTE.accent, borderRadius: 1,
  },

  expanded: { padding: 14, paddingTop: 8, gap: 12 },

  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputLabel: { color: PALETTE.silver, fontSize: 13, fontWeight: '700' },
  stepperWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  stepperBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: PALETTE.panelAlt,
    borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  numInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  numInput: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    fontSize: 18, fontWeight: '800', minWidth: 56, textAlign: 'center',
    borderWidth: 1, borderColor: PALETTE.border,
  },
  pct: { fontSize: 16, fontWeight: '700' },

  readOnlyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readOnlyText: { color: PALETTE.accent, fontSize: 13, fontWeight: '700' },

  injuryBox: {
    backgroundColor: PALETTE.dangerSoft, borderRadius: 10,
    padding: 12, gap: 10,
    borderWidth: 1, borderColor: '#ef444433',
  },
  injuryBoxLabel: {
    color: PALETTE.danger, fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  severityRow: { flexDirection: 'row', gap: 8 },
  sevBtn: {
    flex: 1, paddingVertical: 7, borderRadius: 8,
    backgroundColor: PALETTE.panelAlt, alignItems: 'center',
    borderWidth: 1, borderColor: PALETTE.border,
  },
  sevBtnActive: { backgroundColor: PALETTE.danger, borderColor: PALETTE.danger },
  sevBtnText: { color: PALETTE.muted, fontSize: 12, fontWeight: '700' },
  sevBtnTextActive: { color: '#fff' },
  injuryNoteInput: {
    backgroundColor: PALETTE.panel, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, padding: 10, fontSize: 13,
    minHeight: 80, textAlignVertical: 'top',
  },
  injuryNoteReadOnly: { color: PALETTE.text, fontSize: 13, lineHeight: 19 },

  noteSection: { marginTop: 8, marginBottom: 4 },
  sectionLabel: {
    color: PALETTE.muted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8,
  },
  notePreview: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 14, minHeight: 56,
  },
  notePreviewText: { flex: 1, color: PALETTE.muted, fontSize: 14, lineHeight: 20 },
  noteCharCount: {
    backgroundColor: PALETTE.accentSoft, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  noteCharCountText: { color: PALETTE.accent, fontSize: 11, fontWeight: '700' },

  noteModalRoot: {
    flex: 1, backgroundColor: PALETTE.background,
  },
  noteModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
    backgroundColor: PALETTE.panel,
  },
  noteModalTitle: { color: PALETTE.text, fontSize: 15, fontWeight: '800' },
  noteModalCancel: { color: PALETTE.muted, fontSize: 15, fontWeight: '600' },
  noteModalDone: {
    backgroundColor: PALETTE.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  noteModalDoneText: { color: PALETTE.accent, fontSize: 15, fontWeight: '800' },
  noteModalInput: {
    flex: 1, color: PALETTE.text, fontSize: 16,
    lineHeight: 24, padding: 20, textAlignVertical: 'top',
  },
  noteSuggestions: { paddingHorizontal: 16, paddingBottom: 20 },
  noteSuggestLabel: {
    color: PALETTE.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  noteSuggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  noteSuggestPill: {
    backgroundColor: PALETTE.panel, borderRadius: 999,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  noteSuggestText: { color: PALETTE.silver, fontSize: 12, fontWeight: '600' },
  noteInput: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, padding: 14, fontSize: 14,
    minHeight: 110, textAlignVertical: 'top',
  },
  performanceSection: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.accent + '33',
    padding: 10, marginTop: 8,
  },
  performanceLabel: {
    color: PALETTE.accent, fontSize: 9, fontWeight: '800',
    letterSpacing: 1.2, marginBottom: 8,
  },
  performanceRow: { flexDirection: 'row', gap: 8 },
  performanceField: { flex: 1 },
  performanceFieldLabel: { color: PALETTE.muted, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  performanceInput: {
    backgroundColor: PALETTE.panel, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 8, paddingVertical: 7,
    fontSize: 14, fontWeight: '700', textAlign: 'center',
  },
  noteDoneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-end', marginTop: 6,
    backgroundColor: PALETTE.accentSoft, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.accent,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  noteDoneBtnText: { color: PALETTE.accent, fontSize: 12, fontWeight: '800' },

  permRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 14, gap: 12, marginTop: 8,
  },
  permLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  permLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  permHint: { color: PALETTE.muted, fontSize: 11 },
});
