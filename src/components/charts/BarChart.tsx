import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Props {
  data: { name: string; value: number; color?: string }[];
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-card shadow-dropdown p-3 text-xs">
      <p className="font-semibold text-text-primary mb-1">{label}</p>
      <p className="text-text-secondary">
        <span className="font-bold text-text-primary tabular-nums">{payload[0].value.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function BarChartComponent({ data, title, subtitle, color = '#6558D3', height = 220 }: Props) {
  return (
    <div className="card h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E9F0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8791A5' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8791A5' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={700}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color ?? color} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
