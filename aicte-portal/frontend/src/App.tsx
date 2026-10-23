import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

// Officer Portal Modules
import OfficerShell from '@/pages/officer/OfficerShell';
import OfficerOverview from '@/pages/officer/OfficerOverview';
import OfficerInstitutions from '@/pages/officer/OfficerInstitutions';
import OfficerEnrolments from '@/pages/officer/OfficerEnrolments';
import OfficerQueue from '@/pages/officer/OfficerQueue';
import OfficerSeatLedger from '@/pages/officer/OfficerSeatLedger';
import OfficerPolicyStudio from '@/pages/officer/OfficerPolicyStudio';
import OfficerIdentityGraph from '@/pages/officer/OfficerIdentityGraph';
import OfficerVerifierPortal from '@/pages/officer/OfficerVerifierPortal';
import OfficerAuditTrail from '@/pages/officer/OfficerAuditTrail';
import OfficerReports from '@/pages/officer/OfficerReports';

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect to Officer Command Centre */}
      <Route path="/" element={<Navigate to="/officer" replace />} />

      {/* AICTE Officer Portal — 10 Modules */}
      <Route path="/officer" element={<OfficerShell />}>
        <Route index                element={<OfficerOverview />} />
        <Route path="institutions"  element={<OfficerInstitutions />} />
        <Route path="enrolments"    element={<OfficerEnrolments />} />
        <Route path="queue"         element={<OfficerQueue />} />
        <Route path="seats"         element={<OfficerSeatLedger />} />
        <Route path="policy"        element={<OfficerPolicyStudio />} />
        <Route path="identity"      element={<OfficerIdentityGraph />} />
        <Route path="verifier"      element={<OfficerVerifierPortal />} />
        <Route path="audit"         element={<OfficerAuditTrail />} />
        <Route path="reports"       element={<OfficerReports />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/officer" replace />} />
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
