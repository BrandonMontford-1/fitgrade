import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryScatter,
} from 'victory-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadSessions } from '../services/firebaseService';
import EmptyState from './EmptyState';
import { SkeletonBlock } from './SkeletonLoader';
import { BODY_PARTS, PALETTE, PART_META, gradeColor } from '../ui/theme';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 48;
const CHART_H = 220;

const PART_COLORS = {
  Head: '#60a5fa',
  Arm:  '#a78bfa',
  Core: '#34d399',
  Leg:  '#fbbf24',
  Foot: '#f87171',
};

function formatDateShort(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── Legend pill ──────────────────────────────────────────────────────────────
function LegendPill({ part, active, onPress }) {
  const color = PART_COLORS[part];
  return (
    <TouchableOpacity
      onPress={() => onPress(part)}
      style={[styles.legendPill, active && { backgroundColor: color + '28', borderColor: color }]}
      activeOpacity={0.8}
    >
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, active && { color }]}>{part}</Text>
    </TouchableOpacity>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonTitle} />
      <View style={[styles.skeletonTitle, { width: '45%', marginTop: 8 }]} />
      <View style={styles.skeletonChart} />
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyChart() {
  return (
    <View style={styles.emptyWrap}>
      <MaterialCommunityIcons name="chart-line" size={48} color={PALETTE.accent} />
      <Text style={styles.emptyTitle}>No sessions yet</Text>
      <Text style={styles.emptyText}>
        Log your first session to start tracking progress over time.
      </Text>
    </View>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProgressChart({ trainerId, clientId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeParts, setActiveParts] = useState(new Set(BODY_PARTS));
  const [latestGrades, setLatestGrades] = useState({});

  useEffect(() => {
    fetchSessions();
  }, [clientId]);

  const fetchSessions = async () => {
    setLoading(true);
    const result = await loadSessions(trainerId, clientId);
    if (result.success) {
      const ordered = [...result.data].reverse();
      setSessions(ordered);
      if (result.data.length > 0) {
        setLatestGrades(result.data[0].grades || {});
      }
    }
    setLoading(false);
  };

  const togglePart = (part) => {
    setActiveParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) {
        if (next.size === 1) return prev;
        next.delete(part);
      } else {
        next.add(part);
      }
      return next;
    });
  };

  const chartData = (part) =>
    sessions.map((s, i) => ({
      x: i,
      y: s.grades?.[part] ?? 100,
    }));

  if (loading) return (
    <View style={styles.root}>
      <View style={{ gap: 10, paddingHorizontal: 16 }}>
        <SkeletonBlock width="40%" height={14} />
        <SkeletonBlock width="60%" height={22} />
        <SkeletonBlock width="100%" height={220} borderRadius={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );

  if (sessions.length === 0) return (
    <EmptyState
      icon="chart-line"
      title="No sessions yet"
      subtitle="Log your first session to start tracking this client's progress over time."
      color={PALETTE.accent}
    />
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Progress</Text>
          <Text style={styles.title}>Grade History</Text>
        </View>
        <Text style={styles.sessionCount}>{sessions.length} sessions</Text>
      </View>

      {/* Latest grades */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.latestStrip}>
        {BODY_PARTS.map((part) => {
          const g = latestGrades[part] ?? 100;
          const color = PART_COLORS[part];
          return (
            <View key={part} style={[styles.latestCard, { borderColor: color + '55' }]}>
              <MaterialCommunityIcons name={PART_META[part].icon} size={14} color={color} />
              <Text style={styles.latestPart}>{part}</Text>
              <Text style={[styles.latestGrade, { color }]}>{g}%</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Legend toggles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendRow}>
        {BODY_PARTS.map((part) => (
          <LegendPill
            key={part}
            part={part}
            active={activeParts.has(part)}
            onPress={togglePart}
          />
        ))}
      </ScrollView>

      {/* Chart */}
      <View style={styles.chartWrap}>
        <VictoryChart
          width={CHART_W}
          height={CHART_H}
          padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
          domain={{ y: [0, 100] }}
        >
          <VictoryAxis
            dependentAxis
            tickValues={[0, 25, 50, 70, 90, 100]}
            style={{
              axis: { stroke: PALETTE.border },
              tickLabels: { fill: PALETTE.muted, fontSize: 9 },
              grid: { stroke: PALETTE.border, strokeDasharray: '4,4' },
            }}
          />
          <VictoryAxis
            tickValues={sessions.map((_, i) => i)}
            tickFormat={(i) => sessions[i] ? formatDateShort(sessions[i].timestamp) : ''}
            style={{
              axis: { stroke: PALETTE.border },
              tickLabels: {
                fill: PALETTE.muted,
                fontSize: 9,
                angle: sessions.length > 5 ? -30 : 0,
              },
              grid: { stroke: 'transparent' },
            }}
          />

          {BODY_PARTS.filter((p) => activeParts.has(p)).map((part) => (
            <VictoryLine
              key={part}
              data={chartData(part)}
              style={{
                data: {
                  stroke: PART_COLORS[part],
                  strokeWidth: 2.5,
                  strokeLinecap: 'round',
                },
              }}
              interpolation="monotoneX"
            />
          ))}

          {BODY_PARTS.filter((p) => activeParts.has(p)).map((part) => (
            <VictoryScatter
              key={`dot-${part}`}
              data={chartData(part)}
              size={4}
              style={{ data: { fill: PART_COLORS[part] } }}
            />
          ))}
        </VictoryChart>
      </View>

      {/* Hint when only 1 session */}
      {sessions.length === 1 && (
        <View style={styles.chartHint}>
          <MaterialCommunityIcons name="information-outline" size={14} color={PALETTE.muted} />
          <Text style={styles.chartHintText}>
            Log more sessions to see trends over time
          </Text>
        </View>
      )}

      {/* Trend summary */}
      {sessions.length >= 2 ? (
        <View style={styles.trendRow}>
          {BODY_PARTS.map((part) => {
            const first = sessions[0]?.grades?.[part] ?? 100;
            const last = sessions[sessions.length - 1]?.grades?.[part] ?? 100;
            const diff = last - first;
            const color = PART_COLORS[part];
            return (
              <View key={part} style={[styles.trendCard, { borderColor: color + '33' }]}>
                <Text style={[styles.trendPart, { color }]}>{part[0]}</Text>
                <MaterialCommunityIcons
                  name={diff > 0 ? 'trending-up' : diff < 0 ? 'trending-down' : 'minus'}
                  size={13}
                  color={diff > 0 ? PALETTE.success : diff < 0 ? PALETTE.danger : PALETTE.muted}
                />
                <Text style={[styles.trendDiff, {
                  color: diff > 0 ? PALETTE.success : diff < 0 ? PALETTE.danger : PALETTE.muted,
                }]}>
                  {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.needMoreData}>
          <MaterialCommunityIcons name="chart-timeline-variant" size={16} color={PALETTE.muted} />
          <Text style={styles.needMoreDataText}>Log more sessions to see trends</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingBottom: 24 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 14,
  },
  eyebrow: {
    color: PALETTE.muted, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2,
  },
  title: { color: PALETTE.text, fontSize: 20, fontWeight: '800' },
  sessionCount: { color: PALETTE.muted, fontSize: 12, fontWeight: '700' },

  latestStrip: { marginBottom: 12 },
  latestCard: {
    backgroundColor: PALETTE.panel, borderRadius: 12,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', marginRight: 8, gap: 3,
  },
  latestPart: { color: PALETTE.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  latestGrade: { fontSize: 15, fontWeight: '800' },

  legendRow: { marginBottom: 10 },
  legendPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PALETTE.panel, borderRadius: 999,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 8,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: PALETTE.muted, fontSize: 11, fontWeight: '700' },

  chartWrap: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    overflow: 'hidden', marginBottom: 12,
  },
  chartHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PALETTE.panel, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  chartHintText: { color: PALETTE.muted, fontSize: 12, fontWeight: '600' },

  needMoreData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PALETTE.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  needMoreDataText: {
    color: PALETTE.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  trendCard: {
    flex: 1, backgroundColor: PALETTE.panel,
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 8, alignItems: 'center', gap: 3,
  },
  trendPart: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  trendDiff: { fontSize: 11, fontWeight: '800' },

  skeleton: { padding: 16 },
  skeletonTitle: {
    height: 14, backgroundColor: PALETTE.panel,
    borderRadius: 8, width: '40%',
  },
  skeletonChart: {
    height: CHART_H, backgroundColor: PALETTE.panel,
    borderRadius: 16, marginTop: 16,
  },

  emptyWrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: {
    color: PALETTE.text, fontSize: 18, fontWeight: '800',
    marginTop: 14, marginBottom: 8,
  },
  emptyText: { color: PALETTE.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
