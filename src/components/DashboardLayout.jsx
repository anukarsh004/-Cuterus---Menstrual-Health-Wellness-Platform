import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateCurrentPhase, PHASES } from '../utils/cycleUtils';
import {
  LayoutDashboard, Calendar, Activity, MessageCircle,
  FileText, Settings, LogOut, Heart, Menu, X,
  Sparkles, Moon, Sun, Zap, Droplets, User, ChevronRight, Lightbulb
} from 'lucide-react';
import SharedMessageBox from './SharedMessageBox';

const phaseIcons = {
  MENSTRUATION: Droplets,
  FOLLICULAR: Zap,
  OVULATION: Sun,
  LUTEAL: Moon,
};

export default function DashboardLayout() {
  const { user, logout } = useApp();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;
  const PhaseIcon = phaseInfo ? phaseIcons[phaseInfo.phase] : Sparkles;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), end: true },
    { to: '/dashboard/cycle', icon: Calendar, label: t('cycle') },
    { to: '/dashboard/symptoms', icon: Activity, label: t('symptoms') },
    { to: '/dashboard/chat', icon: MessageCircle, label: t('chat') },
    { to: '/dashboard/sleep', icon: Moon, label: t('sleep') },
    { to: '/dashboard/stress', icon: Heart, label: t('stress') },
    { to: '/dashboard/workouts', icon: Zap, label: t('workouts') },
    { to: '/dashboard/report', icon: FileText, label: t('report') },
    { to: '/dashboard/myths', icon: Lightbulb, label: 'Myths & Facts' },
    { to: '/dashboard/settings', icon: Settings, label: t('settings') },
  ];

  if (user?.role === 'employee') {
    navItems.splice(5, 0, {
      to: '/dashboard/work-wellness',
      icon: Sparkles,
      label: t('workWellness'),
    });
  }

  return (
    <div className={`min-h-screen flex ${currentPhase.cssClass} ${isDarkMode ? 'dark' : ''}`} style={{ backgroundColor: isDarkMode ? '#1a1a2e' : currentPhase.bgColor + '40' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md border border-pink-100 dark:border-gray-700"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-40 flex flex-col
          bg-white/70 dark:bg-gray-900/90 backdrop-blur-xl border-r border-pink-100/60 dark:border-gray-700 shadow-xl lg:shadow-none
          transform lg:transform-none transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md shadow-pink-200/50">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                Cuterus
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                {user?.role === 'employee' ? 'Employee Wellness' : 'Personal Wellness'}
              </p>
            </div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="mx-4 mb-4">
          <motion.div
            animate={{ boxShadow: `0 0 20px ${currentPhase.glowColor}` }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="rounded-2xl p-4 border"
            style={{ 
              backgroundColor: currentPhase.bgColor,
              borderColor: currentPhase.secondaryColor,
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: currentPhase.secondaryColor }}
              >
                <PhaseIcon className="w-5 h-5" style={{ color: currentPhase.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Current Phase</p>
                <p className="text-sm font-semibold" style={{ color: currentPhase.color }}>
                  {currentPhase.emoji} {currentPhase.name}
                </p>
                {phaseInfo && (
                  <p className="text-[10px] text-gray-400">Day {phaseInfo.totalDay} of cycle</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-pink-100/60 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Direct Comm Link - Only for employees */}
      {user?.role === 'employee' && (
        <SharedMessageBox roleTitle="Employee" />
      )}
    </div>
  );
}
