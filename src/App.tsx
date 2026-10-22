import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

// Auth
import LoginPage from '@/pages/auth/LoginPage';

// Student
import StudentShell from '@/pages/student/StudentShell';
import StudentOverview from '@/pages/student/StudentOverview';
import StudentDetails from '@/pages/student/StudentDetails';
import StudentDocuments from '@/pages/student/StudentDocuments';
import StudentRequests from '@/pages/student/StudentRequests';
import StudentHelp from '@/pages/student/StudentHelp';

// Institution
import InstitutionShell from '@/pages/institution/InstitutionShell';
import InstitutionOverview from '@/pages/institution/InstitutionOverview';
import InstitutionStudents from '@/pages/institution/InstitutionStudents';
import InstitutionSubmissions from '@/pages/institution/InstitutionSubmissions';
import InstitutionIntegrity from '@/pages/institution/InstitutionIntegrity';
import InstitutionCases from '@/pages/institution/InstitutionCases';
import InstitutionReports from '@/pages/institution/InstitutionReports';

// Officer
import OfficerShell from '@/pages/officer/OfficerShell';
import OfficerOverview from '@/pages/officer/OfficerOverview';
import OfficerInstitutions from '@/pages/officer/OfficerInstitutions';
import OfficerEnrolments from '@/pages/officer/OfficerEnrolments';
import OfficerQueue from '@/pages/officer/OfficerQueue';
import OfficerSeatLedger from '@/pages/officer/OfficerSeatLedger';
import OfficerReports from '@/pages/officer/OfficerReports';

function RequireAuth({ children, role }: { children: ReactNode; role?: string }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    // redirect to correct portal
    const dest =
      user?.role === 'student' ? '/student' :
      user?.role === 'institution' ? '/institution' : '/officer';
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'student')     return <Navigate to="/student" replace />;
  if (user?.role === 'institution') return <Navigate to="/institution" replace />;
  if (user?.role === 'officer')     return <Navigate to="/officer" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Student portal */}
      <Route path="/student" element={
        <RequireAuth role="student"><StudentShell /></RequireAuth>
      }>
        <Route index         element={<StudentOverview />} />
        <Route path="details"   element={<StudentDetails />} />
        <Route path="documents" element={<StudentDocuments />} />
        <Route path="requests"  element={<StudentRequests />} />
        <Route path="help"      element={<StudentHelp />} />
      </Route>

      {/* Institution portal */}
      <Route path="/institution" element={
        <RequireAuth role="institution"><InstitutionShell /></RequireAuth>
      }>
        <Route index              element={<InstitutionOverview />} />
        <Route path="students"    element={<InstitutionStudents />} />
        <Route path="submissions" element={<InstitutionSubmissions />} />
        <Route path="integrity"   element={<InstitutionIntegrity />} />
        <Route path="cases"       element={<InstitutionCases />} />
        <Route path="reports"     element={<InstitutionReports />} />
      </Route>

      {/* Officer portal */}
      <Route path="/officer" element={
        <RequireAuth role="officer"><OfficerShell /></RequireAuth>
      }>
        <Route index                element={<OfficerOverview />} />
        <Route path="institutions"  element={<OfficerInstitutions />} />
        <Route path="enrolments"    element={<OfficerEnrolments />} />
        <Route path="queue"         element={<OfficerQueue />} />
        <Route path="seats"         element={<OfficerSeatLedger />} />
        <Route path="reports"       element={<OfficerReports />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
