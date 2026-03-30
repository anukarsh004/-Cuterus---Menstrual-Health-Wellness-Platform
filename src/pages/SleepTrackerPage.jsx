import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES } from '../utils/cycleUtils';

const sleepTips = {
  MENSTRUATION: [
    '💤 Allow extra sleep - your body needs recovery',
    '🛏️ Try sleeping on your side with a pillow between knees',
    '🌡️ Keep room cool (65-68°F is ideal)',
    '☕ Avoid caffeine after 2 PM',
  ],
  FOLLICULAR: [
    '⚡ You\'ll naturally wake earlier - harness this energy!',
    '🏃 Morning workouts can improve sleep quality',
    '📱 Light morning exposure helps regulate circadian rhythm',
    '😴 Typically easier to fall asleep during this phase',
  ],
  OVULATION: [
    '🌞 Melatonin may be lower - try dark sunglasses before bed',
    '🧘 Consider meditation or breathwork before sleep',
    '🌙 Blackout curtains are your friend',
    '📖 Relaxing bedtime routine is especially important',
  ],
  LUTEAL: [
    '🛌 Sleep needs increase significantly - prioritize rest',
    '😴 You may sleep 1-2 hours longer than other phases',
    '🌿 Magnesium supplements (consult doctor) may help',
    '🚫 Avoid blue light 1 hour before bed',
  ],
};

export default function SleepTrackerPage() {
  const { user, appState, updateAppState } = useApp();
  const [sleepLog, setSleepLog] = useState(appState?.sleepLog || []);
  const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().split('T')[0], duration: '', quality: 5 });

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;

  const handleAddSleep = () => {
    if (newEntry.duration && newEntry.date) {
      const entry = {
        id: Date.now(),
        date: newEntry.date,
        duration: parseFloat(newEntry.duration),
        quality: newEntry.quality,
        phase: phaseInfo?.phase,
      };
      const updated = [entry, ...sleepLog];
      setSleepLog(updated);
      updateAppState({ sleepLog: updated });
      setNewEntry({ date: new Date().toISOString().split('T')[0], duration: '', quality: 5 });
    }
  };

  const handleDelete = (id) => {
    const updated = sleepLog.filter(s => s.id !== id);
    setSleepLog(updated);
    updateAppState({ sleepLog: updated });
  };

  // Last 7 days chart data
  const last7Days = sleepLog.slice(0, 7).reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    duration: entry.duration,
    quality: entry.quality,
  }));

  const avgSleep = sleepLog.length > 0 
    ? (sleepLog.reduce((sum, s) => sum + s.duration, 0) / sleepLog.length).toFixed(1)
    : 0;

  const avgQuality = sleepLog.length > 0
    ? (sleepLog.reduce((sum, s) => sum + s.quality, 0) / sleepLog.length).toFixed(1)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Moon className="w-8 h-8" style={{ color: currentPhase.color }} />
            Sleep Tracker
          </h1>
          <p className="text-gray-500 mt-1">Track your sleep quality and duration</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Sleep', value: `${avgSleep} hrs`, color: 'from-blue-400 to-cyan-500' },
          { label: 'Avg Quality', value: `${avgQuality}/10`, color: 'from-purple-400 to-pink-500' },
          { label: 'Total Logs', value: sleepLog.length, color: 'from-green-400 to-emerald-500' },
          { label: 'Current Phase', value: currentPhase.name, color: currentPhase.color },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className="stat-card"
            style={{
              background: stat.color?.includes('from') 
                ? `linear-gradient(135deg, var(--color-from), var(--color-to))` 
                : stat.color,
            }}
          >
            <p className="text-xs text-gray-600/60">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Log New Sleep Entry */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">Log Sleep</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <input
              type="number"
              placeholder="Duration (hours)"
              value={newEntry.duration}
              onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
              min="0"
              max="24"
              step="0.5"
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality: {newEntry.quality}/10</label>
            <input
              type="range"
              value={newEntry.quality}
              onChange={(e) => setNewEntry({ ...newEntry, quality: parseInt(e.target.value) })}
              min="1"
              max="10"
              className="w-full"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSleep}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Log Sleep
          </motion.button>
        </div>
      </motion.div>

      {/* Charts */}
      {last7Days.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div className="glass-card p-6">
            <h3 className="font-display font-semibold text-gray-800 mb-4">Sleep Duration</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="glass-card p-6">
            <h3 className="font-display font-semibold text-gray-800 mb-4">Sleep Quality</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="quality" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Phase-Specific Tips */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">💡 Sleep Tips for {currentPhase.name}</h3>
        <div className="space-y-2">
          {sleepTips[currentPhase.name]?.map((tip, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-sm text-gray-700 flex items-start gap-2"
            >
              {tip}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Sleep History */}
      <motion.div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">Sleep History</h3>
        <div className="space-y-2">
          {sleepLog.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No sleep logs yet. Start tracking!</p>
          ) : (
            sleepLog.slice(0, 10).map(entry => (
              <motion.div
                key={entry.id}
                layout
                className="flex items-center justify-between p-3 rounded-lg bg-white/40 border border-blue-50"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800">
                    {new Date(entry.date).toLocaleDateString()} - {entry.duration} hours
                  </p>
                  <p className="text-xs text-gray-600">Quality: {entry.quality}/10 • {entry.phase}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
