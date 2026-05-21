import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EmptyState from '../components/EmptyState';
import InfoTooltip from '../components/InfoTooltip';
import WelcomeTip from '../components/WelcomeTip';
import ImageUploader from '../components/ImageUploader';
import Toast from '../components/Toast';
import QuickLogModal from '../components/QuickLogModal';
import { ClientCardSkeleton, SummarySkeleton } from '../components/SkeletonLoader';
import {
  addClient,
  deleteClient,
  updateClient,
  loadClients,
  loadTrainerOrgs,
  loadOrgClients,
  saveTrainerPrefs,
  loadTrainerPrefs,
} from '../services/firebaseService';
import {
  BODY_PARTS,
  PALETTE,
  getAverageScore,
  getNumericGrade,
  getPriorityArea,
  getSeverityMeta,
  gradeColor,
} from '../ui/theme';

const PART_COLORS = {
  Head: '#60a5fa',
  Arm:  '#a78bfa',
  Core: '#34d399',
  Leg:  '#fbbf24',
  Foot: '#f87171',
};

const INITIAL_CLIENT = {
  name: '',
  sport: '',
  age: '',
  Head: 100,
  Arm: 100,
  Core: 100,
  Leg: 100,
  Foot: 100,
};

const PART_ICONS = {
  Head: 'brain',
  Arm: 'arm-flex',
  Core: 'heart-pulse',
  Leg: 'run-fast',
  Foot: 'shoe-sneaker',
};

function LetterAvatar({ name, grade }) {
  const color = gradeColor(grade);
  const letter = (name || '?')[0].toUpperCase();
  const letterOpacity = 0.1 + (grade / 100) * 0.9;
  return (
    <View style={[styles.letterAvatarWrap, { borderColor: color }]}>
      <Text style={styles.letterAvatarGhost}>{letter}</Text>
      <Text style={[styles.letterAvatarSolid, { color, opacity: letterOpacity }]}>{letter}</Text>
      <Text style={[styles.letterAvatarGradeText, { color }]}>{grade}</Text>
    </View>
  );
}

