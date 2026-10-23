import type {
  Student, Institution, Case, Submission, Document,
  TimelineEvent, ChartDataPoint, SeatPool,
} from '@/types';

// ─── Students ───────────────────────────────────────────────────────────────
export const mockStudents: Student[] = [
  { id: 's1', maskedId: 'STU-***-4821', name: 'Arjun Sharma',    apaarId: '1234-5678-9012', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'B.Tech CSE',     academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 3, admissionDate: '2026-08-01', poolCode: 'REGULAR',       riskScore: 12, lastUpdated: '2026-10-10' },
  { id: 's2', maskedId: 'STU-***-3317', name: 'Meera Patel',     apaarId: '2345-6789-0123', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'B.Tech ECE',     academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 2, admissionDate: '2026-08-03', poolCode: 'REGULAR',       riskScore: 8,  lastUpdated: '2026-10-12' },
  { id: 's3', maskedId: 'STU-***-7749', name: 'Rahul Verma',     apaarId: '3456-7890-1234', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'B.Tech Mech',    academicYear: '2026-27', status: 'ADMITTED',    holdState: 'CONFLICT_HOLD', trustLevel: 1, admissionDate: '2026-08-10', poolCode: 'REGULAR',       riskScore: 74, lastUpdated: '2026-10-18' },
  { id: 's4', maskedId: 'STU-***-2205', name: 'Sneha Kulkarni',  apaarId: '4567-8901-2345', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'M.Tech AI',      academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 3, admissionDate: '2026-08-05', poolCode: 'REGULAR',       riskScore: 5,  lastUpdated: '2026-10-14' },
  { id: 's5', maskedId: 'STU-***-9934', name: 'Omar Al-Hassan',                              institutionId: 'INST-KA-0021', institutionName: 'RV College Bengaluru',  programme: 'B.Tech CSE',     academicYear: '2026-27', status: 'ENROLLED',    holdState: 'IDENTITY_HOLD', trustLevel: 1, admissionDate: '2026-09-01', poolCode: 'FN',            riskScore: 45, lastUpdated: '2026-10-05' },
  { id: 's6', maskedId: 'STU-***-6612', name: 'Priya Menon',     apaarId: '5678-9012-3456', institutionId: 'INST-KA-0021', institutionName: 'RV College Bengaluru',  programme: 'B.Tech CSE',     academicYear: '2026-27', status: 'CONTINUING',  holdState: 'NONE',          trustLevel: 4, admissionDate: '2025-08-01', poolCode: 'REGULAR',       riskScore: 3,  lastUpdated: '2026-09-30' },
  { id: 's7', maskedId: 'STU-***-8801', name: 'Kiran Reddy',     apaarId: '6789-0123-4567', institutionId: 'INST-TS-0015', institutionName: 'JNTU Hyderabad',        programme: 'B.Tech IT',      academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 2, admissionDate: '2026-08-15', poolCode: 'NRI',           riskScore: 18, lastUpdated: '2026-10-09' },
  { id: 's8', maskedId: 'STU-***-1123', name: 'Ananya Roy',      apaarId: '7890-1234-5678', institutionId: 'INST-WB-0009', institutionName: 'Jadavpur University',   programme: 'B.Tech Chem',    academicYear: '2026-27', status: 'WITHDRAWN',   holdState: 'NONE',          trustLevel: 2, admissionDate: '2026-08-02', poolCode: 'REGULAR',       riskScore: 0,  lastUpdated: '2026-09-20' },
  { id: 's9', maskedId: 'STU-***-5571', name: 'Vikram Joshi',    apaarId: '8901-2345-6789', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'B.Tech CSE',     academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 3, admissionDate: '2026-08-04', poolCode: 'REGULAR',       riskScore: 22, lastUpdated: '2026-10-15' },
  { id:'s10', maskedId: 'STU-***-4490', name: 'Nisha Gupta',     apaarId: '9012-3456-7890', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',           programme: 'B.Tech ECE',     academicYear: '2026-27', status: 'CONTINUING',  holdState: 'NONE',          trustLevel: 3, admissionDate: '2025-08-01', poolCode: 'REGULAR',       riskScore: 7,  lastUpdated: '2026-10-01' },
  { id:'s11', maskedId: 'STU-***-3382', name: 'Tanmay Desh.',    apaarId: '0123-4567-8901', institutionId: 'INST-GJ-0037', institutionName: 'DDIT Nadiad',           programme: 'B.Tech Civil',   academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 2, admissionDate: '2026-08-10', poolCode: 'REGULAR',       riskScore: 14, lastUpdated: '2026-10-11' },
  { id:'s12', maskedId: 'STU-***-7761', name: 'Lakshmi Iyer',    apaarId: '1234-5678-2222', institutionId: 'INST-TN-0088', institutionName: 'Anna University',       programme: 'M.Tech VLSI',    academicYear: '2026-27', status: 'ENROLLED',    holdState: 'NONE',          trustLevel: 4, admissionDate: '2026-08-20', poolCode: 'REGULAR',       riskScore: 2,  lastUpdated: '2026-10-20' },
];

// ─── Institutions ────────────────────────────────────────────────────────────
export const mockInstitutions: Institution[] = [
  { id: 'INST-MH-0042', name: 'Shri Institute of Engineering & Technology', state: 'Maharashtra', district: 'Mumbai', region: 'West', type: 'Private', status: 'ACTIVE', approvedIntake: 240, enrolledCount: 231, verifiedCount: 198, openCases: 3, integrityBand: 'B', integrityScore: 82, lastSubmission: '2026-10-18' },
  { id: 'INST-KA-0021', name: 'RV College of Engineering',                  state: 'Karnataka',   district: 'Bengaluru', region: 'South', type: 'Private', status: 'ACTIVE', approvedIntake: 480, enrolledCount: 462, verifiedCount: 451, openCases: 1, integrityBand: 'A', integrityScore: 94, lastSubmission: '2026-10-15' },
  { id: 'INST-TS-0015', name: 'JNTU College of Engineering Hyderabad',       state: 'Telangana',   district: 'Hyderabad', region: 'South', type: 'Government', status: 'ACTIVE', approvedIntake: 360, enrolledCount: 394, verifiedCount: 310, openCases: 7, integrityBand: 'C', integrityScore: 61, lastSubmission: '2026-10-10' },
  { id: 'INST-WB-0009', name: 'Jadavpur University',                         state: 'West Bengal', district: 'Kolkata', region: 'East', type: 'Government', status: 'ACTIVE', approvedIntake: 300, enrolledCount: 287, verifiedCount: 280, openCases: 0, integrityBand: 'A', integrityScore: 97, lastSubmission: '2026-10-20' },
  { id: 'INST-GJ-0037', name: 'Dharmsinh Desai Institute of Technology',     state: 'Gujarat',     district: 'Nadiad', region: 'West', type: 'Private', status: 'ACTIVE', approvedIntake: 180, enrolledCount: 175, verifiedCount: 141, openCases: 2, integrityBand: 'B', integrityScore: 78, lastSubmission: '2026-10-12' },
  { id: 'INST-TN-0088', name: 'Anna University',                             state: 'Tamil Nadu',  district: 'Chennai', region: 'South', type: 'Government', status: 'ACTIVE', approvedIntake: 600, enrolledCount: 598, verifiedCount: 590, openCases: 0, integrityBand: 'A', integrityScore: 99, lastSubmission: '2026-10-21' },
  { id: 'INST-UP-0055', name: 'Harcourt Butler Technical University',        state: 'Uttar Pradesh', district: 'Kanpur', region: 'North', type: 'Government', status: 'ACTIVE', approvedIntake: 420, enrolledCount: 488, verifiedCount: 312, openCases: 12, integrityBand: 'D', integrityScore: 44, lastSubmission: '2026-09-30' },
  { id: 'INST-RJ-0018', name: 'Malaviya National Institute of Technology',   state: 'Rajasthan',   district: 'Jaipur', region: 'North', type: 'NIT', status: 'ACTIVE', approvedIntake: 360, enrolledCount: 358, verifiedCount: 350, openCases: 0, integrityBand: 'A', integrityScore: 96, lastSubmission: '2026-10-19' },
];

// ─── Cases ───────────────────────────────────────────────────────────────────
export const mockCases: Case[] = [
  { id: 'C-0042', caseType: 'DUP_ENROLMENT',      severity: 'HIGH',     institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',    subjectType: 'student',     subjectId: 's3',  reasonCodes: ['LOCK_VIOLATION', 'APAAR_CONFLICT'],           status: 'UnderReview',         assignedTo: 'Shri Rajesh Kumar', slaDueAt: '2026-10-22', openedAt: '2026-10-18', description: 'Student has active full-time enrolment at SIET Mumbai and another institution. Holding new claim pending mediation.' },
  { id: 'C-0039', caseType: 'INTAKE_BREACH',       severity: 'HIGH',     institutionId: 'INST-TS-0015', institutionName: 'JNTU Hyderabad', subjectType: 'seat_pool',   subjectId: 'REGULAR-2026', reasonCodes: ['POOL_OVER_CAP'],                         status: 'AwaitingInstitution', assignedTo: 'Shri Rajesh Kumar', slaDueAt: '2026-10-24', openedAt: '2026-10-10', description: 'REGULAR pool exceeded approved intake by 34 records. Institution must provide justification or withdraw excess admissions.' },
  { id: 'C-0036', caseType: 'DATA_MISMATCH',       severity: 'MEDIUM',   institutionId: 'INST-GJ-0037', institutionName: 'DDIT Nadiad',    subjectType: 'student',     subjectId: 's11', reasonCodes: ['NAME_DOB_MISMATCH', 'APAAR_VERIFY_FAIL'],    status: 'Open',                slaDueAt: '2026-10-25', openedAt: '2026-10-14', description: 'Student name in submission (Tanmay Deshpande) differs from APAAR registry. Jaro-Winkler similarity: 0.71. Manual review required.' },
  { id: 'C-0031', caseType: 'DECLARATION_MISMATCH',severity: 'MEDIUM',   institutionId: 'INST-UP-0055', institutionName: 'HBTU Kanpur',    subjectType: 'institution', subjectId: 'INST-UP-0055', reasonCodes: ['DECLARED_VS_DERIVED_GAP'],            status: 'Escalated',           assignedTo: 'Shri Rajesh Kumar', slaDueAt: '2026-10-20', openedAt: '2026-09-28', description: 'Declared enrolment (420) differs from student-row derived count (488) by 68. Possible ghost-student entries detected.' },
  { id: 'C-0028', caseType: 'POSSIBLE_SAME_PERSON', severity: 'MEDIUM',  institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',    subjectType: 'student',     subjectId: 's9',  reasonCodes: ['IDENTITY_GRAPH_MATCH', 'SHARED_CONTACT'],    status: 'Open',                slaDueAt: '2026-10-28', openedAt: '2026-10-16', description: 'Two records share identical guardian contact and similar names with slight transliteration difference. Possible same person with two IDs.' },
  { id: 'C-0021', caseType: 'ANOMALY',              severity: 'LOW',      institutionId: 'INST-TS-0015', institutionName: 'JNTU Hyderabad', subjectType: 'batch',       subjectId: 'BATCH-2874', reasonCodes: ['BULK_UPLOAD_SPIKE', 'DEADLINE_BURST'],   status: 'Resolved',            assignedTo: 'Shri Priti Singh',  slaDueAt: '2026-10-15', openedAt: '2026-10-08', closedAt: '2026-10-14', outcome: 'Reviewed by officer. Institution confirmed legitimate pre-deadline upload. No action required.', description: 'Bulk upload of 180 records in final 24 hours before deadline. Anomaly score: 68/100.' },
  { id: 'C-0018', caseType: 'INVALID_ID',           severity: 'LOW',      institutionId: 'INST-KA-0021', institutionName: 'RV College',     subjectType: 'student',     subjectId: 's5',  reasonCodes: ['MISSING_APAAR', 'PROVISIONAL_IDENTITY'],    status: 'Open',                slaDueAt: '2026-11-01', openedAt: '2026-10-20', description: 'Foreign national student without APAAR. Provisional identity (PPID) assigned. Document verification by officer required to reach L2 trust.' },
];

// ─── Submissions ─────────────────────────────────────────────────────────────
export const mockSubmissions: Submission[] = [
  { id: 'sub1', institutionId: 'INST-MH-0042', institutionName: 'SIET Mumbai',    batchId: 'BATCH-2901', submittedAt: '2026-10-18T09:22:00Z', totalRows: 245, accepted: 231, rejected: 8,  held: 6,  status: 'COMPLETED_WITH_ERRORS', policyVersion: 7 },
  { id: 'sub2', institutionId: 'INST-KA-0021', institutionName: 'RV College',     batchId: 'BATCH-2899', submittedAt: '2026-10-15T14:10:00Z', totalRows: 480, accepted: 462, rejected: 18, held: 0,  status: 'COMPLETED',             policyVersion: 7 },
  { id: 'sub3', institutionId: 'INST-TS-0015', institutionName: 'JNTU Hyderabad', batchId: 'BATCH-2874', submittedAt: '2026-10-10T23:45:00Z', totalRows: 400, accepted: 382, rejected: 4,  held: 14, status: 'COMPLETED_WITH_ERRORS', policyVersion: 7 },
  { id: 'sub4', institutionId: 'INST-WB-0009', institutionName: 'Jadavpur Univ.', batchId: 'BATCH-2901', submittedAt: '2026-10-20T10:00:00Z', totalRows: 300, accepted: 300, rejected: 0,  held: 0,  status: 'COMPLETED',             policyVersion: 7 },
  { id: 'sub5', institutionId: 'INST-GJ-0037', institutionName: 'DDIT Nadiad',    batchId: 'BATCH-2888', submittedAt: '2026-10-12T11:30:00Z', totalRows: 180, accepted: 175, rejected: 3,  held: 2,  status: 'COMPLETED_WITH_ERRORS', policyVersion: 7 },
  { id: 'sub6', institutionId: 'INST-UP-0055', institutionName: 'HBTU Kanpur',    batchId: 'BATCH-2865', submittedAt: '2026-09-30T22:00:00Z', totalRows: 420, accepted: 390, rejected: 10, held: 20, status: 'COMPLETED_WITH_ERRORS', policyVersion: 6 },
];

// ─── Student documents (current student) ────────────────────────────────────
export const mockDocuments: Document[] = [
  { id: 'd1', type: 'APAAR ID',          name: 'APAAR_Card_1234.pdf',       status: 'VERIFIED',  uploadedAt: '2026-08-01T10:00:00Z', verifiedAt: '2026-08-02T09:00:00Z' },
  { id: 'd2', type: 'Admission Letter',  name: 'Admission_Letter_2026.pdf', status: 'VERIFIED',  uploadedAt: '2026-08-01T10:05:00Z', verifiedAt: '2026-08-04T11:00:00Z' },
  { id: 'd3', type: 'Marksheet (Class 12)', name: 'HSC_Marksheet.pdf',      status: 'VERIFIED',  uploadedAt: '2026-08-01T10:10:00Z', verifiedAt: '2026-08-03T14:00:00Z' },
  { id: 'd4', type: 'Category Certificate', name: 'Caste_Certificate.pdf', status: 'PENDING',   uploadedAt: '2026-09-15T08:00:00Z' },
  { id: 'd5', type: 'Photo ID',           name: 'Aadhar_Card.pdf',          status: 'VERIFIED',  uploadedAt: '2026-08-01T10:15:00Z', verifiedAt: '2026-08-02T09:30:00Z' },
  { id: 'd6', type: 'Migration Certificate', name: 'Migration_Cert.pdf',   status: 'UPLOADED',  uploadedAt: '2026-10-10T12:00:00Z' },
];

// ─── Timeline events ──────────────────────────────────────────────────────────
export const mockTimeline: TimelineEvent[] = [
  { id: 'e1', actor: 'System',              action: 'Enrolment created',      detail: 'Record admitted via batch BATCH-2901, policy v7',             at: '2026-08-01T09:00:00Z', type: 'info' },
  { id: 'e2', actor: 'APAAR Service',       action: 'Identity verified',      detail: 'APAAR 1234-5678-9012 verified. Name match: 0.98, DOB: exact', at: '2026-08-02T10:15:00Z', type: 'success' },
  { id: 'e3', actor: 'Integrity Engine',    action: 'Seat Ledger claim',      detail: 'Slot 47 / 60 in REGULAR pool. Status: within cap',           at: '2026-08-01T09:01:00Z', type: 'success' },
  { id: 'e4', actor: 'Integrity Engine',    action: 'Single-Seat Lock passed','detail': 'No active full-time enrolment conflict detected',           at: '2026-08-01T09:01:05Z', type: 'success' },
  { id: 'e5', actor: 'Dr. Priya Nair',      action: 'Document uploaded',      detail: 'Category certificate pending officer review',                at: '2026-09-15T08:10:00Z', type: 'info' },
  { id: 'e6', actor: 'AICTE Officer',       action: 'Trust level updated',    detail: 'Record promoted to L3 Cross-Checked after review',           at: '2026-10-05T14:30:00Z', type: 'success' },
  { id: 'e7', actor: 'System',              action: 'Annual continuation',    detail: 'Enrolment continued to AY 2026-27',                          at: '2026-08-15T00:00:00Z', type: 'info' },
];

// ─── Chart data ───────────────────────────────────────────────────────────────
export const enrolmentTrendData: ChartDataPoint[] = [
  { name: 'Apr', enrolled: 0,    verified: 0,    cases: 0  },
  { name: 'May', enrolled: 0,    verified: 0,    cases: 0  },
  { name: 'Jun', enrolled: 820,  verified: 420,  cases: 4  },
  { name: 'Jul', enrolled: 4200, verified: 2800, cases: 12 },
  { name: 'Aug', enrolled: 9800, verified: 7200, cases: 28 },
  { name: 'Sep', enrolled: 14200,verified: 11400,cases: 41 },
  { name: 'Oct', enrolled: 18400,verified: 15600,cases: 38 },
];

export const institutionComplianceData = [
  { name: 'Jan', submissions: 12, errors: 2 },
  { name: 'Feb', submissions: 18, errors: 3 },
  { name: 'Mar', submissions: 8,  errors: 1 },
  { name: 'Aug', submissions: 142,errors: 22 },
  { name: 'Sep', submissions: 387,errors: 48 },
  { name: 'Oct', submissions: 512,errors: 67 },
];

export const trustDistributionData = [
  { name: 'L4 AICTE-Certified', value: 3200, color: '#6558D3' },
  { name: 'L3 Cross-Checked',   value: 8700, color: '#198754' },
  { name: 'L2 ID-Verified',     value: 4100, color: '#2F6FED' },
  { name: 'L1 Format-Valid',    value: 1800, color: '#8791A5' },
  { name: 'L0 Claimed',         value: 600,  color: '#D0D5E2' },
];

export const casesByTypeData = [
  { name: 'Intake Breach',  value: 7,  color: '#C53B45' },
  { name: 'Dup Enrolment',  value: 12, color: '#B7791F' },
  { name: 'Data Mismatch',  value: 18, color: '#2F6FED' },
  { name: 'Declaration',    value: 4,  color: '#6558D3' },
  { name: 'Anomaly',        value: 9,  color: '#8791A5' },
  { name: 'Invalid ID',     value: 6,  color: '#667085' },
];

export const seatPoolData: SeatPool[] = [
  { programme: 'B.Tech CSE',   approved: 60, claimed: 62, overBy: 2, poolCode: 'REGULAR',       status: 'BREACH' },
  { programme: 'B.Tech ECE',   approved: 60, claimed: 58, overBy: 0, poolCode: 'REGULAR',       status: 'OK' },
  { programme: 'B.Tech Mech',  approved: 60, claimed: 55, overBy: 0, poolCode: 'REGULAR',       status: 'OK' },
  { programme: 'M.Tech AI',    approved: 30, claimed: 28, overBy: 0, poolCode: 'REGULAR',       status: 'OK' },
  { programme: 'B.Tech CSE',   approved: 9,  claimed: 11, overBy: 2, poolCode: 'NRI',           status: 'BREACH' },
  { programme: 'B.Tech ECE',   approved: 3,  claimed: 2,  overBy: 0, poolCode: 'OCI',           status: 'OK' },
  { programme: 'B.Tech Mech',  approved: 3,  claimed: 5,  overBy: 2, poolCode: 'SUPERNUMERARY', status: 'WARNING' },
];

export const regionWiseData = [
  { name: 'North', value: 4820 },
  { name: 'South', value: 7340 },
  { name: 'East',  value: 2910 },
  { name: 'West',  value: 5120 },
  { name: 'Central',value: 2210 },
];
