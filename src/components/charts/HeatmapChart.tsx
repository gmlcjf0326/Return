'use client';

import { useMemo } from 'react';
import { getHeatmapColor } from '@/hooks/useMouseTracking';

interface HeatmapCell {
  x: number;
  y: number;
  intensity: number;
  hoverTime?: number;
  clickCount?: number;
}

interface ContentInterest {
  region: string;
  hoverTime: number;
  clickCount: number;
  percentage: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  gridSize?: number;
  width?: number;
  height?: number;
  showColorScale?: boolean;
  title?: string;
  className?: string;
}

interface ContentInterestChartProps {
  data: ContentInterest[];
  title?: string;
  className?: string;
}

export function HeatmapChart({
  data,
  gridSize = 10,
  width = 300,
  height = 200,
  showColorScale = true,
  title = '관심 영역 히트맵',
  className = '',
}: HeatmapChartProps) {
  const cells = useMemo(() => {
    if (!data || data.length === 0) {
      // 빈 그리드 생성
      const emptyCells: HeatmapCell[] = [];
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          emptyCells.push({ x, y, intensity: 0 });
        }
      }
      return emptyCells;
    }
    return data;
  }, [data, gridSize]);

  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const hasData = data && data.length > 0 && data.some(d => d.intensity > 0);

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          🔥 {title}
        </h3>
      )}

      {!hasData ? (
        <div
          className="flex items-center justify-center bg-[var(--neutral-50)] rounded-lg"
          style={{ width, height }}
        >
          <p className="text-[var(--neutral-400)] text-sm">히트맵 데이터가 없습니다</p>
        </div>
      ) : (
        <>
          {/* 히트맵 그리드 */}
          <div
            className="relative rounded-lg overflow-hidden border border-[var(--neutral-200)]"
            style={{ width, height }}
          >
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              {cells.map((cell, i) => (
                <rect
                  key={i}
                  x={cell.x * cellWidth}
                  y={cell.y * cellHeight}
                  width={cellWidth - 1}
                  height={cellHeight - 1}
                  fill={cell.intensity > 0 ? getHeatmapColor(cell.intensity) : '#F8FAFC'}
                  className="transition-colors duration-200"
                >
                  <title>
                    {cell.intensity > 0
                      ? `관심도: ${Math.round(cell.intensity * 100)}%`
                      : '데이터 없음'}
                  </title>
                </rect>
              ))}
            </svg>

            {/* 영역 레이블 (오버레이) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-[var(--neutral-500)] bg-white/80 px-2 py-0.5 rounded">
                문항/타이머
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)] bg-white/80 px-2 py-0.5 rounded">
                답변 영역
              </div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-[var(--neutral-500)] bg-white/80 px-2 py-0.5 rounded">
                버튼/네비
              </div>
            </div>
          </div>

          {/* 색상 스케일 */}
          {showColorScale && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--neutral-500)] mb-1">
                <span>낮음</span>
                <span>관심도</span>
                <span>높음</span>
              </div>
              <div
                className="h-4 rounded-full"
                style={{
                  background: 'linear-gradient(to right, hsl(240, 70%, 50%), hsl(120, 70%, 50%), hsl(60, 70%, 50%), hsl(0, 70%, 50%))',
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ContentInterestChart({
  data,
  title = '콘텐츠 관심도',
  className = '',
}: ContentInterestChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-[var(--neutral-50)] rounded-xl p-6 ${className}`}>
        <p className="text-[var(--neutral-400)] text-sm">관심도 데이터가 없습니다</p>
      </div>
    );
  }

  const maxPercentage = Math.max(...data.map(d => d.percentage));

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          📊 {title}
        </h3>
      )}

      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--neutral-700)]">
                {item.region}
              </span>
              <span className="text-sm text-[var(--neutral-500)]">
                {item.percentage}% ({Math.round(item.hoverTime / 1000)}초)
              </span>
            </div>
            <div className="h-6 bg-[var(--neutral-100)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${(item.percentage / maxPercentage) * 100}%`,
                  backgroundColor:
                    item.percentage > 50 ? 'var(--primary)' :
                    item.percentage > 30 ? 'var(--info)' :
                    'var(--neutral-400)',
                }}
              >
                {item.clickCount > 0 && (
                  <span className="text-xs text-white font-medium">
                    {item.clickCount} 클릭
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div className="mt-4 p-3 bg-[var(--info)]/10 rounded-lg">
        <p className="text-xs text-[var(--info)]">
          💡 관심도는 마우스가 해당 영역에 머무른 시간을 기준으로 측정됩니다.
        </p>
      </div>
    </div>
  );
}

export default HeatmapChart;
