import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

const ROLES = [
  {
    key: 'trainer',
    icon: 'clipboard-edit-outline',
    color: '#3b82f6',
    title: 'Trainer / Coach',
    subtitle: 'I track and manage athletes',
    desc: 'Access your full roster, log sessions, generate AI plans, and monitor client health.',
  },
  {
    key: 'athlete',
    icon: 'account-outline',
    color: '#22c55e',
    title: 'Athlete / Client',
    subtitle: 'My trainer set this up for me',
    desc: 'See your own body grades, send updates to your trainer, and view your AI training plan.',
  },
];

export default function RoleSelectScreen({ onSelect }) {
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="lightning-bolt" size={28} color={PALETTE.accent} />
          <Text style={styles.logoText}>FitGrade</Text>
        </View>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>
          Choose your role to get the right experience.{'\n'}You can always change this later in settings.
        </Text>
      </View>

      {/* Role cards */}
      <View style={styles.cards}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.card, { borderColor: r.color + '44' }]}
            onPress={() => onSelect(r.key)}
            activeOpacity={0.85}
          >
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: r.color }]} />

            <View style={[styles.iconCircle, { backgroundColor: r.color + '18', borderColor: r.color + '44' }]}>
              <MaterialCommunityIcons name={r.icon} size={32} color={r.color} />
            </View>

            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: r.color }]}>{r.title}</Text>
              <Text style={styles.cardSubtitle}>{r.subtitle}</Text>
              <Text style={styles.cardDesc}>{r.desc}</Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={22} color={r.color} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footer}>
        FitGrade · Track. Train. Perform.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: PALETTE.background,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40,
  },

  header: { marginBottom: 36, alignItems: 'center' },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32,
  },
  logoText: {
    color: PALETTE.text, fontSize: 24, fontWeight: '900', letterSpacing: 0.5,
  },
  title: {
    color: PALETTE.text, fontSize: 28, fontWeight: '800',
    textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    color: PALETTE.muted, fontSize: 14, textAlign: 'center', lineHeight: 21,
  },

  cards: { gap: 16, flex: 1, justifyContent: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: PALETTE.panel, borderRadius: 18,
    borderWidth: 1.5, padding: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  accentBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardSubtitle: { color: PALETTE.silver, fontSize: 12, fontWeight: '600' },
  cardDesc: { color: PALETTE.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },

  footer: {
    color: PALETTE.muted, fontSize: 12,
    textAlign: 'center', marginTop: 24,
  },
});
