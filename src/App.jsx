import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CycleCalendar from './pages/CycleCalendar';
import SymptomTracker from './pages/SymptomTracker';
import ChatPage from './pages/ChatPage';
import HealthReport from './pages/HealthReport';
import WorkWellness from './pages/WorkWellness';
import HRDashboard from './pages/HRDashboard';
import MythsFactsPage from './pages/MythsFactsPage';
import SettingsPage from './pages/SettingsPage';
import MonitoringDashboard from './pages/MonitoringDashboard';
import SleepTrackerPage from './pages/SleepTrackerPage';
import StressManagementPage from './pages/StressManagementPage';
import WorkoutPage from './pages/WorkoutPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'hr' ? '/hr' : user.role === 'monitor' ? '/monitoring' : '/dashboard'} replace /> : <LoginPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['personal', 'employee']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="cycle" element={<CycleCalendar />} />
        <Route path="symptoms" element={<SymptomTracker />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="report" element={<HealthReport />} />
        <Route path="work-wellness" element={<WorkWellness />} />
        <Route path="myths" element={<MythsFactsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="sleep" element={<SleepTrackerPage />} />
        <Route path="stress" element={<StressManagementPage />} />
        <Route path="workouts" element={<WorkoutPage />} />
      </Route>

      <Route path="/hr" element={
        <ProtectedRoute allowedRoles={['hr']}>
          <HRDashboard />
        </ProtectedRoute>
      } />

      <Route path="/monitoring" element={
        <ProtectedRoute allowedRoles={['monitor', 'hr']}>
          <MonitoringDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}
