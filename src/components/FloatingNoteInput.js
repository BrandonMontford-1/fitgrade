import React, { useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

export default function FloatingNoteInput({
  value,
  onChangeText,
  placeholder,
  label,
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const handleOpen = () => {
    setDraft(value || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    onChangeText(draft);
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const handleCancel = () => {
    setDraft(value || '');
    Keyboard.dismiss();
    setModalVisible(false);
  };

  return (
    <>
      {/* Tappable preview — shows current value or placeholder */}
      <TouchableOpacity
        style={[styles.preview, style]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.previewText : styles.previewPlaceholder} numberOfLines={3}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="pencil-outline" size={16} color={PALETTE.muted} />
      </TouchableOpacity>

      {/* Full screen modal with input at top */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.root}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{label || 'Session Notes'}</Text>
              <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Input — at top, above keyboard */}
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={placeholder}
              placeholderTextColor={PALETTE.muted}
              multiline
              autoFocus
              color={PALETTE.text}
              textAlignVertical="top"
            />

            {/* Character count */}
            <Text style={styles.charCount}>{draft.length} characters</Text>

            {/* Quick suggestions */}
            <View style={styles.suggestions}>
              <Text style={styles.suggestLabel}>Quick add:</Text>
              {[
                'Great session overall',
                'Needs more recovery time',
                'Cleared to increase intensity',
                'Monitor closely next session',
              ].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionPill}
                  onPress={() => setDraft((prev) => prev ? `${prev} ${s}` : s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  preview: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    padding: 14, minHeight: 80,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  previewText: {
    color: PALETTE.text, fontSize: 14, lineHeight: 20, flex: 1,
  },
  previewPlaceholder: {
    color: PALETTE.muted, fontSize: 14, lineHeight: 20, flex: 1,
  },

  root: { flex: 1, backgroundColor: PALETTE.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: PALETTE.divider,
    backgroundColor: PALETTE.panel,
  },
  headerBtn: { paddingHorizontal: 4, paddingVertical: 6, minWidth: 60 },
  headerTitle: { color: PALETTE.text, fontSize: 15, fontWeight: '800' },
  cancelText: { color: PALETTE.muted, fontSize: 15, fontWeight: '600' },
  saveText: { color: PALETTE.accent, fontSize: 15, fontWeight: '800', textAlign: 'right' },

  input: {
    flex: 1,
    backgroundColor: PALETTE.background,
    padding: 20, fontSize: 16, lineHeight: 24,
    color: PALETTE.text,
  },

  charCount: {
    color: PALETTE.muted, fontSize: 11,
    textAlign: 'right', paddingHorizontal: 20, paddingBottom: 8,
  },

  suggestions: {
    paddingHorizontal: 16, paddingBottom: 16, gap: 8,
  },
  suggestLabel: {
    color: PALETTE.muted, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  suggestionPill: {
    backgroundColor: PALETTE.panel, borderRadius: 999,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start',
  },
  suggestionText: { color: PALETTE.silver, fontSize: 13, fontWeight: '600' },
});
