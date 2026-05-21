import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BodyHologram from '../components/BodyHologram';
import AITrainingPlanScreen from './AITrainingPlanScreen';
import SessionHistoryScreen from './SessionHistoryScreen';
import {
  BODY_PARTS,
  PALETTE,
  PART_META,
  getAverageScore,
  getNumericGrade,
  getSeverityMeta,
  gradeColor,
  getExerciseLink,
} from '../ui/theme';
import { loadClients, saveSession } from '../services/firebaseService';

const TABS = [
  { key: 'overview', icon: 'view-dashboard-outline', label: 'My Status' },
  { key: 'history',  icon: 'clipboard-text-outline', label: 'History' },
  { key: 'ai',       icon: 'lightning-bolt',          label: 'AI Plan' },
];

export default function AthleteHomeScreen({ athlete, trainerId, onSignOut }) {
  const [clientData, setClientData] = useState(athlete || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPart, setSelectedPart] = useState('Core');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Self-log state
  const [feelScore, setFeelScore] = useState('');
  const [selfNote, setSelfNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const metrics = clientData || {};
  const avg = getAverageScore(metrics);
  const avgSeverity = getSeverityMeta(avg);
  const selGrade = getNumericGrade(metrics[selectedPart], 100);
  const selSeverity = getSeverityMeta(selGrade);
  const isCleared = avg >= 60;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await loadClients(trainerId);
      if (result.success && result.data[clientData.id]) {
        setClientData({ ...result.data[clientData.id], id: clientData.id });
      }
    } catch (e) {}
    setRefreshing(false);
  };

  const handleSelfLog = async () => {
    if (!selfNote.trim() && !feelScore) {
      Alert.alert('Add something', 'Enter how you feel or a quick note before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      // Save self-log as a session note — grades unchanged, just feel + note
      const grades = Object.fromEntries(BODY_PARTS.map((p) => [p, getNumericGrade(clientData[p], 100)]));
      await saveSession(trainerId, clientData.id, {
        grades,
        targets: clientData.targets || {},
        injuries: clientData.injuries || {},
        injuryNotes: clientData.injuryNotes || {},
        injurySeverities: clientData.injurySeverities || {},
        sessionNote: `[Athlete self-report] Feel: ${feelScore || '—'}/10. ${selfNote}`,
        loggedBy: 'athlete',
      });
      setSubmitted(true);
      setFeelScore('');
      setSelfNote('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      Alert.alert('Error', 'Could not save your update. Try again.');
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEyebrow}>FitGrade</Text>
          <Text style={styles.headerName}>{clientData?.name || 'Athlete'}</Text>
          <Text style={styles.headerSub}>{clientData?.sport ? clientData.sport.charAt(0).toUpperCase() + clientData.sport.slice(1) : 'General'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.scoreBadge, { borderColor: avgSeverity.color, shadowColor: avgSeverity.color }]}>
            <Text style={[styles.scoreNum, { color: avgSeverity.color }]}>{avg}</Text>
            <Text style={styles.scoreLabel}>AVG</Text>
          </View>
          <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
            <MaterialCommunityIcons name="logout" size={18} color={PALETTE.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Clearance badge */}
      <View style={[styles.clearanceBanner, { backgroundColor: isCleared ? '#0a1a0a' : '#1a0a0a', borderColor: isCleared ? PALETTE.success + '44' : PALETTE.danger + '44' }]}>
        <MaterialCommunityIcons
          name={isCleared ? 'check-circle-outline' : 'alert-circle-outline'}
          size={16}
          color={isCleared ? PALETTE.success : PALETTE.danger}
        />
        <Text style={[styles.clearanceText, { color: isCleared ? PALETTE.success : PALETTE.danger }]}>
          {isCleared ? 'Cleared to train' : 'Not cleared — contact your trainer'}
        </Text>
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

      {/* ── MY STATUS TAB ── */}
      {activeTab === 'overview' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PALETTE.accent} />}
        >
          {/* Hologram */}
          <View style={styles.hologramSection}>
            <BodyHologram metrics={metrics} selectedPart={selectedPart} onRegionPress={setSelectedPart} />
          </View>

          {/* Grade legend */}
          <View style={styles.gradeLegend}>
            {[
              { color: '#22c55e', label: 'Optimal 90-100%' },
              { color: '#f59e0b', label: 'Monitor 70-89%' },
              { color: '#ef4444', label: 'Needs work 0-69%' },
            ].map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>

          {/* Grade pills */}
          <View style={styles.gradesRow}>
            {BODY_PARTS.map((part) => {
              const g = getNumericGrade(metrics[part]);
              const color = gradeColor(g);
              const active = selectedPart === part;
              const injured = clientData?.injuries?.[part];
              return (
                <TouchableOpacity
                  key={part}
                  onPress={() => setSelectedPart(part)}
                  style={[styles.gradePill,
                    active && { borderColor: color, backgroundColor: color + '18', shadowColor: color, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
                    injured && { borderColor: PALETTE.danger }
                  ]}
                >
                  {injured && <MaterialCommunityIcons name="alert-circle" size={9} color={PALETTE.danger} style={{ position: 'absolute', top: 4, right: 4 }} />}
                  <MaterialCommunityIcons name={PART_META[part].icon} size={14} color={active ? color : PALETTE.muted} />
                  <Text style={[styles.pillPart, { color: active ? color : PALETTE.muted }]}>{part}</Text>
                  <Text style={[styles.pillNum, { color }]}>{g}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Analysis card */}
          <View style={[styles.analysisCard, { borderColor: selSeverity.color + '44' }]}>
            <View style={styles.analysisRow}>
              <View style={[styles.analysisIcon, { backgroundColor: selSeverity.soft }]}>
                <MaterialCommunityIcons name={PART_META[selectedPart]?.icon ?? 'pulse'} size={20} color={selSeverity.color} />
              </View>
              <View style={styles.analysisCopy}>
                <Text style={[styles.analysisPartName, { color: selSeverity.color }]}>{selectedPart} · {selGrade}%</Text>
                <Text style={styles.analysisPartHint}>{PART_META[selectedPart]?.plainHint || PART_META[selectedPart]?.shortHint || ''}</Text>
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
                  <Text style={{ fontSize: 22 }}>{ex.thumb}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseLinkLabel}>RECOMMENDED FOR YOU</Text>
                    <Text style={styles.exerciseLinkText}>{ex.text}</Text>
                  </View>
                  <MaterialCommunityIcons name="youtube" size={22} color="#ff0000" />
                </TouchableOpacity>
              );
            })()}
          </View>

          {/* Last trainer note */}
          {clientData?.lastSessionNote && !clientData.lastSessionNote.includes('[Athlete self-report]') && (
            <View style={styles.trainerNoteCard}>
              <View style={styles.trainerNoteHeader}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={13} color={PALETTE.accent} />
                <Text style={styles.trainerNoteLabel}>TRAINER'S NOTE</Text>
              </View>
              <Text style={styles.trainerNoteText}>{clientData.lastSessionNote}</Text>
            </View>
          )}

          {/* Self-log section */}
          <View style={styles.selfLogCard}>
            <Text style={styles.selfLogTitle}>How are you feeling today?</Text>
            <Text style={styles.selfLogSub}>Your trainer will see this update</Text>

            {/* Feel score */}
            <Text style={styles.selfLogLabel}>Energy & feel (1-10)</Text>
            <View style={styles.feelRow}>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setFeelScore(String(n))}
                  style={[styles.feelBtn, feelScore === String(n) && { backgroundColor: PALETTE.accent, borderColor: PALETTE.accent }]}
                >
                  <Text style={[styles.feelBtnText, feelScore === String(n) && { color: '#fff' }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <Text style={styles.selfLogLabel}>Quick note</Text>
            <TextInput
              style={styles.selfLogInput}
              placeholder="e.g. Knee feels tight, slept well, skipped warmup..."
              placeholderTextColor={PALETTE.muted}
              value={selfNote}
              onChangeText={setSelfNote}
              multiline
              numberOfLines={3}
              color={PALETTE.text}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }, submitted && { backgroundColor: PALETTE.success }]}
              onPress={handleSelfLog}
              disabled={submitting || submitted}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name={submitted ? 'check' : 'send-outline'} size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>{submitted ? 'Sent to trainer!' : 'Send update'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <SessionHistoryScreen client={clientData} trainerId={trainerId} onBack={() => setActiveTab('overview')} hideHeader />
      )}

      {/* ── AI PLAN TAB ── */}
      {activeTab === 'ai' && (
        <AITrainingPlanScreen client={clientData} role="athlete" trainerId={trainerId} onBack={() => setActiveTab('overview')} hideHeader />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerEyebrow: { color: PALETTE.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  headerName: { color: PALETTE.text, fontSize: 28, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: PALETTE.muted, fontSize: 13 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBadge: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PALETTE.panel,
    shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  scoreNum: { fontSize: 20, fontWeight: '900', lineHeight: 22 },
  scoreLabel: { color: PALETTE.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  signOutBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PALETTE.panel, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },

  clearanceBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 8, borderRadius: 10,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
  },
  clearanceText: { fontSize: 13, fontWeight: '700' },

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

  hologramSection: { alignItems: 'center', paddingVertical: 16 },
  gradeLegend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 14, paddingHorizontal: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: PALETTE.muted, fontSize: 10, fontWeight: '600' },

  gradesRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 14, gap: 6,
  },
  gradePill: {
    flex: 1, backgroundColor: PALETTE.panel,
    borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border,
    padding: 8, alignItems: 'center', gap: 3, position: 'relative',
  },
  pillPart: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  pillNum: { fontSize: 14, fontWeight: '800' },

  analysisCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.panel, borderRadius: 16, borderWidth: 1, padding: 14,
  },
  analysisRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  analysisIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  analysisCopy: { flex: 1 },
  analysisPartName: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  analysisPartHint: { color: PALETTE.muted, fontSize: 11, fontStyle: 'italic' },
  analysisBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  analysisBadgeText: { fontSize: 11, fontWeight: '700' },
  exerciseLink: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: PALETTE.divider,
  },
  exerciseLinkLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 2 },
  exerciseLinkText: { color: PALETTE.text, fontSize: 13, fontWeight: '700' },

  trainerNoteCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.accentSoft, borderRadius: 14,
    borderWidth: 1, borderColor: '#3b82f644', padding: 12,
  },
  trainerNoteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  trainerNoteLabel: { color: PALETTE.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  trainerNoteText: { color: PALETTE.text, fontSize: 13, lineHeight: 19 },

  selfLogCard: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border, padding: 16, gap: 10,
  },
  selfLogTitle: { color: PALETTE.text, fontSize: 16, fontWeight: '800' },
  selfLogSub: { color: PALETTE.muted, fontSize: 12, marginTop: -6 },
  selfLogLabel: { color: PALETTE.silver, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  feelRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  feelBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: PALETTE.panelAlt, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  feelBtnText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  selfLogInput: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 12, fontSize: 13, minHeight: 80, textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 12,
    paddingVertical: 12,
    shadowColor: PALETTE.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
