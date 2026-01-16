'use client';

import { useMemo } from 'react';
import { emotionLabels, emotionColors, emotionIcons, type EmotionType } from '@/hooks/useFaceDetection';

interface EmotionData {
  emotion: EmotionType;
  count: number;
  percentage: number;
}

interface EmotionDistributionProps {
  data: EmotionData[];
  size?: number;
  showLegend?: boolean;
  title?: string;
  className?: string;
}

export function EmotionDistribution({
  data,
  size = 200,
  showLegend = true,
  title = '감정 분포',
  className = '',
}: EmotionDistributionProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) return null;

    // 각도 계산 (도넛 차트용)
    let currentAngle = -90; // 12시 방향부터 시작
    const segments = data.map((d) => {
      const angle = (d.count / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return {
        ...d,
        startAngle,
        endAngle: currentAngle,
        color: emotionColors[d.emotion] || '#6B7280',
      };
    });

    return {
      segments,
      total,
      dominant: data[0], // 이미 정렬되어 있다고 가정
    };
  }, [data]);

  // SVG 호(arc) 경로 생성 함수
  const createArcPath = (
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center bg-[var(--neutral-50)] rounded-xl p-6 ${className}`}>
        <p className="text-[var(--neutral-400)] text-sm">감정 데이터가 없습니다</p>
      </div>
    );
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.6;

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          😊 {title}
        </h3>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 도넛 차트 */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {chartData.segments.map((segment, i) => (
              <path
                key={i}
                d={createArcPath(
                  centerX,
                  centerY,
                  outerRadius,
                  innerRadius,
                  segment.startAngle,
                  segment.endAngle - 0.5 // 약간의 갭
                )}
                fill={segment.color}
                className="transition-opacity duration-200 hover:opacity-80"
              />
            ))}
          </svg>

          {/* 중앙 표시 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">
              {emotionIcons[chartData.dominant.emotion]}
            </span>
            <span className="text-sm font-medium text-[var(--neutral-700)]">
              {emotionLabels[chartData.dominant.emotion]}
            </span>
            <span className="text-lg font-bold" style={{ color: emotionColors[chartData.dominant.emotion] }}>
              {chartData.dominant.percentage}%
            </span>
          </div>
        </div>

        {/* 범례 */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {chartData.segments.map((segment, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-lg">{emotionIcons[segment.emotion]}</span>
                <span className="flex-1 text-sm text-[var(--neutral-700)]">
                  {emotionLabels[segment.emotion]}
                </span>
                <span className="text-sm font-medium text-[var(--neutral-900)]">
                  {segment.percentage}%
                </span>
                <span className="text-xs text-[var(--neutral-500)]">
                  ({segment.count}회)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmotionDistribution;
