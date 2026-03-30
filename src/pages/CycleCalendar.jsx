import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { generateCalendarDays, PHASES, calculateCurrentPhase, predictNextPeriod, formatDate } from '../utils/cycleUtils';
import { ChevronLeft, ChevronRight, Calendar, Plus, X, Check } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const phaseColors = {
  MENSTRUATION: { bg: '#fecdd3', text: '#be123c', ring: '#f43f5e' },
  FOLLICULAR: { bg: '#bbf7d0', text: '#166534', ring: '#22c55e' },
  OVULATION: { bg: '#fde68a', text: '#92400e', ring: '#f59e0b' },
  LUTEAL: { bg: '#ddd6fe', text: '#5b21b6', ring: '#8b5cf6' },
};

export default function CycleCalendar() {
  const { user, cycleHistory, logCycle } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const days = generateCalendarDays(currentYear, currentMonth, user?.lastPeriodStart, user?.cycleLength);
  const today = new Date();
  const nextPeriod = predictNextPeriod(user?.lastPeriodStart, user?.cycleLength);
  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleLogCycle = () => {
    if (newStart && newEnd) {
      logCycle(newStart, newEnd);
      setShowModal(false);
      setNewStart('');
      setNewEnd('');
    }
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

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
            <Calendar className="w-6 h-6 text-pink-500" />
            Cycle Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and predict your cycle phases</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Log Period
        </motion.button>
      </div>

      {/* Prediction Strip */}
      {nextPeriod && (
        <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <span className="text-lg">🔮</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Next Period Prediction</p>
              <p className="text-xs text-gray-500">Based on your {user?.cycleLength || 28}-day cycle</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm border border-rose-100">
              {formatDate(nextPeriod)}
            </span>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="glass-card-strong p-6 rounded-3xl">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-pink-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-display font-semibold text-gray-800">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-pink-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const colors = day.phase ? phaseColors[day.phase] : null;
            const todayMatch = isToday(day.date);
            
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.15 }}
                className={`calendar-day relative ${!day.isCurrentMonth ? 'opacity-30' : ''}`}
                style={{
                  backgroundColor: colors ? colors.bg + '80' : 'transparent',
                }}
              >
                {todayMatch && (
                  <div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: colors?.ring || '#f472b6' }}
                  />
                )}
                <span
                  className={`text-sm ${todayMatch ? 'font-bold' : 'font-medium'}`}
                  style={{ color: colors ? colors.text : '#6b7280' }}
                >
                  {day.date.getDate()}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
          {Object.entries(PHASES).map(([key, phase]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phaseColors[key].ring }}
              />
              <span className="text-xs text-gray-500">{phase.emoji} {phase.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cycle History */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">Cycle History</h3>
        <div className="space-y-3">
          {cycleHistory.slice(0, 6).map((cycle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-sm">
                  🩸
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                  </p>
                  <p className="text-xs text-gray-400">Cycle length: {cycle.length} days</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-500 font-medium">
                {cycle.length}d
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Log Period Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card-strong p-6 rounded-3xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-gray-800">Log Period</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-pink-50">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="input-field"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogCycle}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Period
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
