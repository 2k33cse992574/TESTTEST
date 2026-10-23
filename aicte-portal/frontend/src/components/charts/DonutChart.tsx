import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Slice { name: string; value: number; color: string }

interface Props {
  data: Slice[];
  title: string;
  subtitle?: string;
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-surface border border-border rounded-card shadow-dropdown p-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.payload.color }} />
        <span className="font-semibold text-text-primary">{p.name}</span>
      </div>
      <p className="text-text-secondary mt-1">
        <span className="font-bold text-text-primary tabular-nums">{p.value.toLocaleString()}</span>
        {' '}records
      </p>
    </div>
  );
}

export function DonutChart({ data, title, subtitle, height = 240, centerLabel, centerValue }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.28}
              outerRadius={height * 0.4}
              paddingAngle={3}
              dataKey="value"
              animationBegin={200}
              animationDuration={700}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: -20 }}>
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {centerValue ?? total.toLocaleString()}
          </span>
          {centerLabel && (
            <span className="text-xs text-text-muted">{centerLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}
