import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import ChatHistory from './pages/ChatHistory';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CompanyInterview from './pages/CompanyInterview';
import JDInterview from './pages/JDInterview';
import BehavioralInterview from './pages/BehavioralInterview';
import InterviewReport from './pages/InterviewReport';

const FullPageSpinner = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-500 animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Landing />;

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route path="/" element={<HomeRoute />} />
      <Route path="/interview/:id?" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
      <Route path="/reports/:id" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/company-interview" element={<ProtectedRoute><CompanyInterview /></ProtectedRoute>} />
      <Route path="/jd-interview" element={<ProtectedRoute><JDInterview /></ProtectedRoute>} />
      <Route path="/behavioral" element={<ProtectedRoute><BehavioralInterview /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
