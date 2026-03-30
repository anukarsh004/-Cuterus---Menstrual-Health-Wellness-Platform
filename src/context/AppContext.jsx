/**
 * AppContext - Firebase-powered state management
 * Uses Firebase Auth for authentication and Firestore for data persistence
 * Falls back to demo data when Firebase is not configured
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/config';
import { signUp, signIn, logOut, onAuthChange } from '../firebase/authService';
import {
  saveUserProfile,
  getUserProfile,
  logSymptoms as fbLogSymptoms,
  getSymptoms,
  onSymptomsChange,
  logCycle as fbLogCycle,
  getCycles,
  onCyclesChange,
  saveChatMessage,
  onChatMessagesChange,
  clearChatMessages
} from '../firebase/firestoreService';

const AppContext = createContext(null);

// Check if Firebase is configured (not placeholder keys)
function isFirebaseConfigured() {
  try {
    return auth?.app?.options?.apiKey && auth.app.options.apiKey !== 'YOUR_API_KEY';
  } catch {
    return false;
  }
}

// ============================================
// DEMO DATA (used when Firebase not configured)
// ============================================
function getRelativeDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const DEMO_USER = {
  id: 'user-1',
  name: 'Sarah Chen',
  email: 'sarah@example.com',
  role: 'personal',
  avatar: null,
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 8);
    return d.toISOString().split('T')[0];
  })(),
  orgId: null,
  orgName: null,
  age: 28,
};

const DEMO_SYMPTOMS_LOG = [
  { date: getRelativeDate(-1), symptoms: ['cramps', 'fatigue', 'mood_swings'], severity: { cramps: 3, fatigue: 2, mood_swings: 2 } },
  { date: getRelativeDate(-2), symptoms: ['cramps', 'bloating', 'headache'], severity: { cramps: 4, bloating: 2, headache: 3 } },
  { date: getRelativeDate(-3), symptoms: ['cramps', 'fatigue', 'sadness'], severity: { cramps: 5, fatigue: 4, sadness: 3 } },
  { date: getRelativeDate(-5), symptoms: ['fatigue', 'bloating'], severity: { fatigue: 2, bloating: 3 } },
  { date: getRelativeDate(-8), symptoms: ['cravings', 'mood_swings'], severity: { cravings: 3, mood_swings: 2 } },
  { date: getRelativeDate(-15), symptoms: ['acne', 'bloating', 'irritability'], severity: { acne: 2, bloating: 3, irritability: 4 } },
  { date: getRelativeDate(-20), symptoms: ['headache', 'fatigue'], severity: { headache: 2, fatigue: 3 } },
  { date: getRelativeDate(-30), symptoms: ['cramps', 'fatigue', 'mood_swings', 'cravings'], severity: { cramps: 4, fatigue: 3, mood_swings: 3, cravings: 4 } },
  { date: getRelativeDate(-31), symptoms: ['cramps', 'bloating', 'sadness'], severity: { cramps: 5, bloating: 4, sadness: 3 } },
];

const DEMO_CYCLE_HISTORY = [
  { startDate: getRelativeDate(-8), endDate: getRelativeDate(-4), length: 28 },
  { startDate: getRelativeDate(-36), endDate: getRelativeDate(-32), length: 28 },
  { startDate: getRelativeDate(-63), endDate: getRelativeDate(-59), length: 27 },
  { startDate: getRelativeDate(-91), endDate: getRelativeDate(-87), length: 28 },
  { startDate: getRelativeDate(-118), endDate: getRelativeDate(-114), length: 27 },
  { startDate: getRelativeDate(-146), endDate: getRelativeDate(-142), length: 28 },
];

function generateHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const data = [];
  weeks.forEach(week => {
    days.forEach(day => {
      data.push({ week, day, value: Math.floor(60 + Math.random() * 40) });
    });
  });
  return data;
}

const DEMO_HR_DATA = {
  orgName: 'TechFlow Inc.',
  totalEmployees: 124,
  departments: ['Engineering', 'Marketing', 'Design', 'HR', 'Sales'],
  wellnessMetrics: {
    avgWellnessScore: 78, wellnessScoreTrend: +5,
    absenteeismRate: 3.2, absenteeismTrend: -1.8,
    productivityIndex: 92, productivityTrend: +8,
    engagementRate: 85, engagementTrend: +3,
  },
  monthlyTrends: [
    { month: 'Oct', wellness: 72, productivity: 84, engagement: 78 },
    { month: 'Nov', wellness: 74, productivity: 86, engagement: 80 },
    { month: 'Dec', wellness: 71, productivity: 82, engagement: 76 },
    { month: 'Jan', wellness: 75, productivity: 88, engagement: 82 },
    { month: 'Feb', wellness: 78, productivity: 91, engagement: 84 },
    { month: 'Mar', wellness: 78, productivity: 92, engagement: 85 },
  ],
  departmentComparison: [
    { dept: 'Engineering', wellness: 76, productivity: 94, team: 45 },
    { dept: 'Marketing', wellness: 82, productivity: 88, team: 28 },
    { dept: 'Design', wellness: 85, productivity: 90, team: 18 },
    { dept: 'HR', wellness: 80, productivity: 86, team: 12 },
    { dept: 'Sales', wellness: 74, productivity: 91, team: 21 },
  ],
  weeklyHeatmap: generateHeatmapData(),
  roi: {
    absenteeismReduction: 32, productivityGain: 18,
    retentionImprovement: 12, estimatedSavings: '$42,500',
  },
};


// ============================================
// PROVIDER COMPONENT
// ============================================
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [symptomsLog, setSymptomsLog] = useState(DEMO_SYMPTOMS_LOG);
  const [cycleHistory, setCycleHistory] = useState(DEMO_CYCLE_HISTORY);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ---- Check if Firebase is configured ----
  useEffect(() => {
    const configured = isFirebaseConfigured();
    setFirebaseReady(configured);

    if (!configured) {
      // Fall back to localStorage
      const saved = localStorage.getItem('cuterus_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem('cuterus_user'); }
      }
      setIsLoading(false);
    }
  }, []);

  // ---- Firebase Auth listener ----
  useEffect(() => {
    if (!firebaseReady) return;

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — load profile from Firestore
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          const userData = profile || {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role: 'personal',
            cycleLength: 28,
            periodLength: 5,
            age: 28,
          };
          userData.id = firebaseUser.uid;
          setUser(userData);
          localStorage.setItem('cuterus_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Error loading profile:', err);
        }
      } else {
        setUser(null);
        localStorage.removeItem('cuterus_user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseReady]);

  // ---- Real-time listeners for symptoms & cycles ----
  useEffect(() => {
    if (!firebaseReady || !user?.id) return;

    const unsubSymptoms = onSymptomsChange(user.id, (data) => {
      if (data.length > 0) setSymptomsLog(data);
    });

    const unsubCycles = onCyclesChange(user.id, (data) => {
      if (data.length > 0) setCycleHistory(data);
    });

    const unsubChat = onChatMessagesChange(user.id, (data) => {
      setChatMessages(data);
    });

    return () => {
      unsubSymptoms();
      unsubCycles();
      unsubChat();
    };
  }, [firebaseReady, user?.id]);

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  const login = useCallback(async (email, password, role = 'personal', inputName = '') => {
    setAuthError(null);

    if (firebaseReady) {
      try {
        setIsLoading(true);
        const firebaseUser = await signIn(email, password);
        
        // Load or create profile
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            id: firebaseUser.uid,
            name: inputName || firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role,
            cycleLength: 28,
            periodLength: 5,
            age: 28,
            lastPeriodStart: getRelativeDate(-8),
          };
          if (role === 'employee' || role === 'hr') {
            profile.orgId = 'org-1';
            profile.orgName = 'TechFlow Inc.';
          }
          await saveUserProfile(firebaseUser.uid, profile);
        }

        profile.id = firebaseUser.uid;
        setUser(profile);
        localStorage.setItem('cuterus_user', JSON.stringify(profile));
        setIsLoading(false);
        return profile;
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message);
        console.error('Firebase login error:', err);
        throw err;
      }
    } else {
      // Demo/localStorage fallback
      let existingProfile = {};
      const saved = localStorage.getItem('cuterus_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.email === email && parsed.role === role) existingProfile = parsed;
        } catch {}
      }

      const defaultName = role === 'hr' ? 'Alex Rivera' : 'Sarah Chen';
      const finalName = inputName || existingProfile.name || defaultName;
      const userData = { ...DEMO_USER, ...existingProfile, email, role, name: finalName };

      if ((role === 'employee' || role === 'hr') && !existingProfile.orgId) {
        userData.orgId = 'org-1';
        userData.orgName = 'TechFlow Inc.';
      }

      setUser(userData);
      localStorage.setItem('cuterus_user', JSON.stringify(userData));
      return userData;
    }
  }, [firebaseReady]);

  const register = useCallback(async (email, password, role = 'personal', name = '') => {
    setAuthError(null);

    if (firebaseReady) {
      try {
        setIsLoading(true);
        const firebaseUser = await signUp(email, password, name);
        
        const profile = {
          id: firebaseUser.uid,
          name: name || 'User',
          email: firebaseUser.email,
          role,
          avatar: null,
          cycleLength: 28,
          periodLength: 5,
          age: 28,
          lastPeriodStart: getRelativeDate(-8),
          orgId: (role === 'employee' || role === 'hr') ? 'org-1' : null,
          orgName: (role === 'employee' || role === 'hr') ? 'TechFlow Inc.' : null,
        };

        await saveUserProfile(firebaseUser.uid, profile);
        setUser(profile);
        localStorage.setItem('cuterus_user', JSON.stringify(profile));
        setIsLoading(false);
        return profile;
      } catch (err) {
        setIsLoading(false);
        setAuthError(err.message);
        console.error('Firebase register error:', err);
        throw err;
      }
    } else {
      // Demo fallback — same as login
      return login(email, password, role, name);
    }
  }, [firebaseReady, login]);

  const logout = useCallback(async () => {
    if (firebaseReady) {
      try {
        await logOut();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setUser(null);
    setChatMessages([]);
    localStorage.removeItem('cuterus_user');
  }, [firebaseReady]);

  // ============================================
  // DATA FUNCTIONS
  // ============================================

  const updateUser = useCallback(async (updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('cuterus_user', JSON.stringify(updated));

      // Save to Firestore if configured
      if (firebaseReady && prev.id) {
        saveUserProfile(prev.id, updates).catch(err =>
          console.error('Error saving profile to Firestore:', err)
        );
      }

      return updated;
    });
  }, [firebaseReady]);

  const logSymptoms = useCallback(async (date, symptoms, severity) => {
    const newLog = { date, symptoms, severity };

    // Optimistic UI update
    setSymptomsLog(prev => [newLog, ...prev.filter(l => l.date !== date)]);

    // Save to Firestore if configured
    if (firebaseReady && user?.id) {
      try {
        await fbLogSymptoms(user.id, date, symptoms, severity);
      } catch (err) {
        console.error('Error saving symptoms to Firestore:', err);
      }
    }
  }, [firebaseReady, user?.id]);

  const logCycle = useCallback(async (startDate, endDate) => {
    const length = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const newCycle = { startDate, endDate, length };

    // Optimistic UI update
    setCycleHistory(prev => [newCycle, ...prev]);
    setUser(prev => prev ? { ...prev, lastPeriodStart: startDate } : null);

    // Save to Firestore if configured
    if (firebaseReady && user?.id) {
      try {
        await fbLogCycle(user.id, startDate, endDate, length);
        await saveUserProfile(user.id, { lastPeriodStart: startDate });
      } catch (err) {
        console.error('Error saving cycle to Firestore:', err);
      }
    }
  }, [firebaseReady, user?.id]);

  const addChatMessage = useCallback(async (message) => {
    // Optimistic UI update
    setChatMessages(prev => [...prev, message]);

    // Save to Firestore if configured
    if (firebaseReady && user?.id) {
      try {
        await saveChatMessage(user.id, message);
      } catch (err) {
        console.error('Error saving chat message to Firestore:', err);
      }
    }
  }, [firebaseReady, user?.id]);

  return (
    <AppContext.Provider value={{
      user, setUser, login, register, logout, updateUser,
      symptomsLog, logSymptoms,
      cycleHistory, logCycle,
      chatMessages, addChatMessage, setChatMessages,
      isLoading, setIsLoading,
      authError, setAuthError,
      firebaseReady,
      hrData: DEMO_HR_DATA,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
