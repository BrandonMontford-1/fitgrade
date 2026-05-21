import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  PALETTE,
  PART_META,
  getExerciseLink,
  getNumericGrade,
  gradeColor,
  getSeverityMeta,
  getPartMeta,
} from '../ui/theme';
import { loadSessions } from '../services/firebaseService';

const { height: SCREEN_H } = Dimensions.get('window');

const WARM_MESSAGES = {
  Head: "No data yet for Focus & Energy. Once your trainer logs a session, you'll see your trends here. 🧠",
  Arm: "No arm data logged yet. After your first session, you'll see how your upper body strength is tracking. 💪",
  Core: "Your core history will show up here after your first logged session. Stay consistent! 🫀",
  Leg: "No leg data yet. Once your trainer starts tracking, you'll see every step of your progress. 🦵",
  Foot: "No foot or ankle data logged yet. Your balance and agility history will live here. 🦶",
};

const getWarmMessage = (part) =>
  WARM_MESSAGES[part] || `No data logged yet for ${part}. Your history will appear here after your first session.`;

const FAVORITE_EXERCISES = {
  Head: [
    { name: 'Box breathing', url: 'https://www.youtube.com/results?search_query=box+breathing+athletes', emoji: '🧘' },
    { name: 'Focus drills', url: 'https://www.youtube.com/results?search_query=focus+drills+sports', emoji: '🎯' },
  ],
  Arm: [
    { name: 'Band pull-aparts', url: 'https://www.youtube.com/results?search_query=band+pull+apart', emoji: '💪' },
    { name: 'Face pulls', url: 'https://www.youtube.com/results?search_query=face+pull+exercise', emoji: '🏋️' },
    { name: 'Tricep dips', url: 'https://www.youtube.com/results?search_query=tricep+dips+form', emoji: '💪' },
  ],
  Core: [
    { name: 'Dead bug', url: 'https://www.youtube.com/results?search_query=dead+bug+exercise', emoji: '🐛' },
    { name: 'Pallof press', url: 'https://www.youtube.com/results?search_query=pallof+press', emoji: '🏋️' },
    { name: 'Bird dog', url: 'https://www.youtube.com/results?search_query=bird+dog+exercise', emoji: '🦅' },
  ],
  Leg: [
    { name: 'Bulgarian split squat', url: 'https://www.youtube.com/results?search_query=bulgarian+split+squat', emoji: '🦵' },
    { name: 'Nordic curl', url: 'https://www.youtube.com/results?search_query=nordic+curl+exercise', emoji: '🏃' },
    { name: 'Hip thrust', url: 'https://www.youtube.com/results?search_query=hip+thrust+exercise', emoji: '💪' },
  ],
  Foot: [
    { name: 'Single leg balance', url: 'https://www.youtube.com/results?search_query=single+leg+balance+drill', emoji: '🦶' },
    { name: 'Calf raises', url: 'https://www.youtube.com/results?search_query=calf+raises+form', emoji: '⬆️' },
    { name: 'Ankle circles', url: 'https://www.youtube.com/results?search_query=ankle+mobility+exercises', emoji: '🔄' },
  ],
};

const getFavorites = (part) => FAVORITE_EXERCISES[part] || [];

