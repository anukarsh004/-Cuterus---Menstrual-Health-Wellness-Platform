import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { calculateCurrentPhase, PHASES, SYMPTOMS, formatDate } from '../utils/cycleUtils';
import { FileText, Download, Share2, Calendar, Activity, TrendingUp, Printer, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';

export default function HealthReport() {
  const { user, symptomsLog, cycleHistory } = useApp();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const phaseInfo = calculateCurrentPhase(user?.lastPeriodStart, user?.cycleLength);
  const currentPhase = phaseInfo ? PHASES[phaseInfo.phase] : null;

  // Compute report data
  const avgCycleLength = cycleHistory.length > 0
    ? Math.round(cycleHistory.reduce((a, c) => a + c.length, 0) / cycleHistory.length)
    : user?.cycleLength || 28;

  const symptomFrequency = {};
  symptomsLog.forEach(log => {
    log.symptoms.forEach(s => {
      symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const symptom = SYMPTOMS.find(s => s.id === id);
      return { name: symptom?.label || id, count, emoji: symptom?.emoji || '' };
    });

  const generatePDF = () => {
    setGenerating(true);

    setTimeout(() => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Header
      doc.setFillColor(236, 72, 153);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Cuterus Health Report', 20, 28);

      y = 50;

      // Patient Info
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Information', 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${user?.name || 'N/A'}`, 20, y); y += 6;
      doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y); y += 6;
      doc.text(`Average Cycle Length: ${avgCycleLength} days`, 20, y); y += 6;
      doc.text(`Period Length: ${user?.periodLength || 5} days`, 20, y); y += 6;
      doc.text(`Current Phase: ${currentPhase?.name || 'N/A'} (Day ${phaseInfo?.totalDay || 'N/A'})`, 20, y);
      y += 12;

      // Cycle History
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Cycle History', 20, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Table header
      doc.setFillColor(253, 242, 248);
      doc.rect(20, y - 4, pageWidth - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Start Date', 25, y);
      doc.text('End Date', 75, y);
      doc.text('Length', 130, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      cycleHistory.slice(0, 6).forEach((cycle) => {
        doc.text(formatDate(cycle.startDate), 25, y);
        doc.text(formatDate(cycle.endDate), 75, y);
        doc.text(`${cycle.length} days`, 130, y);
        y += 6;
      });
      y += 8;

      // Top Symptoms
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Most Frequent Symptoms', 20, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      topSymptoms.forEach((s) => {
        doc.text(`• ${s.name}: ${s.count} occurrences`, 25, y);
        y += 6;
      });
      y += 8;

      // Recent Symptom Log
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Recent Symptom Log', 20, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      symptomsLog.slice(0, 8).forEach((log) => {
        const symptoms = log.symptoms.map(s => {
          const sym = SYMPTOMS.find(sx => sx.id === s);
          return sym?.label || s;
        }).join(', ');
        const severityAvg = Object.values(log.severity).length > 0
          ? (Object.values(log.severity).reduce((a, b) => a + b, 0) / Object.values(log.severity).length).toFixed(1)
          : 'N/A';
        doc.text(`${formatDate(log.date)}: ${symptoms} (Avg severity: ${severityAvg}/5)`, 25, y);
        y += 6;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 8;

      // Patterns & Notes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text('Patterns & Observations', 20, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Average cycle length is ${avgCycleLength} days (${avgCycleLength >= 24 && avgCycleLength <= 35 ? 'within normal range' : 'may need medical attention'})`, 25, y); y += 6;
      doc.text(`• Most common symptom: ${topSymptoms[0]?.name || 'N/A'} (${topSymptoms[0]?.count || 0} occurrences)`, 25, y); y += 6;
      doc.text(`• ${cycleHistory.length} cycles tracked in total`, 25, y); y += 6;
      doc.text(`• ${symptomsLog.length} symptom entries logged`, 25, y);
      y += 12;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by Cuterus • This report is for informational purposes only and does not constitute medical advice.', 20, 285);
      doc.text('Please share with your healthcare provider for professional assessment.', 20, 290);

      // Save
      doc.save(`Cuterus_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 1500);
  };

  const reportSections = [
    { icon: Calendar, title: 'Cycle History', desc: `${cycleHistory.length} cycles tracked`, color: '#ec4899' },
    { icon: Activity, title: 'Symptom Analysis', desc: `${symptomsLog.length} entries logged`, color: '#f59e0b' },
    { icon: TrendingUp, title: 'Patterns & Trends', desc: `Avg ${avgCycleLength}-day cycle`, color: '#22c55e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" />
          Health Report
        </h1>
        <p className="text-gray-500 text-sm mt-1">Generate a doctor-friendly PDF summary of your health data</p>
      </div>

      {/* Preview Card */}
      <div className="glass-card-strong overflow-hidden rounded-3xl">
        {/* Report Header Preview */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold">Cuterus Health Report</h2>
              <p className="text-sm text-white/80 mt-1">
                For {user?.name || 'Patient'} • Generated {new Date().toLocaleDateString()}
              </p>
            </div>
            <FileText className="w-10 h-10 text-white/40" />
          </div>
        </div>

        {/* Report Sections Preview */}
        <div className="p-6 space-y-4">
          {reportSections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/50 border border-gray-100"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: section.color + '20' }}>
                <section.icon className="w-5 h-5" style={{ color: section.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{section.title}</p>
                <p className="text-xs text-gray-500">{section.desc}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </motion.div>
          ))}
        </div>

        {/* Top Symptoms Summary */}
        <div className="px-6 pb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Top Symptoms in Report</p>
          <div className="flex flex-wrap gap-2">
            {topSymptoms.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-medium border border-pink-100">
                {s.emoji} {s.name} ({s.count}x)
              </span>
            ))}
            {topSymptoms.length === 0 && (
              <span className="text-xs text-gray-400">No symptoms logged yet</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            disabled={generating}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Download className="w-4 h-4" />
                </motion.div>
                Generating...
              </>
            ) : generated ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </motion.button>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="glass-card p-4 flex items-start gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-semibold text-gray-700">Privacy First</p>
          <p className="text-xs text-gray-500 mt-0.5">
            This report is generated locally on your device. Your health data is never shared without your explicit consent. 
            Share this report directly with your gynecologist for better care.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
