'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  defaultColor?: string;
  showValues?: boolean;
  showLabels?: boolean;
  maxValue?: number;
  horizontal?: boolean;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  defaultColor = '#3B82F6',
  showValues = true,
  showLabels = true,
  maxValue: customMax,
  horizontal = false,
  className = '',
}: BarChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map((d) => d.value);
    const max = customMax ?? Math.max(...values) * 1.1;

    return {
      max: max || 1,
      items: data.map((d) => ({
        ...d,
        percentage: (d.value / (max || 1)) * 100,
      })),
    };
  }, [data, customMax]);

  if (!chartData || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 rounded-lg ${className}`} style={{ height }}>
        <p className="text-slate-400 text-sm">데이터가 없습니다</p>
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className={`space-y-3 ${className}`}>
        {chartData.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              {showLabels && (
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
              )}
              {showValues && (
                <span className="text-sm text-slate-500">{item.value}</span>
              )}
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || defaultColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vertical bar chart
  const barWidth = 100 / data.length;
  const barPadding = barWidth * 0.2;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* 그리드 라인 */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = height - 30 - ((height - 50) * percent) / 100;
          return (
            <g key={percent}>
              <line
                x1={0}
                y1={y}
                x2={100}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={0.3}
              />
              <text
                x={2}
                y={y - 2}
                className="fill-slate-400"
                style={{ fontSize: '5px' }}
              >
                {Math.round((chartData.max * percent) / 100)}
              </text>
            </g>
          );
        })}

        {/* 바 */}
        {chartData.items.map((item, i) => {
          const x = i * barWidth + barPadding / 2;
          const width = barWidth - barPadding;
          const barHeight = ((height - 50) * item.percentage) / 100;
          const y = height - 30 - barHeight;

          return (
            <g key={i}>
              {/* 바 */}
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                rx={1}
                fill={item.color || defaultColor}
                className="transition-all duration-300"
              />

              {/* 값 */}
              {showValues && (
                <text
                  x={x + width / 2}
                  y={y - 3}
                  textAnchor="middle"
                  className="fill-slate-600"
                  style={{ fontSize: '5px', fontWeight: 500 }}
                >
                  {item.value}
                </text>
              )}

              {/* 레이블 */}
              {showLabels && (
                <text
                  x={x + width / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500"
                  style={{ fontSize: '5px' }}
                >
                  {item.label.length > 4 ? item.label.slice(0, 4) : item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BarChart;
