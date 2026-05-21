import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');
const SIL_W = Math.min(SCREEN_W * 0.42, 175);
const SIL_H = SIL_W * 2.6;
const VW = 100;
const VH = 260;

const gradeColor = (g) => {
  if (g >= 90) return '#22c55e';
  if (g >= 70) return '#f59e0b';
  return '#ef4444';
};

const gradeOpacity = (g) => 0.55 + (g / 100) * 0.45;

function FrontBody({ metrics, selectedPart, onPress }) {
  const g = (part) => metrics[part] ?? 100;
  const c = (part) => gradeColor(g(part));
  const o = (part) => gradeOpacity(g(part));
  const sel = (part) => selectedPart === part;

  return (
    <Svg width={SIL_W} height={SIL_H} viewBox={`0 0 ${VW} ${VH}`}>
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0f1018" stopOpacity="1" />
          <Stop offset="1" stopColor="#08090f" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width={VW} height={VH} fill="url(#bg)" rx="12" />

      {/* HEAD */}
      <G onPress={() => onPress('Head')} opacity={o('Head')}>
        <Path d="M44 38 Q44 46 43 50 L57 50 Q56 46 56 38 Z" fill={c('Head')} opacity={0.85} />
        <Path d="M38 18 Q38 8 50 8 Q62 8 62 18 L62 34 Q62 42 50 43 Q38 42 38 34 Z" fill={c('Head')} opacity={sel('Head') ? 1 : 0.85} />
        <Path d="M38 22 Q34 22 34 28 Q34 33 38 33 Z" fill={c('Head')} opacity={0.7} />
        <Path d="M62 22 Q66 22 66 28 Q66 33 62 33 Z" fill={c('Head')} opacity={0.7} />
        <Rect x="34" y="8" width="32" height="44" fill="transparent" />
      </G>

      {/* CORE */}
      <G onPress={() => onPress('Core')} opacity={o('Core')}>
        <Path d="M43 50 Q30 52 26 58 Q24 64 26 70 L36 68 Q34 64 38 60 L62 60 Q66 64 64 68 L74 70 Q76 64 74 58 Q70 52 57 50 Z" fill={c('Core')} opacity={sel('Core') ? 1 : 0.85} />
        <Path d="M36 60 Q36 72 35 82 Q35 90 36 96 L64 96 Q65 90 65 82 Q64 72 64 60 Z" fill={c('Core')} opacity={sel('Core') ? 1 : 0.85} />
        <Path d="M36 96 Q35 108 37 118 Q39 124 50 125 Q61 124 63 118 Q65 108 64 96 Z" fill={c('Core')} opacity={sel('Core') ? 0.9 : 0.75} />
        <Rect x="26" y="50" width="48" height="76" fill="transparent" />
      </G>

      {/* ARMS */}
      <G onPress={() => onPress('Arm')} opacity={o('Arm')}>
        <Path d="M26 62 Q18 64 15 76 Q13 86 15 96 Q18 102 24 100 L28 88 Q26 80 28 70 Z" fill={c('Arm')} opacity={sel('Arm') ? 1 : 0.85} />
        <Path d="M15 96 Q12 108 13 118 Q14 124 18 126 Q22 128 25 123 L28 112 Q26 104 24 100 Z" fill={c('Arm')} opacity={sel('Arm') ? 0.9 : 0.75} />
        <Path d="M13 118 Q11 126 13 132 Q16 138 20 136 Q24 134 25 126 Z" fill={c('Arm')} opacity={0.65} />
        <Path d="M74 62 Q82 64 85 76 Q87 86 85 96 Q82 102 76 100 L72 88 Q74 80 72 70 Z" fill={c('Arm')} opacity={sel('Arm') ? 1 : 0.85} />
        <Path d="M85 96 Q88 108 87 118 Q86 124 82 126 Q78 128 75 123 L72 112 Q74 104 76 100 Z" fill={c('Arm')} opacity={sel('Arm') ? 0.9 : 0.75} />
        <Path d="M87 118 Q89 126 87 132 Q84 138 80 136 Q76 134 75 126 Z" fill={c('Arm')} opacity={0.65} />
        <Rect x="11" y="60" width="20" height="78" fill="transparent" />
        <Rect x="70" y="60" width="20" height="78" fill="transparent" />
      </G>

      {/* LEGS */}
      <G onPress={() => onPress('Leg')} opacity={o('Leg')}>
        <Path d="M37 118 Q34 126 34 134 L50 136 L66 134 Q66 126 63 118 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M34 134 Q30 148 30 162 Q30 172 33 178 L46 176 Q47 162 48 150 L50 136 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M33 178 Q30 192 31 204 Q32 210 36 212 L46 210 Q47 196 46 184 L46 176 Z" fill={c('Leg')} opacity={sel('Leg') ? 0.85 : 0.7} />
        <Path d="M66 134 Q70 148 70 162 Q70 172 67 178 L54 176 Q53 162 52 150 L50 136 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M67 178 Q70 192 69 204 Q68 210 64 212 L54 210 Q53 196 54 184 L54 176 Z" fill={c('Leg')} opacity={sel('Leg') ? 0.85 : 0.7} />
        <Rect x="29" y="118" width="42" height="96" fill="transparent" />
      </G>

      {/* FEET */}
      <G onPress={() => onPress('Foot')} opacity={o('Foot')}>
        <Path d="M31 204 Q28 214 28 220 Q28 226 33 228 Q39 230 43 225 Q46 222 46 218 L46 210 Q40 214 36 212 Z" fill={c('Foot')} opacity={sel('Foot') ? 1 : 0.85} />
        <Path d="M69 204 Q72 214 72 220 Q72 226 67 228 Q61 230 57 225 Q54 222 54 218 L54 210 Q60 214 64 212 Z" fill={c('Foot')} opacity={sel('Foot') ? 1 : 0.85} />
        <Rect x="26" y="200" width="48" height="32" fill="transparent" />
      </G>
    </Svg>
  );
}

