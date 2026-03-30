import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Bookmark, Clock, Zap, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES } from '../utils/cycleUtils';
import { useTheme } from '../context/ThemeContext';

const workoutLibrary = [
  // Menstruation Workouts
  {
    id: 1,
    title: 'Restorative Yoga for Period',
    phase: 'MENSTRUATION',
    difficulty: 'Easy',
    duration: 20,
    description: 'Gentle, restorative poses to ease cramps and discomfort',
    videoUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    benefits: ['Cramp relief', 'Relaxation', 'Pain management'],
  },
  {
    id: 2,
    title: 'Yin Yoga - Period Flow',
    phase: 'MENSTRUATION',
    difficulty: 'Easy',
    duration: 30,
    description: 'Slow-paced yin yoga holding poses for deep relaxation',
    videoUrl: 'https://www.youtube.com/embed/Yzm3fA2HhkQ',
    benefits: ['Stretch', 'Relaxation', 'Emotional release'],
  },

  // Follicular Workouts
  {
    id: 3,
    title: 'Morning Energy Flow Yoga',
    phase: 'FOLLICULAR',
    difficulty: 'Medium',
    duration: 20,
    description: 'Energizing flow to boost your morning motivation',
    videoUrl: 'https://www.youtube.com/embed/VaoV1PrYft4',
    benefits: ['Energy boost', 'Strength', 'Focus'],
  },
  {
    id: 4,
    title: 'HIIT Workout - Follicular',
    phase: 'FOLLICULAR',
    difficulty: 'Hard',
    duration: 25,
    description: 'High-intensity interval training when energy is high',
    videoUrl: 'https://www.youtube.com/embed/ml6cT4AelGw',
    benefits: ['Cardio', 'Strength', 'Endurance'],
  },
  {
    id: 5,
    title: 'Pilates Core Strengthening',
    phase: 'FOLLICULAR',
    difficulty: 'Medium',
    duration: 30,
    description: 'Build core strength with controlled pilates movements',
    videoUrl: 'https://www.youtube.com/embed/K56Z12XNQ5M',
    benefits: ['Core strength', 'Posture', 'Stability'],
  },

  // Ovulation Workouts
  {
    id: 6,
    title: 'Dance Cardio - Ovulation Peak',
    phase: 'OVULATION',
    difficulty: 'Hard',
    duration: 25,
    description: 'Fun, high-energy dance workout at your peak energy level',
    videoUrl: 'https://www.youtube.com/embed/gCBLyXfywAY',
    benefits: ['Cardio', 'Joy', 'Coordination'],
  },
  {
    id: 7,
    title: 'Power Yoga Flow',
    phase: 'OVULATION',
    difficulty: 'Hard',
    duration: 30,
    description: 'Challenging power vinyasa flow when you\'re at your strongest',
    videoUrl: 'https://www.youtube.com/embed/v7SN-d4qXx0',
    benefits: ['Strength', 'Balance', 'Confidence'],
  },

  // Luteal Workouts
  {
    id: 8,
    title: 'Calm Walking Meditation',
    phase: 'LUTEAL',
    difficulty: 'Easy',
    duration: 20,
    description: 'Mindful walking to ease into the luteal phase',
    videoUrl: 'https://www.youtube.com/embed/wf5K3pP2IUQ',
    benefits: ['Mindfulness', 'Calm', 'Movement'],
  },
  {
    id: 9,
    title: 'Gentle Stretching - Luteal',
    phase: 'LUTEAL',
    difficulty: 'Easy',
    duration: 25,
    description: 'Slow, gentle stretching for the introspective phase',
    videoUrl: 'https://www.youtube.com/embed/g_tea8ZNk5A',
    benefits: ['Flexibility', 'Relaxation', 'Release'],
  },
  {
    id: 10,
    title: 'Yoga for Anxiety Relief',
    phase: 'LUTEAL',
    difficulty: 'Medium',
    duration: 30,
    description: 'Yoga poses specifically for anxiety and mood support',
    videoUrl: 'https://www.youtube.com/embed/BiWDsfZ3zbo',
    benefits: ['Anxiety relief', 'Mood boost', 'Calm'],
  },
];

