'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showLabels?: boolean;
  maxValue?: number;
  minValue?: number;
  className?: string;
}

export function LineChart({
  data,
  height = 200,
  color = '#3B82F6',
  showDots = true,
  showLabels = true,
  maxValue: customMax,
  minValue: customMin,
  className = '',
}: LineChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map((d) => d.value);
    const max = customMax ?? Math.max(...values) * 1.1;
    const min = customMin ?? Math.min(0, Math.min(...values));
    const range = max - min || 1;

    const width = 100;
    const padding = { top: 20, right: 10, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
      return { x, y, ...d };
    });

    // SVG 경로 생성
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // 그라데이션 영역
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    return {
      points,
      pathD,
      areaD,
      padding,
      chartHeight,
      max,
      min,
    };
  }, [data, height, customMax, customMin]);

  if (!chartData || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[${height}px] bg-slate-50 rounded-lg ${className}`}>
        <p className="text-slate-400 text-sm">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* 그리드 라인 */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = chartData.padding.top + (chartData.chartHeight * (100 - percent)) / 100;
          return (
            <line
              key={percent}
              x1={chartData.padding.left}
              y1={y}
              x2={100 - chartData.padding.right}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth={0.3}
            />
          );
        })}

        {/* 영역 */}
        <path d={chartData.areaD} fill="url(#lineGradient)" />

        {/* 선 */}
        <path
          d={chartData.pathD}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 점 */}
        {showDots &&
          chartData.points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={1.5}
              fill="white"
              stroke={color}
              strokeWidth={0.8}
            />
          ))}

        {/* X축 레이블 */}
        {showLabels &&
          chartData.points.map((point, i) => {
            // 데이터가 많으면 일부만 표시
            if (data.length > 7 && i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={point.x}
                y={height - 5}
                textAnchor="middle"
                className="fill-slate-400"
                style={{ fontSize: '6px' }}
              >
                {point.label}
              </text>
            );
          })}
      </svg>
    </div>
  );
}

export default LineChart;
