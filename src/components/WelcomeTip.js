import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../ui/theme';

const TIPS = [
  {
    icon: 'clipboard-pulse-outline',
    color: '#60a5fa',
    title: 'Health Grades',
    body: 'Every client gets a grade (0-100%) for 5 body parts — Head, Arm, Core, Leg, and Foot. 100% means optimal, below 70% needs attention.',
  },
  {
    icon: 'account-group-outline',
    color: '#a78bfa',
    title: 'Roles',
    body: 'Switch between Trainer, Athlete, and Coach views. Trainers log sessions. Athletes see their status. Coaches view read-only.',
  },
  {
    icon: 'lightning-bolt',
    color: '#3b82f6',
    title: 'AI Training Plans',
    body: 'Tap the AI Plan tab on any client. Claude analyzes their grades, injuries, and goals to generate a personalized weekly training plan.',
  },
  {
    icon: 'chart-line',
    color: '#34d399',
    title: 'Track Progress',
    body: 'Log sessions regularly to build a progress chart. The more sessions you log, the better the AI recommendations get.',
  },
];

export default function WelcomeTip() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('fitgrade_welcome_seen').then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const handleDone = async () => {
    await AsyncStorage.setItem('fitgrade_welcome_seen', 'true');
    setVisible(false);
  };

  const current = TIPS[step];
  const isLast = step === TIPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Progress dots */}
          <View style={styles.dots}>
            {TIPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && { backgroundColor: current.color, width: 20 }]} />
            ))}
          </View>

          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: current.color + '22', borderColor: current.color + '44' }]}>
            <MaterialCommunityIcons name={current.icon} size={36} color={current.color} />
          </View>

          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            {!isLast && (
              <TouchableOpacity style={styles.skipBtn} onPress={handleDone}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: current.color }]}
              onPress={isLast ? handleDone : () => setStep((s) => s + 1)}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>{isLast ? 'Get Started' : 'Next'}</Text>
              <MaterialCommunityIcons
                name={isLast ? 'check' : 'arrow-right'}
                size={16} color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  card: {
    backgroundColor: PALETTE.panel, borderRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 24, width: '100%', alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: {
    height: 6, width: 6, borderRadius: 3,
    backgroundColor: PALETTE.border,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: PALETTE.text, fontSize: 22, fontWeight: '800',
    textAlign: 'center', marginBottom: 10,
  },
  body: {
    color: PALETTE.muted, fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 28,
  },
  btnRow: {
    flexDirection: 'row', gap: 10, width: '100%',
  },
  skipBtn: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, backgroundColor: PALETTE.panelAlt,
    borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
