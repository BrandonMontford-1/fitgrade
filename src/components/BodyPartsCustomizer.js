import React, { useState } from 'react';
import {
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
import { PALETTE, BODY_PART_PRESETS, DEFAULT_PART_COLORS } from '../ui/theme';
import { saveTrainerPrefs } from '../services/firebaseService';

export default function BodyPartsCustomizer({ visible, onClose, trainerId, currentParts, onSave }) {
  const [selectedPreset, setSelectedPreset] = useState('athletic');
  const [customParts, setCustomParts] = useState(
    currentParts?.length ? currentParts : ['', '', '', '', '']
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const preset = BODY_PART_PRESETS[selectedPreset];
    const parts = selectedPreset === 'custom'
      ? customParts.filter(p => p.trim().length > 0)
      : preset.parts;

    if (parts.length < 3) {
      Alert.alert('Too few parts', 'Please add at least 3 body parts.');
      return;
    }
    if (parts.length > 6) {
      Alert.alert('Too many parts', 'Maximum 6 body parts allowed.');
      return;
    }

    setSaving(true);
    await saveTrainerPrefs(trainerId, {
      bodyParts: parts,
      bodyPartPreset: selectedPreset,
    });
    setSaving(false);
    onSave?.(parts, selectedPreset);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Body Part Labels</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Choose a preset that matches your training style, or create your own.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Preset grid */}
            <View style={styles.presetGrid}>
              {Object.entries(BODY_PART_PRESETS).map(([key, preset]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.presetCard, selectedPreset === key && { borderColor: PALETTE.accent, backgroundColor: PALETTE.accentSoft }]}
                  onPress={() => setSelectedPreset(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetLabel, selectedPreset === key && { color: PALETTE.accent }]}>
                    {preset.label}
                  </Text>
                  <Text style={styles.presetParts}>
                    {key === 'custom' ? 'Your own labels' : preset.parts.join(' · ')}
                  </Text>
                  {selectedPreset === key && (
                    <MaterialCommunityIcons name="check-circle" size={14} color={PALETTE.accent} style={styles.presetCheck} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            {selectedPreset !== 'custom' && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>PREVIEW</Text>
                <View style={styles.previewRow}>
                  {BODY_PART_PRESETS[selectedPreset].parts.map((part, i) => (
                    <View key={part} style={[styles.previewPill, { borderColor: DEFAULT_PART_COLORS[i] + '88', backgroundColor: DEFAULT_PART_COLORS[i] + '18' }]}>
                      <Text style={[styles.previewPillText, { color: DEFAULT_PART_COLORS[i] }]}>{part}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Custom input */}
            {selectedPreset === 'custom' && (
              <View style={styles.customSection}>
                <Text style={styles.previewLabel}>YOUR BODY PARTS (3-6)</Text>
                {customParts.map((part, i) => (
                  <View key={i} style={styles.customRow}>
                    <View style={[styles.customDot, { backgroundColor: DEFAULT_PART_COLORS[i] || '#6b7890' }]} />
                    <TextInput
                      style={styles.customInput}
                      value={part}
                      onChangeText={(v) => {
                        const next = [...customParts];
                        next[i] = v;
                        setCustomParts(next);
                      }}
                      placeholder={`Part ${i + 1} — e.g. Hips, Shoulders...`}
                      placeholderTextColor={PALETTE.muted}
                      color={PALETTE.text}
                      autoCapitalize="words"
                    />
                    {customParts.length > 3 && (
                      <TouchableOpacity onPress={() => setCustomParts(customParts.filter((_, j) => j !== i))}>
                        <MaterialCommunityIcons name="close" size={16} color={PALETTE.muted} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {customParts.length < 6 && (
                  <TouchableOpacity style={styles.addPartBtn} onPress={() => setCustomParts([...customParts, ''])}>
                    <MaterialCommunityIcons name="plus" size={14} color={PALETTE.accent} />
                    <Text style={styles.addPartBtnText}>Add another part</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="information-outline" size={14} color={PALETTE.warning} />
              <Text style={styles.warningText}>
                Changing body parts affects all existing client grades. Previous data stays saved but will display under new labels.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Apply to My Roster</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: PALETTE.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border, padding: 20, maxHeight: '90%',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { color: PALETTE.text, fontSize: 17, fontWeight: '800' },
  closeBtn: { padding: 4 },
  desc: { color: PALETTE.muted, fontSize: 13, marginBottom: 16, lineHeight: 18 },

  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  presetCard: {
    width: '47%', backgroundColor: PALETTE.panelAlt,
    borderRadius: 12, borderWidth: 1.5, borderColor: PALETTE.border,
    padding: 12, position: 'relative',
  },
  presetLabel: { color: PALETTE.text, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  presetParts: { color: PALETTE.muted, fontSize: 10, lineHeight: 15 },
  presetCheck: { position: 'absolute', top: 8, right: 8 },

  previewSection: { marginBottom: 16 },
  previewLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  previewPill: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
  },
  previewPillText: { fontSize: 12, fontWeight: '700' },

  customSection: { marginBottom: 16, gap: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customDot: { width: 10, height: 10, borderRadius: 5 },
  customInput: {
    flex: 1, backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  addPartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  addPartBtnText: { color: PALETTE.accent, fontSize: 13, fontWeight: '700' },

  warningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#1a1500', borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.warning + '44',
    padding: 12, marginBottom: 16,
  },
  warningText: { color: PALETTE.muted, fontSize: 11, lineHeight: 16, flex: 1 },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: PALETTE.accent, borderRadius: 14,
    paddingVertical: 14,
    shadowColor: PALETTE.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
