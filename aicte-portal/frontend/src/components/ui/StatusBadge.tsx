import { type EnrolmentStatus, type CaseStatus, type Severity, type TrustLevel } from '@/types';

interface Props {
  type: 'enrolment' | 'case' | 'severity' | 'trust' | 'hold' | 'submission' | 'document' | 'integrity';
  value: string;
  size?: 'sm' | 'md';
}

const enrolmentMap: Record<string, string> = {
  ADMITTED:    'badge-info',
  ENROLLED:    'badge-success',
  CONTINUING:  'badge-success',
  TRANSFERRED: 'badge-neutral',
  WITHDRAWN:   'badge-neutral',
  CANCELLED:   'badge-danger',
  GRADUATED:   'badge-brand',
};

const caseMap: Record<string, string> = {
  Open:                'badge-info',
  UnderReview:         'badge-info',
  AwaitingInstitution: 'badge-warning',
  Resubmitted:         'badge-info',
  Escalated:           'badge-danger',
  Resolved:            'badge-success',
  Appealed:            'badge-warning',
  Closed:              'badge-neutral',
};

const severityMap: Record<string, string> = {
  LOW:      'badge-neutral',
  MEDIUM:   'badge-warning',
  HIGH:     'badge-danger',
  CRITICAL: 'bg-red-100 text-red-800 badge',
};

const trustMap: Record<number, { cls: string; label: string }> = {
  0: { cls: 'badge-neutral', label: 'L0 Claimed' },
  1: { cls: 'badge-neutral', label: 'L1 Format-Valid' },
  2: { cls: 'badge-info',    label: 'L2 ID-Verified' },
  3: { cls: 'badge-success', label: 'L3 Cross-Checked' },
  4: { cls: 'badge-brand',   label: 'L4 AICTE-Certified' },
};

const holdMap: Record<string, string> = {
  NONE:          '',
  CONFLICT_HOLD: 'badge-danger',
  IDENTITY_HOLD: 'badge-warning',
};

const submissionMap: Record<string, string> = {
  COMPLETED:              'badge-success',
  COMPLETED_WITH_ERRORS:  'badge-warning',
  PROCESSING:             'badge-info',
  FAILED:                 'badge-danger',
};

const documentMap: Record<string, string> = {
  UPLOADED: 'badge-info',
  VERIFIED: 'badge-success',
  PENDING:  'badge-neutral',
  REJECTED: 'badge-danger',
};

const integrityBandMap: Record<string, string> = {
  A: 'badge-success',
  B: 'badge-success',
  C: 'badge-warning',
  D: 'badge-danger',
  E: 'bg-red-100 text-red-800 badge',
};

export function StatusBadge({ type, value, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : '';

  if (type === 'trust') {
    const num = parseInt(value) as TrustLevel;
    const t = trustMap[num] ?? trustMap[0];
    return <span className={`${t.cls} ${sizeClass}`}>{t.label}</span>;
  }

  if (type === 'hold') {
    if (value === 'NONE') return null;
    return <span className={`${holdMap[value] ?? 'badge-neutral'} ${sizeClass}`}>{value.replace('_', ' ')}</span>;
  }

  const mapsByType: Record<string, Record<string, string>> = {
    enrolment:  enrolmentMap,
    case:       caseMap,
    severity:   severityMap,
    submission: submissionMap,
    document:   documentMap,
    integrity:  integrityBandMap,
  };

  const map = mapsByType[type] ?? {};
  const cls = map[value] ?? 'badge-neutral';
  const label = type === 'integrity' ? `Band ${value}` : value.replace(/_/g, ' ');

  return <span className={`${cls} ${sizeClass}`}>{label}</span>;
}
