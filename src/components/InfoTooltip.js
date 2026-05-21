import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

export default function InfoTooltip({ text, size = 13 }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.trigger}
      >
        <MaterialCommunityIcons
          name="help-circle-outline"
          size={size}
          color={PALETTE.muted}
          style={{ opacity: 0.55 }}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.popover}>
                <Text style={styles.text}>{text}</Text>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Got it</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  popover: {
    backgroundColor: PALETTE.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 18,
    maxWidth: 280,
    width: '100%',
  },
  text: {
    color: PALETTE.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  closeBtn: {
    backgroundColor: PALETTE.accent,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
