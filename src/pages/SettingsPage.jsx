import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Calendar, Save, CheckCircle2, Moon, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useApp();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    cycleLength: user?.cycleLength || 28,
    periodLength: user?.periodLength || 5,
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.age, 10) || user.age,
      cycleLength: parseInt(formData.cycleLength, 10) || user.cycleLength,
      periodLength: parseInt(formData.periodLength, 10) || user.periodLength,
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-800 dark:text-white">
          Profile Settings ⚙️
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Update your personal details and cycle preferences.
        </p>
      </div>

      <div className="glass-card-strong p-6 md:p-8 rounded-3xl dark:bg-gray-800/80 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="e.g. Sarah Chen"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="sarah@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="28"
                    min="12"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Cycle Tracking Data</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Cycle Length (Days)</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-pink-400" />
                  <input
                    type="number"
                    name="cycleLength"
                    value={formData.cycleLength}
                    onChange={handleChange}
                    className="input-field pl-11"
                    min="21"
                    max="35"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Period Length (Days)</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-rose-400" />
                  <input
                    type="number"
                    name="periodLength"
                    value={formData.periodLength}
                    onChange={handleChange}
                    className="input-field pl-11"
                    min="2"
                    max="10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Preferences</h3>
            
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Language</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose your language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-medium"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-4">
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 font-medium"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Profile Saved!</span>
              </motion.div>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-400 flex items-center gap-2 shadow-lg hover:shadow-pink-300/40 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>

        </form>
      </div>
    </motion.div>
  );
}
