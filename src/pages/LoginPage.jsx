import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, Building2, User, Lock, Mail, ArrowRight, Sparkles, Shield, ChevronDown } from 'lucide-react';

const FloatingPetal = ({ delay, x, y, size, rotation }) => (
  <motion.div
    className="absolute pointer-events-none opacity-10"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      rotate: [rotation, rotation + 15, rotation],
      scale: [1, 1.05, 1],
    }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 0C20 0 25 10 40 20C25 30 20 40 20 40C20 40 15 30 0 20C15 10 20 0 20 0Z" fill="#f9a8d4" />
    </svg>
  </motion.div>
);

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [officeRole, setOfficeRole] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [monitorCode, setMonitorCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, firebaseReady } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const role = activeTab === 'personal' ? 'personal' : officeRole;

    // Validate required fields for office users (allow demo values)
    if (role === 'hr' && !companyCode.trim() && !firebaseReady) {
      setFormError('Company access code is required for HR login.');
      setSubmitting(false);
      return;
    }
    if (role === 'employee' && !employeeCode.trim() && !firebaseReady) {
      setFormError('Employee code is required for employee login.');
      setSubmitting(false);
      return;
    }
    if (role === 'monitor' && !monitorCode.trim() && !firebaseReady) {
      setFormError('Monitor access code is required.');
      setSubmitting(false);
      return;
    }

    // For Firebase-enabled mode, validate codes against expected values
    if (firebaseReady) {
      if (role === 'hr' && companyCode.trim() !== 'TECHFLOW2026') {
        setFormError('Invalid company access code.');
        setSubmitting(false);
        return;
      }
      if (role === 'employee' && employeeCode.trim() !== 'EMP001') {
        setFormError('Invalid employee code.');
        setSubmitting(false);
        return;
      }
      if (role === 'monitor' && monitorCode.trim() !== 'MONITOR2026') {
        setFormError('Invalid monitor code.');
        setSubmitting(false);
        return;
      }
    }

    const finalEmail = email || (role === 'hr' ? 'alex@example.com' : role === 'monitor' ? 'monitor@example.com' : 'sarah@example.com');
    const finalPassword = password || 'demo';

    try {
      if (isSignUp) {
        await register(finalEmail, finalPassword, role, name);
      } else {
        await login(finalEmail, finalPassword, role, isSignUp ? name : undefined);
      }
      if (role === 'hr') navigate('/hr');
      else if (role === 'monitor') navigate('/monitoring');
      else navigate('/dashboard');
    } catch (err) {
      // Show user-friendly Firebase error messages
      const errorMap = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email. Try signing up.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
      };
      const code = err?.code || '';
      setFormError(errorMap[code] || err?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const petals = [
    { delay: 0, x: 10, y: 15, size: 40, rotation: 0 },
    { delay: 1, x: 85, y: 10, size: 35, rotation: 45 },
    { delay: 2, x: 5, y: 70, size: 30, rotation: -30 },
    { delay: 0.5, x: 90, y: 60, size: 45, rotation: 60 },
    { delay: 1.5, x: 50, y: 5, size: 25, rotation: 20 },
    { delay: 3, x: 75, y: 85, size: 35, rotation: -45 },
    { delay: 2.5, x: 20, y: 90, size: 28, rotation: 30 },
    { delay: 0.8, x: 60, y: 75, size: 32, rotation: -15 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden gradient-mesh">
      {/* Floating Petals Background */}
      {petals.map((p, i) => <FloatingPetal key={i} {...p} />)}

      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-200/20 to-purple-200/20 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sage-200/20 to-pink-200/20 blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-8 gap-8 lg:gap-16">
        {/* Left Side — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left max-w-lg"
        >
          <motion.div
            className="flex items-center justify-center lg:justify-start gap-3 mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-300/30">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500">Cuterus</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl lg:text-2xl text-gray-600 mb-4 font-light"
          >
            Your wellness, your power.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mb-8 leading-relaxed"
          >
            A menstrual health & workplace wellness platform that bridges personal health tracking with professional productivity.
            <span className="text-pink-500 font-medium"> Beautiful. Private. Empowering.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 justify-center lg:justify-start"
          >
            {['Phase-Aware UI', 'AI Chatbot', 'Privacy-First', 'Doctor Reports'].map((feature, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-pink-100 text-sm text-gray-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                {feature}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side — Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-card-strong p-8 rounded-3xl shadow-2xl shadow-pink-200/30">
            {/* Tab Selector */}
            <div className="flex gap-2 mb-8 bg-pink-50/80 rounded-2xl p-1.5">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'personal'
                    ? 'bg-white text-pink-600 shadow-md shadow-pink-200/50'
                    : 'text-gray-500 hover:text-pink-400'
                  }`}
              >
                <User className="w-4 h-4" />
                Personal
              </button>
              <button
                onClick={() => setActiveTab('office')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'office'
                    ? 'bg-white text-purple-600 shadow-md shadow-purple-200/50'
                    : 'text-gray-500 hover:text-purple-400'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                Office
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={activeTab + isSignUp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Office Role Selector */}
                {activeTab === 'office' && (
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setOfficeRole('employee')}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border-2 ${officeRole === 'employee'
                          ? 'border-pink-400 bg-pink-50 text-pink-600'
                          : 'border-gray-200 text-gray-400 hover:border-pink-200'
                        }`}
                    >
                      👩‍💼 Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfficeRole('hr')}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border-2 ${officeRole === 'hr'
                          ? 'border-purple-400 bg-purple-50 text-purple-600'
                          : 'border-gray-200 text-gray-400 hover:border-purple-200'
                        }`}
                    >
                      📋 HR Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfficeRole('monitor')}
                      className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border-2 ${officeRole === 'monitor'
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          : 'border-gray-200 text-gray-400 hover:border-emerald-200'
                        }`}
                    >
                      🛡️ Monitor
                    </button>
                  </div>
                )}

                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${activeTab === 'personal' ? 'text-pink-300' : (officeRole === 'hr' ? 'text-indigo-300' : 'text-purple-300')}`} />
                      <input
                        type="text"
                        placeholder="e.g. Sarah Chen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    {activeTab === 'personal' 
                      ? 'Email Login' 
                      : officeRole === 'hr' ? 'HR Admin Email Login' : officeRole === 'monitor' ? 'Monitor Auth Email' : 'Employee Email Login'}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${activeTab === 'personal' ? 'text-pink-300' : 'text-indigo-300'}`} />
                    <input
                      type="email"
                      placeholder={activeTab === 'personal' ? "sarah@example.com" : officeRole === 'hr' ? "admin@company.com" : officeRole === 'monitor' ? "monitor@thirdparty.com" : "employee@company.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${activeTab === 'personal' ? 'text-pink-300' : 'text-indigo-300'}`} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {activeTab === 'office' && officeRole === 'hr' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Company Access Code</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-300" />
                      <input
                        type="text"
                        placeholder={firebaseReady ? "Enter TECHFLOW2026" : "e.g. TECHFLOW2026"}
                        value={companyCode}
                        onChange={(e) => setCompanyCode(e.target.value)}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'office' && officeRole === 'employee' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Employee Code</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-purple-300" />
                      <input
                        type="text"
                        placeholder={firebaseReady ? "Enter EMP001" : "e.g. EMP001"}
                        value={employeeCode}
                        onChange={(e) => setEmployeeCode(e.target.value)}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'office' && officeRole === 'monitor' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Monitor Authorization Code</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-300" />
                      <input
                        type="text"
                        placeholder={firebaseReady ? "Enter MONITOR2026" : "e.g. MONITOR2026"}
                        value={monitorCode}
                        onChange={(e) => setMonitorCode(e.target.value)}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center"
                  >
                    {formError}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={submitting ? {} : { scale: 1.02 }}
                  whileTap={submitting ? {} : { scale: 0.98 }}
                  className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${activeTab === 'personal'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-pink-300/40'
                      : officeRole === 'hr'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-purple-300/40'
                        : officeRole === 'monitor'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-300/40'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-purple-300/40'
                    } hover:shadow-xl ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
            </div>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-center text-sm text-gray-500 hover:text-pink-500 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>

            {/* Privacy Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
            >
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span>GDPR & HIPAA compliant • End-to-end encrypted</span>
            </motion.div>
          </div>

          {/* Quick Demo Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex flex-col gap-2"
          >
            <p className="text-center text-xs text-gray-400 mb-1">Quick Demo Access</p>
            <div className="flex gap-2">
              {[
                { label: '👩 Personal', role: 'personal', color: 'from-pink-400 to-rose-400' },
                { label: '👩‍💼 Employee', role: 'employee', color: 'from-pink-400 to-purple-400' },
                { label: '📋 HR Admin', role: 'hr', color: 'from-purple-400 to-indigo-400' },
                { label: '🛡️ Monitor', role: 'monitor', color: 'from-emerald-400 to-teal-400' },
              ].map(({ label, role, color }) => (
                <motion.button
                  key={role}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    // Set demo codes for office roles
                    if (role === 'hr') {
                      setCompanyCode('TECHFLOW2026');
                      setActiveTab('office');
                      setOfficeRole('hr');
                    } else if (role === 'employee') {
                      setEmployeeCode('EMP001');
                      setActiveTab('office');
                      setOfficeRole('employee');
                    } else if (role === 'monitor') {
                      setMonitorCode('MONITOR2026');
                      setActiveTab('office');
                      setOfficeRole('monitor');
                    }

                    try {
                      const user = await login('demo@cuterus.com', 'demo', role);
                      if (role === 'hr') navigate('/hr');
                      else if (role === 'monitor') navigate('/monitoring');
                      else navigate('/dashboard');
                    } catch (err) {
                      console.error('Demo login error:', err);
                    }
                  }}
                  className={`flex-1 py-2 rounded-xl text-white text-xs font-medium bg-gradient-to-r ${color} shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
