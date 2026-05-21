import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { PALETTE } from '../ui/theme';

const { width: W } = Dimensions.get('window');
const SIZE = 160;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

function ArcRing({ progress }) {
  // Convert progress (0-1) to SVG-style arc using RN transforms
  return (
    <View style={styles.ringOuter}>
      {/* Track ring */}
      <View style={styles.track} />
      {/* Animated arc using rotation + clip trick */}
      <ArcSegment progress={progress} color={PALETTE.accent} />
      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.logoText}>FG</Text>
      </View>
    </View>
  );
}

function ArcSegment({ progress, color }) {
  // We use two half-circle views rotated to form an arc
  const firstHalfRotate = useRef(new Animated.Value(0)).current;
  const secondHalfRotate = useRef(new Animated.Value(0)).current;
  const secondHalfOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      if (value <= 0.5) {
        // First half only
        firstHalfRotate.setValue(value * 360);
        secondHalfOpacity.setValue(0);
      } else {
        // Both halves
        firstHalfRotate.setValue(180);
        secondHalfOpacity.setValue(1);
        secondHalfRotate.setValue((value - 0.5) * 360);
      }
    });
    return () => progress.removeListener(id);
  }, []);

  const half = SIZE / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* First half — rotates 0 to 180 */}
      <View style={[styles.halfCircleContainer, { left: half }]}>
        <Animated.View style={[
          styles.halfCircle,
          { borderColor: color },
          { transform: [{ rotate: firstHalfRotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }
        ]} />
      </View>
      {/* Second half — appears at 50%, rotates 0 to 180 */}
      <Animated.View style={[
        styles.halfCircleContainer,
        { right: half, opacity: secondHalfOpacity }
      ]}>
        <Animated.View style={[
          styles.halfCircle,
          styles.halfCircleLeft,
          { borderColor: color },
          { transform: [{ rotate: secondHalfRotate.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }
        ]} />
      </Animated.View>
    </View>
  );
}

export default function LoadingScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();

    // Ring loop
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1, duration: 1600,
          useNativeDriver: false,
          easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        }),
        Animated.timing(progress, {
          toValue: 0, duration: 300, useNativeDriver: false,
        }),
      ])
    );
    ring.start();

    // Dot pulse
    const makeDot = (anim, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    const d1 = makeDot(dotAnim1, 0);
    const d2 = makeDot(dotAnim2, 200);
    const d3 = makeDot(dotAnim3, 400);
    d1.start(); d2.start(); d3.start();

    return () => { ring.stop(); d1.stop(); d2.stop(); d3.stop(); };
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <ArcRing progress={progress} />

      <Text style={styles.appName}>FitGrade</Text>
      <Text style={styles.tagline}>Performance. Tracked.</Text>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  ringOuter: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  track: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderColor: PALETTE.border,
  },

  halfCircleContainer: {
    position: 'absolute',
    top: 0,
    width: SIZE / 2,
    height: SIZE,
    overflow: 'hidden',
  },

  halfCircle: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: STROKE,
    borderColor: PALETTE.accent,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  halfCircleLeft: {
    right: 0,
    borderLeftColor: PALETTE.accent,
    borderBottomColor: PALETTE.accent,
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
  },

  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoText: {
    color: PALETTE.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -2,
  },

  appName: {
    color: PALETTE.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  tagline: {
    color: PALETTE.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.accent,
  },
});