function GradeCircle({ part, grade, enlarged }) {
  const color = PART_COLORS[part];
  const borderWidth = 1.5 + (grade / 100) * 2;
  const size = enlarged ? 62 : 52;
  return (
    <View style={styles.gradeCircleWrap}>
      <View style={[
        styles.gradeCircle,
        { borderColor: color, borderWidth, width: size, height: size, borderRadius: size / 2 },
        enlarged && { shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
      ]}>
        <MaterialCommunityIcons name={PART_ICONS[part]} size={enlarged ? 15 : 13} color={color} />
        <Text style={[styles.gradeCircleNum, { color, fontSize: enlarged ? 13 : 11 }]}>{grade}</Text>
      </View>
      <Text style={[styles.gradeCircleLabel, { color, fontSize: enlarged ? 10 : 9 }]}>{part}</Text>
    </View>
  );
}

function ClientCard({ client, onPress, onDelete, onEdit }) {
  const avg = getAverageScore(client);
  const severity = getSeverityMeta(avg);
  const priority = getPriorityArea(client);
  const isCritical = avg < 70;
  const isMonitor = avg >= 70 && avg < 90;
  const lowestPart = BODY_PARTS.reduce((low, p) =>
    getNumericGrade(client[p]) < getNumericGrade(client[low]) ? p : low
  , BODY_PARTS[0]);

  return (
    <TouchableOpacity
      style={[
        styles.clientCard,
        isCritical && { borderColor: PALETTE.danger + '66', shadowColor: PALETTE.danger, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
        isMonitor && { borderColor: PALETTE.warning + '55', shadowColor: PALETTE.warning, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
        !isCritical && !isMonitor && { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.urgencyStrip, { backgroundColor: isCritical ? PALETTE.danger : isMonitor ? PALETTE.warning : PALETTE.success }]} />
      <View style={styles.clientCardTop}>
        <LetterAvatar name={client.name} grade={avg} />
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientMeta}>
            {client.sport ? client.sport.charAt(0).toUpperCase() + client.sport.slice(1) : 'General'}{client.age ? `  ·  Age ${client.age}` : ''}
          </Text>
        </View>
        <View style={styles.clientScore}>
          <Text style={[styles.clientScoreNum, { color: severity.color }]}>{avg}</Text>
          <Text style={styles.clientScoreLabel}>SCORE</Text>
        </View>
      </View>
      <View style={[styles.cardSeparator, { backgroundColor: severity.color + '33' }]} />
      <View style={styles.gradeCirclesRow}>
        {BODY_PARTS.map((part) => (
          <GradeCircle
            key={part}
            part={part}
            grade={getNumericGrade(client[part])}
            enlarged={part === lowestPart && getNumericGrade(client[part]) < 90}
          />
        ))}
      </View>
      <View style={styles.clientCardBottom}>
        <View style={[styles.priorityBadge, {
          backgroundColor: priority === 'None' ? PALETTE.successSoft : PALETTE.warningSoft,
        }]}>
          <Text style={[styles.priorityBadgeText, {
            color: priority === 'None' ? PALETTE.success : PALETTE.warning,
          }]}>
            {priority === 'None' ? '✓ Balanced' : `⚠ ${priority} Priority`}
          </Text>
        </View>
        {avg < 60 && (
          <View style={styles.notClearedBadge}>
            <MaterialCommunityIcons name="cancel" size={11} color="#fff" />
            <Text style={styles.notClearedText}>Not Cleared</Text>
          </View>
        )}
        <View style={styles.clientCardActions}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onEdit(client); }}
            style={styles.editBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={15} color={PALETTE.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={15} color={PALETTE.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AddClientModal({ visible, onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL_CLIENT);
  const [loading, setLoading] = useState(false);
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdd = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Please enter a client name.'); return; }
    if (form.name.trim().length < 2) { Alert.alert('Invalid', 'Name must be at least 2 characters.'); return; }
    if (form.age) {
      const age = parseInt(form.age);
      if (isNaN(age) || age < 1 || age > 120) { Alert.alert('Invalid', 'Please enter a valid age between 1 and 120.'); return; }
    }
    for (const part of BODY_PARTS) {
      const g = parseInt(form[part]);
      if (isNaN(g) || g < 0 || g > 100) { Alert.alert('Invalid', `${part} grade must be between 0 and 100.`); return; }
    }
    setLoading(true);
    await onAdd({ ...form, name: form.name.trim() });
    setLoading(false);
    setForm(INITIAL_CLIENT);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Client</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Full name *</Text>
            <TextInput style={styles.input} placeholder="John Smith" placeholderTextColor={PALETTE.muted}
              value={form.name} onChangeText={(v) => update('name', v)} autoCapitalize="words" />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Sport / Activity</Text>
                <TextInput style={styles.input} placeholder="Football" placeholderTextColor={PALETTE.muted}
                  value={form.sport} onChangeText={(v) => update('sport', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} placeholder="24" placeholderTextColor={PALETTE.muted}
                  value={form.age} onChangeText={(v) => update('age', v)} keyboardType="numeric" maxLength={3} />
              </View>
            </View>
            <Text style={styles.label}>Initial grades (0–100)</Text>
            <View style={styles.gradesGrid}>
              {BODY_PARTS.map((part) => (
                <View key={part} style={styles.gradeInput}>
                  <Text style={styles.gradeInputLabel}>{part}</Text>
                  <TextInput
                    style={styles.gradeInputField}
                    value={String(form[part])}
                    onChangeText={(v) => update(part, v)}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholderTextColor={PALETTE.muted}
                  />
                  <Text style={styles.gradeInputPct}>%</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleAdd} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Add Client</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function EditClientModal({ visible, onClose, onSave, client }) {
  const [form, setForm] = useState(client || {});
  const [loading, setLoading] = useState(false);
  useEffect(() => { setForm(client || {}); }, [client]);
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name?.trim()) { Alert.alert('Error', 'Client name is required.'); return; }
    const age = parseInt(form.age);
    if (form.age && (isNaN(age) || age < 1 || age > 120)) {
      Alert.alert('Error', 'Please enter a valid age (1-120).'); return;
    }
    setLoading(true);
    await onSave({ ...form, name: form.name.trim() });
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Client</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <MaterialCommunityIcons name="close" size={20} color={PALETTE.silver} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Full name *</Text>
            <TextInput style={styles.input} value={form.name || ''} onChangeText={(v) => update('name', v)}
              autoCapitalize="words" color={PALETTE.text} placeholderTextColor={PALETTE.muted} />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Sport / Activity</Text>
                <TextInput style={styles.input} value={form.sport || ''} onChangeText={(v) => update('sport', v)}
                  color={PALETTE.text} placeholderTextColor={PALETTE.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Age</Text>
                <TextInput style={styles.input} value={String(form.age || '')} onChangeText={(v) => update('age', v)}
                  keyboardType="numeric" maxLength={3} color={PALETTE.text} placeholderTextColor={PALETTE.muted} />
              </View>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function TrainerHomeScreen({ trainer, onSelectClient, onProfile, onSignOut, onPaywall }) {
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [activeOrg, setActiveOrg] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [showOrgPicker, setShowOrgPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [sortMode, setSortMode] = useState('name');
  const [logoUrl, setLogoUrl] = useState(trainer?.logoUrl || null);
  const [profileUrl, setProfileUrl] = useState(trainer?.profileUrl || null);
  const [compDays, setCompDays] = useState(7);
  const [editingComp, setEditingComp] = useState(false);
  const [compDaysInput, setCompDaysInput] = useState('7');
  const [rosterNote, setRosterNote] = useState('');
  const [rosterNoteInput, setRosterNoteInput] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('fitgrade_comp_days').then((val) => {
      if (val !== null) { setCompDays(parseInt(val)); setCompDaysInput(val); }
    });
    AsyncStorage.getItem('fitgrade_roster_note').then((val) => {
      if (val !== null) { setRosterNote(val); setRosterNoteInput(val); }
    });
    if (trainer?.uid) {
      loadTrainerPrefs(trainer.uid).then((result) => {
        if (result.success) {
          if (result.data.compDays) { setCompDays(result.data.compDays); setCompDaysInput(String(result.data.compDays)); }
          if (result.data.rosterNote) { setRosterNote(result.data.rosterNote); setRosterNoteInput(result.data.rosterNote); }
        }
      });
    }
  }, []);

  const saveCompDays = (val) => {
    const clamped = Math.max(0, Math.min(365, val));
    setCompDays(clamped);
    AsyncStorage.setItem('fitgrade_comp_days', String(clamped));
    if (trainer?.uid) saveTrainerPrefs(trainer.uid, { compDays: clamped, rosterNote });
  };

  const fetchClients = useCallback(async () => {
    const result = await loadClients(trainer.uid);
    if (result.success) setClients(result.data);
    setLoading(false);
    setRefreshing(false);
  }, [trainer.uid]);

  useEffect(() => {
    if (activeOrg) {
      setLoading(true);
      loadOrgClients(activeOrg.id).then((result) => {
        if (result.success) setClients(result.data);
        setLoading(false);
      });
    } else {
      fetchClients();
    }
  }, [activeOrg]);

  useEffect(() => {
    loadTrainerOrgs(trainer.uid).then((result) => {
      if (result.success && result.data.length > 0) setOrgs(result.data);
    });
  }, []);

  const handleAddClient = async (clientData) => {
    const result = await addClient(trainer.uid, clientData);
    if (result.success) {
      setClients((prev) => ({ ...prev, [result.id]: { id: result.id, ...clientData } }));
      setToastMsg(`${clientData.name} added ✓`);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleEditClient = async (updatedClient) => {
    const result = await updateClient(trainer.uid, updatedClient.id, updatedClient);
    if (result.success) {
      setClients((prev) => ({ ...prev, [updatedClient.id]: { ...prev[updatedClient.id], ...updatedClient } }));
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleDeleteClient = (clientId, clientName) => {
    Alert.alert('Remove Client', `Remove ${clientName} from your roster?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          const result = await deleteClient(trainer.uid, clientId);
          if (result.success) {
            setClients((prev) => { const next = { ...prev }; delete next[clientId]; return next; });
          }
        },
      },
    ]);
  };

  const clientList = Object.values(clients).filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'injured') return Object.values(c.injuries || {}).some(Boolean);
    if (filterMode === 'attention') return getPriorityArea(c) !== 'None';
    return true;
  }).sort((a, b) => {
    if (sortMode === 'score') return getAverageScore(a) - getAverageScore(b);
    if (sortMode === 'injury') return (Object.values(b.injuries || {}).some(Boolean) ? 1 : 0) - (Object.values(a.injuries || {}).some(Boolean) ? 1 : 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  const avgRoster = clientList.length
    ? Math.round(clientList.reduce((sum, c) => sum + getAverageScore(c), 0) / clientList.length)
    : 0;

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <SummarySkeleton />
        <View style={styles.skeletonList}>
          <ClientCardSkeleton />
          <ClientCardSkeleton />
          <ClientCardSkeleton />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={{ flex: 1 }}>
        <Toast message={toastMsg} visible={toastVisible} type="success" />
        <WelcomeTip />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? (
              <ImageUploader uid={trainer.uid} type="logo" currentUrl={logoUrl} onUploaded={setLogoUrl} />
            ) : (
              <View style={styles.headerLogoRow}>
                <View>
                  <Text style={styles.headerEyebrow}>{activeOrg ? activeOrg.name : 'FitGrade'}</Text>
                  <Text style={styles.headerTitle}>
                    {activeOrg ? 'Org Roster' : trainer?.name ? `${trainer.name.split(' ')[0]}'s Roster` : 'My Roster'}
                  </Text>
                </View>
                {!activeOrg && (
                  <TouchableOpacity style={styles.addLogoBtn} onPress={onProfile}>
                    <MaterialCommunityIcons name="image-plus" size={13} color={PALETTE.muted} />
                    <Text style={styles.addLogoBtnText}>Add logo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {orgs.length > 0 && (
              <TouchableOpacity style={styles.orgToggle} onPress={() => setShowOrgPicker(true)} activeOpacity={0.8}>
                <MaterialCommunityIcons name="domain" size={13} color={PALETTE.accent} />
                <Text style={styles.orgToggleText}>{activeOrg ? activeOrg.name : 'My Roster'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={13} color={PALETTE.accent} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setQuickLogVisible(true)} style={styles.quickLogBtn}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color={PALETTE.accent} />
              <Text style={styles.quickLogBtnText}>Quick Log</Text>
            </TouchableOpacity>
            {/* Profile button — routes to App.js ProfileSettingsScreen */}
            <TouchableOpacity onPress={onProfile} style={styles.trainerBadge}>
              {profileUrl ? (
                <Image source={{ uri: profileUrl }} style={{ width: 38, height: 38, borderRadius: 19 }} />
              ) : (
                <Text style={styles.trainerBadgeText}>{(trainer.name || 'T')[0].toUpperCase()}</Text>
              )}
              <View style={styles.settingsHint}>
                <MaterialCommunityIcons name="cog" size={9} color={PALETTE.accentText} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerSeparator} />

        {/* First time empty state */}
        {clientList.length === 0 && !loading && (
          <View style={styles.firstTimeCard}>
            <View style={styles.firstTimeHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color={PALETTE.accent} />
              <Text style={styles.firstTimeTitle}>Welcome to FitGrade</Text>
            </View>
            <Text style={styles.firstTimeDesc}>
              Once you add clients, you'll see your Roster Health score here — the average grade across all your clients in real time.
            </Text>
            <View style={styles.firstTimeLegend}>
              {[
                { color: PALETTE.success, label: '90-100%', desc: 'Optimal — cleared to perform' },
                { color: PALETTE.warning, label: '70-89%', desc: 'Monitor — watch closely' },
                { color: PALETTE.danger,  label: 'Below 70%', desc: 'Not Cleared — needs attention' },
              ].map((l) => (
                <View key={l.label} style={styles.firstTimeLegendRow}>
                  <View style={[styles.firstTimeDot, { backgroundColor: l.color }]} />
                  <Text style={[styles.firstTimeLegendLabel, { color: l.color }]}>{l.label}</Text>
                  <Text style={styles.firstTimeLegendDesc}>{l.desc}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.firstTimeCta}>Tap the + button to add your first client →</Text>
          </View>
        )}

        {/* Stats summary */}
        {clientList.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.summaryTopRow}>
              <View style={[styles.summaryMain, { borderColor: PALETTE.accent + '44' }]}>
                <View style={styles.summaryLabelRow}>
                  <Text style={styles.summaryEyebrow}>Roster Health</Text>
                  <InfoTooltip text={`Average health grade across all clients.\n\n🟢 90-100% — Optimal\n🟡 70-89% — Monitor\n🔴 Below 70% — Action needed`} />
                </View>
                <Text style={[styles.summaryBigNum, { color: avgRoster >= 90 ? PALETTE.success : avgRoster >= 70 ? PALETTE.warning : PALETTE.danger }]}>
                  {avgRoster}%
                </Text>
                <View style={styles.summaryTrendRow}>
                  <MaterialCommunityIcons
                    name={avgRoster >= 80 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={avgRoster >= 80 ? PALETTE.success : PALETTE.danger}
                  />
                  <Text style={[styles.summaryTrendText, { color: avgRoster >= 80 ? PALETTE.success : PALETTE.danger }]}>
                    {avgRoster >= 90 ? 'All optimal' : avgRoster >= 70 ? 'Monitor some' : 'Needs attention'}
                  </Text>
                </View>
                <View style={styles.summaryLegend}>
                  {[
                    { color: PALETTE.success, label: '90+ optimal' },
                    { color: PALETTE.warning, label: '70-89 monitor' },
                    { color: PALETTE.danger, label: '<70 urgent' },
                  ].map((l) => (
                    <View key={l.label} style={styles.summaryLegendItem}>
                      <View style={[styles.summaryLegendDot, { backgroundColor: l.color }]} />
                      <Text style={styles.summaryLegendText}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.summaryMiniCol}>
                <View style={[styles.summaryMini, { borderColor: PALETTE.accent + '33' }]}>
                  <MaterialCommunityIcons name="shield-outline" size={16} color={PALETTE.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryMiniNum, { color: PALETTE.accent, fontSize: 13 }]} numberOfLines={1}>
                      {trainer?.specialty || trainer?.name || 'FitGrade'}
                    </Text>
                    <Text style={styles.summaryMiniLabel}>Group / Org</Text>
                  </View>
                </View>
                <View style={styles.summaryMini}>
                  <MaterialCommunityIcons name="account-group-outline" size={16} color={PALETTE.text} />
                  <View>
                    <Text style={styles.summaryMiniNum}>{clientList.length}</Text>
                    <Text style={styles.summaryMiniLabel}>Total clients</Text>
                  </View>
                </View>
                <View style={[styles.summaryMini, { borderColor: PALETTE.danger + '33' }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={PALETTE.danger} />
                  <View>
                    <Text style={[styles.summaryMiniNum, { color: PALETTE.danger }]}>
                      {clientList.filter((c) => Object.values(c.injuries || {}).some(Boolean)).length}
                    </Text>
                    <Text style={styles.summaryMiniLabel}>Active injuries</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Insight cards */}
            <View style={styles.insightRow}>
              <TouchableOpacity
                style={[styles.insightCard, { flex: 1.2 }]}
                onPress={() => setEditingNotes(true)}
                activeOpacity={0.85}
              >
                <View style={styles.insightLabelRow}>
                  <Text style={styles.insightLabel}>TRAINER NOTES</Text>
                  <InfoTooltip text="Notes visible to all athletes. Tap to edit." size={11} />
                </View>
                {rosterNote ? (
                  <Text style={styles.insightNoteText} numberOfLines={4}>{rosterNote}</Text>
                ) : (
                  <View style={styles.insightNotePlaceholder}>
                    <MaterialCommunityIcons name="pencil-plus-outline" size={20} color={PALETTE.muted} />
                    <Text style={styles.insightTipText}>Tap to add a note{'\n'}for your athletes</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.insightColRight}>
                <TouchableOpacity
                  style={styles.insightCard}
                  onPress={() => { setEditingComp(true); setCompDaysInput(String(compDays)); }}
                  activeOpacity={0.8}
                >
                  <View style={styles.insightLabelRow}>
                    <Text style={styles.insightLabel}>NEXT COMP</Text>
                    <InfoTooltip text="Days until next competition. Tap to update." size={11} />
                  </View>
                  <Text style={[styles.insightBigNum, {
                    color: compDays <= 3 ? PALETTE.danger : compDays <= 7 ? PALETTE.warning : PALETTE.accent,
                  }]}>
                    {compDays}
                  </Text>
                  <Text style={styles.insightTipText}>days away</Text>
                </TouchableOpacity>

                <View style={[styles.insightCard, {
                  borderColor: clientList.filter((c) => Object.values(c.injuries || {}).some(Boolean)).length > 0
                    ? PALETTE.danger + '44' : PALETTE.border,
                }]}>
                  <Text style={styles.insightLabel}>ACTIVE INJURIES</Text>
                  <Text style={[styles.insightBigNum, {
                    color: clientList.filter((c) => Object.values(c.injuries || {}).some(Boolean)).length > 0
                      ? PALETTE.danger : PALETTE.success,
                    fontSize: 28,
                  }]}>
                    {clientList.filter((c) => Object.values(c.injuries || {}).some(Boolean)).length}
                  </Text>
                  <Text style={styles.insightTipText}>
                    {clientList.filter((c) => Object.values(c.injuries || {}).some(Boolean)).length === 0
                      ? 'All clear' : 'clients injured'}
                  </Text>
                </View>
              </View>
            </View>

            {editingNotes && (
              <View style={styles.compEditWrap}>
                <Text style={styles.insightLabel}>TRAINER NOTES FOR ATHLETES</Text>
                <TextInput
                  style={[styles.compEditInput, { height: 100, textAlignVertical: 'top', fontSize: 14, padding: 12 }]}
                  value={rosterNoteInput}
                  onChangeText={setRosterNoteInput}
                  placeholder="e.g. Great week everyone — focus on recovery this weekend..."
                  placeholderTextColor={PALETTE.muted}
                  multiline autoFocus color={PALETTE.text}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.compEditSave, { flex: 1, backgroundColor: PALETTE.panel, borderWidth: 1, borderColor: PALETTE.border }]}
                    onPress={() => { Keyboard.dismiss(); setEditingNotes(false); }}
                  >
                    <Text style={[styles.compEditSaveText, { color: PALETTE.muted }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.compEditSave, { flex: 1 }]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setRosterNote(rosterNoteInput);
                      AsyncStorage.setItem('fitgrade_roster_note', rosterNoteInput);
                      if (trainer?.uid) saveTrainerPrefs(trainer.uid, { compDays, rosterNote: rosterNoteInput });
                      setEditingNotes(false);
                    }}
                  >
                    <Text style={styles.compEditSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {editingComp && (
              <View style={styles.compEditWrap}>
                <Text style={styles.insightLabel}>DAYS UNTIL NEXT COMP</Text>
                <View style={styles.compEditRow}>
                  <TextInput
                    style={styles.compEditInput}
                    value={compDaysInput}
                    onChangeText={setCompDaysInput}
                    keyboardType="numeric"
                    maxLength={3}
                    autoFocus
                    selectTextOnFocus
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      const val = parseInt(compDaysInput) || 7;
                      saveCompDays(val);
                      setEditingComp(false);
                      Keyboard.dismiss();
                    }}
                  />
                  <TouchableOpacity
                    style={styles.compEditSave}
                    onPress={() => { const val = parseInt(compDaysInput) || 7; saveCompDays(val); setEditingComp(false); }}
                  >
                    <Text style={styles.compEditSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color={PALETTE.muted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={PALETTE.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'injured', label: 'Injured' },
            { key: 'attention', label: 'Needs Attention' },
          ].map((f) => (
            <TouchableOpacity key={f.key} onPress={() => setFilterMode(f.key)}
              style={[styles.filterPill, filterMode === f.key && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, filterMode === f.key && styles.filterPillTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort pills */}
        <View style={[styles.filterRow, { marginTop: -4, marginBottom: 8 }]}>
          <Text style={styles.sortLabel}>Sort:</Text>
          {[
            { key: 'name', label: 'A–Z' },
            { key: 'score', label: 'Score ↑' },
            { key: 'injury', label: 'Injured first' },
          ].map((s) => (
            <TouchableOpacity key={s.key} onPress={() => setSortMode(s.key)}
              style={[styles.filterPill, sortMode === s.key && styles.filterPillActive]}>
              <Text style={[styles.filterPillText, sortMode === s.key && styles.filterPillTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Client list */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchClients(); }}
              tintColor={PALETTE.accent}
            />
          }
        >
          {clientList.length === 0 ? (
            <EmptyState
              icon="account-group-outline"
              title="No clients yet"
              subtitle="Add your first client to start tracking their health grades and progress."
              actionLabel="Add First Client"
              onAction={() => setAddModalVisible(true)}
            />
          ) : (
            clientList.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onPress={() => onSelectClient(client, clientList.length)}
                onDelete={() => handleDeleteClient(client.id, client.name)}
                onEdit={(c) => setEditClient(c)}
              />
            ))
          )}
        </ScrollView>

        {/* FAB — paywall gate at 3 clients */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (!trainer?.isPro && clientList.length >= 3) {
              onPaywall?.();
              return;
            }
            setAddModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>

        <QuickLogModal
          visible={quickLogVisible}
          onClose={() => setQuickLogVisible(false)}
          clients={clients}
          trainerId={trainer.uid}
          onDone={fetchClients}
        />

        {/* Org picker modal */}
        <Modal visible={showOrgPicker} transparent animationType="slide" onRequestClose={() => setShowOrgPicker(false)}>
          <TouchableOpacity style={styles.orgPickerOverlay} activeOpacity={1} onPress={() => setShowOrgPicker(false)}>
            <View style={styles.orgPickerCard}>
              <View style={styles.orgPickerHandle} />
              <Text style={styles.orgPickerTitle}>Switch Roster</Text>
              <Text style={styles.orgPickerSub2}>You're a member of {orgs.length + 1} roster{orgs.length > 0 ? 's' : ''}</Text>
              <TouchableOpacity
                style={[styles.orgPickerRow, !activeOrg && styles.orgPickerRowActive]}
                onPress={() => { setActiveOrg(null); setShowOrgPicker(false); }}
              >
                <View style={[styles.orgPickerIcon, { backgroundColor: PALETTE.accentSoft }]}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={PALETTE.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orgPickerName, !activeOrg && { color: PALETTE.accent }]}>My Roster</Text>
                  <Text style={styles.orgPickerSub}>
                    {Object.keys(clients).length} client{Object.keys(clients).length !== 1 ? 's' : ''} · personal
                  </Text>
                </View>
                {!activeOrg
                  ? <MaterialCommunityIcons name="check-circle" size={20} color={PALETTE.accent} />
                  : <MaterialCommunityIcons name="chevron-right" size={18} color={PALETTE.muted} />
                }
              </TouchableOpacity>
              {orgs.map((org) => {
                const isActive = activeOrg?.id === org.id;
                const isOwner = org.ownerId === trainer.uid;
                return (
                  <TouchableOpacity
                    key={org.id}
                    style={[styles.orgPickerRow, isActive && styles.orgPickerRowActive]}
                    onPress={() => { setActiveOrg(org); setShowOrgPicker(false); }}
                  >
                    <View style={[styles.orgPickerIcon, { backgroundColor: isActive ? PALETTE.accentSoft : PALETTE.panelAlt }]}>
                      <MaterialCommunityIcons name="domain" size={20} color={isActive ? PALETTE.accent : PALETTE.silver} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.orgPickerName, isActive && { color: PALETTE.accent }]}>{org.name}</Text>
                        {isOwner && (
                          <View style={styles.ownerBadge}>
                            <Text style={styles.ownerBadgeText}>Owner</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.orgPickerSub}>{org.trainers?.length || 1} trainer{org.trainers?.length !== 1 ? 's' : ''}</Text>
                    </View>
                    {isActive
                      ? <MaterialCommunityIcons name="check-circle" size={20} color={PALETTE.accent} />
                      : <MaterialCommunityIcons name="chevron-right" size={18} color={PALETTE.muted} />
                    }
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.orgPickerNewBtn} onPress={() => { setShowOrgPicker(false); onProfile?.(); }}>
                <MaterialCommunityIcons name="plus" size={14} color={PALETTE.muted} />
                <Text style={styles.orgPickerNewText}>Create or join another org</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <AddClientModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddClient} />
        <EditClientModal visible={!!editClient} client={editClient} onClose={() => setEditClient(null)} onSave={handleEditClient} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PALETTE.background },
  loadingWrap: { flex: 1, backgroundColor: PALETTE.background, paddingTop: 12 },
  skeletonList: { paddingHorizontal: 20, paddingTop: 12 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orgToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PALETTE.accentSoft, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.accent,
    paddingHorizontal: 10, paddingVertical: 5, marginTop: 6, alignSelf: 'flex-start',
  },
  orgToggleText: { color: PALETTE.accent, fontSize: 11, fontWeight: '800' },
  headerEyebrow: { color: PALETTE.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  headerTitle: { color: PALETTE.text, fontSize: 28, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickLogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: PALETTE.accentSoft, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.accent,
    paddingHorizontal: 10, paddingVertical: 7,
  },
  quickLogBtnText: { color: PALETTE.accent, fontSize: 12, fontWeight: '800' },
  headerSeparator: { height: 1, backgroundColor: PALETTE.accent + '22' },
  trainerBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PALETTE.accentSoft, borderWidth: 1.5, borderColor: PALETTE.accent,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  trainerBadgeText: { color: PALETTE.accent, fontSize: 16, fontWeight: '800' },
  settingsHint: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: PALETTE.accent, alignItems: 'center', justifyContent: 'center',
  },
  addLogoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PALETTE.panel, borderRadius: 8,
    borderWidth: 1, borderColor: PALETTE.border, borderStyle: 'dashed',
    paddingHorizontal: 8, paddingVertical: 5,
  },
  addLogoBtnText: { color: PALETTE.muted, fontSize: 11, fontWeight: '600' },
  firstTimeCard: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.accent + '44',
    padding: 16, gap: 10,
  },
  firstTimeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  firstTimeTitle: { color: PALETTE.text, fontSize: 15, fontWeight: '800' },
  firstTimeDesc: { color: PALETTE.muted, fontSize: 13, lineHeight: 19 },
  firstTimeLegend: { gap: 8 },
  firstTimeLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  firstTimeDot: { width: 10, height: 10, borderRadius: 5 },
  firstTimeLegendLabel: { fontSize: 12, fontWeight: '800', width: 70 },
  firstTimeLegendDesc: { color: PALETTE.muted, fontSize: 12, flex: 1 },
  firstTimeCta: { color: PALETTE.accent, fontSize: 12, fontWeight: '700' },
  summarySection: { marginHorizontal: 16, marginBottom: 14, gap: 10 },
  summaryTopRow: { flexDirection: 'row', gap: 10 },
  summaryMain: {
    flex: 1, backgroundColor: PALETTE.panel, borderRadius: 16,
    borderWidth: 1, borderColor: PALETTE.border, padding: 14, justifyContent: 'center',
  },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 0 },
  summaryEyebrow: { color: PALETTE.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryBigNum: { fontSize: 52, fontWeight: '900', lineHeight: 56, marginBottom: 4 },
  summaryTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryTrendText: { fontSize: 12, fontWeight: '700' },
  summaryLegend: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  summaryLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  summaryLegendDot: { width: 6, height: 6, borderRadius: 3 },
  summaryLegendText: { color: PALETTE.muted, fontSize: 8, fontWeight: '600' },
  summaryMiniCol: { gap: 8, flex: 1 },
  summaryMini: {
    flex: 1, backgroundColor: PALETTE.panel, borderRadius: 12,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  summaryMiniNum: { color: PALETTE.text, fontSize: 16, fontWeight: '800', lineHeight: 18 },
  summaryMiniLabel: { color: PALETTE.muted, fontSize: 10, fontWeight: '600' },
  insightRow: { flexDirection: 'row', gap: 10 },
  insightColRight: { flex: 1, gap: 10 },
  insightCard: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, padding: 12, justifyContent: 'center',
  },
  insightLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  insightLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  insightNoteText: { color: PALETTE.text, fontSize: 13, lineHeight: 19, marginTop: 4 },
  insightNotePlaceholder: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  insightTipText: { color: PALETTE.muted, fontSize: 11, lineHeight: 16 },
  insightBigNum: { fontSize: 28, fontWeight: '800', lineHeight: 30, marginBottom: 2 },
  compEditWrap: {
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.accent + '55', padding: 12, marginTop: 2,
  },
  compEditRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compEditInput: {
    flex: 1, backgroundColor: PALETTE.panelAlt, borderRadius: 10,
    borderWidth: 1, borderColor: PALETTE.border,
    color: PALETTE.text, fontSize: 20, fontWeight: '800', padding: 10, textAlign: 'center',
  },
  compEditSave: {
    backgroundColor: PALETTE.accent, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
  },
  compEditSaveText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PALETTE.panel, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 14, marginHorizontal: 16, marginBottom: 8, height: 46,
  },
  searchInput: { flex: 1, color: PALETTE.text, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, backgroundColor: PALETTE.panel,
    borderWidth: 1, borderColor: PALETTE.border,
  },
  filterPillActive: { backgroundColor: PALETTE.accentSoft, borderColor: PALETTE.accent },
  filterPillText: { color: PALETTE.muted, fontSize: 11, fontWeight: '700' },
  filterPillTextActive: { color: PALETTE.accent },
  sortLabel: { color: PALETTE.muted, fontSize: 11, fontWeight: '700', alignSelf: 'center' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  clientCard: {
    backgroundColor: PALETTE.panel, borderRadius: 18,
    borderWidth: 1, borderColor: PALETTE.border,
    marginBottom: 12, overflow: 'hidden', position: 'relative',
  },
  urgencyStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
  },
  cardSeparator: { height: 1, marginHorizontal: 16, marginBottom: 10 },
  clientCardTop: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8 },
  letterAvatarWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: PALETTE.panelAlt, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', marginRight: 12,
  },
  letterAvatarGhost: { position: 'absolute', fontSize: 28, fontWeight: '900', color: PALETTE.text, opacity: 0.06, lineHeight: 32 },
  letterAvatarSolid: { fontSize: 28, fontWeight: '900', lineHeight: 32, marginBottom: 2 },
  letterAvatarGradeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3, marginTop: -4 },
  clientInfo: { flex: 1 },
  clientName: { color: PALETTE.text, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  clientMeta: { color: PALETTE.muted, fontSize: 12 },
  clientScore: { alignItems: 'flex-end' },
  clientScoreNum: { fontSize: 28, fontWeight: '800', lineHeight: 30 },
  clientScoreLabel: { color: PALETTE.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  gradeCirclesRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 16, marginBottom: 14, marginTop: 4,
  },
  gradeCircleWrap: { alignItems: 'center', gap: 4 },
  gradeCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: PALETTE.panelAlt, alignItems: 'center', justifyContent: 'center', gap: 0,
  },
  gradeCircleNum: { fontSize: 11, fontWeight: '800', lineHeight: 13 },
  gradeCircleLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  clientCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14,
  },
  clientCardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  priorityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  priorityBadgeText: { fontSize: 11, fontWeight: '700' },
  notClearedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: PALETTE.danger, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  notClearedText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  editBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: PALETTE.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: PALETTE.dangerSoft, alignItems: 'center', justifyContent: 'center',
  },
  fab: {
    position: 'absolute', bottom: 48, right: 24,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: PALETTE.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: PALETTE.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: PALETTE.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '90%', borderWidth: 1, borderColor: PALETTE.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: PALETTE.text, fontSize: 22, fontWeight: '800' },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: PALETTE.panelAlt, alignItems: 'center', justifyContent: 'center',
  },
  label: { color: PALETTE.silver, fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: PALETTE.input, color: PALETTE.text, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  gradesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gradeInput: {
    width: '30%', backgroundColor: PALETTE.panelAlt, borderRadius: 12, padding: 10, alignItems: 'center',
  },
  gradeInputLabel: { color: PALETTE.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  gradeInputField: { color: PALETTE.text, fontSize: 20, fontWeight: '800', textAlign: 'center', width: '100%' },
  gradeInputPct: { color: PALETTE.muted, fontSize: 12, marginTop: 2 },
  primaryBtn: {
    backgroundColor: PALETTE.accent, borderRadius: 14,
    height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  orgPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  orgPickerCard: {
    backgroundColor: PALETTE.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: PALETTE.border, padding: 20, paddingBottom: 36, gap: 4,
  },
  orgPickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: PALETTE.border, alignSelf: 'center', marginBottom: 12 },
  orgPickerTitle: { color: PALETTE.text, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  orgPickerSub2: { color: PALETTE.muted, fontSize: 12, marginBottom: 12 },
  orgPickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: PALETTE.panelAlt, borderRadius: 14,
    borderWidth: 1, borderColor: PALETTE.border, padding: 12, marginBottom: 6,
  },
  orgPickerRowActive: { borderColor: PALETTE.accent, backgroundColor: PALETTE.accentSoft },
  orgPickerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orgPickerName: { color: PALETTE.text, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  orgPickerSub: { color: PALETTE.muted, fontSize: 11 },
  ownerBadge: {
    backgroundColor: '#fbbf2422', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
    borderWidth: 1, borderColor: '#fbbf2444',
  },
  ownerBadgeText: { color: '#fbbf24', fontSize: 9, fontWeight: '800' },
  orgPickerNewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, marginTop: 4,
  },
  orgPickerNewText: { color: PALETTE.muted, fontSize: 13, fontWeight: '600' },
});
