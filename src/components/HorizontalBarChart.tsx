import React from 'react';

interface HorizontalBarChartProps {
  data: { label: string; value: number }[];
  maxBarWidth?: number;
  barHeight?: number;
  color?: string;
  labelWidth?: number;
  style?: React.CSSProperties;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  maxBarWidth = 140,
  barHeight = 18,
  color = '#0b8783',
  labelWidth = 80,
  style = {},
}) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: labelWidth,
              fontSize: 13,
              color: '#444',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={d.label}
          >
            {d.label}
          </span>
          <div
            style={{
              height: barHeight,
              width: `${(d.value / max) * maxBarWidth}px`,
              background: color,
              borderRadius: 4,
              minWidth: 8,
              transition: 'width 0.3s',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 12,
                color: '#fff',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.18)',
              }}
            >
              {d.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalBarChart;
