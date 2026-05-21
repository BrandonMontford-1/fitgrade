import React, { useRef, useEffect } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

const FEATURES = [
  { icon: 'account-group-outline', label: 'Unlimited clients', sub: 'Free plan limited to 3' },
  { icon: 'lightning-bolt', label: 'AI training plans', sub: 'Personalized 7-day programs' },
  { icon: 'chart-line', label: 'Advanced analytics', sub: 'Full session history & trends' },
  { icon: 'shield-check-outline', label: 'Audit log', sub: 'Track every change made' },
  { icon: 'key-outline', label: 'Join code system', sub: 'Link athletes directly' },
  { icon: 'cloud-sync-outline', label: 'Priority sync', sub: 'Faster data across devices' },
];

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '$9.99',
    period: '/month',
    badge: null,
    color: PALETTE.accent,
  },
  {
    key: 'annual',
    label: 'Annual',
    price: '$59.99',
    period: '/year',
    badge: 'SAVE 50%',
    color: '#22c55e',
  },
];

export default function PaywallScreen({ onClose, onUpgrade }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [selectedPlan, setSelectedPlan] = React.useState('annual');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const plan = PLANS.find(p => p.key === selectedPlan);

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <MaterialCommunityIcons name="close" size={20} color={PALETTE.muted} />
          </TouchableOpacity>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.crownWrap}>
              <MaterialCommunityIcons name="crown" size={40} color="#f59e0b" />
            </View>
            <Text style={styles.heroTitle}>FitGrade Pro</Text>
            <Text style={styles.heroSub}>
              Everything you need to run a professional training operation — unlimited clients, AI plans, and full analytics.
            </Text>
          </View>

          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name={f.icon} size={18} color={PALETTE.accent} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
                <MaterialCommunityIcons name="check-circle" size={16} color={PALETTE.success} />
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <Text style={styles.planSectionLabel}>CHOOSE YOUR PLAN</Text>
          <View style={styles.planRow}>
            {PLANS.map((p) => {
              const active = selectedPlan === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setSelectedPlan(p.key)}
                  style={[
                    styles.planCard,
                    active && { borderColor: p.color, backgroundColor: p.color + '18' },
                  ]}
                  activeOpacity={0.85}
                >
                  {p.badge && (
                    <View style={[styles.planBadge, { backgroundColor: p.color }]}>
                      <Text style={styles.planBadgeText}>{p.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.planLabel, active && { color: p.color }]}>{p.label}</Text>
                  <Text style={[styles.planPrice, active && { color: p.color }]}>{p.price}</Text>
                  <Text style={styles.planPeriod}>{p.period}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.upgradeBtn, { backgroundColor: plan.color }]}
            onPress={onUpgrade}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="crown" size={18} color="#fff" />
            <Text style={styles.upgradeBtnText}>
              Start Pro — {plan.price}{plan.period}
            </Text>
          </TouchableOpacity>

          <Text style={styles.legalNote}>
            Cancel anytime. No hidden fees. Billed through the App Store.
          </Text>

          {/* Free plan reminder */}
          <TouchableOpacity style={styles.continueBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>Continue with Free (3 clients max)</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },

  hero: { alignItems: 'center', marginBottom: 28 },
  crownWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#f59e0b22',
    borderWidth: 1.5, borderColor: '#f59e0b44',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: PALETTE.text, fontSize: 30, fontWeight: '900',
    letterSpacing: -0.5, marginBottom: 10,
  },
  heroSub: {
    color: PALETTE.muted, fontSize: 14, textAlign: 'center',
    lineHeight: 21, maxWidth: 300,
  },

  featureList: {
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 4, marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: PALETTE.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '700' },
  featureSub: { color: PALETTE.muted, fontSize: 11, marginTop: 1 },

  planSectionLabel: {
    color: PALETTE.muted, fontSize: 9, fontWeight: '800',
    letterSpacing: 1.5, marginBottom: 10,
  },

  planRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: {
    flex: 1, backgroundColor: PALETTE.panel,
    borderRadius: 16, borderWidth: 1.5, borderColor: PALETTE.border,
    padding: 16, alignItems: 'center', gap: 4, position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute', top: 0, right: 0,
    paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  planBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  planLabel: { color: PALETTE.muted, fontSize: 12, fontWeight: '700', marginTop: 8 },
  planPrice: { color: PALETTE.text, fontSize: 24, fontWeight: '900' },
  planPeriod: { color: PALETTE.muted, fontSize: 11, fontWeight: '600' },

  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 16,
    marginBottom: 12,
    shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  legalNote: {
    color: PALETTE.muted, fontSize: 11,
    textAlign: 'center', marginBottom: 16, lineHeight: 16,
  },

  continueBtn: { alignItems: 'center', paddingVertical: 8 },
  continueBtnText: { color: PALETTE.muted, fontSize: 13, fontWeight: '600' },
});
