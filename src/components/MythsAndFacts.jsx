import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, XCircle, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';

const MYTHS_FACTS = [
  {
    myth: "You shouldn't exercise during your period.",
    fact: "Light to moderate exercise can actually help reduce cramps and improve mood by releasing endorphins. Activities like yoga, walking, and swimming are especially beneficial.",
    category: 'fitness',
  },
  {
    myth: "PMS is just in your head — it's not a real medical condition.",
    fact: "PMS is a well-documented medical condition caused by hormonal fluctuations. Up to 75% of menstruating people experience some form of PMS, and for some it significantly impacts daily life.",
    category: 'health',
  },
  {
    myth: "Periods should last exactly 7 days every 28 days.",
    fact: "Normal menstrual cycles can range from 21 to 35 days, and periods can last 2 to 7 days. Cycle length can also vary month to month — that's completely normal.",
    category: 'cycle',
  },
  {
    myth: "You can't get pregnant during your period.",
    fact: "While less likely, pregnancy is still possible during menstruation, especially for those with shorter cycles. Sperm can survive in the body for up to 5 days.",
    category: 'health',
  },
  {
    myth: "Hormonal changes don't affect work performance.",
    fact: "Hormonal fluctuations can impact energy, focus, and mood. Understanding your cycle can help you schedule tasks strategically — plan deep-focus work during your follicular phase and creative tasks during ovulation.",
    category: 'workplace',
  },
  {
    myth: "Talking about periods at work is unprofessional.",
    fact: "Normalizing menstrual health in the workplace leads to better policies, reduced stigma, and improved employee well-being. Companies with menstrual health support see higher retention and satisfaction.",
    category: 'workplace',
  },
  {
    myth: "Irregular periods always indicate a serious health problem.",
    fact: "While persistent irregularity should be discussed with a doctor, occasional irregular cycles are common and can be caused by stress, diet changes, travel, or lifestyle shifts.",
    category: 'cycle',
  },
  {
    myth: "Menstrual pain is just normal — you should push through it.",
    fact: "While mild discomfort is common, severe menstrual pain (dysmenorrhea) is not something you should just endure. It can indicate conditions like endometriosis and deserves medical attention.",
    category: 'health',
  },
  {
    myth: "Your diet has no impact on your menstrual cycle.",
    fact: "Nutrition plays a huge role! Iron-rich foods help replenish blood loss, omega-3s reduce inflammation, and magnesium can ease cramps. Balanced eating supports a healthier cycle.",
    category: 'fitness',
  },
  {
    myth: "Menstrual leave policies are unnecessary and promote discrimination.",
    fact: "Research shows that menstrual leave policies, when implemented thoughtfully, reduce absenteeism by 20%, increase productivity, and improve workplace culture for everyone.",
    category: 'workplace',
  },
];

const categoryColors = {
  fitness: { bg: '#f0fdf4', color: '#22c55e', label: '💪 Fitness' },
  health: { bg: '#fdf2f8', color: '#ec4899', label: '❤️ Health' },
  cycle: { bg: '#faf5ff', color: '#8b5cf6', label: '🌙 Cycle' },
  workplace: { bg: '#eff6ff', color: '#3b82f6', label: '💼 Workplace' },
};

export default function MythsAndFacts({ variant = 'personal' }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filter, setFilter] = useState(variant === 'employee' || variant === 'hr' ? 'workplace' : 'all');

  const filteredMyths = filter === 'all'
    ? MYTHS_FACTS
    : MYTHS_FACTS.filter(m => m.category === filter);

  const toggle = (i) => setExpandedIndex(expandedIndex === i ? null : i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={variant === 'hr' || variant === 'employee' ? 'glass-card-strong p-6' : 'glass-card p-6'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-800 text-lg">
              Myths vs Facts
            </h3>
            <p className="text-xs text-gray-400">
              Busting common misconceptions about menstrual health
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white/60 border border-gray-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 ml-1" />
          <span className="text-[10px] font-semibold text-amber-600 mr-1">{filteredMyths.length} FACTS</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { id: 'all', label: '✨ All' },
          { id: 'health', label: '❤️ Health' },
          { id: 'cycle', label: '🌙 Cycle' },
          { id: 'fitness', label: '💪 Fitness' },
          { id: 'workplace', label: '💼 Workplace' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { setFilter(cat.id); setExpandedIndex(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              filter === cat.id
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200/40'
                : 'bg-white/70 text-gray-500 hover:bg-amber-50 hover:text-amber-600 border border-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Myths & Facts Accordion */}
      <div className="space-y-3">
        {filteredMyths.map((item, i) => {
          const isOpen = expandedIndex === i;
          const catStyle = categoryColors[item.category];
          return (
            <motion.div
              key={`${item.category}-${i}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <div
                onClick={() => toggle(i)}
                className={`rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-amber-200 shadow-lg shadow-amber-100/40'
                    : 'border-transparent hover:border-gray-200 hover:shadow-md'
                }`}
                style={{ backgroundColor: isOpen ? '#fffbeb' : 'rgba(255,255,255,0.5)' }}
              >
                {/* Myth row */}
                <div className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Myth</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
                      >
                        {catStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      "{item.myth}"
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-amber-500" />
                      : <ChevronDown className="w-4 h-4 text-gray-300" />
                    }
                  </div>
                </div>

                {/* Fact reveal */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green-50/80 border border-green-100">
                          <div className="mt-0.5 flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 block mb-1">
                              ✅ Fact
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item.fact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <p className="text-xs text-gray-400">
          Tap on any myth to reveal the truth. Knowledge is power! 💛
        </p>
      </div>
    </motion.div>
  );
}
