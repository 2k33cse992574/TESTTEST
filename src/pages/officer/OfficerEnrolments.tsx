import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { mockStudents } from '@/data/mockData';
import type { Student } from '@/types';
import { Download, Filter } from 'lucide-react';

const columns: Column<Student>[] = [
  {
    key: 'maskedId', header: 'Student Ref', sortable: true,
    render: r => <span className="font-mono text-xs text-brand">{r.maskedId}</span>,
  },
  {
    key: 'institutionName', header: 'Institution', sortable: true,
    render: r => <span className="text-xs text-text-secondary max-w-[140px] block truncate">{r.institutionName}</span>,
  },
  {
    key: 'programme', header: 'Programme', sortable: true,
    render: r => <span className="text-sm">{r.programme}</span>,
  },
  {
    key: 'poolCode', header: 'Pool',
    render: r => <span className="text-xs px-2 py-0.5 bg-canvas border border-border rounded-lg">{r.poolCode}</span>,
  },
  {
    key: 'status', header: 'Status', sortable: true,
    render: r => <StatusBadge type="enrolment" value={r.status} size="sm" />,
  },
  {
    key: 'holdState', header: 'Hold',
    render: r => r.holdState !== 'NONE'
      ? <StatusBadge type="hold" value={r.holdState} size="sm" />
      : <span className="text-text-muted text-xs">—</span>,
  },
  {
    key: 'trustLevel', header: 'Trust',
    render: r => <TrustLadder level={r.trustLevel} showLabel={false} compact />,
  },
  {
    key: 'riskScore', header: 'Risk Score', sortable: true,
    render: r => {
      const s = r.riskScore ?? 0;
      const color = s > 60 ? 'text-danger' : s > 30 ? 'text-amber-600' : 'text-emerald-600';
      const bg = s > 60 ? 'bg-red-50' : s > 30 ? 'bg-amber-50' : 'bg-emerald-50';
      return (
        <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg ${color} ${bg}`}>{s}</span>
      );
    },
  },
  {
    key: 'lastUpdated', header: 'Updated', sortable: true,
    render: r => <span className="text-xs text-text-muted">{r.lastUpdated}</span>,
  },
];

export default function OfficerEnrolments() {
  const highRisk  = mockStudents.filter(s => (s.riskScore ?? 0) > 60).length;
  const onHold    = mockStudents.filter(s => s.holdState !== 'NONE').length;
  const l0l1      = mockStudents.filter(s => s.trustLevel <= 1).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Enrolments"
        subtitle="All student enrolment records across institutions with trust level and risk score."
        breadcrumb={['AICTE Officer Portal', 'Enrolments']}
        actions={
          <>
            <button className="btn btn-secondary btn-sm">
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records',       value: mockStudents.length, color: 'text-text-primary' },
          { label: 'High Risk (>60)',      value: highRisk,            color: 'text-danger' },
          { label: 'On Hold',             value: onHold,              color: 'text-amber-600' },
          { label: 'Low Trust (L0–L1)',   value: l0l1,                color: 'text-text-secondary' },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <DataTable<Student>
          columns={columns}
          data={mockStudents}
          keyField="id"
          searchPlaceholder="Search by name, institution, programme, status…"
          emptyMessage="No enrolment records match the current filters."
          pageSize={10}
        />
      </div>
    </div>
  );
}
