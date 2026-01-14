'use client';

import { useMemo } from 'react';

interface RadarDataPoint {
  label: string;
  value: number; // 0-100 percentage
  maxValue?: number;
  icon?: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  showLabels?: boolean;
  showValues?: boolean;
  colorScheme?: 'default' | 'risk';
  className?: string;
}

/**
 * 6각형 레이더 차트 컴포넌트
 * 6개 인지 영역의 점수를 시각화합니다.
 */
export default function RadarChart({
  data,
  size = 300,
  showLabels = true,
  showValues = true,
  colorScheme = 'default',
  className = '',
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // 70% of half size for main chart
  const labelRadius = (size / 2) * 0.92; // 92% for labels

  // 각 데이터 포인트의 각도 계산
  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2; // 12시 방향에서 시작

  // 배경 그리드 레벨 (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // 색상 스키마
  const colors = useMemo(() => {
    if (colorScheme === 'risk') {
      // 위험도 기반 그라데이션
      const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;
      if (avgValue >= 85) return { fill: '#10B981', stroke: '#059669' }; // 정상
      if (avgValue >= 70) return { fill: '#F59E0B', stroke: '#D97706' }; // 주의
      if (avgValue >= 55) return { fill: '#F97316', stroke: '#EA580C' }; // 경고
      return { fill: '#EF4444', stroke: '#DC2626' }; // 위험
    }
    return { fill: '#3B82F6', stroke: '#1E40AF' }; // 기본 의료 블루
  }, [colorScheme, data]);

  // 극좌표를 직교좌표로 변환
  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // 데이터 포인트 좌표 계산
  const dataPoints = useMemo(() => {
    return data.map((d, i) => {
      const angle = startAngle + i * angleStep;
      const normalizedValue = Math.min(100, Math.max(0, d.value)) / 100;
      const r = radius * normalizedValue;
      return {
        ...polarToCartesian(angle, r),
        angle,
        value: d.value,
        label: d.label,
        icon: d.icon,
      };
    });
  }, [data, center, radius, angleStep, startAngle]);

  // 데이터 영역 path 생성
  const dataPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    return dataPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ') + ' Z';
  }, [dataPoints]);

  // 그리드 라인 path 생성
  const gridPaths = useMemo(() => {
    return gridLevels.map((level) => {
      const r = radius * level;
      const points = data.map((_, i) => {
        const angle = startAngle + i * angleStep;
        return polarToCartesian(angle, r);
      });
      return points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ') + ' Z';
    });
  }, [data, radius, angleStep, startAngle, center]);

  // 축 라인 생성
  const axisLines = useMemo(() => {
    return data.map((_, i) => {
      const angle = startAngle + i * angleStep;
      const start = polarToCartesian(angle, 0);
      const end = polarToCartesian(angle, radius);
      return { x1: center, y1: center, x2: end.x, y2: end.y };
    });
  }, [data, radius, angleStep, startAngle, center]);

  // 라벨 위치 계산
  const labelPositions = useMemo(() => {
    return data.map((d, i) => {
      const angle = startAngle + i * angleStep;
      const pos = polarToCartesian(angle, labelRadius);

      // 텍스트 정렬 결정
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (Math.abs(Math.cos(angle)) > 0.3) {
        textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
      }

      return {
        ...pos,
        textAnchor,
        label: d.label,
        value: d.value,
        icon: d.icon,
      };
    });
  }, [data, labelRadius, angleStep, startAngle]);

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* 배경 그리드 */}
        <g className="grid">
          {gridPaths.map((path, i) => (
            <path
              key={`grid-${i}`}
              d={path}
              fill="none"
              stroke="var(--neutral-200)"
              strokeWidth="1"
              opacity={0.8}
            />
          ))}
        </g>

        {/* 축 라인 */}
        <g className="axes">
          {axisLines.map((line, i) => (
            <line
              key={`axis-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="var(--neutral-300)"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* 데이터 영역 */}
        <path
          d={dataPath}
          fill={colors.fill}
          fillOpacity={0.3}
          stroke={colors.stroke}
          strokeWidth="3"
          className="transition-all duration-500"
        />

        {/* 데이터 포인트 */}
        {dataPoints.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="white"
            stroke={colors.stroke}
            strokeWidth="3"
            className="transition-all duration-300"
          />
        ))}

        {/* 라벨 */}
        {showLabels && labelPositions.map((pos, i) => (
          <g key={`label-${i}`}>
            {/* 아이콘 */}
            {pos.icon && (
              <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor={pos.textAnchor}
                className="text-lg"
                dominantBaseline="middle"
              >
                {pos.icon}
              </text>
            )}
            {/* 라벨 텍스트 */}
            <text
              x={pos.x}
              y={pos.y + (pos.icon ? 4 : 0)}
              textAnchor={pos.textAnchor}
              className="text-xs font-medium fill-[var(--neutral-700)]"
              dominantBaseline="middle"
            >
              {pos.label}
            </text>
            {/* 값 */}
            {showValues && (
              <text
                x={pos.x}
                y={pos.y + (pos.icon ? 18 : 14)}
                textAnchor={pos.textAnchor}
                className="text-xs font-bold fill-[var(--primary)]"
                dominantBaseline="middle"
              >
                {pos.value}%
              </text>
            )}
          </g>
        ))}

        {/* 중앙 원 */}
        <circle
          cx={center}
          cy={center}
          r="4"
          fill="var(--neutral-400)"
        />
      </svg>
    </div>
  );
}

// Export default data formatter for cognitive assessment
export function formatCognitiveData(categoryScores: Array<{
  category: string;
  name: string;
  percentage: number;
  icon?: string;
}>): RadarDataPoint[] {
  return categoryScores.map((cs) => ({
    label: cs.name,
    value: cs.percentage,
    icon: cs.icon,
  }));
}
