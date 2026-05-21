import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: `FitGrade collects information you provide directly, including your name, email address, and the health and performance data you enter for yourself or your clients. This includes body part grades, session notes, injury flags, and training history.\n\nWe do not collect any information automatically beyond what is required for the app to function.`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use your information solely to provide the FitGrade service. This includes displaying your data within the app, syncing it across your devices, and generating AI-powered training recommendations based on your grades.\n\nWe do not sell your data to third parties. We do not use your data for advertising purposes.`,
  },
  {
    title: 'Data Storage & Security',
    content: `Your data is stored securely using Google Firebase, which is encrypted in transit and at rest. We take reasonable measures to protect your information from unauthorized access.\n\nYou are responsible for maintaining the security of your account credentials.`,
  },
  {
    title: 'Health Data',
    content: `FitGrade stores performance and wellness grades that you or your trainer enter manually. This data is used only within the app and is never shared with insurance companies, employers, or other third parties.\n\nFitGrade is not a medical application and does not provide medical advice. Always consult a qualified healthcare professional for medical decisions.`,
  },
  {
    title: 'Data Sharing',
    content: `When you use FitGrade in a trainer-athlete relationship, the trainer you are linked to has access to your grades, session history, and notes. This is the core function of the connected mode.\n\nOutside of this relationship, your data is not shared with other users.`,
  },
  {
    title: 'Data Deletion',
    content: `You may request deletion of your account and all associated data at any time by contacting us at support@fitgrade.app. We will process deletion requests within 30 days.\n\nDeleting your account will permanently remove all your data from our servers and cannot be undone.`,
  },
  {
    title: 'Children\'s Privacy',
    content: `FitGrade is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Continued use of FitGrade after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact Us',
    content: `If you have questions about this Privacy Policy or how we handle your data, contact us at:\n\nsupport@fitgrade.app`,
  },
];

export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>Last updated May 2025</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <MaterialCommunityIcons name="shield-check-outline" size={32} color={PALETTE.accent} />
          <Text style={styles.introText}>
            FitGrade is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.
          </Text>
        </View>

        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { color: PALETTE.text, fontSize: 18, fontWeight: '800' },
  headerSub: { color: PALETTE.muted, fontSize: 12, marginTop: 2 },

  scroll: { flex: 1 },

  intro: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    margin: 16, padding: 16,
    backgroundColor: PALETTE.accentSoft, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.accent + '33',
  },
  introText: {
    color: PALETTE.text, fontSize: 13, lineHeight: 20, flex: 1,
  },

  section: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, padding: 16,
  },
  sectionTitle: {
    color: PALETTE.text, fontSize: 15, fontWeight: '800', marginBottom: 10,
  },
  sectionContent: {
    color: PALETTE.muted, fontSize: 13, lineHeight: 21,
  },
});
