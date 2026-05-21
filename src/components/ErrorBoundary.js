import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PALETTE } from '../ui/theme';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd log to Sentry/Crashlytics here
    console.error('FitGrade crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="alert-circle-outline" size={52} color={PALETTE.danger} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              FitGrade ran into an unexpected error. Your data is safe — tap below to restart.
            </Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.btnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: PALETTE.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    maxWidth: 340,
  },
  title: {
    color: PALETTE.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: PALETTE.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: PALETTE.accent,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 13,
    marginTop: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
