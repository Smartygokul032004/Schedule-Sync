import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { PublicSchedule } from './pages/PublicSchedule';
import { FacultyProfile } from './pages/FacultyProfile';
import { StudentProfile } from './pages/StudentProfile';
import { ProfileSettings } from './pages/ProfileSettings';
import { FacultyBookings } from './pages/FacultyBookings';
import { StudentBookings } from './pages/StudentBookings';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><span className="text-white">Loading...</span></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={token ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/public/schedule/:token" element={<PublicSchedule />} />
      <Route path="/faculty/profile/:facultyId" element={<FacultyProfile />} />
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/bookings"
        element={
          <ProtectedRoute requiredRole="faculty">
            <FacultyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/bookings"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentBookings />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={token ? <Navigate to={user?.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
