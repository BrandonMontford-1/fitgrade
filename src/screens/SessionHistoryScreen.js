import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadSessions, deleteSession } from '../services/firebaseService';
import EmptyState from '../components/EmptyState';
import { SessionCardSkeleton } from '../components/SkeletonLoader';
import {
  BODY_PARTS,
  PALETTE,
  PART_META,
  getNumericGrade,
  getSeverityMeta,
  gradeColor,
  formatDate,
} from '../ui/theme';

const PART_COLORS = {
  Head: '#60a5fa',
  Arm:  '#a78bfa',
  Core: '#34d399',
  Leg:  '#fbbf24',
  Foot: '#f87171',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SessionSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonBadge} />
          </View>
          <View style={[styles.skeletonTitle, { width: '60%', marginTop: 8 }]} />
          <View style={styles.skeletonBars}>
            {[1, 2, 3, 4, 5].map((j) => (
              <View key={j} style={styles.skeletonBar} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyHistory() {
  return (
    <View style={styles.emptyWrap}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={PALETTE.accent} />
      <Text style={styles.emptyTitle}>No sessions logged</Text>
      <Text style={styles.emptyText}>
        Log your first session to start building a history for this client.
      </Text>
    </View>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({ session, onDelete, trainerId, clientId }) {
  const [expanded, setExpanded] = useState(false);

  const injuredParts = BODY_PARTS.filter((p) => session.injuries?.[p]);

  const handleDelete = () => {
    Alert.alert('Delete Session', 'Are you sure you want to delete this session record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(session.id),
      },
    ]);
  };

  return (
    <View style={styles.sessionCard}>
      {/* Header */}
      <TouchableOpacity
        style={styles.sessionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.sessionHeaderLeft}>
          <Text style={styles.sessionDate}>{formatDate(session.timestamp)}</Text>
          {injuredParts.length > 0 && (
            <View style={styles.injuryFlag}>
              <MaterialCommunityIcons name="alert-circle" size={12} color={PALETTE.danger} />
              <Text style={styles.injuryFlagText}>
                {injuredParts.length} injury{injuredParts.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.sessionHeaderRight}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="trash-can-outline" size={15} color={PALETTE.danger} />
          </TouchableOpacity>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18} color={PALETTE.muted}
          />
        </View>
      </TouchableOpacity>

      {/* Grade pills preview */}
      <View style={styles.gradePreview}>
        {BODY_PARTS.map((part) => {
          const g = getNumericGrade(session.grades?.[part], 100);
          const color = PART_COLORS[part];
          const injured = session.injuries?.[part];
          return (
            <View key={part} style={[styles.gradePill, { borderColor: color + '55' }, injured && { borderColor: PALETTE.danger }]}>
              {injured && (
                <MaterialCommunityIcons name="alert-circle" size={8} color={PALETTE.danger} style={styles.injuryDot} />
              )}
              <Text style={[styles.gradePillPart, { color: PALETTE.muted }]}>{part[0]}</Text>
              <Text style={[styles.gradePillNum, { color }]}>{g}%</Text>
            </View>
          );
        })}
      </View>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Full grades */}
          <Text style={styles.expandedLabel}>GRADES</Text>
          {BODY_PARTS.map((part) => {
            const g = getNumericGrade(session.grades?.[part], 100);
            const color = PART_COLORS[part];
            const target = session.targets?.[part];
            const injured = session.injuries?.[part];
            const severity = session.injurySeverities?.[part];
            const note = session.injuryNotes?.[part];

            return (
              <View key={part} style={styles.expandedRow}>
                <View style={[styles.expandedIcon, { backgroundColor: getSeverityMeta(g).soft }]}>
                  <MaterialCommunityIcons name={PART_META[part].icon} size={15} color={color} />
                </View>
                <View style={styles.expandedInfo}>
                  <View style={styles.expandedNameRow}>
                    <Text style={styles.expandedPart}>{part}</Text>
                    {injured && (
                      <View style={styles.injuredTag}>
                        <Text style={styles.injuredTagText}>{severity || 'Injured'}</Text>
                      </View>
                    )}
                    {target > 0 && (
                      <Text style={styles.targetText}>→ {target}%</Text>
                    )}
                  </View>
                  {injured && note ? (
                    <Text style={styles.injuryNote}>{note}</Text>
                  ) : null}
                </View>
                <Text style={[styles.expandedGrade, { color }]}>{g}%</Text>
              </View>
            );
          })}

          {/* Session note */}
          {session.sessionNote ? (
            <View style={styles.sessionNoteWrap}>
              <Text style={styles.expandedLabel}>SESSION NOTES</Text>
              <Text style={styles.sessionNoteText}>{session.sessionNote}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SessionHistoryScreen({ client, trainerId, onBack, hideHeader }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const result = await loadSessions(trainerId, client.id);
    if (result.success) setSessions(result.data);
    setLoading(false);
  }, [trainerId, client.id]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleDelete = async (sessionId) => {
    const result = await deleteSession(trainerId, client.id, sessionId);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } else {
      Alert.alert('Error', 'Could not delete session.');
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      {!hideHeader && (
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Session History</Text>
          <Text style={styles.headerSub}>{client?.name}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countNum}>{sessions.length}</Text>
          <Text style={styles.countLabel}>sessions</Text>
        </View>
      </View>
      )}

      {loading ? (
        <View style={styles.skeletonWrap}>
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </View>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="clipboard-text-outline"
          title="No sessions logged"
          subtitle="Log your first session to start building a history for this client."
          color={PALETTE.accent}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              trainerId={trainerId}
              clientId={client.id}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}
    </View>
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
  headerTitle: { color: PALETTE.text, fontSize: 20, fontWeight: '800' },
  headerSub: { color: PALETTE.muted, fontSize: 12, marginTop: 2 },
  countBadge: {
    backgroundColor: PALETTE.panel, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
  },
  countNum: { color: PALETTE.accent, fontSize: 18, fontWeight: '800' },
  countLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  sessionCard: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    marginBottom: 12, overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  sessionHeaderLeft: { flex: 1, gap: 6 },
  sessionDate: { color: PALETTE.text, fontSize: 15, fontWeight: '800' },
  injuryFlag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PALETTE.dangerSoft, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  injuryFlagText: { color: PALETTE.danger, fontSize: 10, fontWeight: '700' },
  sessionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: PALETTE.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
  },

  gradePreview: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: 14, paddingBottom: 14,
  },
  gradePill: {
    flex: 1, backgroundColor: PALETTE.panelAlt,
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 6, alignItems: 'center', gap: 2,
    position: 'relative',
  },
  injuryDot: { position: 'absolute', top: 2, right: 2 },
  gradePillPart: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
  gradePillNum: { fontSize: 12, fontWeight: '800' },

  expandedSection: {
    borderTopWidth: 1, borderTopColor: PALETTE.divider,
    padding: 14, gap: 8,
  },
  expandedLabel: {
    color: PALETTE.muted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 4, marginTop: 4,
  },
  expandedRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 6,
  },
  expandedIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  expandedInfo: { flex: 1 },
  expandedNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expandedPart: { color: PALETTE.text, fontSize: 13, fontWeight: '700' },
  injuredTag: {
    backgroundColor: PALETTE.dangerSoft, borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  injuredTagText: { color: PALETTE.danger, fontSize: 9, fontWeight: '800' },
  targetText: { color: PALETTE.accent, fontSize: 11, fontWeight: '700' },
  injuryNote: { color: PALETTE.muted, fontSize: 11, marginTop: 2 },
  expandedGrade: { fontSize: 16, fontWeight: '800' },

  sessionNoteWrap: { marginTop: 8 },
  sessionNoteText: {
    color: PALETTE.text, fontSize: 13, lineHeight: 19,
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    padding: 10, marginTop: 4,
  },

  // Skeleton
  skeletonWrap: { padding: 16, gap: 12 },
  skeletonCard: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border, padding: 14,
  },
  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skeletonTitle: { height: 14, backgroundColor: PALETTE.panelAlt, borderRadius: 8, width: '40%' },
  skeletonBadge: { height: 14, backgroundColor: PALETTE.panelAlt, borderRadius: 8, width: '20%' },
  skeletonBars: { flexDirection: 'row', gap: 6, marginTop: 12 },
  skeletonBar: { flex: 1, height: 40, backgroundColor: PALETTE.panelAlt, borderRadius: 10 },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { color: PALETTE.text, fontSize: 18, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  emptyText: { color: PALETTE.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
