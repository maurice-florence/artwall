import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxBarWidth?: number;
  height?: number;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, maxBarWidth = 120, height = 32, color = '#0b8783' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: maxBarWidth / data.length }}>
          <div
            style={{
              width: 18,
              height: `${Math.max(6, (d.value / max) * (height - 16))}px`,
              background: color,
              borderRadius: 4,
              marginBottom: 2,
              transition: 'height 0.3s',
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
