import { useState } from 'react';
import MythsAndFacts from '../components/MythsAndFacts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Shield,
  Building2, Calendar, ArrowUpRight, ArrowDownRight,
  Heart, LogOut, PieChart, Layers, DollarSign, Target,
  Activity, Clock, ChevronRight, Sparkles, User
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function HRDashboard() {
  const { user, hrData, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMetric, setActiveMetric] = useState('all');

  const handleLogout = () => { logout(); navigate('/'); };

  const metrics = [
    {
      id: 'wellness',
      label: 'Wellness Score',
      value: hrData.wellnessMetrics.avgWellnessScore,
      suffix: '/100',
      trend: hrData.wellnessMetrics.wellnessScoreTrend,
      icon: Heart,
      color: '#ec4899',
      bg: '#fdf2f8',
    },
    {
      id: 'absenteeism',
      label: 'Absenteeism Rate',
      value: hrData.wellnessMetrics.absenteeismRate,
      suffix: '%',
      trend: hrData.wellnessMetrics.absenteeismTrend,
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
      invertTrend: true,
    },
    {
      id: 'productivity',
      label: 'Productivity Index',
      value: hrData.wellnessMetrics.productivityIndex,
      suffix: '%',
      trend: hrData.wellnessMetrics.productivityTrend,
      icon: TrendingUp,
      color: '#22c55e',
      bg: '#f0fdf4',
    },
    {
      id: 'engagement',
      label: 'Engagement Rate',
      value: hrData.wellnessMetrics.engagementRate,
      suffix: '%',
      trend: hrData.wellnessMetrics.engagementTrend,
      icon: Users,
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
  ];

  // Heatmap color helper
  const getHeatmapColor = (value) => {
    if (value >= 90) return '#22c55e';
    if (value >= 80) return '#86efac';
    if (value >= 70) return '#fde68a';
    if (value >= 60) return '#fdba74';
    return '#fca5a5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-purple-100/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                Cuterus HR
              </h1>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase">{hrData.orgName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-semibold text-green-600">ANONYMIZED DATA ONLY</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Header */}
          <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-800">
                Workforce Wellness Dashboard 📊
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Aggregated & anonymized insights across {hrData.totalEmployees} employees
              </p>
            </div>
          </motion.div>

          {/* Privacy Banner */}
          <motion.div variants={item} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">Privacy-First Analytics</p>
              <p className="text-xs text-green-600 mt-0.5">
                All data is anonymized and aggregated. Individual employee health data is never visible. 
                Employees control what data is shared. GDPR & HIPAA compliant.
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={item} className="flex gap-2 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 border border-purple-100/50">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'departments', label: 'Departments', icon: Building2 },
              { id: 'heatmap', label: 'Heatmap', icon: Layers },
              { id: 'roi', label: 'ROI Metrics', icon: DollarSign },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-500 hover:text-purple-400'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Metric Cards */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const isPositive = metric.invertTrend ? metric.trend < 0 : metric.trend > 0;
              const isActive = activeMetric === metric.id;
              const isFaded = activeMetric !== 'all' && !isActive;

              return (
                <motion.div
                  key={metric.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => setActiveMetric(isActive ? 'all' : metric.id)}
                  className={`glass-card-strong p-5 cursor-pointer transition-all duration-300 ${
                    isActive ? 'ring-2 shadow-lg scale-105 z-10' : ''
                  } ${isFaded ? 'opacity-50 grayscale-[50%]' : ''}`}
                  style={{ ringColor: metric.color }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: metric.bg }}>
                      <metric.icon className="w-5 h-5 transition-colors" style={{ color: metric.color }} />
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(metric.trend)}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}<span className="text-sm text-gray-400 font-normal">{metric.suffix}</span></p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{metric.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Trend Chart */}
                <div className="glass-card-strong p-6">
                  <h3 className="font-display font-semibold text-gray-800 mb-4">6-Month Trends</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={hrData.monthlyTrends}>
                      <defs>
                        <linearGradient id="wellnessG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="prodG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="engG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3e8ff', fontSize: '12px' }} />
                      <Legend />
                      <Area 
                        type="monotone" dataKey="wellness" name="Wellness" 
                        stroke="#ec4899" fill="url(#wellnessG)" 
                        strokeWidth={activeMetric === 'wellness' || activeMetric === 'all' ? 3 : 1} 
                        opacity={activeMetric === 'wellness' || activeMetric === 'all' ? 1 : 0.1}
                        activeDot={activeMetric === 'wellness' || activeMetric === 'all' ? { r: 6 } : false}
                      />
                      <Area 
                        type="monotone" dataKey="productivity" name="Productivity" 
                        stroke="#22c55e" fill="url(#prodG)" 
                        strokeWidth={activeMetric === 'productivity' || activeMetric === 'all' ? 3 : 1}
                        opacity={activeMetric === 'productivity' || activeMetric === 'all' ? 1 : 0.1}
                        activeDot={activeMetric === 'productivity' || activeMetric === 'all' ? { r: 6 } : false}
                      />
                      <Area 
                        type="monotone" dataKey="engagement" name="Engagement" 
                        stroke="#8b5cf6" fill="url(#engG)" 
                        strokeWidth={activeMetric === 'engagement' || activeMetric === 'all' ? 3 : 1}
                        opacity={activeMetric === 'engagement' || activeMetric === 'all' ? 1 : 0.1}
                        activeDot={activeMetric === 'engagement' || activeMetric === 'all' ? { r: 6 } : false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick Insights */}
                <div className="glass-card-strong p-6">
                  <h3 className="font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Key Insights
                  </h3>
                  <div className="space-y-4">
                    {[
                      { text: 'Wellness scores have improved by 8% since implementing the program', icon: '📈', type: 'success' },
                      { text: 'Absenteeism reduced by 1.8% compared to last quarter', icon: '✅', type: 'success' },
                      { text: 'Engineering team shows highest productivity at 94%', icon: '💻', type: 'info' },
                      { text: 'Design team reports highest wellness score at 85/100', icon: '🎨', type: 'info' },
                      { text: 'Consider additional wellness resources for Sales team', icon: '💡', type: 'warning' },
                      { text: 'Overall engagement trending upward for 4 consecutive months', icon: '🔥', type: 'success' },
                    ].map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-start gap-3 p-3 rounded-xl ${
                          insight.type === 'success' ? 'bg-green-50/80' :
                          insight.type === 'warning' ? 'bg-amber-50/80' : 'bg-purple-50/80'
                        }`}
                      >
                        <span className="text-lg">{insight.icon}</span>
                        <p className="text-sm text-gray-700">{insight.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'departments' && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                {/* Department Comparison Bar Chart */}
                <div className="glass-card-strong p-6">
                  <h3 className="font-display font-semibold text-gray-800 mb-4">Department Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hrData.departmentComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3e8ff', fontSize: '12px' }} />
                      <Legend />
                      <Bar dataKey="wellness" name="Wellness" fill="#f9a8d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="productivity" name="Productivity" fill="#86efac" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Department Cards */}
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-gray-800">Department Details</h3>
                  {hrData.departmentComparison.map((dept, i) => (
                    <motion.div
                      key={dept.dept}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">{dept.dept}</p>
                        <p className="text-xs text-gray-400">{dept.team} team members</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Wellness</p>
                          <p className="text-sm font-bold text-pink-500">{dept.wellness}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Productivity</p>
                          <p className="text-sm font-bold text-green-500">{dept.productivity}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'heatmap' && (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card-strong p-6"
              >
                <h3 className="font-display font-semibold text-gray-800 mb-2">Team Productivity Heatmap</h3>
                <p className="text-sm text-gray-500 mb-6">Aggregated team productivity scores across the month</p>
                
                <div className="overflow-x-auto">
                  <div className="min-w-[400px]">
                    {/* Header */}
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      <div></div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-400">{day}</div>
                      ))}
                    </div>
                    {/* Rows */}
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                      <div key={week} className="grid grid-cols-6 gap-2 mb-2">
                        <div className="text-xs font-medium text-gray-400 flex items-center">{week}</div>
                        {hrData.weeklyHeatmap
                          .filter(d => d.week === week)
                          .map((cell, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.1 }}
                              className="h-14 rounded-xl flex items-center justify-center text-sm font-bold text-white cursor-pointer transition-all"
                              style={{ backgroundColor: getHeatmapColor(cell.value) }}
                              title={`${cell.day}, ${cell.week}: ${cell.value}%`}
                            >
                              {cell.value}
                            </motion.div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Low</span>
                  {['#fca5a5', '#fdba74', '#fde68a', '#86efac', '#22c55e'].map(color => (
                    <div key={color} className="w-6 h-4 rounded" style={{ backgroundColor: color }} />
                  ))}
                  <span className="text-xs text-gray-400">High</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'roi' && (
              <motion.div
                key="roi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Absenteeism Reduction', value: `${hrData.roi.absenteeismReduction}%`, icon: '📉', color: '#22c55e', desc: 'Since program launch' },
                    { label: 'Productivity Gain', value: `${hrData.roi.productivityGain}%`, icon: '📈', color: '#8b5cf6', desc: 'Year over year' },
                    { label: 'Retention Improvement', value: `${hrData.roi.retentionImprovement}%`, icon: '🤝', color: '#ec4899', desc: 'Employee retention rate' },
                    { label: 'Est. Annual Savings', value: hrData.roi.estimatedSavings, icon: '💰', color: '#f59e0b', desc: 'Based on reduced absenteeism' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ y: -4 }}
                      className="glass-card-strong p-5"
                    >
                      <span className="text-2xl">{stat.icon}</span>
                      <p className="text-2xl font-bold mt-3" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-card-strong p-6">
                  <h3 className="font-display font-semibold text-gray-800 mb-2">Return on Investment Summary</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    The Cuterus wellness program has generated significant measurable improvements across all key metrics.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Reduced sick days by 32% across all departments',
                      'Increased average productivity scores by 18 percentage points',
                      'Employee satisfaction surveys show 85% positive feedback',
                      'Estimated $42,500 annual savings from reduced absenteeism',
                      'Zero privacy incidents — all data remains anonymized',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Myths & Facts Section */}
          <motion.div variants={item}>
            <MythsAndFacts variant="hr" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