export default function PartDetailSheet({ visible, part, clientData, trainerId, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      setShowAllHistory(false);
      Animated.spring(slideAnim, {
        toValue: 0, useNativeDriver: true,
        tension: 65, friction: 11,
      }).start();
      fetchSessions();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_H, duration: 250, useNativeDriver: true,
      }).start();
    }
  }, [visible, part]);

  const fetchSessions = async () => {
    if (!trainerId || !clientData?.id) return;
    setLoading(true);
    const result = await loadSessions(trainerId, clientData.id);
    if (result.success) setSessions(result.data);
    setLoading(false);
  };

  if (!part) return null;

  const grade = getNumericGrade(clientData?.[part], 100);
  const color = gradeColor(grade);
  const severity = getSeverityMeta(grade);
  const meta = getPartMeta(part);
  const injured = clientData?.injuries?.[part];
  const injuryNote = clientData?.injuryNotes?.[part];
  const injurySeverity = clientData?.injurySeverities?.[part];
  const target = clientData?.targets?.[part];
  const exerciseLink = getExerciseLink(part, grade);
  const favorites = getFavorites(part);

  // Build grade history — cap at 6 unless expanded
  const fullHistory = sessions
    .filter(s => s.grades?.[part] !== undefined)
    .reverse();
  const partHistory = showAllHistory ? fullHistory : fullHistory.slice(-6);
  const hasMore = fullHistory.length > 6;

  const hasHistory = partHistory.length > 0;
  const hasInjury = injured && (injuryNote || injurySeverity);
  const prevGrade = partHistory.length > 1 ? partHistory[partHistory.length - 2]?.grades?.[part] : null;
  const trend = prevGrade !== null ? grade - prevGrade : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: color + '22', borderColor: color + '55' }]}>
            <MaterialCommunityIcons name={meta.icon} size={24} color={color} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerPart}>{part}</Text>
            <Text style={styles.headerHint}>{meta.plainHint || meta.shortHint}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.headerGrade, { color }]}>{grade}%</Text>
            {trend !== null && (
              <View style={styles.trendBadge}>
                <MaterialCommunityIcons
                  name={trend > 0 ? 'trending-up' : trend < 0 ? 'trending-down' : 'minus'}
                  size={12}
                  color={trend > 0 ? PALETTE.success : trend < 0 ? PALETTE.danger : PALETTE.muted}
                />
                <Text style={[styles.trendText, {
                  color: trend > 0 ? PALETTE.success : trend < 0 ? PALETTE.danger : PALETTE.muted
                }]}>
                  {trend > 0 ? `+${trend}` : trend}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status bar */}
        <View style={[styles.statusBar, { backgroundColor: color + '18', borderColor: color + '44' }]}>
          <MaterialCommunityIcons name={severity.icon || 'circle'} size={13} color={color} />
          <Text style={[styles.statusText, { color }]}>{severity.label}</Text>
          {target > 0 && (
            <Text style={styles.targetText}>→ Target: {target}%</Text>
          )}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Injury alert */}
          {hasInjury && (
            <View style={styles.injuryCard}>
              <View style={styles.injuryCardHeader}>
                <MaterialCommunityIcons name="alert-circle" size={15} color={PALETTE.danger} />
                <Text style={styles.injuryCardTitle}>
                  {injurySeverity || 'Mild'} Injury Flagged
                </Text>
              </View>
              {injuryNote && <Text style={styles.injuryCardNote}>{injuryNote}</Text>}
            </View>
          )}

          {/* Grade history */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GRADE HISTORY</Text>
            {loading ? (
              <ActivityIndicator color={PALETTE.accent} style={{ marginVertical: 16 }} />
            ) : hasHistory ? (
              <>
                <View style={styles.historyChartHeader}>
                  <Text style={styles.historyChartLabel}>
                    {showAllHistory ? `All ${fullHistory.length} sessions` : `Last ${partHistory.length} sessions`}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {partHistory.length > 1 && (() => {
                      const grades = partHistory.map(s => s.grades?.[part] ?? 100);
                      const max = Math.max(...grades);
                      const min = Math.min(...grades);
                      return (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Text style={{ color: PALETTE.success, fontSize: 10, fontWeight: '800' }}>↑{max}%</Text>
                          <Text style={{ color: PALETTE.danger, fontSize: 10, fontWeight: '800' }}>↓{min}%</Text>
                        </View>
                      );
                    })()}
                    {hasMore && (
                      <TouchableOpacity onPress={() => setShowAllHistory(!showAllHistory)}>
                        <Text style={styles.viewAllText}>
                          {showAllHistory ? 'Show less' : `+${fullHistory.length - 6} more`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.chartWrap}>
                  <View style={styles.yAxis}>
                    {[100, 70, 0].map((v) => (
                      <Text key={v} style={styles.yAxisLabel}>{v}</Text>
                    ))}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.guideLines}>
                      <View style={[styles.guideLine, { top: 0 }]} />
                      <View style={[styles.guideLine, { top: '30%' }]} />
                      <View style={[styles.guideLine, { top: '100%' }]} />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={[styles.historyChart, { minWidth: partHistory.length * 44 }]}>
                        {partHistory.map((s, i) => {
                          const g = s.grades?.[part] ?? 100;
                          const c = gradeColor(g);
                          const barH = Math.max(8, (g / 100) * 80);
                          const isLatest = i === partHistory.length - 1;
                          return (
                            <View key={i} style={styles.historyBar}>
                              <Text style={[styles.historyGrade, { color: c, fontWeight: isLatest ? '900' : '700' }]}>{g}</Text>
                              <View style={[
                                styles.historyBarFill,
                                { height: barH, backgroundColor: c },
                                isLatest && { borderWidth: 1.5, borderColor: '#fff4', borderRadius: 6 }
                              ]} />
                              <Text style={[styles.historyDate, isLatest && { color: PALETTE.silver }]}>
                                {isLatest ? 'Now' : s.timestamp ? new Date(s.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : '—'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {partHistory[partHistory.length - 1]?.sessionNote && (
                  <View style={styles.lastNoteBox}>
                    <Text style={styles.lastNoteLabel}>Last session note</Text>
                    <Text style={styles.lastNoteText}>{partHistory[partHistory.length - 1].sessionNote}</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyText}>{getWarmMessage(part)}</Text>
              </View>
            )}
          </View>

          {/* Recommended exercise */}
          {exerciseLink && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECOMMENDED FOR YOU</Text>
              <TouchableOpacity
                style={[styles.exerciseCard, { borderColor: color + '44' }]}
                onPress={() => Linking.openURL(exerciseLink.url)}
                activeOpacity={0.85}
              >
                <Text style={styles.exerciseEmoji}>{exerciseLink.thumb}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exerciseLink.text}</Text>
                  <Text style={styles.exerciseReason}>
                    Based on your current {grade}% — {grade < 70 ? 'rehab focus' : grade < 90 ? 'maintenance work' : 'performance training'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="youtube" size={22} color="#ff0000" />
              </TouchableOpacity>
            </View>
          )}

          {/* Favorite exercises */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXERCISES FOR {part.toUpperCase()}</Text>
            {favorites.length > 0 ? (
              favorites.map((ex, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.favCard}
                  onPress={() => Linking.openURL(ex.url)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.favEmoji}>{ex.emoji}</Text>
                  <Text style={styles.favName}>{ex.name}</Text>
                  <MaterialCommunityIcons name="open-in-new" size={14} color={PALETTE.muted} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Exercises for this body part will appear here once your trainer configures your program.
                </Text>
              </View>
            )}
          </View>

          {/* Performance data */}
          {hasHistory && partHistory.some(s => s.performance?.[part]) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PERFORMANCE HISTORY</Text>
              {partHistory
                .filter(s => s.performance?.[part])
                .slice(-4)
                .reverse()
                .map((s, i) => {
                  const perf = s.performance[part];
                  return (
                    <View key={i} style={styles.perfRow}>
                      <Text style={styles.perfDate}>
                        {s.timestamp ? new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </Text>
                      <View style={styles.perfStats}>
                        {perf.weight ? <Text style={styles.perfStat}>{perf.weight} lbs</Text> : null}
                        {perf.reps ? <Text style={styles.perfStat}>{perf.reps} reps</Text> : null}
                        {perf.sets ? <Text style={styles.perfStat}>{perf.sets} sets</Text> : null}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: PALETTE.panel,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border,
    maxHeight: SCREEN_H * 0.85,
    paddingBottom: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: PALETTE.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerPart: { color: PALETTE.text, fontSize: 20, fontWeight: '800' },
  headerHint: { color: PALETTE.muted, fontSize: 11, marginTop: 2, lineHeight: 15 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  headerGrade: { fontSize: 28, fontWeight: '900' },
  trendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: PALETTE.panelAlt, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  trendText: { fontSize: 11, fontWeight: '800' },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 6,
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  statusText: { fontSize: 13, fontWeight: '700', flex: 1 },
  targetText: { color: PALETTE.accent, fontSize: 12, fontWeight: '700' },
  injuryCard: {
    marginHorizontal: 20, marginBottom: 6,
    backgroundColor: PALETTE.dangerSoft, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.danger + '44', padding: 12,
  },
  injuryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  injuryCardTitle: { color: PALETTE.danger, fontSize: 13, fontWeight: '800' },
  injuryCardNote: { color: PALETTE.text, fontSize: 12, lineHeight: 17 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    color: PALETTE.muted, fontSize: 9, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 10,
  },
  historyChartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  historyChartLabel: { color: PALETTE.muted, fontSize: 11, fontWeight: '600' },
  viewAllText: { color: PALETTE.accent, fontSize: 11, fontWeight: '700' },
  chartWrap: { flexDirection: 'row', height: 120, marginBottom: 10 },
  yAxis: { width: 26, justifyContent: 'space-between', paddingBottom: 18, alignItems: 'flex-end', paddingRight: 4 },
  yAxisLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '600' },
  guideLines: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 18 },
  guideLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: PALETTE.divider,
  },
  historyChart: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 6, height: 100, paddingBottom: 18,
  },
  historyBar: { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  historyGrade: { fontSize: 10, fontWeight: '800' },
  historyBarFill: { width: '100%', borderRadius: 4, minHeight: 8 },
  historyDate: { color: PALETTE.muted, fontSize: 8, textAlign: 'center' },
  lastNoteBox: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border, padding: 10,
  },
  lastNoteLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '700', marginBottom: 4 },
  lastNoteText: { color: PALETTE.text, fontSize: 12, lineHeight: 17 },
  emptyState: {
    alignItems: 'center', paddingVertical: 20, gap: 8,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: {
    color: PALETTE.muted, fontSize: 13, textAlign: 'center',
    lineHeight: 19, maxWidth: 280,
  },
  exerciseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panelAlt, borderRadius: 14,
    borderWidth: 1, padding: 14,
  },
  exerciseEmoji: { fontSize: 28 },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: PALETTE.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  exerciseReason: { color: PALETTE.muted, fontSize: 11, lineHeight: 15 },
  favCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6,
  },
  favEmoji: { fontSize: 18 },
  favName: { color: PALETTE.text, fontSize: 13, fontWeight: '600', flex: 1 },
  perfRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6,
  },
  perfDate: { color: PALETTE.muted, fontSize: 11, fontWeight: '600', width: 60 },
  perfStats: { flexDirection: 'row', gap: 10, flex: 1, justifyContent: 'flex-end' },
  perfStat: { color: PALETTE.text, fontSize: 12, fontWeight: '700' },
});
