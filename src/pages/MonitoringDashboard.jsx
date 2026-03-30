import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Info, X, ShieldAlert, Calendar, Search, Filter, Activity, LogOut, HeartPulse, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';
import SharedMessageBox from '../components/SharedMessageBox';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const BASE_MOCK_DATA = [
  {
    id: 'EMP-1042', name: 'Eleanor Shellstrop', department: 'Sales',
    cycleType: 'Regular (28 Days)', lastLog: '2 hours ago',
    weekData: [null, 1, 2, 3, 4, 5, null], periodDates: [9, 10, 11, 12, 13],
  },
  {
    id: 'EMP-2091', name: 'Tahani Al-Jamil', department: 'Marketing',
    cycleType: 'Regular (30 Days)', lastLog: 'Yesterday',
    weekData: [null, null, null, null, 1, 2, 3], periodDates: [13, 14, 15, 16],
  },
  {
    id: 'EMP-3015', name: 'Chidi Anagonye', department: 'Engineering',
    cycleType: 'Irregular', lastLog: '3 days ago',
    weekData: [4, 5, null, null, null, null, null], periodDates: [5, 6, 7, 8, 9],
  },
  {
    id: 'EMP-4402', name: 'Janet Della-Denunzio', department: 'Operations',
    cycleType: 'Regular (29 Days)', lastLog: 'Today',
    weekData: [null, null, null, null, null, null, null], periodDates: [22, 23, 24, 25, 26],
  },
  {
    id: 'EMP-5199', name: 'Mindy St. Claire', department: 'Legal',
    cycleType: 'Regular (26 Days)', lastLog: '4 days ago',
    weekData: [2, 3, 4, null, null, null, null], periodDates: [8, 9, 10, 11],
  },
  {
    id: 'EMP-6021', name: 'Sophia Martinez', department: 'Design',
    cycleType: 'Regular (27 Days)', lastLog: '5 hours ago',
    weekData: [null, null, 1, 2, 3, 4, 5], periodDates: [11, 12, 13, 14, 15],
  },
  {
    id: 'EMP-6134', name: 'Olivia Chen', department: 'Engineering',
    cycleType: 'Irregular (PCOS)', lastLog: '1 week ago',
    weekData: [null, null, null, null, null, null, null], periodDates: [28, 29, 30, 31, 1],
  },
  {
    id: 'EMP-7092', name: 'Emma Wilson', department: 'Marketing',
    cycleType: 'Regular (28 Days)', lastLog: 'Just now',
    weekData: [1, 2, 3, 4, 5, null, null], periodDates: [8, 9, 10, 11, 12],
  },
  {
    id: 'EMP-7441', name: 'Isabella Rossi', department: 'Sales',
    cycleType: 'Irregular', lastLog: '2 days ago',
    weekData: [null, null, null, null, null, 1, 2], periodDates: [14, 15, 16, 17, 18],
  },
  {
    id: 'EMP-8022', name: 'Ava Thompson', department: 'Operations',
    cycleType: 'Regular (31 Days)', lastLog: 'Yesterday',
    weekData: [null, null, null, null, null, null, null], periodDates: [25, 26, 27, 28, 29],
  },
  {
    id: 'EMP-8593', name: 'Mia Okafor', department: 'Support',
    cycleType: 'Regular (29 Days)', lastLog: '1 hour ago',
    weekData: [5, 6, null, null, null, null, null], periodDates: [4, 5, 6, 7, 8, 9],
  },
  {
    id: 'EMP-9010', name: 'Amelia Taylor', department: 'Legal',
    cycleType: 'Regular (28 Days)', lastLog: 'Today',
    weekData: [null, null, null, null, null, null, null], periodDates: [18, 19, 20, 21, 22],
  },
  {
    id: 'EMP-9224', name: 'Harper Singh', department: 'Engineering',
    cycleType: 'Irregular (Endometriosis)', lastLog: '3 hours ago',
    weekData: [3, 4, 5, 6, 7, null, null], periodDates: [6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'EMP-9501', name: 'Evelyn Kim', department: 'Design',
    cycleType: 'Regular (30 Days)', lastLog: '2 days ago',
    weekData: [null, null, null, 1, 2, 3, 4], periodDates: [12, 13, 14, 15, 16],
  },
  {
    id: 'EMP-9932', name: 'Abigail Davies', department: 'Marketing',
    cycleType: 'Regular (28 Days)', lastLog: 'Today',
    weekData: [null, null, null, null, null, null, null], periodDates: [21, 22, 23, 24, 25],
  }
];

const MOCK_DATA = BASE_MOCK_DATA.map(emp => {
  const seed = parseInt(emp.id.replace('EMP-', ''), 10);
  return {
    ...emp,
    basicInfo: {
      designation: ['Senior Analyst', 'Manager', 'Specialist', 'Coordinator', 'Director'][seed % 5],
      doj: `202${seed % 4}-0${(seed % 9) + 1}-15`,
      contact: `${emp.name.split(' ')[0].toLowerCase()}@cuterus.app`,
      age: 22 + (seed % 15),
      consent: '✅ Granted'
    },
    corePeriod: {
      lastStart: `Oct 0${(seed % 9) + 1}, 2023`,
      periodEnd: `Oct 0${(seed % 9) + 6}, 2023`,
      avgLength: 26 + (seed % 6),
      duration: 4 + (seed % 3),
      nextPredicted: `Nov 0${(seed % 9) + 1}, 2023`,
      regularity: emp.cycleType.includes('Irregular') ? 'Irregular' : 'Regular',
      currentPhase: ['Follicular Phase', 'Luteal Phase', 'Menstruation', 'Ovulation Phase'][seed % 4]
    },
    workTracking: {
      wfhRequested: seed % 2 === 0 ? 'Yes' : 'No',
      leaveTaken: seed % 3 === 0 ? 'Yes (Period Leave)' : (seed % 4 === 0 ? 'Yes (Sick Leave)' : 'No'),
      productivityRating: (seed % 5) + 6 + '/10',
      difficulty: ['Low', 'Moderate', 'High'][seed % 3],
      flexibleHours: seed % 4 === 0 ? 'Requested' : 'Not Requested',
      accommodation: seed % 2 === 0 ? 'Rest breaks requested, Heating pad access' : 'None'
    },
    attendance: {
      periodLeavesPerMonth: seed % 3,
      leavePattern: ['Days 1-2 of cycle', 'Day 1 only', 'Rarely takes leave', 'Sporadic depending on symptoms'][seed % 4],
      upcomingHighSymptom: `Nov 0${(seed % 9) + 1} to Nov 0${(seed % 9) + 3}`,
      last6Months: `${(seed % 5) + 1} Total Leave Days`
    },
    privacy: {
      consentGiven: `Yes (Updated Oct 12, 2023)`,
      dataScope: ['Share all completely', 'Share anonymously only', 'Share symptoms & leave only'][seed % 3],
      lastUpdate: '2 weeks ago',
      withdrawRight: 'Maintained'
    },
    support: {
      requests: seed % 2 === 0 ? 'Ergonomic chair assessment, Desk fan' : 'None active',
      hrStatus: seed % 2 === 0 ? 'Approved & Deployed' : 'N/A',
      resources: 'Cuterus Wellness App Premium, Monthly Check-in active',
      doctorReferral: seed % 5 === 0 ? 'Suggested by user' : 'No',
      followUp: seed % 5 === 0 ? 'Scheduled for next Tuesday' : 'N/A'
    }
  };
});

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function EmployeeCalendar({ emp }) {
  // A simple structured month view holding 35 days (5 weeks)
  const days = Array.from({ length: 35 }, (_, i) => {
    // Offset logic to simulate a real month start day
    const dayNum = i - 2; 
    const isCurrentMonth = dayNum > 0 && dayNum <= 31;
    let periodDayIndex = -1;
    if (isCurrentMonth && emp.periodDates) {
      periodDayIndex = emp.periodDates.indexOf(dayNum);
    }
    const isPeriod = periodDayIndex !== -1;
    const isRedPeriod = isPeriod && periodDayIndex <= 2;
    const isYellowPeriod = isPeriod && periodDayIndex > 2;

    return {
      day: isCurrentMonth ? dayNum : (dayNum <= 0 ? 31 + dayNum : dayNum - 31),
      isCurrentMonth,
      isPeriod,
      isRedPeriod,
      isYellowPeriod
    };
  });

  const bloodCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ef4444' viewBox='0 0 24 24'><path d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'/></svg>") 8 8, auto`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-semibold text-gray-800">Monthly View</h3>
        <span className="text-sm text-gray-500">Google Calendar Mode</span>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-gray-50 text-center py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
        {days.map((d, i) => (
          <div 
            key={i} 
            className={`min-h-[80px] bg-white p-1 relative flex items-start justify-center text-sm ${
              !d.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
            }`}
            style={{ 
              cursor: d.isPeriod ? bloodCursor : 'default',
            }}
          >
            {d.isRedPeriod && (
               <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-semibold mt-1 shadow-sm transition-all hover:bg-rose-600">
                 {d.day}
               </div>
            )}
            {d.isYellowPeriod && (
               <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-semibold mt-1 shadow-sm transition-all hover:bg-yellow-500">
                 {d.day}
               </div>
            )}
            {!d.isPeriod && (
               <div className="w-8 h-8 flex items-center justify-center mt-1 group-hover:bg-gray-50 rounded-full transition-colors">
                 {d.day}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonitoringDashboard() {
  const { logout } = useApp();
  const navigate = useNavigate();

  const [hoveredEmpId, setHoveredEmpId] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeFilterCard, setActiveFilterCard] = useState('all');
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('basic');
  const [modalTab, setModalTab] = useState('basic');

  const filteredData = MOCK_DATA.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const finalData = filteredData.filter(emp => {
    if (activeFilterCard === 'onPeriod') return emp.weekData.some(d => d !== null);
    if (activeFilterCard === 'irregular') return emp.cycleType === 'Irregular';
    return true;
  });

  const departments = ['All', ...new Set(MOCK_DATA.map(emp => emp.department))];
  const totalTracked = filteredData.length;
  const currentlyOnPeriod = filteredData.filter(emp => emp.weekData.some(d => d !== null)).length;
  const irregularCycles = filteredData.filter(emp => emp.cycleType === 'Irregular').length;

  const statCards = [
    { id: 'all', label: 'All Tracked', value: totalTracked, icon: Activity, color: '#3b82f6', bg: '#eff6ff', desc: 'Matching current search' },
    { id: 'onPeriod', label: 'Currently on Period', value: currentlyOnPeriod, icon: Droplet, color: '#ec4899', bg: '#fdf2f8', desc: 'Experiencing symptoms' },
    { id: 'irregular', label: 'Irregular Cycles', value: irregularCycles, icon: HeartPulse, color: '#f59e0b', bg: '#fffbeb', desc: 'May need attention' },
  ];

  const getDropStyle = (dayNum) => {
    switch (dayNum) {
      case 1: return { color: 'text-rose-600', bg: 'bg-rose-100', scale: 1.1 };
      case 2: return { color: 'text-rose-500', bg: 'bg-rose-50', scale: 1.05 };
      case 3: return { color: 'text-rose-400', bg: 'bg-rose-50/50', scale: 1 };
      default: return { color: 'text-rose-300', bg: 'bg-transparent', scale: 0.9 };
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-800 font-sans overflow-hidden">
      {/* Colorful Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-2xl border-r border-white/50 flex flex-col shadow-[10px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-40 hidden md:flex">
         <div className="p-6 border-b border-gray-100/50 flex items-center gap-3 relative overflow-hidden">
             <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-rose-200/40 rounded-full blur-xl pointer-events-none"></div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 shadow-lg shadow-pink-300 flex items-center justify-center text-white">
               <ShieldAlert size={20} />
             </div>
             <div>
               <span className="block font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 leading-none mb-1">Cuterus Plus</span>
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Admin Hub</span>
             </div>
         </div>
         <div className="p-4 flex-1 flex flex-col gap-2 relative z-10">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-2 mt-4">Main Menu</p>
             {[
               { id: 'basic', label: 'Basic Info Directory', icon: Info },
               { id: 'overview', label: 'Cycle Calendar', icon: Calendar },
               { id: 'medical', label: 'Core Period Data', icon: Droplet },
               { id: 'work', label: 'Work Tracking Board', icon: Activity },
               { id: 'attendance', label: 'Attendance & Leave', icon: Filter },
               { id: 'privacy', label: 'Privacy & Consent', icon: ShieldAlert },
               { id: 'support', label: 'Support Tracker', icon: HeartPulse }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveMenu(tab.id); setIsMessageOpen(false); }}
                 className={`flex items-center gap-3 w-full p-2.5 rounded-2xl transition-all duration-300 text-sm ${activeMenu === tab.id ? 'bg-white shadow-[0_5px_15px_-5px_rgba(251,113,133,0.3)] text-rose-600 font-bold border border-rose-100/50' : 'text-gray-500 hover:bg-white/50 font-medium'}`}
               >
                 <tab.icon size={18} className={activeMenu === tab.id ? 'text-rose-500' : ''} />
                 {tab.label}
               </button>
             ))}
             <button 
                 onClick={() => { setActiveMenu('messages'); setIsMessageOpen(false); }}
                 className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-300 relative ${activeMenu === 'messages' ? 'bg-white shadow-[0_5px_15px_-5px_rgba(168,85,247,0.3)] text-purple-600 font-bold border border-purple-100/50' : 'text-gray-500 hover:bg-white/50 font-medium'}`}
             >
                 <div className="absolute left-6 top-6 w-2 h-2 rounded-full bg-purple-500 animate-pulse outline outline-2 outline-white"></div>
                 <MessageSquare size={18} className={activeMenu === 'messages' ? 'text-purple-500' : ''} />
                 Live Messages
             </button>

             <div className="mt-auto">
               <button 
                 onClick={() => { logout(); navigate('/'); }}
                 className="w-full p-3.5 bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-rose-200/50 rounded-2xl text-white transition-all flex items-center justify-center gap-2 font-bold hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-300/40"
                 title="Logout"
               >
                 <LogOut size={16} />
                 <span className="text-sm">Exit Secure Area</span>
               </button>
             </div>
         </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#fafafa]">
        {/* Dynamic Abstract Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-300/20 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-sky-200/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-blob animation-delay-4000"></div>

        <div className={`p-6 md:p-10 max-w-6xl mx-auto w-full relative z-10 ${activeMenu === 'messages' ? 'h-full flex flex-col' : ''}`}>
          {activeMenu === 'messages' ? (
            <div className="flex-1 w-full h-full min-h-[500px] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
               <SharedMessageBox roleTitle="Monitor" inline={true} />
            </div>
          ) : (
            <>
          {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-rose-500 mb-2">
              <ShieldAlert size={24} />
              <span className="uppercase tracking-widest text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                Restricted Access
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Cycle Monitoring</h1>
            <p className="text-gray-500 max-w-xl text-sm leading-relaxed">
              Privacy-first overview of employee menstrual cycles. Designed to support workplace wellness without compromising anonymity. Read-only view.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-lg px-5 py-2.5 border border-white rounded-2xl shadow-sm">
              <Calendar size={18} className="text-rose-400" />
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">Current Week</span>
            </div>
          </div>
        </header>

        {/* Interactive Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <AnimatePresence>
            {statCards.map((card) => {
              const isActive = activeFilterCard === card.id;
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilterCard(isActive ? 'all' : card.id)}
                  className={`relative overflow-hidden p-6 rounded-3xl cursor-pointer transition-all duration-300 shadow-sm border backdrop-blur-sm ${
                    isActive ? 'ring-2 shadow-2xl shadow-gray-200/50 border-transparent scale-[1.02] z-10' : 'bg-white/60 border-white hover:bg-white hover:shadow-lg'
                  }`}
                  style={{
                    backgroundColor: isActive ? card.bg : undefined,
                    ringColor: card.color
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeFilterBg" 
                      className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundColor: card.color }} 
                    />
                  )}
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm" style={{ backgroundColor: isActive ? 'white' : card.bg }}>
                      <card.icon size={22} style={{ color: card.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
                      <h4 className="text-3xl font-black text-gray-900 mt-1">{card.value}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{card.desc}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-4 right-4 text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-white rounded-full shadow-sm" style={{ color: card.color }}>
                      Filtered
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/70 backdrop-blur-md border border-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all font-semibold shadow-sm text-gray-800"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select 
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full pl-12 pr-8 py-3.5 bg-white/70 backdrop-blur-md border border-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all appearance-none cursor-pointer font-semibold shadow-sm text-gray-800"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : `${dept} Dept`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Board View */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/30 border border-white overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            {activeMenu === 'overview' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-5 font-semibold text-gray-600 text-sm whitespace-nowrap min-w-[200px]">
                      Employee
                    </th>
                    {WEEK_DAYS.map((day, i) => (
                      <th key={day} className="p-5 font-semibold text-gray-600 text-sm text-center min-w-[80px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 relative">
                  <AnimatePresence>
                  {finalData.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={8} className="p-16 text-center text-gray-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Search size={24} className="text-gray-300" />
                          </div>
                          <p>No employees found matching your criteria.</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : finalData.map((emp, index) => (
                    <motion.tr 
                      key={emp.id} 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ delay: index * 0.05 }}
                      className="transition-colors hover:bg-rose-50/40 relative"
                    >
                      <td className="p-5 relative">
                        <div 
                          className="inline-flex items-center cursor-pointer group"
                          onMouseEnter={() => setHoveredEmpId(emp.id)} onMouseLeave={() => setHoveredEmpId(null)}
                          onClick={() => { setSelectedEmp(emp); setModalTab('overview'); }}
                        >
                          <span className="font-medium text-gray-800 group-hover:text-rose-600 transition-colors">{emp.name}</span>
                          <Info size={14} className="ml-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <AnimatePresence>
                            {hoveredEmpId === emp.id && (
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                className="absolute left-5 bottom-full mb-2 bg-gray-900 text-white text-xs font-mono px-3 py-1.5 rounded shadow-lg z-10 whitespace-nowrap pointer-events-none"
                              >
                                ID: {emp.id}<div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                      {emp.weekData.map((dayNum, idx) => {
                        const isHovered = hoveredCell === `${emp.id}-${idx}`;
                        const styleInfo = dayNum ? getDropStyle(dayNum) : null;
                        return (
                          <td key={idx} className="p-3 text-center" onMouseEnter={() => setHoveredCell(`${emp.id}-${idx}`)} onMouseLeave={() => setHoveredCell(null)}>
                            <div className="h-12 w-full flex flex-col items-center justify-center rounded-lg relative overflow-hidden transition-colors">
                              {dayNum ? (
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: isHovered ? 1.2 : styleInfo.scale, rotate: isHovered ? [0, -10, 10, 0] : 0 }} transition={{ duration: 0.3 }}
                                  className={`flex flex-col items-center justify-center w-full h-full rounded-md ${isHovered ? 'bg-rose-50' : styleInfo.bg}`}
                                >
                                  <Droplet size={isHovered ? 20 : 16} className={`${styleInfo.color} fill-current transition-all duration-300`} />
                                  {dayNum <= 3 && <span className={`text-[9px] mt-1 font-bold ${styleInfo.color}`}>Day {dayNum}</span>}
                                </motion.div>
                              ) : <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>}
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-5 font-semibold text-gray-600 text-sm whitespace-nowrap min-w-[200px]">Employee</th>
                     {activeMenu === 'basic' && <><th className="p-4 font-semibold text-gray-600 text-sm">Department</th><th className="p-4 font-semibold text-gray-600 text-sm">Age</th><th className="p-4 font-semibold text-gray-600 text-sm">Date of Joining</th><th className="p-4 font-semibold text-gray-600 text-sm">Contact</th><th className="p-4 font-semibold text-gray-600 text-sm">Consent</th></>}
                     {activeMenu === 'medical' && <><th className="p-4 font-semibold text-gray-600 text-sm">Current Phase</th><th className="p-4 font-semibold text-gray-600 text-sm">Regularity</th><th className="p-4 font-semibold text-gray-600 text-sm">Last Period</th><th className="p-4 font-semibold text-gray-600 text-sm">Avg Length</th><th className="p-4 font-semibold text-gray-600 text-sm">Next Predicted</th></>}
                     {activeMenu === 'work' && <><th className="p-4 font-semibold text-gray-600 text-sm">Active Leave</th><th className="p-4 font-semibold text-gray-600 text-sm">Task Difficulty</th><th className="p-4 font-semibold text-gray-600 text-sm">Productivity</th><th className="p-4 font-semibold text-gray-600 text-sm">Flexible Hours</th></>}
                     {activeMenu === 'attendance' && <><th className="p-4 font-semibold text-gray-600 text-sm">High-Symptom Days</th><th className="p-4 font-semibold text-gray-600 text-sm">Leaves/Month</th><th className="p-4 font-semibold text-gray-600 text-sm">History</th></>}
                     {activeMenu === 'privacy' && <><th className="p-4 font-semibold text-gray-600 text-sm">Consent Given</th><th className="p-4 font-semibold text-gray-600 text-sm">Data Scope</th><th className="p-4 font-semibold text-gray-600 text-sm">Withdraw Right</th></>}
                     {activeMenu === 'support' && <><th className="p-4 font-semibold text-gray-600 text-sm">Active Requests</th><th className="p-4 font-semibold text-gray-600 text-sm">HR Status</th><th className="p-4 font-semibold text-gray-600 text-sm">Resources</th><th className="p-4 font-semibold text-gray-600 text-sm">Next Follow-up</th></>}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 relative">
                   <AnimatePresence>
                   {finalData.length === 0 ? (
                     <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                       <td colSpan={6} className="p-16 text-center text-gray-400 font-medium">No records found.</td>
                     </motion.tr>
                   ) : finalData.map((emp, index) => (
                     <motion.tr 
                       key={emp.id} 
                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                       className="transition-colors hover:bg-rose-50/40 cursor-pointer group" 
                       onClick={() => { setSelectedEmp(emp); setModalTab(activeMenu); }}
                     >
                       <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">{emp.name.charAt(0)}</div>
                           <div>
                             <span className="block group-hover:text-rose-600 transition-colors">{emp.name}</span>
                             <span className="text-[10px] text-gray-400 font-mono">{emp.id}</span>
                           </div>
                       </td>
                       {activeMenu === 'basic' && <><td className="p-4 text-sm">{emp.department}</td><td className="p-4 text-sm text-gray-500">{emp.basicInfo.age}</td><td className="p-4 text-sm text-gray-500">{emp.basicInfo.doj}</td><td className="p-4 text-sm text-gray-500">{emp.basicInfo.contact}</td><td className="p-4 text-sm text-green-600 font-bold bg-green-50/50">{emp.basicInfo.consent}</td></>}
                       {activeMenu === 'medical' && <><td className="p-4 text-sm"><span className="bg-rose-50 text-rose-600 px-2 py-1.5 border border-rose-100 rounded-md font-bold">{emp.corePeriod.currentPhase}</span></td><td className="p-4 text-sm">{emp.corePeriod.regularity}</td><td className="p-4 text-sm text-gray-500">{emp.corePeriod.lastStart}</td><td className="p-4 text-sm font-semibold">{emp.corePeriod.avgLength} Days</td><td className="p-4 text-sm text-rose-500 font-bold">{emp.corePeriod.nextPredicted}</td></>}
                       {activeMenu === 'work' && <><td className="p-4 text-sm font-semibold">{emp.workTracking.leaveTaken}</td><td className="p-4 text-sm text-gray-500">{emp.workTracking.difficulty}</td><td className="p-4 text-sm text-gray-500">{emp.workTracking.productivityRating}</td><td className="p-4 text-sm font-semibold text-blue-600 bg-blue-50/50">{emp.workTracking.flexibleHours}</td></>}
                       {activeMenu === 'attendance' && <><td className="p-4 text-sm font-semibold text-rose-600 bg-rose-50/50">{emp.attendance.upcomingHighSymptom}</td><td className="p-4 text-sm font-medium">{emp.attendance.periodLeavesPerMonth} Days</td><td className="p-4 text-xs text-gray-500 max-w-[200px] truncate" title={emp.attendance.last6Months}>{emp.attendance.last6Months}</td></>}
                       {activeMenu === 'privacy' && <><td className="p-4 text-sm font-bold text-green-600 bg-green-50/50">{emp.privacy.consentGiven}</td><td className="p-4 text-sm text-gray-500">{emp.privacy.dataScope}</td><td className="p-4 text-xs text-gray-500">{emp.privacy.withdrawRight}</td></>}
                       {activeMenu === 'support' && <><td className="p-4 text-sm font-bold text-purple-600">{emp.support.requests}</td><td className="p-4 text-sm"><span className="bg-purple-50 text-purple-700 px-2.5 py-1 border border-purple-100 rounded-md font-medium text-xs tracking-wide">{emp.support.hrStatus}</span></td><td className="p-4 text-xs text-gray-500">{emp.support.resources}</td><td className="p-4 text-sm font-semibold text-gray-700">{emp.support.followUp}</td></>}
                     </motion.tr>
                   ))}
                   </AnimatePresence>
                 </tbody>
               </table>
            )}
          </div>
        </div>

      {/* Expanded Details Modal */}
      <AnimatePresence>
        {selectedEmp && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmp(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] relative z-10 overflow-hidden flex flex-col md:flex-row border border-white/50"
            >
              {/* Modal Left Sidebar / Tabs Menu */}
              <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-100/50 bg-white">
                  <div className="flex justify-between items-start mb-2 mt-1">
                    <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedEmp.name}</h3>
                    <button 
                      onClick={() => setSelectedEmp(null)}
                      className="md:hidden text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs font-mono font-semibold text-rose-500 bg-rose-50 inline-block px-2 py-1 rounded-md mb-2">{selectedEmp.id}</p>
                  <p className="text-xs text-gray-500 font-medium">{selectedEmp.basicInfo.designation} &bull; {selectedEmp.department}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-row md:flex-col gap-2 no-scrollbar">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: Info },
                    { id: 'overview', label: 'Cycle Calendar', icon: Calendar },
                    { id: 'medical', label: 'Core Period Data', icon: Droplet },
                    { id: 'work', label: 'Work Tracking', icon: Activity },
                    { id: 'attendance', label: 'Attendance & Leave', icon: Filter },
                    { id: 'privacy', label: 'Privacy & Consent', icon: ShieldAlert },
                    { id: 'support', label: 'Support & Accommodations', icon: HeartPulse }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModalTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-semibold shrink-0 md:shrink border ${
                        modalTab === tab.id 
                        ? 'bg-white shadow-sm border-rose-100 text-rose-600' 
                        : 'border-transparent text-gray-500 hover:bg-white/60'
                      }`}
                    >
                      <tab.icon size={16} className={modalTab === tab.id ? 'text-rose-500' : 'text-gray-400'} />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="hidden md:block p-4 border-t border-gray-100 bg-white items-center">
                  <button onClick={() => setSelectedEmp(null)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <X size={16} /> Close Profile
                  </button>
                </div>
              </div>
              
              {/* Modal Right Content Area */}
              <div className="flex-1 overflow-y-auto bg-white p-6 md:p-10 relative">
                {modalTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Cycle Calendar</h2>
                      <p className="text-sm text-gray-500">Visual mapping of reported cycle days for the current period tracking window.</p>
                    </div>
                    <EmployeeCalendar emp={selectedEmp} />
                    <div className="flex items-start gap-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                      <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-700 leading-relaxed font-medium">
                        This view is heavily restricted. Hovering over active dates reveals visual indicators but blocks direct edits.
                      </p>
                    </div>
                  </div>
                )}

                {modalTab === 'basic' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Employee Name</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.name}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Department</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.department}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Age</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.basicInfo.age}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Contact Details</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.basicInfo.contact}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date of Joining</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.basicInfo.doj}</p>
                      </div>
                      <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Consent Status</p>
                        <p className="text-lg font-semibold text-rose-700">{selectedEmp.basicInfo.consent}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'medical' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🩸 Core Period Data</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                        <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Current Phase Today</p>
                        <p className="text-xl font-bold text-rose-600">{selectedEmp.corePeriod.currentPhase}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cycle Regularity</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.corePeriod.regularity}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Last Period Start</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.corePeriod.lastStart}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Last Period End</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.corePeriod.periodEnd}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Cycle Length (Avg)</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.corePeriod.avgLength} Days</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Next Predicted Date</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.corePeriod.nextPredicted}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'work' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🏢 Work-Related Tracking</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Active Leave Request</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.workTracking.leaveTaken}</p>
                        </div>
                        <Activity className="text-gray-300" size={32} />
                      </div>
                      <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Task Difficulty Reported</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.workTracking.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Productivity Self-Rating (Period Days)</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.workTracking.productivityRating}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Flexible Hours Status</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.workTracking.flexibleHours}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'attendance' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Attendance Correlation</h2>
                    <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 mb-6">
                       <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2"><Calendar size={20}/> Upcoming High-Symptom Days</h4>
                       <p className="text-rose-600 font-medium">Predicted Window: {selectedEmp.attendance.upcomingHighSymptom}</p>
                       <p className="text-sm text-rose-500 opacity-80 mt-1">Consider pre-approving flexible work options during this period.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Period Leaves (Per Month)</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.attendance.periodLeavesPerMonth} Days Avg</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Historical Pattern</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.attendance.leavePattern}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 sm:col-span-2">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Last 6 Months History</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.attendance.last6Months}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'privacy' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Privacy Configuration</h2>
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex gap-4 items-start mb-6">
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                         <ShieldAlert size={20} className="text-green-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900">{selectedEmp.privacy.consentGiven}</h4>
                        <p className="text-sm text-green-700 mt-1 font-medium">This employee has explicitly granted consent for their data to be viewed by HR monitors.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Data Scope Access</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.privacy.dataScope}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Right to Withdraw</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedEmp.privacy.withdrawRight}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'support' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">💊 Support & Resources</h2>
                    <div className="space-y-4">
                      <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                         <div>
                            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Active Accommodation Request</p>
                            <p className="text-lg font-bold text-purple-900">{selectedEmp.support.requests}</p>
                         </div>
                         <div className="px-4 py-2 bg-white rounded-full text-sm font-bold text-purple-600 shadow-sm whitespace-nowrap">
                            Status: {selectedEmp.support.hrStatus}
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Resources Accessed</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.support.resources}</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Doctor Referral Suggested</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.support.doctorReferral}</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 sm:col-span-2">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Upcoming HR Follow-up</p>
                          <p className="text-lg font-semibold text-gray-800">{selectedEmp.support.followUp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
            </>
          )}
        </div> {/* End max-w-6xl */}
      </div> {/* End Main Area */}
    </div>
  );
}
