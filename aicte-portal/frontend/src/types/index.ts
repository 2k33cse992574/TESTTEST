export type UserRole = 'student' | 'institution' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  avatarInitials: string;
}

export type TrustLevel = 0 | 1 | 2 | 3 | 4;
export type TrustLevelLabel = 'Claimed' | 'Format-Valid' | 'Identity-Verified' | 'Cross-Checked' | 'AICTE-Certified';

export type EnrolmentStatus =
  | 'ADMITTED' | 'ENROLLED' | 'CONTINUING' | 'TRANSFERRED'
  | 'WITHDRAWN' | 'CANCELLED' | 'GRADUATED';

export type HoldState = 'NONE' | 'CONFLICT_HOLD' | 'IDENTITY_HOLD';

export type CaseStatus =
  | 'Open' | 'UnderReview' | 'AwaitingInstitution' | 'Resubmitted'
  | 'Escalated' | 'Resolved' | 'Appealed' | 'Closed';

export type CaseType =
  | 'INTAKE_BREACH' | 'DUP_ENROLMENT' | 'POSSIBLE_SAME_PERSON'
  | 'INVALID_ID' | 'DATA_MISMATCH' | 'DECLARATION_MISMATCH'
  | 'ANOMALY' | 'STALE_ACTIVE';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingSource = 'RULE' | 'ML' | 'GRAPH' | 'RECONCILIATION';

export interface Student {
  id: string;
  maskedId: string;
  name: string;
  apaarId?: string;
  institutionId: string;
  institutionName: string;
  programme: string;
  academicYear: string;
  status: EnrolmentStatus;
  holdState: HoldState;
  trustLevel: TrustLevel;
  admissionDate: string;
  poolCode: string;
  riskScore?: number;
  riskFactors?: any[];
  lastUpdated: string;
}

export interface Institution {
  id: string;
  name: string;
  state: string;
  district: string;
  region: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  approvedIntake: number;
  enrolledCount: number;
  verifiedCount: number;
  openCases: number;
  integrityBand: 'A' | 'B' | 'C' | 'D' | 'E';
  integrityScore: number;
  lastSubmission: string;
}

export interface Case {
  id: string;
  caseType: CaseType;
  severity: Severity;
  institutionId: string;
  institutionName: string;
  subjectType: string;
  subjectId: string;
  reasonCodes: string[];
  status: CaseStatus;
  assignedTo?: string;
  slaDueAt: string;
  openedAt: string;
  closedAt?: string;
  outcome?: string;
  description: string;
}

export interface MetricCardData {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
  sublabel?: string;
  icon?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  clickable?: boolean;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface SeatPool {
  programme: string;
  approved: number;
  claimed: number;
  overBy: number;
  poolCode: string;
  status: 'OK' | 'WARNING' | 'BREACH';
}

export interface Submission {
  id: string;
  institutionId: string;
  institutionName: string;
  batchId: string;
  submittedAt: string;
  totalRows: number;
  accepted: number;
  rejected: number;
  held: number;
  status: 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'PROCESSING' | 'FAILED';
  policyVersion: number;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  status: 'UPLOADED' | 'VERIFIED' | 'PENDING' | 'REJECTED';
  uploadedAt: string;
  verifiedAt?: string;
}

export interface TimelineEvent {
  id: string;
  actor: string;
  action: string;
  detail: string;
  at: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
