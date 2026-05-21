import { db, auth, storage } from './firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// ─── Image upload ─────────────────────────────────────────────────────────────
export const uploadImage = async (uid, imageUri, type = 'profile') => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `trainers/${uid}/${type}.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'trainers', uid), {
      [`${type}Url`]: url,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, url };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signUp = async (email, password, name) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'trainers', cred.user.uid), {
      name,
      email,
      role: 'trainer',
      createdAt: new Date().toISOString(),
    });
    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logIn = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: cred.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export const getTrainerProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'trainers', uid));
    if (snap.exists()) return { success: true, data: snap.data() };
    return { success: false, message: 'Profile not found' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateTrainerProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'trainers', uid), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export const addClient = async (trainerId, clientData) => {
  try {
    const ref = await addDoc(collection(db, 'trainers', trainerId, 'clients'), {
      ...clientData,
      athleteCanEdit: false,
      targets: {},
      injuries: {},
      injuryNotes: {},
      injurySeverities: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: ref.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loadClients = async (trainerId) => {
  try {
    const snap = await getDocs(collection(db, 'trainers', trainerId, 'clients'));
    const clients = {};
    snap.forEach((d) => { clients[d.id] = { id: d.id, ...d.data() }; });
    return { success: true, data: clients };
  } catch (error) {
    return { success: false, data: {}, message: error.message };
  }
};

export const updateClient = async (trainerId, clientId, data) => {
  try {
    await updateDoc(doc(db, 'trainers', trainerId, 'clients', clientId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteClient = async (trainerId, clientId) => {
  try {
    await deleteDoc(doc(db, 'trainers', trainerId, 'clients', clientId));
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

// Save a full session + update client's current grades/injuries/targets
export const saveSession = async (trainerId, clientId, sessionData) => {
  try {
    const {
      grades,
      targets,
      injuries,
      injuryNotes,
      injurySeverities,
      sessionNote,
    } = sessionData;

    const timestamp = new Date().toISOString();

    // 1. Log the session record
    const sessionRef = await addDoc(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'sessions'),
      {
        grades,
        targets,
        injuries,
        injuryNotes,
        injurySeverities,
        sessionNote: sessionNote || '',
        timestamp,
      }
    );

    // 2. Update the client's current grades + metadata
    await updateDoc(doc(db, 'trainers', trainerId, 'clients', clientId), {
      ...grades,
      targets: targets || {},
      injuries: injuries || {},
      injuryNotes: injuryNotes || {},
      injurySeverities: injurySeverities || {},
      lastSessionAt: timestamp,
      lastSessionNote: sessionNote || '',
      updatedAt: timestamp,
    });

    // 3. Write audit log entry
    await addDoc(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'auditLog'),
      {
        timestamp,
        grades,
        sessionNote: sessionNote || '',
        loggedBy: sessionData.loggedBy || 'trainer',
        action: 'session_logged',
      }
    );

    return { success: true, sessionId: sessionRef.id };
  } catch (error) {
    console.error('saveSession error:', error);
    return { success: false, message: error.message };
  }
};

export const createOrg = async (ownerId, orgName) => {
  try {
    const orgRef = await addDoc(collection(db, 'orgs'), {
      name: orgName,
      ownerId,
      trainers: [ownerId],
      createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'trainers', ownerId), {
      orgId: orgRef.id,
      orgRole: 'owner',
    });
    return { success: true, orgId: orgRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const joinOrg = async (trainerId, orgId) => {
  try {
    const orgRef = doc(db, 'orgs', orgId);
    const orgSnap = await getDoc(orgRef);
    if (!orgSnap.exists()) return { success: false, message: 'Org not found' };
    const trainers = orgSnap.data().trainers || [];
    if (!trainers.includes(trainerId)) {
      await updateDoc(orgRef, { trainers: [...trainers, trainerId] });
    }
    await updateDoc(doc(db, 'trainers', trainerId), {
      orgId,
      orgRole: 'trainer',
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loadOrg = async (orgId) => {
  try {
    const snap = await getDoc(doc(db, 'orgs', orgId));
    if (!snap.exists()) return { success: false };
    return { success: true, data: { id: snap.id, ...snap.data() } };
  } catch (error) {
    return { success: false };
  }
};

export const loadSessions = async (trainerId, clientId) => {
  try {
    const q = query(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'sessions'),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    const sessions = [];
    snap.forEach((d) => sessions.push({ id: d.id, ...d.data() }));
    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, data: [], message: error.message };
  }
};

export const deleteSession = async (trainerId, clientId, sessionId) => {
  try {
    await deleteDoc(
      doc(db, 'trainers', trainerId, 'clients', clientId, 'sessions', sessionId)
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Athlete edit permission ───────────────────────────────────────────────────

export const setAthleteCanEdit = async (trainerId, clientId, canEdit) => {
  try {
    await updateDoc(doc(db, 'trainers', trainerId, 'clients', clientId), {
      athleteCanEdit: canEdit,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── AI Plans ────────────────────────────────────────────────────────────────

export const saveTrainerPrefs = async (uid, prefs) => {
  try {
    await updateDoc(doc(db, 'trainers', uid), {
      prefs: prefs,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loadTrainerPrefs = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'trainers', uid));
    if (snap.exists() && snap.data().prefs) {
      return { success: true, data: snap.data().prefs };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
};

export const saveAIPlan = async (trainerId, clientId, plan) => {
  try {
    await setDoc(
      doc(db, 'trainers', trainerId, 'clients', clientId, 'aiPlans', 'latest'),
      {
        ...plan,
        generatedAt: new Date().toISOString(),
      }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loadAIPlan = async (trainerId, clientId) => {
  try {
    const snap = await getDoc(
      doc(db, 'trainers', trainerId, 'clients', clientId, 'aiPlans', 'latest')
    );
    if (snap.exists()) return { success: true, data: snap.data() };
    return { success: false, message: 'No plan found' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Join Code System ─────────────────────────────────────────────────────────
export const generateJoinCode = async (trainerId, clientId, clientName) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await setDoc(doc(db, 'joinCodes', code), {
      trainerId, clientId, clientName, code, expiresAt,
      used: false, createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'trainers', trainerId, 'clients', clientId), {
      joinCode: code, joinCodeExpiry: expiresAt,
    });
    return { success: true, code };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const redeemJoinCode = async (athleteId, athleteName, code) => {
  try {
    const codeRef = doc(db, 'joinCodes', code.trim());
    const codeSnap = await getDoc(codeRef);
    if (!codeSnap.exists()) return { success: false, message: 'Invalid code. Check with your trainer.' };
    const data = codeSnap.data();
    if (data.used) return { success: false, message: 'This code has already been used.' };
    if (new Date(data.expiresAt) < new Date()) return { success: false, message: 'Code expired. Ask your trainer for a new one.' };
    await updateDoc(doc(db, 'trainers', data.trainerId, 'clients', data.clientId), {
      linkedAthleteId: athleteId, linkedAthleteName: athleteName,
      linkedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'trainers', athleteId), {
      linkedTrainerId: data.trainerId, linkedClientId: data.clientId,
      linkedClientName: data.clientName,
    });
    await updateDoc(codeRef, { used: true, redeemedBy: athleteId });
    return { success: true, trainerId: data.trainerId, clientId: data.clientId, clientName: data.clientName };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const loadLinkedClientData = async (trainerId, clientId) => {
  try {
    const snap = await getDoc(doc(db, 'trainers', trainerId, 'clients', clientId));
    if (!snap.exists()) return { success: false };
    return { success: true, data: { id: snap.id, ...snap.data() } };
  } catch (error) {
    return { success: false };
  }
};

// ─── Audit Log ───────────────────────────────────────────────────────────────
export const loadAuditLog = async (trainerId, clientId) => {
  try {
    const q = query(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'auditLog'),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, data: [] };
  }
};

// ─── Coach Notes ───────────────────────────────────────────────────────────────
export const saveCoachNote = async (trainerId, clientId, coachNote, coachName) => {
  try {
    await addDoc(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'coachNotes'),
      {
        note: coachNote,
        coachName: coachName || 'Coach',
        createdAt: new Date().toISOString(),
      }
    );
    // Also update lastCoachNote on client for quick display
    await updateDoc(doc(db, 'trainers', trainerId, 'clients', clientId), {
      lastCoachNote: coachNote,
      lastCoachName: coachName || 'Coach',
      lastCoachNoteAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ─── Multi-Org ────────────────────────────────────────────────────────────────
export const loadTrainerOrgs = async (trainerId) => {
  try {
    // Load all orgs where this trainer is a member
    const snap = await getDocs(collection(db, 'orgs'));
    const orgs = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.trainers?.includes(trainerId)) {
        orgs.push({ id: d.id, ...data });
      }
    });
    return { success: true, data: orgs };
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const loadOrgClients = async (orgId) => {
  try {
    const orgSnap = await getDoc(doc(db, 'orgs', orgId));
    if (!orgSnap.exists()) return { success: false, data: {} };
    const trainers = orgSnap.data().trainers || [];
    const allClients = {};
    await Promise.all(trainers.map(async (tid) => {
      const snap = await getDocs(collection(db, 'trainers', tid, 'clients'));
      snap.forEach((d) => {
        allClients[d.id] = { id: d.id, trainerId: tid, ...d.data() };
      });
    }));
    return { success: true, data: allClients };
  } catch (error) {
    return { success: false, data: {} };
  }
};

// ─── Coach Note History ───────────────────────────────────────────────────────
export const loadCoachNotes = async (trainerId, clientId) => {
  try {
    const q = query(
      collection(db, 'trainers', trainerId, 'clients', clientId, 'coachNotes'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return { success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, data: [] };
  }
};
