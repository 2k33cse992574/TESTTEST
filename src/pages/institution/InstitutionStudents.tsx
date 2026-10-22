import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustLadder } from '@/components/ui/TrustLadder';
import { mockStudents } from '@/data/mockData';
import { Download, UserPlus } from 'lucide-react';
import type { Student } from '@/types';

const instStudents = mockStudents.filter(s => s.institutionId === 'INST-MH-0042');

const columns: Column<Student>[] = [
  {
    key: 'maskedId',
    header: 'Student Ref',
    sortable: true,
    render: r => <span className="font-mono text-xs text-brand">{r.maskedId}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: r => <span className="font-medium text-sm">{r.name}</span>,
  },
  {
    key: 'programme',
    header: 'Programme',
    sortable: true,
    render: r => <span className="text-sm text-text-secondary">{r.programme}</span>,
  },
  {
    key: 'poolCode',
    header: 'Pool',
    render: r => (
      <span className="text-xs font-medium px-2 py-0.5 bg-canvas border border-border rounded-lg">
        {r.poolCode}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: r => <StatusBadge type="enrolment" value={r.status} size="sm" />,
  },
  {
    key: 'holdState',
    header: 'Hold',
    render: r => r.holdState !== 'NONE'
      ? <StatusBadge type="hold" value={r.holdState} size="sm" />
      : <span className="text-text-muted text-xs">—</span>,
  },
  {
    key: 'trustLevel',
    header: 'Trust',
    render: r => <TrustLadder level={r.trustLevel} showLabel={false} compact />,
  },
  {
    key: 'riskScore',
    header: 'Risk',
    sortable: true,
    render: r => {
      const s = r.riskScore ?? 0;
      const color = s > 60 ? 'text-danger' : s > 30 ? 'text-amber-600' : 'text-emerald-600';
      return <span className={`text-xs font-bold tabular-nums ${color}`}>{s}</span>;
    },
  },
  {
    key: 'lastUpdated',
    header: 'Last Updated',
    sortable: true,
    render: r => <span className="text-xs text-text-muted">{r.lastUpdated}</span>,
  },
];

export default function InstitutionStudents() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Student Records"
        subtitle="Search, filter and manage all enrolled students for your institution."
        breadcrumb={['Institution Portal', 'Students']}
        actions={
          <>
            <button className="btn btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button className="btn btn-primary btn-sm">
              <UserPlus className="w-3.5 h-3.5" /> Add Student
            </button>
          </>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: instStudents.length, color: 'text-text-primary' },
          { label: 'Enrolled/Continuing', value: instStudents.filter(s => ['ENROLLED','CONTINUING'].includes(s.status)).length, color: 'text-emerald-600' },
          { label: 'On Hold', value: instStudents.filter(s => s.holdState !== 'NONE').length, color: 'text-amber-600' },
          { label: 'High Risk', value: instStudents.filter(s => (s.riskScore ?? 0) > 60).length, color: 'text-danger' },
        ].map((s,i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <DataTable<Student>
          columns={columns}
          data={instStudents}
          keyField="id"
          searchPlaceholder="Search by name, programme, status…"
          emptyMessage="No student records found for this institution."
          pageSize={8}
        />
      </div>
    </div>
  );
}
