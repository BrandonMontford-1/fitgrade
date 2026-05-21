import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { PALETTE } from '../ui/theme';

// Single shimmer block
export function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.85],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: PALETTE.panelAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Roster card skeleton
export function ClientCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardSkeletonTop}>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
        <View style={styles.cardSkeletonInfo}>
          <SkeletonBlock width="60%" height={14} />
          <SkeletonBlock width="40%" height={11} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
      </View>
      <View style={styles.cardSkeletonCircles}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} width={48} height={48} borderRadius={24} />
        ))}
      </View>
      <SkeletonBlock width="50%" height={11} style={{ marginTop: 4 }} />
    </View>
  );
}

// Session card skeleton
export function SessionCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardSkeletonTop}>
        <View style={styles.cardSkeletonInfo}>
          <SkeletonBlock width="45%" height={14} />
          <SkeletonBlock width="30%" height={11} style={{ marginTop: 6 }} />
        </View>
        <SkeletonBlock width={24} height={24} borderRadius={6} />
      </View>
      <View style={styles.cardSkeletonCircles}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonBlock key={i} width={48} height={40} borderRadius={10} />
        ))}
      </View>
    </View>
  );
}

// Roster summary skeleton
export function SummarySkeleton() {
  return (
    <View style={styles.summarySkeleton}>
      <View style={styles.summarySkeletonRow}>
        <SkeletonBlock width="48%" height={120} borderRadius={16} />
        <View style={styles.summarySkeletonMini}>
          <SkeletonBlock width="100%" height={34} borderRadius={12} />
          <SkeletonBlock width="100%" height={34} borderRadius={12} />
          <SkeletonBlock width="100%" height={34} borderRadius={12} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={110} borderRadius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: PALETTE.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  cardSkeletonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardSkeletonInfo: {
    flex: 1,
    gap: 6,
  },
  cardSkeletonCircles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summarySkeleton: {
    marginHorizontal: 16,
    gap: 10,
  },
  summarySkeletonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summarySkeletonMini: {
    flex: 1,
    gap: 8,
  },
});
