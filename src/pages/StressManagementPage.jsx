import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Trash2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES } from '../utils/cycleUtils';

const breathingExercises = [
  {
    name: 'Box Breathing',
    description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s',
    duration: 5,
    color: 'from-blue-400 to-cyan-500',
  },
  {
    name: '4-7-8 Breathing',
    description: 'Inhale 4s → Hold 7s → Exhale 8s (calming)',
    duration: 10,
    color: 'from-purple-400 to-pink-500',
  },
  {
    name: 'Belly Breathing',
    description: 'Deep diaphragmatic breathing - relax your belly',
    duration: 5,
    color: 'from-green-400 to-emerald-500',
  },
  {
    name: '2-1 Breathing',
    description: 'Inhale 4s → Exhale 8s (very calming)',
    duration: 10,
    color: 'from-amber-400 to-orange-500',
  },
];

const journalingPrompts = {
  MENSTRUATION: [
    'How is my body feeling today? What does it need?',
    'What am I grateful for this cycle?',
    'What rested me the most this week?',
  ],
  FOLLICULAR: [
    'What new things want to emerge in my life?',
    'How can I channel my growing energy?',
    'What goals excite me right now?',
  ],
  OVULATION: [
    'What am I proud of myself for?',
    'How do I want to shine this phase?',
    'What connections do I want to nurture?',
  ],
  LUTEAL: [
    'What needs releasing or letting go?',
    'How can I practice more self-compassion?',
    'What boundaries do I need to set?',
  ],
};

export default function StressManagementPage() {
  const { user, appState, updateAppState } = useApp();
  const [journalEntries, setJournalEntries] = useState(appState?.journalEntries || []);
  const [showBreathe, setShowBreathe] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [newJournal, setNewJournal] = useState('');

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;
  const prompts = journalingPrompts[currentPhase.name] || journalingPrompts.FOLLICULAR;

  // Breathing animation
  useEffect(() => {
    if (!activeExercise) return;

    const exercise = breathingExercises[activeExercise];
    let count = 0;

    const timer = setInterval(() => {
      count++;
      setBreathCount(count);
      if (count >= (exercise.duration * 60) / 4) {
        clearInterval(timer);
        setActiveExercise(null);
        setBreathCount(0);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [activeExercise]);

  const handleAddJournal = () => {
    if (newJournal.trim()) {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        content: newJournal,
        mood: 5,
        stress: 5,
        phase: phaseInfo?.phase,
      };
      const updated = [entry, ...journalEntries];
      setJournalEntries(updated);
      updateAppState({ journalEntries: updated });
      setNewJournal('');
    }
  };

  const handleDeleteJournal = (id) => {
    const updated = journalEntries.filter(e => e.id !== id);
    setJournalEntries(updated);
    updateAppState({ journalEntries: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500" />
          Stress Management
        </h1>
        <p className="text-gray-500 mt-1">Breathing exercises & journaling for emotional wellness</p>
      </div>

      {/* Breathing Exercises */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">🫁 Breathing Exercises</h3>
        
        {activeExercise !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8 py-8"
          >
            <h2 className="text-2xl font-bold text-gray-800">
              {breathingExercises[activeExercise].name}
            </h2>
            
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-4xl font-bold text-white"
              >
                ◉
              </motion.div>
            </motion.div>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                {breathingExercises[activeExercise].description}
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-4">{breathCount}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveExercise(null);
                setBreathCount(0);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
            >
              Stop Exercise
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {breathingExercises.map((exercise, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveExercise(i)}
                className={`p-4 rounded-lg text-white font-medium text-left transition-all ${
                  exercise.color.includes('from')
                    ? `bg-gradient-to-br ${exercise.color}`
                    : exercise.color
                }`}
              >
                <p className="font-semibold">{exercise.name}</p>
                <p className="text-xs opacity-90">{exercise.duration} minutes</p>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Journaling */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">📖 Journaling</h3>
        
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm font-medium text-blue-900 mb-2">Today's Prompt:</p>
          <p className="text-sm text-blue-800">{prompts[0]}</p>
        </div>

        <div className="space-y-3">
          <textarea
            value={newJournal}
            onChange={(e) => setNewJournal(e.target.value)}
            placeholder="Write your thoughts and feelings..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            rows="5"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddJournal}
            className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Save Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Journal History */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">Recent Entries</h3>
        <div className="space-y-3">
          {journalEntries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No journal entries yet. Start writing!</p>
          ) : (
            journalEntries.slice(0, 5).map(entry => (
              <motion.div
                key={entry.id}
                layout
                className="p-4 rounded-lg bg-white/40 border border-pink-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} • {entry.phase}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteJournal(entry.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{entry.content}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* More Prompts */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">More Journaling Prompts</h3>
        <div className="space-y-2">
          {prompts.map((prompt, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-sm text-gray-700 flex items-start gap-2 p-2 rounded hover:bg-white/50 transition-colors"
            >
              <span className="text-gray-400">→</span>
              {prompt}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
