import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';
import { generateJoinCode, redeemJoinCode } from '../services/firebaseService';

// ─── Trainer side — generates and shows code ──────────────────────────────────
export function TrainerJoinCodeModal({ visible, onClose, client, trainerId }) {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateJoinCode(trainerId, client.id, client.name);
    setLoading(false);
    if (result.success) {
      setCode(result.code);
    } else {
      Alert.alert('Error', result.message || 'Could not generate code.');
    }
  };

  const handleClose = () => {
    setCode(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Athlete Join Code</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>

          <Text style={styles.clientName}>{client?.name}</Text>

          {!code ? (
            <>
              <Text style={styles.desc}>
                Generate a 6-digit code and show or read it to your athlete. They enter it in their FitGrade app to connect their self-reports to this client card.
              </Text>
              <View style={styles.howRow}>
                {[
                  { icon: 'numeric', label: 'Generate code' },
                  { icon: 'eye-outline', label: 'Show athlete' },
                  { icon: 'link-variant', label: 'Connected!' },
                ].map((s, i) => (
                  <View key={i} style={styles.step}>
                    <View style={styles.stepIcon}>
                      <MaterialCommunityIcons name={s.icon} size={18} color={PALETTE.accent} />
                    </View>
                    <Text style={styles.stepLabel}>{s.label}</Text>
                    {i < 2 && <MaterialCommunityIcons name="chevron-right" size={14} color={PALETTE.muted} style={styles.stepArrow} />}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.generateBtn, loading && { opacity: 0.6 }]}
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="key-outline" size={18} color="#fff" />
                    <Text style={styles.generateBtnText}>Generate Code</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>
                Show this code to {client?.name} or read it aloud. It expires in 24 hours.
              </Text>

              {/* Big code display */}
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>
                  {code.slice(0, 3)} {code.slice(3)}
                </Text>
                <Text style={styles.codeExpiry}>Expires in 24 hours · single use</Text>
              </View>

              <Text style={styles.instructionTitle}>Tell your athlete:</Text>
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  "Open FitGrade → tap Connect to Trainer → enter this code: <Text style={{ color: PALETTE.accent, fontWeight: '800' }}>{code.slice(0, 3)} {code.slice(3)}</Text>"
                </Text>
              </View>

              <TouchableOpacity style={styles.newCodeBtn} onPress={() => setCode(null)}>
                <MaterialCommunityIcons name="refresh" size={14} color={PALETTE.muted} />
                <Text style={styles.newCodeBtnText}>Generate new code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Athlete side — enters code to connect ───────────────────────────────────
export function AthleteConnectModal({ visible, onClose, athleteId, athleteName, onConnected }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (code.replace(/\s/g, '').length !== 6) {
      Alert.alert('Invalid code', 'Please enter the full 6-digit code from your trainer.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    const result = await redeemJoinCode(athleteId, athleteName, code.replace(/\s/g, ''));
    setLoading(false);
    if (result.success) {
      Alert.alert(
        '✓ Connected!',
        `You're now linked to your trainer's roster. Your updates will appear on your trainer's screen.`,
        [{ text: 'Great!', onPress: () => { setCode(''); onClose(); onConnected?.(result); } }]
      );
    } else {
      Alert.alert('Could not connect', result.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Connect to Trainer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Ask your trainer to generate a join code in FitGrade and enter it below. Your updates and self-reports will appear directly on their roster.
          </Text>

          <View style={styles.codeInputWrap}>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(v) => {
                // Auto-format with space in middle
                const clean = v.replace(/\D/g, '').slice(0, 6);
                setCode(clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean);
              }}
              placeholder="000 000"
              placeholderTextColor={PALETTE.muted}
              keyboardType="number-pad"
              maxLength={7}
              textAlign="center"
              color={PALETTE.text}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, (loading || code.replace(/\s/g, '').length < 6) && { opacity: 0.5 }]}
            onPress={handleRedeem}
            disabled={loading || code.replace(/\s/g, '').length < 6}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="link-variant" size={18} color="#fff" />
                <Text style={styles.generateBtnText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Don't have a code? Ask your trainer to open your client card in FitGrade and tap "Get Join Code".
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: PALETTE.panel, borderRadius: 20,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 22, width: '100%', gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: PALETTE.text, fontSize: 17, fontWeight: '800' },
  closeBtn: { padding: 4 },
  clientName: { color: PALETTE.accent, fontSize: 13, fontWeight: '700', marginTop: -8 },

  desc: { color: PALETTE.muted, fontSize: 13, lineHeight: 19 },

  howRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  step: { alignItems: 'center', gap: 4 },
  stepIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PALETTE.accentSoft, borderWidth: 1, borderColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: { color: PALETTE.muted, fontSize: 10, fontWeight: '700', textAlign: 'center', maxWidth: 60 },
  stepArrow: { marginBottom: 16 },

  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 14,
    paddingVertical: 14,
    shadowColor: PALETTE.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  codeBox: {
    backgroundColor: PALETTE.background, borderRadius: 16,
    borderWidth: 2, borderColor: PALETTE.accent,
    alignItems: 'center', paddingVertical: 20,
    shadowColor: PALETTE.accent, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  codeText: {
    color: PALETTE.text, fontSize: 44, fontWeight: '900',
    letterSpacing: 8, fontVariant: ['tabular-nums'],
  },
  codeExpiry: { color: PALETTE.muted, fontSize: 11, marginTop: 6, fontWeight: '600' },

  instructionTitle: { color: PALETTE.silver, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  instructionBox: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border, padding: 12,
  },
  instructionText: { color: PALETTE.muted, fontSize: 13, lineHeight: 19 },

  newCodeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
  },
  newCodeBtnText: { color: PALETTE.muted, fontSize: 12, fontWeight: '700' },

  codeInputWrap: { alignItems: 'center' },
  codeInput: {
    backgroundColor: PALETTE.background, borderRadius: 16,
    borderWidth: 2, borderColor: PALETTE.accent,
    fontSize: 40, fontWeight: '900', letterSpacing: 8,
    paddingVertical: 16, paddingHorizontal: 24,
    minWidth: 200, textAlign: 'center',
  },
  hint: {
    color: PALETTE.muted, fontSize: 11, textAlign: 'center', lineHeight: 17,
  },
});
