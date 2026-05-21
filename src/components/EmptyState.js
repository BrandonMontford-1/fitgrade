import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  color,
}) {
  const accentColor = color || PALETTE.accent;

  return (
    <View style={styles.root}>
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: accentColor + '18', borderColor: accentColor + '33' }]}>
        <MaterialCommunityIcons name={icon} size={36} color={accentColor} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: accentColor }]}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: PALETTE.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: PALETTE.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  actionBtn: {
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
