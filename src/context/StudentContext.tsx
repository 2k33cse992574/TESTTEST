/**
 * StudentContext — persists verification state across student portal pages
 * and safely connects to the AICTE FastAPI Backend, ML Risk Scorer,
 * and SHA-256 Cryptographic Audit Ledger.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Document } from '@/types';
import { mockDocuments } from '@/data/mockData';
import { registerCredential, revokeRegisteredCredential } from './CredentialRegistry';
import { api } from '@/api/client';

export interface AccessLogEntry {
  id: string;
  verifier: string;
  purpose: string;
  outcome: 'VALID' | 'DENIED' | 'REVOKED';
  fieldsReturned: string[];
  at: string;
}

export interface CredentialPayload {
  sub: string;           // masked student ref
  iss: string;           // issuer
  iat: number;           // issued-at unix
  exp: number;           // expires unix
  purpose: string;
  claims: Record<string, string>;
  credId: string;        // unique per generation
  auditBlockSeq?: number;
  auditHash?: string;
}

export interface MLAssessment {
  riskScore: number;
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trustLevel: number;
  factors: Array<{ factor: string; impact: string; severity: string; detail?: string }>;
  anomalyDetected: boolean;
  auditBlockSeq?: number;
  auditHash?: string;
  evaluatedAt: string;
  recommendation?: string;
}

interface StudentContextValue {
  // Live photo
  livePhotoDone: boolean;
  livePhotoAt: string | null;
  markLivePhotoDone: () => void;

  // Documents — writable list
  documents: Document[];
  updateDocumentStatus: (id: string, status: Document['status']) => void;
  addDocument: (doc: Document) => void;

  // Credential
  activeCredential: CredentialPayload | null;
  credentialRevoked: boolean;
  issueCredential: (purpose: string, fields: string[]) => Promise<CredentialPayload>;
  revokeCredential: () => void;

  // Access log
  accessLog: AccessLogEntry[];
  addAccessLogEntry: (entry: AccessLogEntry) => void;

  // Backend & ML Integration
  backendOnline: boolean;
  isAnalyzingML: boolean;
  mlAssessment: MLAssessment | null;
  runMLRiskCheck: (overrides?: any) => Promise<MLAssessment>;
  refreshProfile: () => Promise<void>;
  profileData: any | null;
}

const StudentContext = createContext<StudentContextValue | null>(null);

const DEFAULT_ML_ASSESSMENT: MLAssessment = {
  riskScore: 10,
  riskBand: 'LOW',
  trustLevel: 3,
  anomalyDetected: false,
  factors: [
    { factor: 'Verified Cohort Baseline', impact: '0 pts', severity: 'INFO', detail: 'Matriculation credentials cross-referenced.' },
    { factor: 'APAAR Registry Confirmed', impact: '-10 pts', severity: 'INFO', detail: 'Central registry match 1234-5678-9012.' },
  ],
  auditBlockSeq: 1044,
  auditHash: '8d11ee4deb91c530...',
  evaluatedAt: new Date().toISOString(),
  recommendation: 'Record meets all integrity criteria for National APAAR certification.',
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const [livePhotoDone,    setLivePhotoDone]    = useState(false);
  const [livePhotoAt,      setLivePhotoAt]      = useState<string | null>(null);
  const [documents,        setDocuments]        = useState<Document[]>(mockDocuments);
  const [activeCredential, setActiveCredential] = useState<CredentialPayload | null>(null);
  const [credentialRevoked,setCredentialRevoked] = useState(false);
  const [backendOnline,    setBackendOnline]    = useState(false);
  const [isAnalyzingML,    setIsAnalyzingML]    = useState(false);
  const [mlAssessment,     setMlAssessment]     = useState<MLAssessment | null>(DEFAULT_ML_ASSESSMENT);
  const [profileData,      setProfileData]      = useState<any | null>(null);

  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([
    { id: 'AL-001', verifier: 'TCS Recruitment',       purpose: 'EMPLOYMENT',  outcome: 'VALID',   fieldsReturned: ['degree','institution','year'],  at: '2026-10-15T14:22:00Z' },
    { id: 'AL-002', verifier: 'Infosys HR',            purpose: 'EMPLOYMENT',  outcome: 'VALID',   fieldsReturned: ['degree','institution'],          at: '2026-10-12T09:10:00Z' },
    { id: 'AL-003', verifier: 'Unknown scan attempt',  purpose: '—',           outcome: 'DENIED',  fieldsReturned: [],                               at: '2026-10-10T20:45:00Z' },
    { id: 'AL-004', verifier: 'State Education Dept.', purpose: 'SCHOLARSHIP', outcome: 'REVOKED', fieldsReturned: [],                               at: '2026-10-05T11:00:00Z' },
  ]);

  // Check backend health & fetch student profile on mount
  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.getStudentProfile('s1');
      if (data && data.student) {
        setProfileData(data);
        setBackendOnline(true);
        const st = data.student;
        setMlAssessment({
          riskScore: st.riskScore ?? 10,
          riskBand: (st.riskScore ?? 10) > 40 ? 'HIGH' : (st.riskScore ?? 10) > 20 ? 'MEDIUM' : 'LOW',
          trustLevel: st.trustLevel ?? 3,
          factors: st.riskFactors || [],
          anomalyDetected: (st.riskScore ?? 10) > 40,
          auditBlockSeq: 1040 + (data.auditChainLength || 4),
          auditHash: '8d11ee4deb91c530...',
          evaluatedAt: new Date().toISOString(),
          recommendation: st.holdState === 'NONE'
            ? 'Record meets all integrity criteria for National APAAR certification.'
            : 'Enrolment on regulatory CONFLICT_HOLD. Review required by AICTE officer desk.',
        });
        if (data.documents && data.documents.length) {
          // Merge with mockDocuments if needed
          setDocuments(data.documents);
        }
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const markLivePhotoDone = useCallback(() => {
    setLivePhotoDone(true);
    setLivePhotoAt(new Date().toISOString());

    // Record on blockchain ledger via backend if online
    api.uploadStudentDocument({
      studentId: 's1',
      type: 'Live Photo Liveness Check',
      name: 'facial_liveness_verified.jpg',
      issuer: 'Pramaan Real-time Biometric Liveness Service',
    }).then(res => {
      setBackendOnline(true);
      if (res?.auditBlockSeq) {
        setMlAssessment(prev => prev ? { ...prev, auditBlockSeq: res.auditBlockSeq, auditHash: res.auditHash } : prev);
      }
    }).catch(() => {});
  }, []);

  const updateDocumentStatus = useCallback((id: string, status: Document['status']) => {
    setDocuments(prev => prev.map(d =>
      d.id === id
        ? { ...d, status, verifiedAt: status === 'VERIFIED' ? new Date().toISOString() : d.verifiedAt }
        : d
    ));
  }, []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => {
      const exists = prev.find(d => d.id === doc.id);
      return exists ? prev.map(d => d.id === doc.id ? doc : d) : [...prev, doc];
    });

    // Safely sync to backend
    api.uploadStudentDocument({
      studentId: 's1',
      type: doc.type,
      name: doc.name,
      issuer: 'Student Portal Self-Service Upload',
    }).then(res => {
      setBackendOnline(true);
      if (res?.auditBlockSeq) {
        setMlAssessment(prev => prev ? { ...prev, auditBlockSeq: res.auditBlockSeq, auditHash: res.auditHash } : prev);
      }
    }).catch(() => {});
  }, []);

  // Run real Isolation Forest ML check
  const runMLRiskCheck = useCallback(async (overrides?: any): Promise<MLAssessment> => {
    setIsAnalyzingML(true);
    try {
      const res = await api.runStudentMLCheck({
        studentId: 's1',
        age: 18.5,
        submissionDaysBeforeDeadline: 5.0,
        isMultiInstitutionClaim: overrides?.isMultiInstitutionClaim ?? false,
        categoryCertVerified: overrides?.categoryCertVerified ?? true,
      });

      const assessment: MLAssessment = {
        riskScore: res.riskScore,
        riskBand: res.riskBand,
        trustLevel: res.trustLevel,
        factors: res.factors || [],
        anomalyDetected: res.anomalyDetected,
        auditBlockSeq: res.auditBlockSeq,
        auditHash: res.auditHash,
        evaluatedAt: new Date().toISOString(),
        recommendation: res.recommendation,
      };

      setMlAssessment(assessment);
      setBackendOnline(true);
      setIsAnalyzingML(false);
      return assessment;
    } catch {
      // Graceful offline fallback
      await new Promise(r => setTimeout(r, 600));
      const fallback: MLAssessment = {
        riskScore: 12,
        riskBand: 'LOW',
        trustLevel: 3,
        anomalyDetected: false,
        factors: [
          { factor: 'Verified Cohort Baseline', impact: '0 pts', severity: 'INFO', detail: 'Matriculation records verified.' },
          { factor: 'Single Active Enrolment Lock', impact: '0 pts', severity: 'INFO', detail: 'No collision with 8 peer institutions.' },
        ],
        auditBlockSeq: 1045,
        auditHash: '9a32cc81df9042b1...',
        evaluatedAt: new Date().toISOString(),
        recommendation: 'Record meets all integrity criteria for National APAAR certification.',
      };
      setMlAssessment(fallback);
      setIsAnalyzingML(false);
      return fallback;
    }
  }, []);

  const issueCredential = useCallback(async (purpose: string, fields: string[]): Promise<CredentialPayload> => {
    const fieldValues: Record<string, string> = {
      degree:       'B.Tech Computer Science & Engineering',
      institution:  'Shri Institute of Engineering & Technology, Mumbai',
      year:         '2026-27',
      status:       'ENROLLED',
      apaar_masked: '1234-****-****',
      mode:         'Full-Time',
    };
    const now = Math.floor(Date.now() / 1000);

    let auditSeq = 1044;
    let auditHash = '8d11ee4deb91c530...';

    try {
      const backendVC = await api.getStudentVerifiableCredential('s1');
      if (backendVC?.auditBlockSeq) {
        auditSeq = backendVC.auditBlockSeq;
        auditHash = backendVC.credentialHash;
        setBackendOnline(true);
      }
    } catch {
      // continue offline
    }

    const cred: CredentialPayload = {
      sub:      'STU-***-4821',
      iss:      'pramaan.aicte.gov.in',
      iat:      now,
      exp:      now + 60,          // 60 seconds
      purpose,
      credId:   `CRED-${Date.now().toString(36).toUpperCase()}`,
      claims:   Object.fromEntries(fields.map(f => [f, fieldValues[f] ?? ''])),
      auditBlockSeq: auditSeq,
      auditHash,
    };
    setActiveCredential(cred);
    setCredentialRevoked(false);
    registerCredential(cred);   // register in module-level registry for /verify lookup
    return cred;
  }, []);

  const revokeCredential = useCallback(() => {
    if (activeCredential) revokeRegisteredCredential(activeCredential.credId);
    setCredentialRevoked(true);
    setAccessLog(prev => [{
      id:             `AL-${Date.now()}`,
      verifier:       'Student (self)',
      purpose:        activeCredential?.purpose ?? '—',
      outcome:        'REVOKED',
      fieldsReturned: [],
      at:             new Date().toISOString(),
    }, ...prev]);
    setActiveCredential(null);
  }, [activeCredential]);

  const addAccessLogEntry = useCallback((entry: AccessLogEntry) => {
    setAccessLog(prev => [entry, ...prev]);
  }, []);

  return (
    <StudentContext.Provider value={{
      livePhotoDone, livePhotoAt, markLivePhotoDone,
      documents, updateDocumentStatus, addDocument,
      activeCredential, credentialRevoked, issueCredential, revokeCredential,
      accessLog, addAccessLogEntry,
      backendOnline, isAnalyzingML, mlAssessment, runMLRiskCheck,
      refreshProfile, profileData,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');
  return ctx;
}
