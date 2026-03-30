// Cycle calculation utilities

export const PHASES = {
  MENSTRUATION: {
    name: 'Menstruation',
    emoji: '🔴',
    icon: '🩸',
    color: '#f43f5e',
    bgColor: '#fff1f2',
    secondaryColor: '#fecdd3',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    gradientFrom: '#fecdd3',
    gradientTo: '#fda4af',
    cssClass: 'phase-menstruation',
    mood: 'Rest & Recharge',
    tips: [
      'Take it easy — your body is working hard',
      'Warm beverages can help with cramps',
      'Gentle stretching or yoga is beneficial',
      'Prioritize sleep and relaxation',
      'Iron-rich foods help replenish energy',
      'Schedule lighter tasks if possible',
    ],
    workTips: [
      'Schedule lighter, routine tasks',
      'Take regular breaks to stretch',
      'Consider working from home if possible',
      'Avoid scheduling intense meetings',
      'Focus on planning and organizing',
    ],
    remedies: {
      cramps: ['Heating pad', 'Ginger tea', 'Gentle yoga', 'Ibuprofen if needed'],
      fatigue: ['Short power naps', 'Iron-rich snacks', 'Stay hydrated', 'Reduce caffeine'],
      mood: ['Journaling', 'Light walks', 'Comfort activities', 'Talk to a friend'],
    },
  },
  FOLLICULAR: {
    name: 'Follicular',
    emoji: '🌱',
    icon: '🌿',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    secondaryColor: '#bbf7d0',
    glowColor: 'rgba(34, 197, 94, 0.15)',
    gradientFrom: '#bbf7d0',
    gradientTo: '#86efac',
    cssClass: 'phase-follicular',
    mood: 'Growth & Energy',
    tips: [
      'Energy is rising — try new activities!',
      'Great time for creative projects',
      'Your body responds well to exercise now',
      'Experiment with new recipes',
      'Start new learning goals',
      'Social activities feel more natural',
    ],
    workTips: [
      'Tackle challenging creative projects',
      'Schedule brainstorming sessions',
      'Start new initiatives or campaigns',
      'Network and connect with colleagues',
      'Take on highly visible tasks',
    ],
    remedies: {},
  },
  OVULATION: {
    name: 'Ovulation',
    emoji: '🌕',
    icon: '✨',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    secondaryColor: '#fde68a',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    gradientFrom: '#fde68a',
    gradientTo: '#fcd34d',
    cssClass: 'phase-ovulation',
    mood: 'Peak Performance',
    tips: [
      'You\'re at peak energy — go for it!',
      'Perfect time for social events',
      'Communication skills are heightened',
      'Great for presentations and interviews',
      'High-intensity workouts feel amazing',
      'Your skin may be glowing naturally',
    ],
    workTips: [
      'Schedule important presentations',
      'Lead team meetings and pitches',
      'Handle client-facing interactions',
      'Negotiate deals and partnerships',
      'Deep focus work at peak productivity',
    ],
    remedies: {},
  },
  LUTEAL: {
    name: 'Luteal',
    emoji: '🌙',
    icon: '🫧',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    secondaryColor: '#ddd6fe',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    gradientFrom: '#ddd6fe',
    gradientTo: '#c4b5fd',
    cssClass: 'phase-luteal',
    mood: 'Reflect & Nurture',
    tips: [
      'Wind down — self-care is essential',
      'Reduce sugar and caffeine intake',
      'Gentle exercise like walking helps',
      'Prepare for your upcoming period',
      'Magnesium-rich foods reduce PMS',
      'Practice mindfulness and meditation',
    ],
    workTips: [
      'Focus on detail-oriented work',
      'Organize and clean up projects',
      'Review and edit existing work',
      'Plan for the coming week/month',
      'Wrap up ongoing tasks',
    ],
    remedies: {
      bloating: ['Reduce salt intake', 'Drink herbal tea', 'Light exercise', 'Eat potassium-rich foods'],
      mood: ['Dark chocolate (small amounts)', 'B6-rich foods', 'Regular sleep schedule', 'Limit alcohol'],
      cravings: ['Complex carbs instead of sugar', 'Protein-rich snacks', 'Stay hydrated', 'Balanced meals'],
    },
  },
};

export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣', category: 'physical' },
  { id: 'headache', label: 'Headache', emoji: '🤕', category: 'physical' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧', category: 'physical' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴', category: 'physical' },
  { id: 'backpain', label: 'Back Pain', emoji: '🔙', category: 'physical' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢', category: 'physical' },
  { id: 'acne', label: 'Acne', emoji: '😤', category: 'physical' },
  { id: 'tender_breasts', label: 'Breast Tenderness', emoji: '💔', category: 'physical' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭', category: 'emotional' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰', category: 'emotional' },
  { id: 'irritability', label: 'Irritability', emoji: '😠', category: 'emotional' },
  { id: 'sadness', label: 'Sadness', emoji: '😢', category: 'emotional' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫', category: 'other' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙', category: 'other' },
  { id: 'low_libido', label: 'Low Energy', emoji: '🔋', category: 'other' },
];

export function calculateCurrentPhase(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const dayInCycle = daysDiff % cycleLength;
  
  if (dayInCycle < 5) return { phase: 'MENSTRUATION', day: dayInCycle + 1, totalDay: dayInCycle + 1 };
  if (dayInCycle < 13) return { phase: 'FOLLICULAR', day: dayInCycle - 4, totalDay: dayInCycle + 1 };
  if (dayInCycle < 16) return { phase: 'OVULATION', day: dayInCycle - 12, totalDay: dayInCycle + 1 };
  return { phase: 'LUTEAL', day: dayInCycle - 15, totalDay: dayInCycle + 1 };
}

export function predictNextPeriod(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  const today = new Date();
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cyclesElapsed = Math.floor(daysDiff / cycleLength);
  const nextStart = new Date(start);
  nextStart.setDate(nextStart.getDate() + (cyclesElapsed + 1) * cycleLength);
  return nextStart;
}

export function getDaysUntilNextPeriod(lastPeriodStart, cycleLength = 28) {
  const nextPeriod = predictNextPeriod(lastPeriodStart, cycleLength);
  if (!nextPeriod) return null;
  const today = new Date();
  return Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
}

export function getPhaseForDate(date, lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  const start = new Date(lastPeriodStart);
  const target = new Date(date);
  const daysDiff = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return null;
  const dayInCycle = daysDiff % cycleLength;
  
  if (dayInCycle < 5) return 'MENSTRUATION';
  if (dayInCycle < 13) return 'FOLLICULAR';
  if (dayInCycle < 16) return 'OVULATION';
  return 'LUTEAL';
}

export function generateCalendarDays(year, month, lastPeriodStart, cycleLength = 28) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const days = [];
  
  // Previous month padding
  const prevMonthLast = new Date(year, month, 0);
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(prevMonthLast);
    d.setDate(prevMonthLast.getDate() - i);
    days.push({ date: d, isCurrentMonth: false, phase: getPhaseForDate(d, lastPeriodStart, cycleLength) });
  }
  
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true, phase: getPhaseForDate(d, lastPeriodStart, cycleLength) });
  }
  
  // Next month padding
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false, phase: getPhaseForDate(d, lastPeriodStart, cycleLength) });
  }
  
  return days;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
}
