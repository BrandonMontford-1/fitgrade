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
    title: 'Acceptance of Terms',
    content: `By downloading or using FitGrade, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the app.\n\nThese terms apply to all users of FitGrade, including trainers, athletes, coaches, and parents.`,
  },
  {
    title: 'Description of Service',
    content: `FitGrade is a performance tracking application that allows trainers to monitor client health grades, log sessions, flag injuries, and generate AI-powered training recommendations.\n\nFitGrade is not a medical device and does not provide medical advice, diagnosis, or treatment.`,
  },
  {
    title: 'User Accounts',
    content: `You must create an account to use FitGrade. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.\n\nYou agree to provide accurate and complete information when creating your account. You may not impersonate another person or entity.`,
  },
  {
    title: 'Trainer-Athlete Relationships',
    content: `When a trainer links to an athlete via join code, the trainer gains access to that athlete's grade data and session history. Athletes consent to this access by redeeming a join code.\n\nTrainers are responsible for ensuring they have appropriate consent from athletes, particularly for minors, before linking accounts.`,
  },
  {
    title: 'Acceptable Use',
    content: `You agree not to use FitGrade for any unlawful purpose or in any way that could harm other users. You may not attempt to gain unauthorized access to any part of the service.\n\nYou are solely responsible for the accuracy of data you enter into FitGrade. FitGrade is not responsible for decisions made based on inaccurate user-entered data.`,
  },
  {
    title: 'Not Medical Advice',
    content: `FitGrade is a performance tracking tool only. Nothing in FitGrade constitutes medical advice. Health grades and recommendations are based on user-entered data and AI analysis — they are not a substitute for professional medical evaluation.\n\nAlways consult a qualified healthcare professional before making health or training decisions, especially regarding injuries.`,
  },
  {
    title: 'Intellectual Property',
    content: `FitGrade and all its content, features, and functionality are owned by FitGrade and are protected by applicable intellectual property laws.\n\nYou retain ownership of data you enter into FitGrade. By using the service, you grant FitGrade a limited license to store and display your data to provide the service.`,
  },
  {
    title: 'Subscriptions & Billing',
    content: `FitGrade offers a free tier limited to 3 clients and a Pro subscription with unlimited clients and additional features.\n\nPro subscriptions are billed through the Apple App Store. All billing is handled by Apple and subject to Apple's payment terms. FitGrade does not store payment information.\n\nSubscriptions auto-renew unless cancelled at least 24 hours before the end of the billing period.`,
  },
  {
    title: 'Termination',
    content: `You may terminate your account at any time by contacting support@fitgrade.app. We may suspend or terminate your account if you violate these terms.\n\nUpon termination, your data will be deleted in accordance with our Privacy Policy.`,
  },
  {
    title: 'Limitation of Liability',
    content: `FitGrade is provided "as is" without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.\n\nOur total liability to you for any claims arising from use of FitGrade shall not exceed the amount you paid for the service in the 12 months preceding the claim.`,
  },
  {
    title: 'Changes to Terms',
    content: `We may update these Terms of Service at any time. We will notify you of significant changes through the app. Continued use of FitGrade after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: 'Contact',
    content: `For questions about these Terms of Service, contact us at:\n\nsupport@fitgrade.app`,
  },
];

export default function TermsOfServiceScreen({ onBack }) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={PALETTE.silver} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerSub}>Last updated May 2025</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <MaterialCommunityIcons name="file-document-outline" size={32} color={PALETTE.accent} />
          <Text style={styles.introText}>
            Please read these terms carefully before using FitGrade. By using the app you agree to be bound by these terms.
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
