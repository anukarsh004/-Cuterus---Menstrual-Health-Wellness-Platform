import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES, getDaysUntilNextPeriod } from '../utils/cycleUtils';
import {
  Sparkles, Briefcase, Coffee, Brain, Target,
  Clock, Droplets, Zap, Sun, Moon, ChevronRight,
  CalendarCheck, Bell, Heart
} from 'lucide-react';

const phaseIcons = { MENSTRUATION: Droplets, FOLLICULAR: Zap, OVULATION: Sun, LUTEAL: Moon };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function WorkWellness() {
  const { user } = useApp();
  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;
  const phaseKey = phaseInfo?.phase || 'FOLLICULAR';
  const PhaseIcon = phaseIcons[phaseKey];
  const daysUntil = getDaysUntilNextPeriod(user?.lastPeriodStart, user?.cycleLength);

  const scheduleRecommendations = {
    MENSTRUATION: [
      { time: '9:00 AM', task: 'Light admin & email catch-up', type: 'Low', icon: Coffee },
      { time: '10:30 AM', task: 'Brief team check-in', type: 'Low', icon: Brain },
      { time: '12:00 PM', task: 'Lunch break + short walk', type: 'Break', icon: Heart },
      { time: '1:30 PM', task: 'Planning & organizing tasks', type: 'Medium', icon: Target },
      { time: '3:00 PM', task: 'Stretch break + warm drink', type: 'Break', icon: Coffee },
      { time: '3:30 PM', task: 'Documentation & routine work', type: 'Low', icon: Brain },
    ],
    FOLLICULAR: [
      { time: '9:00 AM', task: 'Creative brainstorming session', type: 'High', icon: Sparkles },
      { time: '10:30 AM', task: 'Start new project initiatives', type: 'High', icon: Target },
      { time: '12:00 PM', task: 'Networking lunch', type: 'Medium', icon: Heart },
      { time: '1:30 PM', task: 'Deep focus work — coding/writing', type: 'High', icon: Brain },
      { time: '3:00 PM', task: 'Cross-team collaboration', type: 'High', icon: Briefcase },
      { time: '4:30 PM', task: 'Learning & skill development', type: 'Medium', icon: Zap },
    ],
    OVULATION: [
      { time: '9:00 AM', task: 'Important presentation prep', type: 'Peak', icon: Target },
      { time: '10:30 AM', task: 'Client meeting / pitch', type: 'Peak', icon: Briefcase },
      { time: '12:00 PM', task: 'Social lunch — team building', type: 'High', icon: Heart },
      { time: '1:30 PM', task: 'Strategic planning session', type: 'Peak', icon: Brain },
      { time: '3:00 PM', task: 'Lead team standup', type: 'High', icon: Sparkles },
      { time: '4:30 PM', task: 'Mentoring / teaching', type: 'High', icon: Zap },
    ],
    LUTEAL: [
      { time: '9:00 AM', task: 'Detail-oriented review work', type: 'Medium', icon: Brain },
      { time: '10:30 AM', task: 'Project wrap-up tasks', type: 'Medium', icon: Target },
      { time: '12:00 PM', task: 'Quiet lunch + mindfulness', type: 'Break', icon: Heart },
      { time: '1:30 PM', task: 'Editing & proofreading', type: 'Medium', icon: Coffee },
      { time: '3:00 PM', task: 'Organize files & spaces', type: 'Low', icon: Briefcase },
      { time: '4:00 PM', task: 'Plan next week priorities', type: 'Medium', icon: CalendarCheck },
    ],
  };

  const typeColors = {
    Peak: { bg: '#fde68a', text: '#92400e', border: '#f59e0b' },
    High: { bg: '#bbf7d0', text: '#166534', border: '#22c55e' },
    Medium: { bg: '#ddd6fe', text: '#5b21b6', border: '#8b5cf6' },
    Low: { bg: '#fecdd3', text: '#be123c', border: '#f43f5e' },
    Break: { bg: '#e0f2fe', text: '#075985', border: '#38bdf8' },
  };

  const reminders = [
    { icon: '💧', text: 'Drink water — aim for 8 glasses today', time: 'Every 2 hours' },
    { icon: '🧘', text: 'Take a 5-min stretch break', time: 'Every 90 minutes' },
    { icon: '🌬️', text: 'Deep breathing exercise', time: 'Before meetings' },
    { icon: '🍎', text: 'Healthy snack reminder', time: '3:00 PM' },
    { icon: '🚶', text: 'Short walk around the office', time: 'After lunch' },
  ];

  const schedule = scheduleRecommendations[phaseKey] || scheduleRecommendations.FOLLICULAR;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Work Wellness
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cycle-aware productivity recommendations for {user?.orgName || 'your workplace'}
          </p>
        </div>
      </motion.div>

      {/* Phase Work Banner */}
      <motion.div
        variants={item}
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentPhase.gradientFrom}, ${currentPhase.gradientTo}40)`,
          border: `1px solid ${currentPhase.secondaryColor}`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: currentPhase.secondaryColor }}
            >
              <PhaseIcon className="w-7 h-7" style={{ color: currentPhase.color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: currentPhase.color }}>
                {currentPhase.emoji} {currentPhase.name} Phase — Work Mode
              </p>
              <h2 className="text-lg font-display font-bold text-gray-800">
                {phaseKey === 'MENSTRUATION' ? 'Gentle Productivity Day' :
                 phaseKey === 'FOLLICULAR' ? 'Creative Powerhouse Day' :
                 phaseKey === 'OVULATION' ? 'Peak Performance Day' :
                 'Focused Detail Day'}
              </h2>
            </div>
          </div>
          <div className="md:ml-auto flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm text-center">
              <p className="text-xs text-gray-500">Energy Level</p>
              <p className="text-lg font-bold" style={{ color: currentPhase.color }}>
                {phaseKey === 'OVULATION' ? '🔥 High' : phaseKey === 'FOLLICULAR' ? '⚡ Rising' : phaseKey === 'LUTEAL' ? '🌙 Moderate' : '💤 Low'}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm text-center">
              <p className="text-xs text-gray-500">Next Period</p>
              <p className="text-lg font-bold" style={{ color: currentPhase.color }}>
                {daysUntil || '--'} days
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Schedule Recommendations */}
        <motion.div variants={item} className="lg:col-span-3 glass-card p-6">
          <h3 className="font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" style={{ color: currentPhase.color }} />
            Today's Optimized Schedule
          </h3>
          <div className="space-y-3">
            {schedule.map((slot, i) => {
              const colors = typeColors[slot.type];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors"
                >
                  <div className="text-xs font-mono text-gray-400 min-w-[60px]">{slot.time}</div>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <slot.icon className="w-4 h-4" style={{ color: colors.border }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{slot.task}</p>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}40` }}
                  >
                    {slot.type}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Smart Reminders */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
          <h3 className="font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Smart Health Reminders
          </h3>
          <div className="space-y-3">
            {reminders.map((reminder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/40"
              >
                <span className="text-xl">{reminder.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{reminder.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {reminder.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Work Tips */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">
          💼 Phase-Specific Work Tips
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {currentPhase.workTips?.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/40">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: currentPhase.color }} />
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
