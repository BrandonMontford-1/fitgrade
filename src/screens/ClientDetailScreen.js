import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BodyHologram from '../components/BodyHologram';
import ProgressChart from '../components/ProgressChart';
import PartDetailSheet from '../components/PartDetailSheet';
import LogSessionScreen from './LogSessionScreen';
import SessionHistoryScreen from './SessionHistoryScreen';
import AITrainingPlanScreen from './AITrainingPlanScreen';
import { TrainerJoinCodeModal } from '../components/JoinCodeModal';
import {
  BODY_PARTS,
  PALETTE,
  PART_META,
  FONT_SCALE,
  getAverageScore,
  getNumericGrade,
  getRecommendation,
  getSeverityMeta,
  gradeColor,
  getExerciseLink,
} from '../ui/theme';

// ─── Coach Note Input ─────────────────────────────────────────────────────────
function CoachNoteInput({ trainerId, clientData, onSaved }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { loadCoachNotes } = require('../services/firebaseService');
      const result = await loadCoachNotes(trainerId, clientData?.id);
      if (result.success) setHistory(result.data);
      setLoadingHistory(false);
    };
    if (trainerId && clientData?.id) fetch();
  }, [trainerId, clientData?.id]);

  const handleSend = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const { saveCoachNote } = require('../services/firebaseService');
    const result = await saveCoachNote(trainerId, clientData.id, note.trim(), 'Coach');
    setSaving(false);
    if (result.success) {
      const newNote = { note: note.trim(), coachName: 'Coach', createdAt: new Date().toISOString() };
      setHistory((prev) => [newNote, ...prev]);
      onSaved?.(note.trim());
      setSent(true);
      setNote('');
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <View style={coachStyles.wrap}>
      <View style={coachStyles.header}>
        <MaterialCommunityIcons name="whistle-outline" size={14} color="#a78bfa" />
        <Text style={coachStyles.label}>COACH OBSERVATIONS</Text>
        <View style={coachStyles.badge}>
          <Text style={coachStyles.badgeText}>View only · no grade access</Text>
        </View>
      </View>

      {/* Previous notes history */}
      {!loadingHistory && history.length > 0 && (
        <View style={coachStyles.historyWrap}>
          <Text style={coachStyles.historyLabel}>YOUR PREVIOUS NOTES</Text>
          {history.slice(0, 5).map((h, i) => (
            <View key={i} style={coachStyles.historyRow}>
              <View style={coachStyles.historyDot} />
              <View style={{ flex: 1 }}>
                <Text style={coachStyles.historyNote}>{h.note}</Text>
                <Text style={coachStyles.historyDate}>
                  {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* New note input */}
      <TextInput
        style={coachStyles.input}
        placeholder="Leave a note for the trainer and athlete — tactical observations, game-day concerns..."
        placeholderTextColor={PALETTE.muted}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        color={PALETTE.text}
        returnKeyType="done"
        blurOnSubmit
      />
      <TouchableOpacity
        style={[coachStyles.btn, (saving || sent) && { opacity: 0.7 }, sent && { backgroundColor: PALETTE.success }]}
        onPress={handleSend}
        disabled={saving || sent || !note.trim()}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name={sent ? 'check' : 'send-outline'} size={15} color="#fff" />
            <Text style={coachStyles.btnText}>{sent ? 'Sent to trainer & athlete!' : 'Send note'}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const coachStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#1a1528', borderRadius: 14,
    borderWidth: 1, borderColor: '#a78bfa44', padding: 12, gap: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { color: '#a78bfa', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, flex: 1 },
  badge: {
    backgroundColor: '#2a1a3a', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: '#a78bfa', fontSize: 9, fontWeight: '700' },
  input: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: '#a78bfa33',
    padding: 10, fontSize: 13, minHeight: 70, textAlignVertical: 'top',
  },
  historyWrap: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: '#a78bfa22', padding: 10, gap: 8,
  },
  historyLabel: { color: '#a78bfa', fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  historyRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  historyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a78bfa', marginTop: 5 },
  historyNote: { color: PALETTE.text, fontSize: 12, lineHeight: 17 },
  historyDate: { color: PALETTE.muted, fontSize: 10, marginTop: 2 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#a78bfa', borderRadius: 10, paddingVertical: 10,
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

const TABS = [
  { key: 'overview', icon: 'view-dashboard-outline', label: 'Overview' },
  { key: 'chart',    icon: 'chart-line',             label: 'Progress' },
  { key: 'history',  icon: 'clipboard-text-outline', label: 'History'  },
  { key: 'ai',       icon: 'lightning-bolt',          label: 'AI Plan'  },
];

const ROLES = [
  { key: 'trainer', label: 'Trainer', icon: 'clipboard-edit-outline', color: PALETTE.accent },
  { key: 'athlete', label: 'Athlete', icon: 'account-outline', color: '#22c55e' },
  { key: 'coach',   label: 'Coach',   icon: 'eye-outline',     color: PALETTE.muted },
];

export default function ClientDetailScreen({ client, trainerId, trainerMode, onBack }) {
  const [selectedPart, setSelectedPart] = useState('Core');
  const [sheetPart, setSheetPart] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [role, setRole] = useState('trainer');
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogSession, setShowLogSession] = useState(false);
  const [clientData, setClientData] = useState(client || {});
  const [refreshing, setRefreshing] = useState(false);
  const [pinnedNote, setPinnedNote] = useState(client?.pinnedNote || '');
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(client?.pinnedNote || '');
  const [sessionCount, setSessionCount] = useState(0);
  const [joinCodeVisible, setJoinCodeVisible] = useState(false);
  const [auditLogVisible, setAuditLogVisible] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [partSheetVisible, setPartSheetVisible] = useState(false);

  useEffect(() => {
    if (!trainerId || !clientData?.id) return;
    const fetchSessions = async () => {
      try {
        const { loadSessions } = require('../services/firebaseService');
        const result = await loadSessions(trainerId, clientData.id);
        if (result.success) setSessionCount(result.data.length);
      } catch (e) {}
    };
    fetchSessions();
  }, [clientData?.id, trainerId]);

  if (!client) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { loadClients, loadSessions } = require('../services/firebaseService');
      const result = await loadClients(trainerId);
      if (result.success && result.data[clientData.id]) {
        setClientData({ ...result.data[clientData.id], id: clientData.id });
      }
      const sessions = await loadSessions(trainerId, clientData.id);
      if (sessions.success) setSessionCount(sessions.data.length);
    } catch (e) {}
    setRefreshing(false);
  };

  const metrics = clientData || {};
  const avg = getAverageScore(metrics);
  const avgSeverity = getSeverityMeta(avg);
  const selGrade = getNumericGrade(metrics[selectedPart], 100);
  const selSeverity = getSeverityMeta(selGrade);
  const canEdit = role === 'trainer' || (role === 'athlete' && clientData?.athleteCanEdit);

  const handleSaved = (updatedData) => {
    setClientData((prev) => ({ ...prev, ...updatedData }));
    setSessionCount((prev) => prev + 1);
  };

  if (showLogSession) {
    return (
      <LogSessionScreen
        client={clientData}
        trainerId={trainerId}
        role={role}
        trainerMode={trainerMode || 'training'}
        onBack={() => setShowLogSession(false)}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <View style={styles.root}>
      {/* Join code modal */}
      <TrainerJoinCodeModal
        visible={joinCodeVisible}
        onClose={() => setJoinCodeVisible(false)}
        client={clientData}
        trainerId={trainerId}
      />

      {/* Audit log modal */}
      {auditLogVisible && (
        <View style={styles.auditOverlay}>
          <View style={styles.auditCard}>
            <View style={styles.auditHeader}>
              <Text style={styles.auditTitle}>Audit Log — {clientData?.name}</Text>
              <TouchableOpacity onPress={() => setAuditLogVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
              </TouchableOpacity>
            </View>
            {auditLog.length === 0 ? (
              <Text style={styles.auditEmpty}>No changes logged yet.</Text>
            ) : (
              auditLog.map((entry, i) => (
                <View key={i} style={styles.auditRow}>
                  <View style={styles.auditDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditWho}>
                      {entry.loggedBy === 'athlete' ? '🏃 Athlete self-report' : '📋 Trainer logged'}
                    </Text>
                    <Text style={styles.auditNote}>{entry.sessionNote || 'No note'}</Text>
                    <Text style={styles.auditTime}>
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}
      {/* Body Part Sheet */}
      <PartDetailSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        part={sheetPart}
        clientData={clientData}
        trainerId={trainerId}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{clientData?.name || 'Client'}</Text>
          <Text style={styles.headerSub}>
            {clientData?.sport
              ? clientData.sport.charAt(0).toUpperCase() + clientData.sport.slice(1)
              : 'General'}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: avgSeverity.color }]}>
          <Text style={[styles.scoreNum, { color: avgSeverity.color, fontSize: 18 * FONT_SCALE }]}>{avg}</Text>
          <Text style={styles.scoreLabel}>AVG</Text>
        </View>
      </View>

      {/* Role toggle */}
      <View style={styles.roleRow}>
        {ROLES.map((r) => {
          const active = role === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              onPress={() => setRole(r.key)}
              style={[styles.roleBtn, active && { backgroundColor: r.color + '22', borderColor: r.color }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={r.icon} size={13} color={active ? r.color : PALETTE.muted} />
              <Text style={[styles.roleBtnText, active && { color: r.color }]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={tab.icon} size={16} color={active ? PALETTE.accent : PALETTE.muted} />
              <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PALETTE.accent} />}
        >
          {/* Pinned note */}
          {(pinnedNote || role === 'trainer') && (
            <TouchableOpacity
              style={[styles.pinnedNote, !pinnedNote && styles.pinnedNotePlaceholder]}
              onPress={() => role === 'trainer' && setEditingNote(true)}
              activeOpacity={role === 'trainer' ? 0.8 : 1}
            >
              <MaterialCommunityIcons name="pin-outline" size={14} color={pinnedNote ? PALETTE.warning : PALETTE.muted} />
              {pinnedNote
                ? <Text style={styles.pinnedNoteText}>{pinnedNote}</Text>
                : <Text style={styles.pinnedNotePlaceholderText}>Tap to pin a note about this client</Text>
              }
              {role === 'trainer' && <MaterialCommunityIcons name="pencil-outline" size={13} color={PALETTE.muted} />}
            </TouchableOpacity>
          )}

          {/* Note editor modal */}
          <Modal visible={editingNote} transparent animationType="fade">
            <View style={styles.noteModalOverlay}>
              <View style={styles.noteModal}>
                <Text style={styles.noteModalTitle}>Pinned Note</Text>
                <TextInput
                  style={styles.noteModalInput}
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="e.g. Peanut allergy, prefers morning sessions, ACL history..."
                  placeholderTextColor={PALETTE.muted}
                  multiline
                  numberOfLines={4}
                  autoFocus
                  color={PALETTE.text}
                />
                <View style={styles.noteModalBtns}>
                  <TouchableOpacity style={styles.noteModalCancel} onPress={() => { setEditingNote(false); setNoteInput(pinnedNote); }}>
                    <Text style={styles.noteModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.noteModalSave}
                    onPress={async () => {
                      setPinnedNote(noteInput);
                      setEditingNote(false);
                      try {
                        const { updateClient } = require('../services/firebaseService');
                        await updateClient(trainerId, clientData.id, { pinnedNote: noteInput });
                      } catch (e) {}
                    }}
                  >
                    <Text style={styles.noteModalSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Hologram + pills */}
          <View style={styles.bodySection}>
            <View style={styles.gradeCol}>
              {['Head', 'Arm', 'Core'].map((part) => {
                const g = getNumericGrade(metrics[part]);
                const color = gradeColor(g);
                const active = selectedPart === part;
                const injured = clientData?.injuries?.[part];
                return (
                  <TouchableOpacity key={part}
                    onPress={() => { setSelectedPart(part); setSheetPart(part); setSheetVisible(true); }}
                    style={[styles.gradePill,
                      active && { borderColor: color, backgroundColor: color + '18', shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
                      injured && { borderColor: PALETTE.danger }]}>
                    {injured && <MaterialCommunityIcons name="alert-circle" size={9} color={PALETTE.danger} style={styles.injuryDot} />}
                    <MaterialCommunityIcons name={PART_META[part].icon} size={13} color={active ? color : PALETTE.muted} />
                    <Text style={[styles.pillPart, { color: active ? color : PALETTE.muted }]}>{part}</Text>
                    <Text style={[styles.pillNum, { color, fontSize: 16 * FONT_SCALE }]}>{g}%</Text>
                    {clientData?.targets?.[part] > 0 && <Text style={styles.pillTarget}>→{clientData.targets[part]}%</Text>}
                    <MaterialCommunityIcons name="chevron-up" size={10} color={PALETTE.muted} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.hologramWrap}>
              <BodyHologram metrics={metrics} selectedPart={selectedPart} onRegionPress={(part) => { setSelectedPart(part); setSheetPart(part); setSheetVisible(true); }} />
            </View>

            <View style={styles.gradeCol}>
              {['Leg', 'Foot'].map((part) => {
                const g = getNumericGrade(metrics[part]);
                const color = gradeColor(g);
                const active = selectedPart === part;
                const injured = clientData?.injuries?.[part];
                return (
                  <TouchableOpacity key={part}
                    onPress={() => { setSelectedPart(part); setSheetPart(part); setSheetVisible(true); }}
                    style={[styles.gradePill,
                      active && { borderColor: color, backgroundColor: color + '18', shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
                      injured && { borderColor: PALETTE.danger }]}>
                    {injured && <MaterialCommunityIcons name="alert-circle" size={9} color={PALETTE.danger} style={styles.injuryDot} />}
                    <MaterialCommunityIcons name={PART_META[part].icon} size={13} color={active ? color : PALETTE.muted} />
                    <Text style={[styles.pillPart, { color: active ? color : PALETTE.muted }]}>{part}</Text>
                    <Text style={[styles.pillNum, { color, fontSize: 16 * FONT_SCALE }]}>{g}%</Text>
                    {clientData?.targets?.[part] > 0 && <Text style={styles.pillTarget}>→{clientData.targets[part]}%</Text>}
                    <MaterialCommunityIcons name="chevron-up" size={10} color={PALETTE.muted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Grade legend */}
          <View style={styles.gradeLegend}>
            {[
              { color: '#22c55e', label: 'Optimal 90-100%' },
              { color: '#f59e0b', label: 'Monitor 70-89%' },
              { color: '#ef4444', label: 'Rehab 0-69%' },
            ].map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>

          {sessionCount > 0 && (
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={14} color="#f97316" />
              <Text style={styles.streakText}>{sessionCount} session{sessionCount > 1 ? 's' : ''} logged</Text>
            </View>
          )}

          {/* Analysis card */}
          <View style={[styles.analysisCard, { borderColor: selSeverity.color + '44' }]}>
            <View style={styles.analysisRow}>
              <View style={[styles.analysisIcon, { backgroundColor: selSeverity.soft }]}>
                <MaterialCommunityIcons name={PART_META[selectedPart]?.icon ?? 'pulse'} size={20} color={selSeverity.color} />
              </View>
              <View style={styles.analysisCopy}>
                <Text style={[styles.analysisPartName, { color: selSeverity.color }]}>{selectedPart} · {selGrade}%</Text>
                <Text style={styles.analysisPartHint}>
                  {trainerMode === 'parent'
                    ? PART_META[selectedPart]?.plainHint
                    : PART_META[selectedPart]?.shortHint || ''}
                </Text>
                <Text style={styles.analysisRec}>{getRecommendation(selectedPart, selGrade)}</Text>
                {clientData?.injuries?.[selectedPart] && (
                  <Text style={styles.injuryWarning}>
                    ⚠ {clientData.injurySeverities?.[selectedPart] || 'Mild'} injury flagged
                    {clientData.injuryNotes?.[selectedPart] ? ` · ${clientData.injuryNotes[selectedPart]}` : ''}
                  </Text>
                )}
              </View>
              <View style={[styles.analysisBadge, { backgroundColor: selSeverity.soft }]}>
                <Text style={[styles.analysisBadgeText, { color: selSeverity.color }]}>{selSeverity.label}</Text>
              </View>
            </View>

            {/* Exercise link */}
            {(() => {
              const ex = getExerciseLink(selectedPart, selGrade);
              if (!ex) return null;
              return (
                <TouchableOpacity
                  style={styles.exerciseLink}
                  onPress={() => {
                    const { Linking } = require('react-native');
                    Linking.openURL(ex.url);
                  }}
                >
                  <Text style={styles.exerciseLinkThumb}>{ex.thumb}</Text>
                  <View style={styles.exerciseLinkInfo}>
                    <Text style={styles.exerciseLinkLabel}>RECOMMENDED EXERCISE</Text>
                    <Text style={styles.exerciseLinkText}>{ex.text}</Text>
                  </View>
                  <MaterialCommunityIcons name="youtube" size={22} color="#ff0000" />
                </TouchableOpacity>
              );
            })()}
          </View>

          {/* Coach note — visible to trainer and athlete */}
          {clientData?.lastCoachNote && role !== 'coach' && (
            <View style={styles.coachNoteCard}>
              <View style={styles.sessionNoteHeader}>
                <MaterialCommunityIcons name="whistle-outline" size={13} color="#a78bfa" />
                <Text style={[styles.sessionNoteLabel, { color: '#a78bfa' }]}>
                  COACH NOTE — {clientData.lastCoachName || 'Coach'}
                </Text>
              </View>
              <Text style={styles.sessionNoteText}>{clientData.lastCoachNote}</Text>
            </View>
          )}

          {/* Coach input — only visible to coach */}
          {role === 'coach' && (
            <CoachNoteInput
              trainerId={trainerId}
              clientData={clientData}
              onSaved={(note) => setClientData((prev) => ({ ...prev, lastCoachNote: note }))}
            />
          )}
          {clientData?.lastSessionNote ? (
            <View style={[
              styles.sessionNoteCard,
              clientData.lastSessionNote.includes('[Athlete self-report]') && {
                backgroundColor: '#0a1a0a',
                borderColor: PALETTE.success + '44',
              }
            ]}>
              <View style={styles.sessionNoteHeader}>
                <MaterialCommunityIcons
                  name={clientData.lastSessionNote.includes('[Athlete self-report]') ? 'account-outline' : 'note-text-outline'}
                  size={14}
                  color={clientData.lastSessionNote.includes('[Athlete self-report]') ? PALETTE.success : PALETTE.accent}
                />
                <Text style={[
                  styles.sessionNoteLabel,
                  clientData.lastSessionNote.includes('[Athlete self-report]') && { color: PALETTE.success }
                ]}>
                  {clientData.lastSessionNote.includes('[Athlete self-report]') ? 'ATHLETE SELF-REPORT' : 'TRAINER\'S LAST NOTE'}
                </Text>
              </View>
              <Text style={styles.sessionNoteText}>
                {clientData.lastSessionNote.replace('[Athlete self-report] ', '')}
              </Text>
            </View>
          ) : null}

          {/* Parent read-only note */}
          {trainerMode === 'parent' && role !== 'trainer' && (
            <View style={styles.parentBanner}>
              <MaterialCommunityIcons name="eye-outline" size={14} color={PALETTE.warning} />
              <Text style={styles.parentBannerText}>
                Viewing as {ROLES.find(r => r.key === role)?.label || 'Viewer'} — contact your trainer to update grades
              </Text>
            </View>
          )}

          {/* Log button */}
          {canEdit ? (
            <TouchableOpacity style={styles.logBtn} onPress={() => setShowLogSession(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="clipboard-plus-outline" size={20} color="#fff" />
              <Text style={styles.logBtnText}>{role === 'trainer' ? 'Log Session' : 'Update My Status'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.readOnlyBanner}>
              <MaterialCommunityIcons name={role === 'coach' ? 'eye-outline' : 'lock-outline'} size={15} color={PALETTE.muted} />
              <Text style={styles.readOnlyBannerText}>
                {role === 'coach' ? 'Coach view — read only' : 'Editing not enabled by trainer'}
              </Text>
            </View>
          )}

          {/* Trainer tools — join code + audit log */}
          {role === 'trainer' && (
            <View style={styles.trainerTools}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => setJoinCodeVisible(true)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="key-outline" size={15} color={PALETTE.accent} />
                <Text style={styles.toolBtnText}>Get Join Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolBtn, { borderColor: PALETTE.warning + '55' }]}
                onPress={async () => {
                  const { loadAuditLog } = require('../services/firebaseService');
                  const result = await loadAuditLog(trainerId, clientData.id);
                  if (result.success) setAuditLog(result.data);
                  setAuditLogVisible(true);
                }}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="shield-check-outline" size={15} color={PALETTE.warning} />
                <Text style={[styles.toolBtnText, { color: PALETTE.warning }]}>Audit Log</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Linked athlete badge */}
          {clientData?.linkedAthleteName && (
            <View style={styles.linkedBadge}>
              <MaterialCommunityIcons name="link-variant" size={13} color={PALETTE.success} />
              <Text style={styles.linkedBadgeText}>
                {clientData.linkedAthleteName} is connected · self-reports syncing
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── PROGRESS TAB ── */}
      {activeTab === 'chart' && (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <ProgressChart trainerId={trainerId} clientId={clientData.id} clientName={clientData.name} />
        </ScrollView>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <SessionHistoryScreen client={clientData} trainerId={trainerId} onBack={() => setActiveTab('overview')} hideHeader />
      )}

      {/* ── AI PLAN TAB ── */}
      {activeTab === 'ai' && (
        <AITrainingPlanScreen client={clientData} compDays={7} role={role} trainerId={trainerId} onBack={() => setActiveTab('overview')} hideHeader />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider, gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerName: { color: PALETTE.text, fontSize: 20, fontWeight: '800' },
  headerSub: { color: PALETTE.muted, fontSize: 12, marginTop: 2 },
  scoreBadge: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PALETTE.panel,
  },
  scoreNum: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  scoreLabel: { color: PALETTE.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },

  roleRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
  },
  roleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border, backgroundColor: PALETTE.panel,
  },
  roleBtnText: { color: PALETTE.muted, fontSize: 11, fontWeight: '700' },

  tabBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider, gap: 8,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent',
  },
  tabBtnActive: { backgroundColor: PALETTE.accentSoft, borderColor: PALETTE.accent },
  tabBtnText: { color: PALETTE.muted, fontSize: 12, fontWeight: '700' },
  tabBtnTextActive: { color: PALETTE.accent },

  pinnedNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a1a0a', borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.warning + '44',
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  pinnedNotePlaceholder: { borderColor: PALETTE.border, backgroundColor: PALETTE.panel },
  pinnedNoteText: { flex: 1, color: PALETTE.text, fontSize: 13, lineHeight: 18 },
  pinnedNotePlaceholderText: { flex: 1, color: PALETTE.muted, fontSize: 13 },

  noteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  noteModal: { backgroundColor: PALETTE.panel, borderRadius: 16, borderWidth: 1, borderColor: PALETTE.border, padding: 18, width: '100%' },
  noteModalTitle: { color: PALETTE.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  noteModalInput: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top', marginBottom: 14,
  },
  noteModalBtns: { flexDirection: 'row', gap: 10 },
  noteModalCancel: { flex: 1, backgroundColor: PALETTE.panelAlt, borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border, paddingVertical: 10, alignItems: 'center' },
  noteModalCancelText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  noteModalSave: { flex: 1, backgroundColor: PALETTE.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  noteModalSaveText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  gradeLegend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 12, paddingHorizontal: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: PALETTE.muted, fontSize: 10, fontWeight: '600' },

  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1a0f00', borderRadius: 8, borderWidth: 1, borderColor: '#f9731644',
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 10, marginHorizontal: 16,
  },
  streakText: { color: '#f97316', fontSize: 12, fontWeight: '700' },

  coachNoteCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#1a1528', borderRadius: 14,
    borderWidth: 1, borderColor: '#a78bfa44', padding: 12,
  },
  sessionNoteCard: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: PALETTE.accentSoft,
    borderRadius: 14, borderWidth: 1, borderColor: '#3b82f644', padding: 12,
  },
  sessionNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  sessionNoteLabel: { color: PALETTE.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  sessionNoteText: { color: PALETTE.text, fontSize: 13, lineHeight: 19 },

  bodySection: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 16,
  },
  gradeCol: { flex: 1, gap: 8, alignItems: 'center' },
  gradePill: {
    width: '95%', backgroundColor: PALETTE.panel,
    borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border,
    padding: 8, alignItems: 'center', gap: 3, position: 'relative',
  },
  injuryDot: { position: 'absolute', top: 4, right: 4 },
  pillPart: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  pillNum: { fontSize: 16, fontWeight: '800' },
  pillTarget: { color: PALETTE.accent, fontSize: 9, fontWeight: '700' },
  pillTapHint: { color: PALETTE.muted, fontSize: 7, fontWeight: '600', letterSpacing: 0.5 },
  hologramWrap: { alignItems: 'center', justifyContent: 'center' },

  analysisCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.panel, borderRadius: 16, borderWidth: 1, padding: 14,
  },
  analysisRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  analysisIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  analysisCopy: { flex: 1 },
  analysisPartName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  analysisPartHint: { color: PALETTE.muted, fontSize: 11, marginBottom: 4, fontStyle: 'italic' },
  analysisRec: { color: PALETTE.muted, fontSize: 12, lineHeight: 17, marginBottom: 4 },
  injuryWarning: { color: PALETTE.danger, fontSize: 11, fontWeight: '700' },
  analysisBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  analysisBadgeText: { fontSize: 11, fontWeight: '700' },

  exerciseLink: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: PALETTE.divider,
  },
  exerciseLinkThumb: { fontSize: 24 },
  exerciseLinkInfo: { flex: 1 },
  exerciseLinkLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  exerciseLinkText: { color: PALETTE.text, fontSize: 13, fontWeight: '700' },

  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 14,
    marginHorizontal: 16, marginBottom: 16, paddingVertical: 14,
    shadowColor: PALETTE.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  trainerTools: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginBottom: 10,
  },
  toolBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 12,
    backgroundColor: PALETTE.accentSoft, borderWidth: 1, borderColor: PALETTE.accent,
  },
  toolBtnText: { color: PALETTE.accent, fontSize: 13, fontWeight: '700' },
  linkedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#0a1a0a', borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.success + '44',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  linkedBadgeText: { color: PALETTE.success, fontSize: 12, fontWeight: '600', flex: 1 },

  auditOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100,
    justifyContent: 'flex-end',
  },
  auditCard: {
    backgroundColor: PALETTE.panel, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderColor: PALETTE.border, padding: 20, maxHeight: '70%',
  },
  auditHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  auditTitle: { color: PALETTE.text, fontSize: 16, fontWeight: '800' },
  auditEmpty: { color: PALETTE.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  auditRow: {
    flexDirection: 'row', gap: 10, marginBottom: 14,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
  },
  auditDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: PALETTE.warning, marginTop: 5,
  },
  auditWho: { color: PALETTE.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  auditNote: { color: PALETTE.muted, fontSize: 12, lineHeight: 17, marginBottom: 2 },
  auditTime: { color: PALETTE.muted, fontSize: 10, fontWeight: '600' },
  parentBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#1a1500', borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.warning + '44',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  parentBannerText: { color: PALETTE.warning, fontSize: 12, fontWeight: '600', flex: 1 },
  readOnlyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 16, backgroundColor: PALETTE.panel,
    borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  readOnlyBannerText: { color: PALETTE.muted, fontSize: 12, fontWeight: '700' },
});
