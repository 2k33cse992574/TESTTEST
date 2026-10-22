/**
 * StudentContext — persists verification state across student portal pages.
 * Live photo result, document statuses, credential/revocation state, and
 * access log all live here so they survive route transitions.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Document } from '@/types';
import { mockDocuments } from '@/data/mockData';

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
  issueCredential: (purpose: string, fields: string[]) => CredentialPayload;
  revokeCredential: () => void;

  // Access log
  accessLog: AccessLogEntry[];
  addAccessLogEntry: (entry: AccessLogEntry) => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [livePhotoDone,  setLivePhotoDone]  = useState(false);
  const [livePhotoAt,    setLivePhotoAt]    = useState<string | null>(null);
  const [documents,      setDocuments]      = useState<Document[]>(mockDocuments);
  const [activeCredential, setActiveCredential] = useState<CredentialPayload | null>(null);
  const [credentialRevoked,setCredentialRevoked] = useState(false);
  const [accessLog,      setAccessLog]      = useState<AccessLogEntry[]>([
    { id: 'AL-001', verifier: 'TCS Recruitment',       purpose: 'EMPLOYMENT',  outcome: 'VALID',   fieldsReturned: ['degree','institution','year'],  at: '2026-10-15T14:22:00Z' },
    { id: 'AL-002', verifier: 'Infosys HR',            purpose: 'EMPLOYMENT',  outcome: 'VALID',   fieldsReturned: ['degree','institution'],          at: '2026-10-12T09:10:00Z' },
    { id: 'AL-003', verifier: 'Unknown scan attempt',  purpose: '—',           outcome: 'DENIED',  fieldsReturned: [],                               at: '2026-10-10T20:45:00Z' },
    { id: 'AL-004', verifier: 'State Education Dept.', purpose: 'SCHOLARSHIP', outcome: 'REVOKED', fieldsReturned: [],                               at: '2026-10-05T11:00:00Z' },
  ]);

  const markLivePhotoDone = useCallback(() => {
    setLivePhotoDone(true);
    setLivePhotoAt(new Date().toISOString());
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
  }, []);

  const issueCredential = useCallback((purpose: string, fields: string[]): CredentialPayload => {
    const fieldValues: Record<string, string> = {
      degree:       'B.Tech Computer Science & Engineering',
      institution:  'Shri Institute of Engineering & Technology, Mumbai',
      year:         '2026-27',
      status:       'ENROLLED',
      apaar_masked: '1234-****-****',
      mode:         'Full-Time',
    };
    const now = Math.floor(Date.now() / 1000);
    const cred: CredentialPayload = {
      sub:      'STU-***-4821',
      iss:      'pramaan.aicte.gov.in',
      iat:      now,
      exp:      now + 60,          // 60 seconds
      purpose,
      credId:   `CRED-${Date.now().toString(36).toUpperCase()}`,
      claims:   Object.fromEntries(fields.map(f => [f, fieldValues[f] ?? ''])),
    };
    setActiveCredential(cred);
    setCredentialRevoked(false);
    return cred;
  }, []);

  const revokeCredential = useCallback(() => {
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
