const DARK_PALETTE = {
  // Backgrounds
  background: '#08090f',
  surface: '#0f1018',
  panel: '#161820',
  panelAlt: '#1c1e2a',
  input: '#1a1c26',

  // Text
  text: '#e8ecf4',
  muted: '#6b7890',
  silver: '#c0c8d8',
  silverLight: '#e8ecf4',
  silverDark: '#4a5268',

  // Blue accent
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentDark: '#1d4ed8',
  accentText: '#ffffff',
  accentSoft: '#1e2d4a',

  // Status
  success: '#22c55e',
  successSoft: '#14291e',
  warning: '#f59e0b',
  warningSoft: '#2d2210',
  danger: '#ef4444',
  dangerSoft: '#2d1212',

  // Structure
  divider: '#1e2030',
  border: '#252838',
};

const LIGHT_PALETTE = {
  // Backgrounds
  background: '#f0f2f8',
  surface: '#e8eaf2',
  panel: '#ffffff',
  panelAlt: '#f4f5fb',
  input: '#eceef6',

  // Text
  text: '#0f1118',
  muted: '#6b7890',
  silver: '#4a5268',
  silverLight: '#1a1c26',
  silverDark: '#9098b0',

  // Blue accent
  accent: '#3b82f6',
  accentLight: '#60a5fa',
  accentDark: '#1d4ed8',
  accentText: '#ffffff',
  accentSoft: '#dbeafe',

  // Status
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#d97706',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',

  // Structure
  divider: '#e2e4f0',
  border: '#d4d6e8',
};

// Active palette — updated by setAppTheme
let _isDark = true;
export let PALETTE = { ..._isDark ? DARK_PALETTE : LIGHT_PALETTE };

export const setAppTheme = (isDark) => {
  _isDark = isDark;
  Object.assign(PALETTE, isDark ? DARK_PALETTE : LIGHT_PALETTE);
};

export const isDarkTheme = () => _isDark;

export const MODES = {
  training: {
    key: 'training',
    label: 'Personal Trainer',
    icon: 'dumbbell',
    color: '#3b82f6',
    description: 'For personal trainers and strength coaches',
    roles: [
      { key: 'trainer', label: 'Trainer', icon: 'clipboard-edit-outline', color: '#3b82f6' },
      { key: 'athlete', label: 'Athlete', icon: 'account-outline', color: '#22c55e' },
      { key: 'coach', label: 'Coach', icon: 'eye-outline', color: '#6b7890' },
    ],
    partLabels: {
      Head: 'Focus & Mental Readiness',
      Arm: 'Upper Body Power',
      Core: 'Core Stability',
      Leg: 'Leg Strength & Speed',
      Foot: 'Balance & Agility',
    },
  },
  rehab: {
    key: 'rehab',
    label: 'Physical Therapist',
    icon: 'medical-bag',
    color: '#22c55e',
    description: 'For PTs, athletic trainers, and sports medicine',
    roles: [
      { key: 'trainer', label: 'Physician', icon: 'stethoscope', color: '#22c55e' },
      { key: 'athlete', label: 'Patient', icon: 'account-heart-outline', color: '#60a5fa' },
    ],
    partLabels: {
      Head: 'Cognitive & Neurological',
      Arm: 'Upper Extremity Function',
      Core: 'Lumbar Stability',
      Leg: 'Lower Extremity Function',
      Foot: 'Ankle & Foot Mobility',
    },
  },
  parent: {
    key: 'parent',
    label: 'Parent / Youth Coach',
    icon: 'account-child-outline',
    color: '#f59e0b',
    description: 'Simple tracking for parents and youth coaches',
    roles: [
      { key: 'trainer', label: 'Parent', icon: 'account-supervisor-outline', color: '#f59e0b' },
      { key: 'athlete', label: 'Athlete', icon: 'account-outline', color: '#22c55e' },
    ],
    partLabels: {
      Head: 'Focus & Energy',
      Arm: 'Arm & Shoulder Strength',
      Core: 'Back & Stomach Strength',
      Leg: 'Leg Strength & Speed',
      Foot: 'Balance & Footwork',
    },
  },
};

