/**
 * APAAR-Pramaan Unified API Client
 * Seamlessly connects both AICTE Officer Portal and Student Portal
 * to the FastAPI Backend and ML Engines with full TypeScript typings.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.warn(`[API] Error fetching ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // ── 1. AICTE Overview ──────────────────────────────────────────
  getOverviewMetrics: () => request<any[]>('/api/overview/metrics'),
  getEnrolmentTrend: () => request<any[]>('/api/overview/enrolment-trend'),
  getTrustDistribution: () => request<any[]>('/api/overview/trust-distribution'),
  getCasesByType: () => request<any[]>('/api/overview/cases-by-type'),
  getRegionalDistribution: () => request<any[]>('/api/overview/regional-distribution'),
  getCriticalCases: () => request<any[]>('/api/overview/critical-cases'),
  getRiskInstitutions: () => request<any[]>('/api/overview/risk-institutions'),
  getTimeline: () => request<any[]>('/api/overview/timeline'),

  // ── 2. AICTE Institutions ──────────────────────────────────────
  getInstitutions: (params?: { search?: string; state_filter?: string; band?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.state_filter) q.append('state_filter', params.state_filter);
    if (params?.band) q.append('band', params.band);
    return request<any[]>(`/api/institutions?${q.toString()}`);
  },
  getInstitution: (id: string) => request<any>(`/api/institutions/${id}`),
  takeInstitutionAction: (id: string, body: { action: string; reason: string; officerName: string }) =>
    request<any>(`/api/institutions/${id}/action`, { method: 'POST', body: JSON.stringify(body) }),

  // ── 3. AICTE Central Enrolments ────────────────────────────────
  getEnrolments: (params?: { search?: string; institutionId?: string; trustLevel?: number; holdState?: string; minRisk?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.institutionId) q.append('institutionId', params.institutionId);
    if (params?.trustLevel !== undefined) q.append('trustLevel', String(params.trustLevel));
    if (params?.holdState) q.append('holdState', params.holdState);
    if (params?.minRisk !== undefined) q.append('minRisk', String(params.minRisk));
    return request<any[]>(`/api/enrolments?${q.toString()}`);
  },
  getStudent: (id: string) => request<any>(`/api/enrolments/${id}`),
  toggleHold: (id: string, body: { holdState: string; reason: string; officerName: string }) =>
    request<any>(`/api/enrolments/${id}/toggle-hold`, { method: 'POST', body: JSON.stringify(body) }),
  predictRisk: (body: { age: number; submissionDaysBeforeDeadline: number; hasApaar: boolean; isMultiInstitutionClaim: boolean; poolMismatch: boolean; categoryCertVerified: boolean }) =>
    request<any>('/api/enrolments/predict-risk', { method: 'POST', body: JSON.stringify(body) }),

  // ── 4. AICTE Integrity Queue ───────────────────────────────────
  getQueue: (filterMode: string = 'all') => request<any[]>(`/api/queue?filter_mode=${filterMode}`),
  getCase: (id: string) => request<any>(`/api/queue/${id}`),
  submitDecision: (id: string, body: { decision: string; rationale: string; officerName: string }) =>
    request<any>(`/api/queue/${id}/decision`, { method: 'POST', body: JSON.stringify(body) }),

  // ── 5. AICTE Seat Ledger ───────────────────────────────────────
  getSeatSummary: () => request<any>('/api/seats/summary'),
  getInstitutionSeats: () => request<any[]>('/api/seats/institutions'),
  getSeatPools: () => request<any[]>('/api/seats/pools'),

  // ── 6. AICTE Policy Studio ─────────────────────────────────────
  getPolicyRules: () => request<any[]>('/api/policy/rules'),
  updateRuleStage: (id: string, body: { newStage: string; rationale: string; officerName: string }) =>
    request<any>(`/api/policy/rules/${id}/stage`, { method: 'POST', body: JSON.stringify(body) }),
  runBacktest: () => request<any>('/api/policy/backtest', { method: 'POST' }),
  simulateCaps: (body: { nriCapPercent: number; fnCapPercent: number }) =>
    request<any>('/api/policy/simulate-caps', { method: 'POST', body: JSON.stringify(body) }),

  // ── 7. AICTE Identity Graph & Fuzzy Match ───────────────────────
  getIdentityRecords: (search?: string) => request<any[]>(`/api/identity/records${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getMergeJournal: () => request<any[]>('/api/identity/journal'),
  mergeIdentities: (body: { survivorId: string; absorbedId: string; rationale: string; officerName: string }) =>
    request<any>('/api/identity/merge', { method: 'POST', body: JSON.stringify(body) }),
  undoMerge: (journalId: string, officerName?: string) =>
    request<any>(`/api/identity/undo-merge/${journalId}?officer_name=${encodeURIComponent(officerName || 'Shri Rajesh Kumar')}`, { method: 'POST' }),
  fuzzyCheck: (record1: any, record2: any) =>
    request<any>('/api/identity/fuzzy-check', { method: 'POST', body: JSON.stringify({ record1, record2 }) }),

  // ── 8. AICTE Verifier Portal ───────────────────────────────────
  getVerifiers: (search?: string) => request<any[]>(`/api/verifier/list${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getVerificationLogs: () => request<any[]>('/api/verifier/logs'),
  updateVerifierStatus: (id: string, body: { status: string; officerName: string }) =>
    request<any>(`/api/verifier/${id}/status`, { method: 'POST', body: JSON.stringify(body) }),
  updateVerifierQuota: (id: string, body: { quotaDaily: number }) =>
    request<any>(`/api/verifier/${id}/quota`, { method: 'POST', body: JSON.stringify(body) }),
  simulateVerification: (body: { verifierId: string; studentRef: string; purpose: string; consentRef: string }) =>
    request<any>('/api/verifier/simulate-verify', { method: 'POST', body: JSON.stringify(body) }),

  // ── 9. AICTE Audit Trail & SHA-256 Ledger ──────────────────────
  getAuditChain: (search?: string) => request<any[]>(`/api/audit/chain${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  verifyAuditChain: () => request<any>('/api/audit/verify'),
  simulateTamper: (body: { seq: number; tamperedActor?: string; tamperedAction?: string }) =>
    request<any>('/api/audit/tamper', { method: 'POST', body: JSON.stringify(body) }),
  restoreAuditChain: () => request<any>('/api/audit/restore', { method: 'POST' }),
  timeMachineReplay: (asOf: string) => request<any>(`/api/audit/time-machine?as_of=${encodeURIComponent(asOf)}`),

  // ── 10. AICTE Reports & Downloads ──────────────────────────────
  getReportsList: () => request<any[]>('/api/reports/list'),
  downloadReport: async (reportId: string, filename?: string) => {
    const res = await fetch(`${BASE_URL}/api/reports/download/${reportId}`);
    if (!res.ok) throw new Error('Failed to download report');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || `${reportId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    a.remove();
  },

  // ── 11. Student Portal Backend & ML Flow ───────────────────────
  getStudentProfile: (studentId: string = 's1') =>
    request<any>(`/api/student/me?student_id=${encodeURIComponent(studentId)}`),

  runStudentMLCheck: (params: {
    studentId?: string;
    age?: number;
    submissionDaysBeforeDeadline?: number;
    isMultiInstitutionClaim?: boolean;
    categoryCertVerified?: boolean;
  }) =>
    request<any>('/api/student/ml-check', {
      method: 'POST',
      body: JSON.stringify({
        studentId: params.studentId || 's1',
        age: params.age ?? 18.5,
        submissionDaysBeforeDeadline: params.submissionDaysBeforeDeadline ?? 5.0,
        isMultiInstitutionClaim: params.isMultiInstitutionClaim ?? false,
        categoryCertVerified: params.categoryCertVerified ?? true,
      }),
    }),

  getStudentDocuments: (studentId: string = 's1') =>
    request<any>(`/api/student/documents?student_id=${encodeURIComponent(studentId)}`),

  uploadStudentDocument: (body: {
    studentId?: string;
    type: string;
    name: string;
    rawContent?: string;
    issuer?: string;
  }) =>
    request<any>('/api/student/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        studentId: body.studentId || 's1',
        type: body.type,
        name: body.name,
        rawContent: body.rawContent || '',
        issuer: body.issuer || 'Candidate Self-Upload via Pramaan Portal',
      }),
    }),

  getStudentVerifiableCredential: (studentId: string = 's1') =>
    request<any>(`/api/student/verifiable-credential?student_id=${encodeURIComponent(studentId)}`),

  getStudentRequests: (studentId: string = 's1') =>
    request<any>(`/api/student/requests?student_id=${encodeURIComponent(studentId)}`),

  createStudentRequest: (body: {
    studentId?: string;
    type: string;
    title: string;
    detail: string;
  }) =>
    request<any>('/api/student/requests', {
      method: 'POST',
      body: JSON.stringify({
        studentId: body.studentId || 's1',
        type: body.type,
        title: body.title,
        detail: body.detail,
      }),
    }),

  getStudentTimeline: (studentId: string = 's1') =>
    request<any>(`/api/student/timeline?student_id=${encodeURIComponent(studentId)}`),

  studentEnrol: (body: any) =>
    request<any>('/api/student/enrol', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
