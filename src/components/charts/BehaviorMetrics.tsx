'use client';

interface BehaviorData {
  hesitationCount: number;
  correctionCount: number;
  avgResponseTime: number;
  maxResponseTime?: number;
  minResponseTime?: number;
  responseTimeVariance?: number;
}

interface BehaviorMetricsProps {
  data: BehaviorData | null;
  title?: string;
  className?: string;
}

export function BehaviorMetrics({
  data,
  title = '행동 분석 지표',
  className = '',
}: BehaviorMetricsProps) {
  if (!data) {
    return (
      <div className={`flex items-center justify-center bg-[var(--neutral-50)] rounded-xl p-6 ${className}`}>
        <p className="text-[var(--neutral-400)] text-sm">행동 데이터가 없습니다</p>
      </div>
    );
  }

  // 망설임/수정 횟수에 따른 상태 색상 결정
  const getHesitationColor = (count: number) => {
    if (count <= 3) return 'var(--success)';
    if (count <= 7) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getCorrectionColor = (count: number) => {
    if (count <= 2) return 'var(--success)';
    if (count <= 5) return 'var(--warning)';
    return 'var(--danger)';
  };

  // 응답 시간 포맷팅
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}초`;
  };

  const metrics = [
    {
      icon: '⏱️',
      label: '평균 응답 시간',
      value: formatTime(data.avgResponseTime),
      subValue: data.minResponseTime && data.maxResponseTime
        ? `${formatTime(data.minResponseTime)} ~ ${formatTime(data.maxResponseTime)}`
        : undefined,
      color: data.avgResponseTime <= 10000 ? 'var(--success)' : 'var(--warning)',
      bgColor: data.avgResponseTime <= 10000 ? 'var(--success)' : 'var(--warning)',
    },
    {
      icon: '🤔',
      label: '망설임 횟수',
      value: `${data.hesitationCount}회`,
      description: data.hesitationCount <= 3 ? '양호' : data.hesitationCount <= 7 ? '보통' : '주의',
      color: getHesitationColor(data.hesitationCount),
      bgColor: getHesitationColor(data.hesitationCount),
    },
    {
      icon: '✏️',
      label: '답변 수정',
      value: `${data.correctionCount}회`,
      description: data.correctionCount <= 2 ? '양호' : data.correctionCount <= 5 ? '보통' : '주의',
      color: getCorrectionColor(data.correctionCount),
      bgColor: getCorrectionColor(data.correctionCount),
    },
  ];

  // 응답 시간 분산이 있으면 일관성 지표 추가
  if (data.responseTimeVariance !== undefined) {
    const consistency = data.responseTimeVariance < 5000 ? '높음' :
                       data.responseTimeVariance < 15000 ? '보통' : '낮음';
    const consistencyColor = data.responseTimeVariance < 5000 ? 'var(--success)' :
                            data.responseTimeVariance < 15000 ? 'var(--warning)' : 'var(--danger)';
    metrics.push({
      icon: '📊',
      label: '응답 일관성',
      value: consistency,
      description: '응답 시간의 변동성 분석',
      color: consistencyColor,
      bgColor: consistencyColor,
    });
  }

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          📊 {title}
        </h3>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: `${metric.bgColor}10` }}
          >
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div
              className="text-xl font-bold mb-1"
              style={{ color: metric.color }}
            >
              {metric.value}
            </div>
            <div className="text-sm text-[var(--neutral-600)]">{metric.label}</div>
            {metric.subValue && (
              <div className="text-xs text-[var(--neutral-400)] mt-1">
                {metric.subValue}
              </div>
            )}
            {metric.description && (
              <div
                className="text-xs mt-1 font-medium"
                style={{ color: metric.color }}
              >
                {metric.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 해석 안내 */}
      <div className="mt-4 p-3 bg-[var(--neutral-50)] rounded-lg">
        <p className="text-xs text-[var(--neutral-600)]">
          <strong>해석 안내:</strong> 망설임은 답변 전 마우스 움직임으로 측정되며,
          수정 횟수가 많으면 의사결정에 어려움을 겪을 수 있음을 나타냅니다.
        </p>
      </div>
    </div>
  );
}

// 응답 시간 차트 (문항별)
interface ResponseTimeData {
  questionIndex: number;
  responseTime: number;
  isCorrect?: boolean;
  category?: string;
}

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
  avgLine?: number;
  title?: string;
  height?: number;
  className?: string;
}

export function ResponseTimeChart({
  data,
  avgLine,
  title = '문항별 응답 시간',
  height = 200,
  className = '',
}: ResponseTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-[var(--neutral-50)] rounded-xl p-6 ${className}`}>
        <p className="text-[var(--neutral-400)] text-sm">응답 시간 데이터가 없습니다</p>
      </div>
    );
  }

  const maxTime = Math.max(...data.map(d => d.responseTime), avgLine || 0) * 1.1;
  const chartWidth = 100;
  const padding = { top: 20, right: 5, bottom: 30, left: 5 };
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = (chartWidth - padding.left - padding.right) / data.length;

  return (
    <div className={`bg-white rounded-xl p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">
          📈 {title}
        </h3>
      )}

      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* 그리드 라인 */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding.top + (chartHeight * (100 - percent)) / 100;
          return (
            <line
              key={percent}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth={0.3}
            />
          );
        })}

        {/* 평균선 */}
        {avgLine && (
          <line
            x1={padding.left}
            y1={padding.top + chartHeight - (avgLine / maxTime) * chartHeight}
            x2={chartWidth - padding.right}
            y2={padding.top + chartHeight - (avgLine / maxTime) * chartHeight}
            stroke="var(--warning)"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        )}

        {/* 바 */}
        {data.map((item, i) => {
          const barHeight = (item.responseTime / maxTime) * chartHeight;
          const x = padding.left + i * barWidth;
          const y = padding.top + chartHeight - barHeight;

          return (
            <g key={i}>
              <rect
                x={x + barWidth * 0.1}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill={item.isCorrect === false ? 'var(--danger)' : 'var(--primary)'}
                rx={0.5}
              >
                <title>
                  문항 {item.questionIndex + 1}: {(item.responseTime / 1000).toFixed(1)}초
                  {item.isCorrect === false ? ' (오답)' : ''}
                </title>
              </rect>
            </g>
          );
        })}

        {/* X축 레이블 */}
        {data.map((item, i) => {
          if (data.length > 15 && i % 5 !== 0 && i !== data.length - 1) return null;
          const x = padding.left + i * barWidth + barWidth / 2;
          return (
            <text
              key={i}
              x={x}
              y={height - 5}
              textAnchor="middle"
              className="fill-slate-400"
              style={{ fontSize: '5px' }}
            >
              {item.questionIndex + 1}
            </text>
          );
        })}
      </svg>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--primary)]" />
          <span className="text-xs text-[var(--neutral-600)]">정답</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--danger)]" />
          <span className="text-xs text-[var(--neutral-600)]">오답</span>
        </div>
        {avgLine && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[var(--warning)]" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-[var(--neutral-600)]">평균</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BehaviorMetrics;