export const EXERCISE_LINKS = {
  Head: {
    optimal: { text: 'Mindfulness breathing', url: 'https://www.youtube.com/results?search_query=box+breathing+athletes', thumb: '🧠' },
    monitor: { text: 'Neck mobility routine', url: 'https://www.youtube.com/results?search_query=neck+mobility+exercises+athletes', thumb: '🧠' },
    rehab: { text: 'Concussion recovery protocol', url: 'https://www.youtube.com/results?search_query=concussion+recovery+exercises', thumb: '🧠' },
  },
  Arm: {
    optimal: { text: 'Band pull-aparts', url: 'https://www.youtube.com/results?search_query=band+pull+apart+exercise', thumb: '💪' },
    monitor: { text: 'Shoulder mobility routine', url: 'https://www.youtube.com/results?search_query=shoulder+mobility+routine+athletes', thumb: '💪' },
    rehab: { text: 'Rotator cuff rehab exercises', url: 'https://www.youtube.com/results?search_query=rotator+cuff+rehabilitation+exercises', thumb: '💪' },
  },
  Core: {
    optimal: { text: 'Pallof press', url: 'https://www.youtube.com/results?search_query=pallof+press+exercise', thumb: '🫀' },
    monitor: { text: 'Dead bug exercise', url: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core', thumb: '🫀' },
    rehab: { text: 'Lower back rehab routine', url: 'https://www.youtube.com/results?search_query=lower+back+rehabilitation+exercises', thumb: '🫀' },
  },
  Leg: {
    optimal: { text: 'Bulgarian split squat', url: 'https://www.youtube.com/results?search_query=bulgarian+split+squat+form', thumb: '🦵' },
    monitor: { text: 'Quad and hamstring stretch', url: 'https://www.youtube.com/results?search_query=quad+hamstring+stretch+routine', thumb: '🦵' },
    rehab: { text: 'Knee rehab exercises', url: 'https://www.youtube.com/results?search_query=knee+rehabilitation+exercises', thumb: '🦵' },
  },
  Foot: {
    optimal: { text: 'Single leg balance drill', url: 'https://www.youtube.com/results?search_query=single+leg+balance+training', thumb: '🦶' },
    monitor: { text: 'Calf and ankle stretch', url: 'https://www.youtube.com/results?search_query=calf+ankle+stretch+routine', thumb: '🦶' },
    rehab: { text: 'Plantar fasciitis exercises', url: 'https://www.youtube.com/results?search_query=plantar+fasciitis+exercises', thumb: '🦶' },
  },
};

export const getExerciseLink = (part, grade) => {
  const level = grade >= 90 ? 'optimal' : grade >= 70 ? 'monitor' : 'rehab';
  return EXERCISE_LINKS[part]?.[level] || null;
};

export const BODY_PARTS = ['Head', 'Arm', 'Core', 'Leg', 'Foot'];

export const BODY_PART_PRESETS = {
  athletic: {
    label: 'Athletic / Sports',
    parts: ['Head', 'Arm', 'Core', 'Leg', 'Foot'],
    colors: { Head: '#60a5fa', Arm: '#a78bfa', Core: '#34d399', Leg: '#fbbf24', Foot: '#f87171' },
  },
  yoga: {
    label: 'Yoga / Mobility',
    parts: ['Shoulders', 'Spine', 'Hips', 'Balance', 'Breath'],
    colors: { Shoulders: '#a78bfa', Spine: '#34d399', Hips: '#f59e0b', Balance: '#60a5fa', Breath: '#f87171' },
  },
  strength: {
    label: 'Strength / Powerlifting',
    parts: ['Upper', 'Push', 'Pull', 'Lower', 'Core'],
    colors: { Upper: '#60a5fa', Push: '#a78bfa', Pull: '#34d399', Lower: '#fbbf24', Core: '#f87171' },
  },
  rehab: {
    label: 'Physical Therapy',
    parts: ['Cervical', 'Shoulder', 'Lumbar', 'Knee', 'Ankle'],
    colors: { Cervical: '#60a5fa', Shoulder: '#a78bfa', Lumbar: '#34d399', Knee: '#fbbf24', Ankle: '#f87171' },
  },
  custom: {
    label: 'Custom',
    parts: [],
    colors: {},
  },
};

export const DEFAULT_PART_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

export const PART_META = {
  // Athletic defaults
  Head: { icon: 'brain', label: 'Head', shortHint: 'Focus and cognitive readiness', plainHint: 'How sharp and mentally present the athlete feels — concentration, reaction time, and stress levels' },
  Arm: { icon: 'arm-flex', label: 'Arm', shortHint: 'Upper body power and stability', plainHint: 'Strength and health of the shoulders, arms, and hands — throwing, pushing, and pulling power' },
  Core: { icon: 'heart-pulse', label: 'Core', shortHint: 'Midline control and posture', plainHint: 'Back strength, abdominal control, and posture — the foundation for almost every athletic movement' },
  Leg: { icon: 'run-fast', label: 'Leg', shortHint: 'Drive, force, and sprint capacity', plainHint: 'Power and health of the hips, quads, hamstrings, and knees — running, jumping, and driving force' },
  Foot: { icon: 'shoe-sneaker', label: 'Foot', shortHint: 'Balance and push-off control', plainHint: 'Ankle stability, foot health, and balance — the base of every step, jump, and landing' },
  // Yoga presets
  Shoulders: { icon: 'human-handsup', label: 'Shoulders', shortHint: 'Shoulder mobility and stability', plainHint: 'Range of motion, strength, and openness in the shoulder joint and surrounding muscles' },
  Spine: { icon: 'human', label: 'Spine', shortHint: 'Spinal alignment and flexibility', plainHint: 'Health, flexibility, and alignment of the entire spine from neck to tailbone' },
  Hips: { icon: 'run', label: 'Hips', shortHint: 'Hip mobility and strength', plainHint: 'Flexibility, strength, and range of motion in the hip flexors, glutes, and pelvis' },
  Balance: { icon: 'yoga', label: 'Balance', shortHint: 'Stability and proprioception', plainHint: 'Ability to stabilize the body through static and dynamic movements' },
  Breath: { icon: 'weather-windy', label: 'Breath', shortHint: 'Breathing capacity and control', plainHint: 'Breath awareness, lung capacity, and ability to connect breath to movement' },
  // Strength presets
  Upper: { icon: 'arm-flex', label: 'Upper', shortHint: 'Upper body strength', plainHint: 'Overall pressing, pulling, and carrying strength of the upper body' },
  Push: { icon: 'arrow-up-bold', label: 'Push', shortHint: 'Push strength and stability', plainHint: 'Bench press, overhead press, and pushing movement patterns' },
  Pull: { icon: 'arrow-down-bold', label: 'Pull', shortHint: 'Pull strength and control', plainHint: 'Rows, pull-ups, and pulling movement patterns' },
  Lower: { icon: 'run-fast', label: 'Lower', shortHint: 'Lower body strength', plainHint: 'Squat, deadlift, and lower body power and mobility' },
  // Rehab presets
  Cervical: { icon: 'head-outline', label: 'Cervical', shortHint: 'Neck and cervical spine', plainHint: 'Mobility, strength, and pain levels in the neck and upper cervical spine' },
  Shoulder: { icon: 'human-handsup', label: 'Shoulder', shortHint: 'Shoulder joint health', plainHint: 'Range of motion, strength, and pain levels in the shoulder complex' },
  Lumbar: { icon: 'human', label: 'Lumbar', shortHint: 'Lower back function', plainHint: 'Mobility, stability, and pain levels in the lumbar spine and surrounding muscles' },
  Knee: { icon: 'run', label: 'Knee', shortHint: 'Knee joint health', plainHint: 'Range of motion, strength, and pain levels in the knee joint and surrounding tissues' },
  Ankle: { icon: 'shoe-sneaker', label: 'Ankle', shortHint: 'Ankle mobility and stability', plainHint: 'Dorsiflexion, plantar flexion, and lateral stability of the ankle joint' },
};

export const getPartMeta = (part) => PART_META[part] || {
  icon: 'circle-outline',
  label: part,
  shortHint: `${part} health and performance`,
  plainHint: `Health and performance of the ${part}`,
};

let _largeText = false;
export let FONT_SCALE = 1;

export const setLargeText = (large) => {
  _largeText = large;
  FONT_SCALE = large ? 1.2 : 1;
};

export const isLargeText = () => _largeText;

export const getNumericGrade = (grade, fallback = 100) => {
  const parsed = Number(grade);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseGradeValue = (value, fallback = null) => {
  const normalized = String(value ?? '').trim();
  if (normalized === '') return fallback;
  if (!/^\d{1,3}$/.test(normalized)) return fallback;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
};

export const getSeverityMeta = (grade) => {
  const g = getNumericGrade(grade);
  if (g >= 90) return { label: 'Optimal', color: PALETTE.success, soft: PALETTE.successSoft, text: '#a7f3c0' };
  if (g >= 70) return { label: 'Monitor', color: PALETTE.warning, soft: PALETTE.warningSoft, text: '#fde68a' };
  return { label: 'Priority', color: PALETTE.danger, soft: PALETTE.dangerSoft, text: '#fca5a5' };
};

export const getRecommendation = (part, grade) => {
  const g = getNumericGrade(grade);
  if (g >= 90) return `${part} is strong. Maintain current training load.`;
  if (g >= 70) return `${part} needs lighter load and additional recovery time.`;
  return `${part} requires immediate rehab focus before increasing intensity.`;
};

export const getPriorityArea = (metrics = {}) => {
  const lowest = BODY_PARTS.reduce((low, part) => {
    return getNumericGrade(metrics[part]) < getNumericGrade(metrics[low]) ? part : low;
  }, BODY_PARTS[0]);
  return getNumericGrade(metrics[lowest]) < 90 ? lowest : 'None';
};

export const getAverageScore = (metrics = {}) => {
  const total = BODY_PARTS.reduce((sum, part) => sum + getNumericGrade(metrics[part]), 0);
  return Math.round(total / BODY_PARTS.length);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const gradeColor = (g) => {
  if (g >= 90) return PALETTE.success;
  if (g >= 70) return PALETTE.warning;
  return PALETTE.danger;
};
