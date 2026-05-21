import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BODY_PARTS, PALETTE, PART_META, getNumericGrade, gradeColor } from '../ui/theme';
import { saveSession } from '../services/firebaseService';

export default function QuickLogModal({ visible, onClose, clients, trainerId, onDone }) {
  const clientList = Object.values(clients || {});
  const [current, setCurrent] = useState(0);
  const [grades, setGrades] = useState({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState([]);

  const client = clientList[current];

  const getGrades = (c) => grades[c?.id] || Object.fromEntries(
    BODY_PARTS.map((p) => [p, getNumericGrade(c?.[p], 100)])
  );

  const setClientGrade = (clientId, part, val) => {
    const parsed = Math.max(0, Math.min(100, parseInt(val) || 0));
    setGrades((prev) => ({
      ...prev,
      [clientId]: { ...(prev[clientId] || {}), [part]: parsed },
    }));
  };

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    const g = getGrades(client);
    await saveSession(trainerId, client.id, {
      grades: g,
      targets: client.targets || {},
      injuries: client.injuries || {},
      injuryNotes: client.injuryNotes || {},
      injurySeverities: client.injurySeverities || {},
      sessionNote: note,
    });
    setDone((prev) => [...prev, client.id]);
    setNote('');
    setSaving(false);
    if (current < clientList.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      onDone?.();
      onClose();
      setCurrent(0);
      setDone([]);
    }
  };

  const handleSkip = () => {
    if (current < clientList.length - 1) setCurrent((prev) => prev + 1);
    else { onClose(); setCurrent(0); setDone([]); }
  };

  if (!client) return null;
  const clientGrades = getGrades(client);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Quick Log</Text>
              <Text style={styles.headerSub}>{current + 1} of {clientList.length} clients</Text>
            </View>
            <View style={styles.progress}>
              {clientList.map((c, i) => (
                <View key={c.id} style={[
                  styles.progressDot,
                  i === current && { backgroundColor: PALETTE.accent, width: 16 },
                  done.includes(c.id) && { backgroundColor: PALETTE.success },
                ]} />
              ))}
            </View>
          </View>

          {/* Client name */}
          <View style={styles.clientHeader}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>{(client.name || '?')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientSub}>{client.sport || 'General'}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Grade steppers */}
            {BODY_PARTS.map((part) => {
              const g = clientGrades[part];
              const color = gradeColor(g);
              return (
                <View key={part} style={styles.gradeRow}>
                  <MaterialCommunityIcons name={PART_META[part].icon} size={16} color={color} />
                  <Text style={styles.gradeLabel}>{part}</Text>
                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setClientGrade(client.id, part, g - 5)}
                    >
                      <MaterialCommunityIcons name="minus" size={14} color={PALETTE.text} />
                    </TouchableOpacity>
                    <Text style={[styles.gradeNum, { color }]}>{g}%</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => setClientGrade(client.id, part, g + 5)}
                    >
                      <MaterialCommunityIcons name="plus" size={14} color={PALETTE.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Note */}
            <TextInput
              style={styles.noteInput}
              placeholder="Session note (optional)..."
              placeholderTextColor={PALETTE.muted}
              value={note}
              onChangeText={setNote}
              multiline
              color={PALETTE.text}
            />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>
                    {current < clientList.length - 1 ? 'Save & Next' : 'Save & Finish'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: PALETTE.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border, maxHeight: '90%',
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
  },
  closeBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { color: PALETTE.text, fontSize: 16, fontWeight: '800' },
  headerSub: { color: PALETTE.muted, fontSize: 12 },
  progress: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.border },

  clientHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  clientAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: PALETTE.accentSoft, borderWidth: 1, borderColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  clientAvatarText: { color: PALETTE.accent, fontSize: 18, fontWeight: '800' },
  clientName: { color: PALETTE.text, fontSize: 17, fontWeight: '800' },
  clientSub: { color: PALETTE.muted, fontSize: 12 },

  scroll: { paddingHorizontal: 16, maxHeight: 360 },
  gradeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 12, marginBottom: 8,
  },
  gradeLabel: { color: PALETTE.text, fontSize: 14, fontWeight: '700', flex: 1 },
  stepperWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: PALETTE.panel, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeNum: { fontSize: 16, fontWeight: '800', minWidth: 42, textAlign: 'center' },
  noteInput: {
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 12, fontSize: 13, minHeight: 60, textAlignVertical: 'top',
    marginBottom: 12, color: PALETTE.text,
  },

  btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  skipBtn: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
    backgroundColor: PALETTE.panelAlt, borderWidth: 1, borderColor: PALETTE.border,
    alignItems: 'center', justifyContent: 'center',
  },
  skipBtnText: { color: PALETTE.muted, fontSize: 13, fontWeight: '700' },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 12, paddingVertical: 12,
    shadowColor: PALETTE.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
