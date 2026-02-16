import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DoctorLayout from './components/layout/DoctorLayout';
import PatientLayout from './components/layout/PatientLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/doctor/Dashboard';
import Patients from './pages/doctor/Patients';
import AccessManager from './pages/doctor/AccessManager';
import PatientDashboard from './pages/patient/Dashboard';
import AiScan from './pages/patient/AiScan';
import SecureVault from './pages/patient/SecureVault';
import PillTracker from './pages/patient/PillTracker';
import ShareAccess from './pages/patient/ShareAccess';
import ReportSummary from './pages/patient/ReportSummary';
import PatientDetails from './pages/doctor/PatientDetails';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Simple wrapper component to handle context
const LayoutWrapper = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

function App() {
  return (
    <LayoutWrapper>
      <Router>
        <Routes>
          {/* Auth Route */}
          <Route path="/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="access" element={<AccessManager />} />
            <Route path="patient-details" element={<PatientDetails />} />
          </Route>
          
          {/* Patient Route */}
          <Route path="/patient" element={
            <ProtectedRoute requiredRole="patient">
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PatientDashboard />} />
            <Route path="ai-scan" element={<AiScan />} />
            <Route path="secure-vault" element={<SecureVault />} />
            <Route path="pill-tracker" element={<PillTracker />} />
            <Route path="share-access" element={<ShareAccess />} />
            <Route path="report-summary" element={<ReportSummary />} />
          </Route>
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LayoutWrapper>
  );
}


export default App;
