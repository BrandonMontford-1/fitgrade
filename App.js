import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { onAuthChange, getTrainerProfile, logOut } from './src/services/firebaseService';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import TrainerHomeScreen from './src/screens/TrainerHomeScreen';
import AthleteHomeScreen from './src/screens/AthleteHomeScreen';
import ClientDetailScreen from './src/screens/ClientDetailScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import OfflineBanner from './src/components/OfflineBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import { PALETTE, setAppTheme, setLargeText } from './src/ui/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist theme + text size across sessions
AsyncStorage.getItem('fitgrade_theme').then((val) => {
  if (val === 'light') setAppTheme(false);
});
AsyncStorage.getItem('fitgrade_large_text').then((val) => {
  if (val === 'true') setLargeText(true);
});

export default function App() {
  const [authState, setAuthState] = useState('loading');
  const [trainer, setTrainer] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [screen, setScreen] = useState('login');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsRoleSelect, setNeedsRoleSelect] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Swipe back gesture for client detail
  const swipeBack = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx > 20 && Math.abs(g.dy) < 40,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 80) setSelectedClient(null);
      },
    })
  ).current;

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        const profile = await getTrainerProfile(user.uid);
        const data = profile.success ? profile.data : {};
        const trainerData = {
          uid: user.uid,
          email: user.email,
          name: data.name || user.email,
          specialty: data.specialty || '',
          mode: data.mode || 'training',
          accountType: data.accountType || null,
          profileUrl: data.profileUrl || null,
          logoUrl: data.logoUrl || null,
          orgId: data.orgId || null,
          orgRole: data.orgRole || null,
          createdAt: data.createdAt || null,
          isPro: data.isPro || false,
        };
        setTrainer(trainerData);

        // Fix race condition — resolve onboarding first, then role select
        if (!data.onboarded) {
          setNeedsOnboarding(true);
          setNeedsRoleSelect(false);
        } else if (!data.accountType) {
          setNeedsOnboarding(false);
          setNeedsRoleSelect(true);
        } else {
          setNeedsOnboarding(false);
          setNeedsRoleSelect(false);
        }

        setAuthState('home');
      } else {
        setTrainer(null);
        setSelectedClient(null);
        setNeedsOnboarding(false);
        setNeedsRoleSelect(false);
        setShowProfile(false);
        setAuthState('auth');
      }
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    await logOut();
    setScreen('login');
  };

  const handleProfileUpdate = (updates) => {
    setTrainer((prev) => ({ ...prev, ...updates }));
  };

  const handleClientSelect = (client, clientCount) => {
    // Gate at 3 clients for free accounts
    if (!trainer?.isPro && clientCount > 3 && !selectedClient) {
      setShowPaywall(true);
      return;
    }
    setSelectedClient(client);
  };

  // ── Loading ──
  if (authState === 'loading') {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  // ── Legal screens (accessible from profile settings) ──
  if (showPrivacy) {
    return (
      <SafeAreaProvider>
        <PrivacyPolicyScreen onBack={() => setShowPrivacy(false)} />
      </SafeAreaProvider>
    );
  }

  if (showTerms) {
    return (
      <SafeAreaProvider>
        <TermsOfServiceScreen onBack={() => setShowTerms(false)} />
      </SafeAreaProvider>
    );
  }

  // ── Paywall ──
  if (showPaywall) {
    return (
      <SafeAreaProvider>
        <PaywallScreen
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => {
            setTrainer((prev) => ({ ...prev, isPro: true }));
            setShowPaywall(false);
          }}
        />
      </SafeAreaProvider>
    );
  }

  // ── Profile settings ──
  if (showProfile && trainer) {
    return (
      <SafeAreaProvider>
        <ProfileSettingsScreen
          trainer={trainer}
          onBack={() => setShowProfile(false)}
          onUpdate={handleProfileUpdate}
          onSignOut={handleSignOut}
          onPrivacy={() => setShowPrivacy(true)}
          onTerms={() => setShowTerms(true)}
          onUpgrade={() => setShowPaywall(true)}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider>
          <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>

            {/* Offline banner */}
            <OfflineBanner />

            {/* ── Auth ── */}
            {authState === 'auth' && screen === 'login' && (
              <LoginScreen
                onNavigateSignup={() => setScreen('signup')}
                onPrivacy={() => setShowPrivacy(true)}
                onTerms={() => setShowTerms(true)}
              />
            )}
            {authState === 'auth' && screen === 'signup' && (
              <SignupScreen
                onNavigateLogin={() => setScreen('login')}
                onPrivacy={() => setShowPrivacy(true)}
                onTerms={() => setShowTerms(true)}
              />
            )}

            {/* ── Onboarding — first launch, blocks everything else ── */}
            {authState === 'home' && trainer && needsOnboarding && (
              <OnboardingScreen
                trainer={trainer}
                onComplete={(updates) => {
                  setTrainer((prev) => ({ ...prev, ...updates }));
                  setNeedsOnboarding(false);
                  // Only go to role select if accountType not set during onboarding
                  if (!updates.accountType) {
                    setNeedsRoleSelect(true);
                  }
                }}
              />
            )}

            {/* ── Role select — only after onboarding is done ── */}
            {authState === 'home' && trainer && !needsOnboarding && needsRoleSelect && (
              <RoleSelectScreen
                onSelect={async (role) => {
                  const { updateTrainerProfile } = require('./src/services/firebaseService');
                  await updateTrainerProfile(trainer.uid, { accountType: role });
                  setTrainer((prev) => ({ ...prev, accountType: role }));
                  setNeedsRoleSelect(false);
                }}
              />
            )}

            {/* ── Athlete home ── */}
            {authState === 'home' && trainer && !needsOnboarding && !needsRoleSelect && trainer.accountType === 'athlete' && (
              <AthleteHomeScreen
                athlete={{ id: trainer.uid, name: trainer.name, ...trainer }}
                trainerId={trainer.uid}
                onProfile={() => setShowProfile(true)}
                onSignOut={handleSignOut}
              />
            )}

            {/* ── Trainer home — roster ── */}
            {authState === 'home' && trainer && !needsOnboarding && !needsRoleSelect && trainer.accountType !== 'athlete' && !selectedClient && (
              <TrainerHomeScreen
                trainer={trainer}
                onSelectClient={handleClientSelect}
                onProfile={() => setShowProfile(true)}
                onSignOut={handleSignOut}
                onPaywall={() => setShowPaywall(true)}
              />
            )}

            {/* ── Client detail with swipe back ── */}
            {authState === 'home' && trainer && !needsOnboarding && !needsRoleSelect && trainer.accountType !== 'athlete' && selectedClient && (
              <View style={{ flex: 1 }} {...swipeBack.panHandlers}>
                <ClientDetailScreen
                  client={selectedClient}
                  trainerId={trainer.uid}
                  trainerMode={trainer.mode || 'training'}
                  onBack={() => setSelectedClient(null)}
                />
              </View>
            )}

          </SafeAreaView>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
});
