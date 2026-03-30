import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export default function CustomRemedies({ customRemedies = [], onAdd, onDelete, onEdit }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phase: 'MENSTRUATION',
    category: 'physical',
  });

  const phases = ['MENSTRUATION', 'FOLLICULAR', 'OVULATION', 'LUTEAL'];
  const categories = ['physical', 'emotional', 'other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.description) {
      if (editingId) {
        onEdit(editingId, formData);
        setEditingId(null);
      } else {
        onAdd(formData);
      }
      setFormData({ name: '', description: '', phase: 'MENSTRUATION', category: 'physical' });
      setShowForm(false);
    }
  };

  const startEdit = (remedy) => {
    setFormData(remedy);
    setEditingId(remedy.id);
    setShowForm(true);
  };

  return (
    <motion.div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-800">My Remedies</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-lg bg-pink-100 text-pink-600 hover:bg-pink-200"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 rounded-xl bg-white/50 border border-pink-100 space-y-3"
          >
            <input
              type="text"
              placeholder="Remedy name (e.g., Ginger Tea)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              required
            />
            <textarea
              placeholder="Description and how to use"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              rows="3"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {phases.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {editingId ? 'Update Remedy' : 'Add Remedy'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', description: '', phase: 'MENSTRUATION', category: 'physical' });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {customRemedies.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No custom remedies yet. Add your first one!</p>
        ) : (
          customRemedies.map(remedy => (
            <motion.div
              key={remedy.id}
              layout
              className="p-3 rounded-lg bg-white/40 border border-pink-50 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800">{remedy.name}</p>
                <p className="text-xs text-gray-600 mt-1">{remedy.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded bg-pink-100 text-pink-600">{remedy.phase}</span>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-600">{remedy.category}</span>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => startEdit(remedy)}
                  className="p-1.5 rounded text-amber-600 hover:bg-amber-50"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(remedy.id)}
                  className="p-1.5 rounded text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
