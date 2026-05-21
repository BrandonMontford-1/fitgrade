import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTE } from '../ui/theme';

const STORAGE_KEY = 'fitgrade_session_templates';

export function useSessionTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setTemplates(JSON.parse(val));
    });
  }, []);

  const saveTemplate = async (template) => {
    const updated = [...templates, { ...template, id: Date.now().toString() }];
    setTemplates(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteTemplate = async (id) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { templates, saveTemplate, deleteTemplate };
}

export default function SessionTemplateModal({ visible, onClose, onLoad, currentGrades, currentTargets }) {
  const { templates, saveTemplate, deleteTemplate } = useSessionTemplates();
  const [savingName, setSavingName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleSave = async () => {
    if (!savingName.trim()) return;
    await saveTemplate({
      name: savingName.trim(),
      grades: currentGrades,
      targets: currentTargets,
    });
    setSavingName('');
    setShowSave(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Template', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTemplate(id) },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Templates</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>

          {/* Save current as template */}
          {!showSave ? (
            <TouchableOpacity style={styles.saveBtn} onPress={() => setShowSave(true)}>
              <MaterialCommunityIcons name="content-save-outline" size={16} color={PALETTE.accent} />
              <Text style={styles.saveBtnText}>Save current as template</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.saveRow}>
              <TextInput
                style={styles.nameInput}
                placeholder="Template name..."
                placeholderTextColor={PALETTE.muted}
                value={savingName}
                onChangeText={setSavingName}
                autoFocus
              />
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSave}>
                <Text style={styles.confirmBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {templates.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="clipboard-outline" size={32} color={PALETTE.muted} />
                <Text style={styles.emptyText}>No templates saved yet</Text>
                <Text style={styles.emptySubtext}>Save your common session setups to load them quickly next time</Text>
              </View>
            ) : (
              templates.map((t) => (
                <View key={t.id} style={styles.templateCard}>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateMeta}>
                      {Object.entries(t.grades).map(([p, g]) => `${p[0]}:${g}`).join(' · ')}
                    </Text>
                  </View>
                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      style={styles.loadBtn}
                      onPress={() => { onLoad(t); onClose(); }}
                    >
                      <Text style={styles.loadBtnText}>Load</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(t.id, t.name)}
                      style={styles.deleteBtn}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color={PALETTE.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: PALETTE.panel,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 20, maxHeight: '75%',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  title: { color: PALETTE.text, fontSize: 18, fontWeight: '800' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: PALETTE.accentSoft, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.accent,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  saveBtnText: { color: PALETTE.accent, fontSize: 13, fontWeight: '700' },
  saveRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  nameInput: {
    flex: 1, backgroundColor: PALETTE.panelAlt,
    borderRadius: 10, borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: PALETTE.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { color: PALETTE.text, fontSize: 15, fontWeight: '700' },
  emptySubtext: { color: PALETTE.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  templateCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.panelAlt, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 12, marginBottom: 10,
  },
  templateInfo: { flex: 1 },
  templateName: { color: PALETTE.text, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  templateMeta: { color: PALETTE.muted, fontSize: 11 },
  templateActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadBtn: {
    backgroundColor: PALETTE.accent, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  loadBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: PALETTE.dangerSoft,
    alignItems: 'center', justifyContent: 'center',
  },
});
