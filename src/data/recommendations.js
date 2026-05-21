// Recommended exercises and stretches per body part and grade level
// Grade >= 90: Maintenance
// Grade 70-89: Monitor
// Grade < 70: Rehab

export const RECOMMENDATIONS = {
  Head: {
    optimal: [
      'Continue current cognitive load management',
      'Maintain sleep 7-9 hours nightly',
      'Add brief mindfulness or breathing exercises',
    ],
    monitor: [
      'Reduce mental fatigue — limit screen time post-session',
      'Neck rolls: slow circles x10 each direction',
      'Chin tucks: 3 sets x 10 reps',
      'Occipital release: gentle self-massage base of skull',
    ],
    rehab: [
      'Full cognitive rest — no high-stress activities',
      'Suboccipital stretch: chin to chest hold 30s x 3',
      'Levator scapulae stretch: ear to shoulder 30s each side',
      'Consult physician if headaches persist',
      'No contact activities until cleared',
    ],
  },
  Arm: {
    optimal: [
      'Continue current upper body programming',
      'Band pull-aparts: 3x15 for shoulder health',
      'Wrist circles and forearm stretches post-session',
    ],
    monitor: [
      'Reduce pressing volume by 30%',
      'Doorway chest stretch: 30s x 3',
      'Cross-body shoulder stretch: 30s each arm',
      'Forearm flexor stretch: arm extended, fingers down 30s',
      'Ice after activity if inflamed',
    ],
    rehab: [
      'No overhead pressing until grade improves',
      'Pendulum exercises: gentle arm circles',
      'Theraband external rotation: 3x15 light resistance',
      'Wrist tendon glides: full range slow movement',
      'Consult PT for persistent pain above elbow',
    ],
  },
  Core: {
    optimal: [
      'Continue current core programming',
      'Add anti-rotation holds: Pallof press 3x10',
      'Single-leg balance: 30s each side',
    ],
    monitor: [
      'Avoid heavy spinal loading this week',
      'Dead bug: 3x8 slow controlled',
      'Bird dog: 3x10 each side',
      'Cat-cow stretch: 2 min slow',
      'Diaphragmatic breathing: 5 min daily',
    ],
    rehab: [
      'No loaded spinal flexion or extension',
      'Supine pelvic tilts: 3x15 gentle',
      'Knee-to-chest stretch: hold 30s each leg',
      'Prone press-up: 3x10 gentle extension',
      'Consult PT — possible disc or SI joint issue',
    ],
  },
  Leg: {
    optimal: [
      'Continue current lower body programming',
      'Hip flexor stretch post-session: 30s each side',
      'Calf raises: 3x20 for ankle stability',
    ],
    monitor: [
      'Reduce squat depth and load by 40%',
      'Quad stretch standing: 30s each leg',
      'Hamstring stretch seated: 30s each leg',
      'Foam roll IT band and quads: 2 min each',
      'Ice knees post-session if swollen',
    ],
    rehab: [
      'No impact activities — pool or bike only',
      'Straight leg raises: 3x15 lying down',
      'Terminal knee extensions with band: 3x20',
      'Short arc quads: 3x15',
      'Consult PT — possible ligament or meniscus involvement',
    ],
  },
  Foot: {
    optimal: [
      'Continue current programming',
      'Towel scrunches: 3x20 for intrinsic strength',
      'Single leg balance with eyes closed: 30s each',
    ],
    monitor: [
      'Reduce impact — limit jumping and sprinting',
      'Plantar fascia stretch: foot on wall toes up 30s x 3',
      'Calf stretch against wall: 30s each leg',
      'Marble pickups with toes for intrinsic strength',
      'Supportive footwear recommended',
    ],
    rehab: [
      'Non-weight bearing as much as possible',
      'Ankle alphabet: trace letters with foot',
      'Towel stretch: towel around foot pull gently 30s',
      'Ice 20 min every 2 hours if swollen',
      'Consult PT — possible plantar fasciitis or stress fracture',
    ],
  },
};

export const getRecommendations = (part, grade) => {
  const partRecs = RECOMMENDATIONS[part];
  if (!partRecs) return [];
  if (grade >= 90) return partRecs.optimal;
  if (grade >= 70) return partRecs.monitor;
  return partRecs.rehab;
};

export const getRecommendationLevel = (grade) => {
  if (grade >= 90) return { label: 'Maintenance', color: '#22c55e' };
  if (grade >= 70) return { label: 'Monitor', color: '#f59e0b' };
  return { label: 'Rehab', color: '#ef4444' };
};
