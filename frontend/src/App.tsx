import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import ChatHistory from './pages/ChatHistory';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CompanyInterview from './pages/CompanyInterview';
import JDInterview from './pages/JDInterview';

// Protected Route Wrapper - Sirf logged in users ke liye
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/interview/:id?" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="/company-interview" element={<ProtectedRoute><CompanyInterview /></ProtectedRoute>} />
      <Route path="/jd-interview" element={<ProtectedRoute><JDInterview /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
