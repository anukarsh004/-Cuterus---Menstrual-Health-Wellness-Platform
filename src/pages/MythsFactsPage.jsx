import { motion } from 'framer-motion';
import MythsAndFacts from '../components/MythsAndFacts';
import { useApp } from '../context/AppContext';

export default function MythsFactsPage() {
  const { user } = useApp();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-800">
          Myths & Facts 💡
        </h1>
        <p className="text-gray-500 mt-2">
          Discover the truth behind common misconceptions about menstrual health, wellness, and the workplace.
        </p>
      </div>

      <MythsAndFacts variant={user?.role === 'employee' ? 'employee' : 'personal'} />
      
    </motion.div>
  );
}
