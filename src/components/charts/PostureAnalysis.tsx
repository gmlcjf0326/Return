'use client';

import { useMemo } from 'react';
import { postureLabels, postureColors, postureIcons, type PostureType } from '@/hooks/usePoseDetection';

interface PostureStats {
  uprightPercentage: number;
  leftTiltPercentage: number;
  rightTiltPercentage: number;
  slouchingPercentage: number;
  totalTiltCount: number;
  avgTiltDuration: number;
}

interface PostureTimelineItem {
  timestamp: number;
  posture: PostureType;
  tiltAngle: number;
  questionIndex?: number;
}

interface PostureAnalysisProps {
  stats: PostureStats | null;
  timeline?: PostureTimelineItem[];
  showTimeline?: boolean;
  title?: string;
  className?: string;
}

export function PostureAnalysis({
  stats,
  timeline = [],
  showTimeline = false,
  title = '자세 분석',
  className = '',
}: PostureAnalysisProps) {
  // 타임라인 시각화 데이터
  const timelineBlocks = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];

    // 연속된 자세 블록으로 그룹화
    const blocks: Array<{
      posture: PostureType;
      startIndex: number;
      endIndex: number;
      duration: number;
    }> = [];

    let currentBlock: typeof blocks[0] | null = null;

    timeline.forEach((item, index) => {
      if (!currentBlock || currentBlock.posture !== item.posture) {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          posture: item.posture,
          startIndex: index,
          endIndex: index,
          duration: 0,
        };
      } else {
        currentBlock.endIndex = index;
      }
    });

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    // 비율 계산
    const totalLength = timeline.length;
    return blocks.map((block) => ({
      ...block,
      widthPercent: ((block.endIndex - block.startIndex + 1) / totalLength) * 100,
    }));
  }, [timeline]);

  if (!stats) {
    return (
      <div className={`flex items-center justify-center bg-[var(--neutral-50)] rounded-xl p-6 ${className}`}>
        <p className="text-[var(--neutral-400)] text-sm">자세 데이터가 없습니다</p>
      </div>
    );
  }

  const postureData = [
    { type: 'upright' as PostureType, percentage: stats.uprightPercentage, label: '바른 자세' },
    { type: 'leaning_left' as PostureType, percentage: stats.leftTiltPercentage, label: '왼쪽 기울임' },
    { type: 'leaning_right' as PostureType, percentage: stats.rightTiltPercentage, label: '오른쪽 기울임' },
    { type: 'slouching' as PostureType, percentage: stats.slouchingPercentage, label: '구부정함' },
  ].filter(d => d.percentage > 0);

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          🧘 {title}
        </h3>
      )}

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--success)]/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--success)]">
            {stats.uprightPercentage}%
          </div>
          <div className="text-sm text-[var(--neutral-600)]">바른 자세 유지율</div>
        </div>

        <div className="bg-[var(--warning)]/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--warning)]">
            {stats.totalTiltCount}회
          </div>
          <div className="text-sm text-[var(--neutral-600)]">기울어짐 횟수</div>
        </div>

        <div className="bg-[var(--info)]/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-[var(--info)]">
            {stats.avgTiltDuration > 1000
              ? `${Math.round(stats.avgTiltDuration / 1000)}초`
              : `${stats.avgTiltDuration}ms`}
          </div>
          <div className="text-sm text-[var(--neutral-600)]">평균 기울기 지속</div>
        </div>
      </div>

      {/* 자세 비율 바 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--neutral-700)] mb-2">자세 분포</div>
        <div className="h-8 rounded-full overflow-hidden flex bg-[var(--neutral-100)]">
          {postureData.map((item, i) => (
            <div
              key={i}
              className="h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: postureColors[item.type],
              }}
            >
              {item.percentage >= 10 && `${item.percentage}%`}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 mb-4">
        {postureData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: postureColors[item.type] }}
            />
            <span className="text-sm">{postureIcons[item.type]}</span>
            <span className="text-sm text-[var(--neutral-600)]">
              {item.label} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>

      {/* 타임라인 */}
      {showTimeline && timelineBlocks.length > 0 && (
        <div className="mt-6">
          <div className="text-sm font-medium text-[var(--neutral-700)] mb-2">
            자세 타임라인
          </div>
          <div className="h-6 rounded-lg overflow-hidden flex bg-[var(--neutral-100)]">
            {timelineBlocks.map((block, i) => (
              <div
                key={i}
                className="h-full transition-all duration-200"
                style={{
                  width: `${block.widthPercent}%`,
                  backgroundColor: postureColors[block.posture],
                }}
                title={`${postureLabels[block.posture]}: ${Math.round(block.widthPercent)}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-[var(--neutral-400)] mt-1">
            <span>시작</span>
            <span>종료</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostureAnalysis;
