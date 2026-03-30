/**
 * Firestore Database Service
 * Handles all CRUD operations for user data, symptoms, cycles, chat, etc.
 * 
 * Collections structure:
 *   users/{userId}                    - User profile data
 *   users/{userId}/symptoms/{docId}   - Symptom logs
 *   users/{userId}/cycles/{docId}     - Cycle history
 *   users/{userId}/chatMessages/{docId} - Chat messages
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// USER PROFILE
// ============================================

// Create or update user profile
export async function saveUserProfile(userId, profileData) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Get user profile
export async function getUserProfile(userId) {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}

// ============================================
// SYMPTOMS
// ============================================

// Log symptoms for a specific date
export async function logSymptoms(userId, date, symptoms, severity) {
  const symptomsRef = collection(db, 'users', userId, 'symptoms');
  
  // Check if entry for this date already exists
  const q = query(symptomsRef, where('date', '==', date));
  const existing = await getDocs(q);
  
  if (!existing.empty) {
    // Update existing entry
    const docRef = existing.docs[0].ref;
    await updateDoc(docRef, { symptoms, severity, updatedAt: serverTimestamp() });
    return docRef.id;
  } else {
    // Create new entry
    const docRef = await addDoc(symptomsRef, {
      date,
      symptoms,
      severity,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
}

// Get all symptom logs for a user
export async function getSymptoms(userId) {
  const symptomsRef = collection(db, 'users', userId, 'symptoms');
  const q = query(symptomsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Listen to symptom changes in real-time
export function onSymptomsChange(userId, callback) {
  const symptomsRef = collection(db, 'users', userId, 'symptoms');
  const q = query(symptomsRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const symptoms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(symptoms);
  });
}

// ============================================
// CYCLE HISTORY
// ============================================

// Log a new cycle
export async function logCycle(userId, startDate, endDate, length) {
  const cyclesRef = collection(db, 'users', userId, 'cycles');
  const docRef = await addDoc(cyclesRef, {
    startDate,
    endDate,
    length,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// Get all cycles for a user
export async function getCycles(userId) {
  const cyclesRef = collection(db, 'users', userId, 'cycles');
  const q = query(cyclesRef, orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Listen to cycle changes in real-time
export function onCyclesChange(userId, callback) {
  const cyclesRef = collection(db, 'users', userId, 'cycles');
  const q = query(cyclesRef, orderBy('startDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const cycles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(cycles);
  });
}

// ============================================
// CHAT MESSAGES
// ============================================

// Save a chat message
export async function saveChatMessage(userId, message) {
  const chatRef = collection(db, 'users', userId, 'chatMessages');
  const docRef = await addDoc(chatRef, {
    ...message,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// Get chat messages for a user
export async function getChatMessages(userId) {
  const chatRef = collection(db, 'users', userId, 'chatMessages');
  const q = query(chatRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Listen to chat messages in real-time
export function onChatMessagesChange(userId, callback) {
  const chatRef = collection(db, 'users', userId, 'chatMessages');
  const q = query(chatRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// Clear all chat messages for a user
export async function clearChatMessages(userId) {
  const chatRef = collection(db, 'users', userId, 'chatMessages');
  const snapshot = await getDocs(chatRef);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

// ============================================
// SHARED MESSAGES (EMPLOYEE <-> MONITOR)
// ============================================

export async function sendSharedMessage(senderName, role, text) {
  const chatRef = collection(db, 'sharedMessages');
  const docRef = await addDoc(chatRef, {
    senderName,
    role,
    text,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export function onSharedMessagesChange(callback) {
  const chatRef = collection(db, 'sharedMessages');
  const q = query(chatRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

export async function sendSharedPoll(senderName, role, text, optionsArray) {
  const chatRef = collection(db, 'sharedMessages');
  const docRef = await addDoc(chatRef, {
    senderName,
    role,
    text,
    type: 'poll',
    options: optionsArray.map(opt => ({ text: opt, votes: [] })),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function voteOnSharedPoll(messageId, optionIndex, voterId) {
  const docRef = doc(db, 'sharedMessages', messageId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data.type === 'poll' && data.options) {
      const newOptions = data.options.map((opt, i) => {
        const withoutVoter = (opt.votes || []).filter(v => v !== voterId);
        if (i === optionIndex) {
          return { ...opt, votes: [...withoutVoter, voterId] };
        }
        return { ...opt, votes: withoutVoter };
      });
      await updateDoc(docRef, { options: newOptions });
    }
  }
}
