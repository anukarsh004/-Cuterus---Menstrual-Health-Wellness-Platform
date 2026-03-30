import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SYMPTOMS, PHASES, calculateCurrentPhase } from '../utils/cycleUtils';
import { Activity, Plus, Check, X, TrendingUp, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const severityLevels = [
  { value: 1, label: 'Mild', color: '#86efac', emoji: '🟢' },
  { value: 2, label: 'Light', color: '#fde68a', emoji: '🟡' },
  { value: 3, label: 'Moderate', color: '#fdba74', emoji: '🟠' },
  { value: 4, label: 'Strong', color: '#fca5a5', emoji: '🔴' },
  { value: 5, label: 'Severe', color: '#f87171', emoji: '🔴' },
];

export default function SymptomTracker() {
  const { user, symptomsLog, logSymptoms } = useApp();
  const [showLogger, setShowLogger] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severities, setSeverities] = useState({});
  const [activeTab, setActiveTab] = useState('log');

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    if (!severities[id]) {
      setSeverities(prev => ({ ...prev, [id]: 2 }));
    }
  };

  const handleSave = () => {
    if (selectedSymptoms.length > 0) {
      logSymptoms(selectedDate, selectedSymptoms, severities);
      setShowLogger(false);
      setSelectedSymptoms([]);
      setSeverities({});
    }
  };

  // Frequency analysis
  const symptomFrequency = useMemo(() => {
    const freq = {};
    symptomsLog.forEach(log => {
      log.symptoms.forEach(s => {
        freq[s] = (freq[s] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const symptom = SYMPTOMS.find(s => s.id === id);
        return { name: symptom?.label || id, count, emoji: symptom?.emoji || '' };
      });
  }, [symptomsLog]);

  // Remedies for current symptoms
  const currentRemedies = useMemo(() => {
    const allRemedies = {};
    if (currentPhase.remedies) {
      Object.entries(currentPhase.remedies).forEach(([symptom, remedies]) => {
        allRemedies[symptom] = remedies;
      });
    }
    return allRemedies;
  }, [currentPhase]);

  // Radar chart data
  const radarData = useMemo(() => {
    const categories = { physical: 0, emotional: 0, other: 0 };
    const counts = { physical: 0, emotional: 0, other: 0 };
    symptomsLog.slice(0, 10).forEach(log => {
      log.symptoms.forEach(s => {
        const symptom = SYMPTOMS.find(sym => sym.id === s);
        if (symptom) {
          categories[symptom.category] += (log.severity[s] || 1);
          counts[symptom.category]++;
        }
      });
    });
    return [
      { category: 'Physical', value: counts.physical > 0 ? categories.physical / counts.physical : 0, fullMark: 5 },
      { category: 'Emotional', value: counts.emotional > 0 ? categories.emotional / counts.emotional : 0, fullMark: 5 },
      { category: 'Other', value: counts.other > 0 ? categories.other / counts.other : 0, fullMark: 5 },
    ];
  }, [symptomsLog]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" />
            Symptom Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">Log symptoms & get AI-powered insights</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogger(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Log Symptoms
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 border border-pink-100/50">
        {[
          { id: 'log', label: 'Log', icon: Calendar },
          { id: 'insights', label: 'Insights', icon: TrendingUp },
          { id: 'remedies', label: 'Remedies', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-pink-600 shadow-md'
                : 'text-gray-500 hover:text-pink-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'log' && (
          <motion.div
            key="log"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {symptomsLog.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-gray-500">No symptoms logged yet. Tap "Log Symptoms" to start!</p>
              </div>
            ) : (
              symptomsLog.map((log, i) => (
                <motion.div
                  key={log.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-500">
                      {log.symptoms.length} symptoms
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.symptoms.map(s => {
                      const symptom = SYMPTOMS.find(sym => sym.id === s);
                      const severity = log.severity?.[s] || 1;
                      const sevInfo = severityLevels[severity - 1];
                      return symptom ? (
                        <span
                          key={s}
                          className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-medium"
                          style={{ 
                            backgroundColor: sevInfo.color + '30',
                            borderColor: sevInfo.color,
                            color: '#374151',
                          }}
                        >
                          {symptom.emoji} {symptom.label}
                          <span className="text-[10px] opacity-60">({sevInfo.label})</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Frequency Chart */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gray-800 mb-4">Most Common Symptoms</h3>
              {symptomFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={symptomFrequency.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #fce7f3', fontSize: '12px' }}
                      formatter={(value) => [`${value} times`, 'Frequency']}
                    />
                    <Bar dataKey="count" fill="#f9a8d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Log symptoms to see insights</p>
              )}
            </div>

            {/* Radar */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gray-800 mb-4">Symptom Categories</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#fce7f3" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar name="Avg Severity" dataKey="value" stroke="#ec4899" fill="#f9a8d4" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'remedies' && (
          <motion.div
            key="remedies"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" style={{ color: currentPhase.color }} />
                <h3 className="font-display font-semibold text-gray-800">
                  Remedies for {currentPhase.name} Phase
                </h3>
              </div>
              
              {Object.keys(currentRemedies).length > 0 ? (
                Object.entries(currentRemedies).map(([symptom, remedies]) => (
                  <div key={symptom} className="mb-5 last:mb-0">
                    <p className="text-sm font-semibold text-gray-700 capitalize mb-2">{symptom}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {remedies.map((remedy, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/50">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: currentPhase.color }} />
                          <p className="text-sm text-gray-600">{remedy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🌿</p>
                  <p className="text-gray-500 text-sm">
                    You're in the {currentPhase.name} phase — enjoy the energy! 
                    <br />No specific remedies needed during this phase.
                  </p>
                </div>
              )}
            </div>

            {/* General Wellness Tips */}
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-gray-800 mb-4">
                💡 General Wellness Tips
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { tip: 'Stay hydrated — aim for 8 glasses of water daily', emoji: '💧' },
                  { tip: 'Regular exercise helps regulate your cycle', emoji: '🏃‍♀️' },
                  { tip: 'Balanced nutrition supports hormonal health', emoji: '🥗' },
                  { tip: 'Quality sleep improves overall wellness', emoji: '😴' },
                  { tip: 'Stress management through mindfulness', emoji: '🧘‍♀️' },
                  { tip: 'Regular check-ups with your healthcare provider', emoji: '👩‍⚕️' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/40">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-sm text-gray-600">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Symptom Logger Modal */}
      {showLogger && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card-strong p-6 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-800">Log Symptoms</h3>
              <button onClick={() => setShowLogger(false)} className="p-2 rounded-xl hover:bg-pink-50">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>

            <p className="text-sm font-medium text-gray-600 mb-3">Select symptoms:</p>
            
            {['physical', 'emotional', 'other'].map(category => (
              <div key={category} className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.filter(s => s.category === category).map(symptom => (
                    <motion.button
                      key={symptom.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 text-gray-500 hover:border-pink-200'
                      }`}
                    >
                      {symptom.emoji} {symptom.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            {/* Severity selectors */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">Severity:</p>
                {selectedSymptoms.map(id => {
                  const symptom = SYMPTOMS.find(s => s.id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-700 min-w-[100px]">{symptom?.emoji} {symptom?.label}</span>
                      <div className="flex gap-1">
                        {severityLevels.map(level => (
                          <button
                            key={level.value}
                            onClick={() => setSeverities(prev => ({ ...prev, [id]: level.value }))}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              (severities[id] || 2) === level.value
                                ? 'ring-2 ring-offset-1 scale-110'
                                : 'opacity-50 hover:opacity-80'
                            }`}
                            style={{
                              backgroundColor: level.color,
                              ringColor: level.color,
                            }}
                          >
                            {level.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={selectedSymptoms.length === 0}
              className={`w-full btn-primary flex items-center justify-center gap-2 ${
                selectedSymptoms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Check className="w-4 h-4" />
              Save ({selectedSymptoms.length} symptoms)
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