function BackBody({ metrics, selectedPart, onPress }) {
  const g = (part) => metrics[part] ?? 100;
  const c = (part) => gradeColor(g(part));
  const o = (part) => gradeOpacity(g(part));
  const sel = (part) => selectedPart === part;

  return (
    <Svg width={SIL_W} height={SIL_H} viewBox={`0 0 ${VW} ${VH}`}>
      <Defs>
        <LinearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0f1018" stopOpacity="1" />
          <Stop offset="1" stopColor="#08090f" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width={VW} height={VH} fill="url(#bg2)" rx="12" />

      <G onPress={() => onPress('Head')} opacity={o('Head')}>
        <Path d="M38 18 Q38 8 50 8 Q62 8 62 18 L62 34 Q62 42 50 43 Q38 42 38 34 Z" fill={c('Head')} opacity={sel('Head') ? 1 : 0.85} />
        <Path d="M44 38 Q44 46 43 50 L57 50 Q56 46 56 38 Z" fill={c('Head')} opacity={0.85} />
        <Rect x="34" y="8" width="32" height="44" fill="transparent" />
      </G>

      <G onPress={() => onPress('Core')} opacity={o('Core')}>
        <Path d="M43 50 Q30 52 26 58 Q24 64 26 70 L36 68 Q34 64 38 60 L62 60 Q66 64 64 68 L74 70 Q76 64 74 58 Q70 52 57 50 Z" fill={c('Core')} opacity={sel('Core') ? 1 : 0.85} />
        <Path d="M36 60 L64 60 L65 125 Q50 128 35 125 Z" fill={c('Core')} opacity={sel('Core') ? 1 : 0.85} />
        <Rect x="26" y="50" width="48" height="76" fill="transparent" />
      </G>

      <G onPress={() => onPress('Arm')} opacity={o('Arm')}>
        <Path d="M26 62 Q18 64 15 76 Q13 86 15 96 Q18 102 24 100 L28 88 Q26 80 28 70 Z" fill={c('Arm')} opacity={sel('Arm') ? 1 : 0.85} />
        <Path d="M15 96 Q12 108 13 118 Q14 124 18 126 Q22 128 25 123 L28 112 Q26 104 24 100 Z" fill={c('Arm')} opacity={0.8} />
        <Path d="M74 62 Q82 64 85 76 Q87 86 85 96 Q82 102 76 100 L72 88 Q74 80 72 70 Z" fill={c('Arm')} opacity={sel('Arm') ? 1 : 0.85} />
        <Path d="M85 96 Q88 108 87 118 Q86 124 82 126 Q78 128 75 123 L72 112 Q74 104 76 100 Z" fill={c('Arm')} opacity={0.8} />
        <Rect x="11" y="60" width="20" height="68" fill="transparent" />
        <Rect x="70" y="60" width="20" height="68" fill="transparent" />
      </G>

      <G onPress={() => onPress('Leg')} opacity={o('Leg')}>
        <Path d="M35 125 Q50 128 65 125 L66 134 L50 136 L34 134 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M34 134 Q30 150 30 164 Q30 174 34 180 L46 178 Q47 164 48 150 L50 136 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M34 180 Q31 194 32 206 Q33 212 37 214 L47 212 Q47 198 46 184 L46 178 Z" fill={c('Leg')} opacity={0.8} />
        <Path d="M66 134 Q70 150 70 164 Q70 174 66 180 L54 178 Q53 164 52 150 L50 136 Z" fill={c('Leg')} opacity={sel('Leg') ? 1 : 0.85} />
        <Path d="M66 180 Q69 194 68 206 Q67 212 63 214 L53 212 Q53 198 54 184 L54 178 Z" fill={c('Leg')} opacity={0.8} />
        <Rect x="29" y="118" width="42" height="96" fill="transparent" />
      </G>

      <G onPress={() => onPress('Foot')} opacity={o('Foot')}>
        <Path d="M32 206 Q29 216 30 222 Q31 228 36 229 Q42 230 45 225 L47 212 Q42 216 37 214 Z" fill={c('Foot')} opacity={sel('Foot') ? 1 : 0.85} />
        <Path d="M68 206 Q71 216 70 222 Q69 228 64 229 Q58 230 55 225 L53 212 Q58 216 63 214 Z" fill={c('Foot')} opacity={sel('Foot') ? 1 : 0.85} />
        <Rect x="26" y="202" width="48" height="30" fill="transparent" />
      </G>
    </Svg>
  );
}

export default function BodyHologram({ metrics, selectedPart, onRegionPress }) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFront, setIsFront] = useState(true);
  const [paused, setPaused] = useState(false);
  const animRef = useRef(null);

  const startRotation = () => {
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(flipAnim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(flipAnim, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    animRef.current.start();
  };

  useEffect(() => {
    if (!paused) startRotation();
    else animRef.current?.stop();
    return () => animRef.current?.stop();
  }, [paused]);

  const listenerRef = useRef(null);
  useEffect(() => {
    listenerRef.current = flipAnim.addListener(({ value }) => {
      setIsFront(value < 0.5);
    });
    return () => flipAnim.removeListener(listenerRef.current);
  }, []);

  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scaleX }] }}>
        <TouchableOpacity onPress={() => setPaused((p) => !p)} activeOpacity={1}>
          {isFront
            ? <FrontBody metrics={metrics} selectedPart={selectedPart} onPress={onRegionPress} />
            : <BackBody metrics={metrics} selectedPart={selectedPart} onPress={onRegionPress} />
          }
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.hint}>
        {paused ? 'Tap to resume' : `${isFront ? 'FRONT' : 'BACK'} · Auto-rotating · tap to pause`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  hint: {
    color: '#ffffff33',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