export default function WorkoutPage() {
  const { user, appState, updateAppState } = useApp();
  const { isDarkMode } = useTheme();
  const [favorites, setFavorites] = useState(appState?.favoriteWorkouts || []);
  const [watched, setWatched] = useState(appState?.watchedWorkouts || []);
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [playingVideo, setPlayingVideo] = useState(null);

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : PHASES.FOLLICULAR;

  const filteredWorkouts = workoutLibrary.filter(w => {
    const phaseMatch = selectedPhase === 'ALL' || w.phase === selectedPhase;
    const difficultyMatch = selectedDifficulty === 'ALL' || w.difficulty === selectedDifficulty;
    return phaseMatch && difficultyMatch;
  });

  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(updated);
    updateAppState({ favoriteWorkouts: updated });
  };

  const markWatched = (id) => {
    const updated = watched.includes(id) ? watched : [...watched, id];
    setWatched(updated);
    updateAppState({ watchedWorkouts: updated });
  };

  const openVideo = (workout) => {
    setPlayingVideo(workout);
    markWatched(workout.id);
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Video Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={closeVideo}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`${playingVideo.videoUrl}?autoplay=1&rel=0`}
                title={playingVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="p-4 dark:text-white">
              <h3 className="text-xl font-bold">{playingVideo.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{playingVideo.description}</p>
            </div>
          </motion.div>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-800 dark:text-white flex items-center gap-2">
          💪 Workout Library
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Phase-specific yoga, pilates, and cardio workouts</p>
      </div>

      {/* Filters */}
      <motion.div className="glass-card p-6 dark:bg-gray-800/60 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="ALL">All Phases</option>
              <option value="MENSTRUATION">Menstruation</option>
              <option value="FOLLICULAR">Follicular</option>
              <option value="OVULATION">Ovulation</option>
              <option value="LUTEAL">Luteal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="ALL">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Recommended for Current Phase */}
      {selectedPhase === 'ALL' && phaseInfo && (
        <motion.div className="glass-card p-6 dark:bg-gray-800/60 dark:border-gray-700" style={{ borderColor: currentPhase.color }}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            🌸 Recommended for your {currentPhase.name} phase:
          </p>
          <div className="flex flex-wrap gap-2">
            {workoutLibrary
              .filter(w => w.phase === phaseInfo.phase)
              .slice(0, 3)
              .map(workout => (
                <span key={workout.id} className="text-xs px-3 py-1 rounded-full bg-white/60 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white">
                  {workout.title}
                </span>
              ))}
          </div>
        </motion.div>
      )}

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkouts.map((workout) => (
          <motion.div
            key={workout.id}
            whileHover={{ y: -4 }}
            className="glass-card overflow-hidden dark:bg-gray-800/60 dark:border-gray-700"
          >
            {/* Thumbnail with play button */}
            <div className="relative w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group cursor-pointer"
                 onClick={() => openVideo(workout)}>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${PHASES[workout.phase]?.gradientFrom}, ${PHASES[workout.phase]?.gradientTo}40)`,
                }}
              />
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
              >
                <Play className="w-6 h-6 text-pink-500 fill-current" />
              </motion.button>
              <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                {workout.duration} min
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{workout.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{workout.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleFavorite(workout.id)}
                  className="flex-shrink-0"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      favorites.includes(workout.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </motion.button>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {workout.duration} min
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full text-white flex items-center gap-1"
                  style={{
                    backgroundColor: workout.difficulty === 'Easy' ? '#10b981' : 
                                   workout.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
                  }}
                >
                  <Zap className="w-3 h-3" />
                  {workout.difficulty}
                </span>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap gap-1">
                {workout.benefits.map((benefit) => (
                  <span key={benefit} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {benefit}
                  </span>
                ))}
              </div>

              {/* Watch status */}
              {watched.includes(workout.id) && (
                <p className="text-xs text-green-600 font-medium">✅ Watched</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <motion.div className="glass-card p-8 text-center dark:bg-gray-800/60 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No workouts found with these filters</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div className="glass-card p-6 dark:bg-gray-800/60 dark:border-gray-700">
        <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-4">Your Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-500">{watched.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Watched</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{favorites.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Favorites</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{workoutLibrary.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Available</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
