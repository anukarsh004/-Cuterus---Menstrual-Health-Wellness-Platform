import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MythsAndFacts from '../components/MythsAndFacts';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { calculateCurrentPhase, predictNextPeriod, getDaysUntilNextPeriod, PHASES, SYMPTOMS } from '../utils/cycleUtils';
import {
  Droplets, Zap, Sun, Moon, Calendar, Activity,
  TrendingUp, Clock, Heart, Sparkles, ArrowRight,
  ChevronRight, Flower2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

const phaseIcons = { MENSTRUATION: Droplets, FOLLICULAR: Zap, OVULATION: Sun, LUTEAL: Moon };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function DashboardHome() {
  const { user, symptomsLog, cycleHistory } = useApp();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const basePhaseKey = phaseInfo?.phase || 'FOLLICULAR';
  const [hoveredPhaseKey, setHoveredPhaseKey] = useState(null);
  
  const currentPhase = hoveredPhaseKey ? PHASES[hoveredPhaseKey] : (PHASES[basePhaseKey] || PHASES.FOLLICULAR);
  const PhaseIcon = phaseIcons[hoveredPhaseKey || basePhaseKey];
  const daysUntil = getDaysUntilNextPeriod(user?.lastPeriodStart, user?.cycleLength);
  const nextPeriod = predictNextPeriod(user?.lastPeriodStart, user?.cycleLength);

  const cycleLength = user?.cycleLength || 28;
  const interactiveCycleData = [
    { key: 'MENSTRUATION', name: 'Menstruation', value: 5, color: PHASES.MENSTRUATION.color },
    { key: 'FOLLICULAR', name: 'Follicular', value: Math.max(1, cycleLength/2 - 5), color: PHASES.FOLLICULAR.color },
    { key: 'OVULATION', name: 'Ovulation', value: 3, color: PHASES.OVULATION.color },
    { key: 'LUTEAL', name: 'Luteal', value: Math.max(1, cycleLength/2 - 3), color: PHASES.LUTEAL.color }
  ];

  // Last 7 days symptoms
  const recentSymptoms = symptomsLog.slice(0, 5);
  
  // Symptom trend data
  const symptomTrendData = symptomsLog.slice(0, 7).reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: log.symptoms.length,
    severity: Object.values(log.severity).reduce((a, b) => a + b, 0) / Object.values(log.severity).length,
  }));

  const allPhases = [
    { key: 'MENSTRUATION', ...PHASES.MENSTRUATION },
    { key: 'FOLLICULAR', ...PHASES.FOLLICULAR },
    { key: 'OVULATION', ...PHASES.OVULATION },
    { key: 'LUTEAL', ...PHASES.LUTEAL },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-800">
            Welcome back, <span style={{ color: currentPhase.color }}>{user?.name?.split(' ')[0] || 'there'}</span> 💐
          </h1>
          <p className="text-gray-500 mt-1">
            {currentPhase.mood} • Day {phaseInfo?.totalDay || 1} of your cycle
          </p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/dashboard/chat')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium cursor-pointer shadow-lg shadow-pink-200/40 hover:shadow-xl transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Talk to Utaura
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </motion.div>

      {/* Interactive Phase Hero Card */}
      <motion.div 
        variants={item}
        className="relative overflow-hidden rounded-3xl flex flex-col lg:flex-row shadow-xl transition-all duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${currentPhase.gradientFrom}, ${currentPhase.gradientTo}40)`,
          border: `1px solid ${currentPhase.secondaryColor}`,
        }}
      >
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredPhaseKey || basePhaseKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row md:items-center gap-6"
            >
              <div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors duration-500"
                style={{ backgroundColor: currentPhase.secondaryColor }}
              >
                <PhaseIcon className="w-10 h-10 mb-1" style={{ color: currentPhase.color }} />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-bold mb-1 tracking-wider uppercase transition-colors duration-500" style={{ color: currentPhase.color }}>
                  {hoveredPhaseKey ? 'INTERACTIVE VIEW' : `DAY ${phaseInfo?.day || 1}`}
                </p>
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-2">
                  {currentPhase.emoji} {currentPhase.name} Phase
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed max-w-lg font-medium bg-white/40 p-3 rounded-xl border border-white/50 backdrop-blur-sm">
                  {currentPhase.tips[0]}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {!hoveredPhaseKey && (
            <div className="mt-6 inline-flex flex-col items-center gap-1 bg-white/70 backdrop-blur-md rounded-2xl p-4 w-max border border-white/60 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Next Period In</p>
              <p className="text-3xl font-black" style={{ color: currentPhase.color }}>{daysUntil || '--'}</p>
              <p className="text-xs text-gray-500 font-medium">days</p>
            </div>
          )}
        </div>

        {/* Interactive Ring Section */}
        <div className="lg:w-1/3 bg-white/30 backdrop-blur-sm p-6 flex flex-col items-center justify-center border-l border-white/40">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Interactive Cycle</p>
           <div className="h-[220px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={interactiveCycleData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                   onMouseEnter={(_, index) => setHoveredPhaseKey(interactiveCycleData[index].key)}
                   onMouseLeave={() => setHoveredPhaseKey(null)}
                   stroke="none"
                 >
                   {interactiveCycleData.map((entry, index) => (
                     <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease', transformOrigin: 'center', transform: hoveredPhaseKey === entry.key ? 'scale(1.05)' : 'scale(1)' }} 
                     />
                   ))}
                 </Pie>
                 <Tooltip content={() => null} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl">{currentPhase.emoji}</span>
                <span className="text-[10px] font-bold mt-1 text-gray-600 tracking-wider">
                  {hoveredPhaseKey ? currentPhase.name : 'YOUR CYCLE'}
                </span>
             </div>
           </div>
           <p className="text-[10px] text-gray-400 text-center mt-2 max-w-[200px]">Hover over the ring segments to explore each phase.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Cycle Day', 
            value: phaseInfo?.totalDay || '--',
            sub: `of ${user?.cycleLength || 28} days`,
            icon: Calendar, 
            color: currentPhase.color,
            bg: currentPhase.bgColor,
          },
          {
            label: 'Avg Cycle',
            value: `${user?.cycleLength || 28}d`,
            sub: 'regular',
            icon: TrendingUp,
            color: '#22c55e',
            bg: '#f0fdf4',
          },
          {
            label: 'Symptoms Today',
            value: recentSymptoms[0]?.symptoms?.length || 0,
            sub: 'logged',
            icon: Activity,
            color: '#f59e0b',
            bg: '#fffbeb',
          },
          {
            label: 'Cycles Tracked',
            value: cycleHistory.length,
            sub: 'total',
            icon: Heart,
            color: '#ec4899',
            bg: '#fdf2f8',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Phase Tips */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flower2 className="w-5 h-5" style={{ color: currentPhase.color }} />
            <h3 className="font-display font-semibold text-gray-800">Phase Tips</h3>
          </div>
          <div className="space-y-3">
            {currentPhase.tips.slice(0, 4).map((tip, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5"
                  style={{ backgroundColor: currentPhase.secondaryColor, color: currentPhase.color }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
              </motion.div>
            ))}
          </div>
          
          {user?.role === 'employee' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-purple-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Work Suggestions
              </p>
              {currentPhase.workTips?.slice(0, 2).map((tip, i) => (
                <p key={i} className="text-sm text-gray-600 mb-1.5 flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </p>
              ))}
            </div>
          )}
        </motion.div>

        {/* Symptom Trend Chart */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-semibold text-gray-800">Symptom Trend</h3>
            </div>
            <button 
              onClick={() => navigate('/dashboard/symptoms')}
              className="text-xs text-pink-500 font-medium hover:text-pink-600 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {symptomTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={symptomTrendData}>
                <defs>
                  <linearGradient id="symptomGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentPhase.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={currentPhase.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', border: '1px solid #fce7f3', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }} 
                />
                <Area 
                  type="monotone" dataKey="count" name="Symptoms"
                  stroke={currentPhase.color} fill="url(#symptomGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              No symptom data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* 4-Phase Overview Strip */}
      <motion.div variants={item}>
        <h3 className="font-display font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Your Cycle Phases
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {allPhases.map((phase) => {
            const isActive = phase.key === (hoveredPhaseKey || basePhaseKey);
            const Icon = phaseIcons[phase.key];
            return (
              <motion.div
                key={phase.key}
                whileHover={{ scale: 1.03 }}
                className={`relative rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'shadow-lg' 
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? phase.bgColor : '#fafafa',
                  borderColor: isActive ? phase.color : '#e5e7eb',
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: phase.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <Icon className="w-6 h-6 mb-2" style={{ color: phase.color }} />
                <p className="text-sm font-semibold text-gray-800">{phase.emoji} {phase.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{phase.mood}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Symptoms */}
      {recentSymptoms.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Symptoms
            </h3>
          </div>
          <div className="space-y-3">
            {recentSymptoms.slice(0, 3).map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/40">
                <p className="text-xs text-gray-400 min-w-[70px]">
                  {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {log.symptoms.map(s => {
                    const symptom = SYMPTOMS.find(sym => sym.id === s);
                    return symptom ? (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
                        {symptom.emoji} {symptom.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Myths & Facts Section */}
      <motion.div variants={item}>
        <MythsAndFacts variant={user?.role === 'employee' ? 'employee' : 'personal'} />
      </motion.div>
    </motion.div>
  );
}
