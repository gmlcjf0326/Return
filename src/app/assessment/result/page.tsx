'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  calculateAssessmentResult,
  riskLevelConfig,
  analyzeWeakAreas,
  analyzeStrongAreas,
  getTrainingRecommendations,
  type QuestionResponse,
} from '@/lib/scoring';
import { categoryConfig } from '@/data/assessment-questions';
import type { CognitiveCategory } from '@/data/assessment-questions';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BehaviorMetrics } from '@/components/charts';

// 헬퍼 함수들
function calculateVariance(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squaredDiffs = arr.map(x => Math.pow(x - avg, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
}

function calculateEmotionDistribution(timeline: Array<{ emotion: string }>) {
  if (!timeline || timeline.length === 0) return [];

  const counts: Record<string, number> = {};
  timeline.forEach(item => {
    counts[item.emotion] = (counts[item.emotion] || 0) + 1;
  });

  const total = timeline.length;
  return Object.entries(counts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function getDominantEmotion(timeline: Array<{ emotion: string }>): string {
  const distribution = calculateEmotionDistribution(timeline);
  return distribution.length > 0 ? distribution[0].emotion : 'neutral';
}

// 행동 데이터 타입
interface BehaviorDataType {
  responseTime: number[];
  hesitationCount: number;
  correctionCount: number;
  avgResponseTime: number;
  maxResponseTime?: number;
  minResponseTime?: number;
  responseTimeVariance?: number;
  emotionTimeline?: Array<{ timestamp: number; emotion: string; confidence: number; questionIndex?: number }>;
  emotionDistribution?: Array<{ emotion: string; count: number; percentage: number }>;
  dominantEmotion?: string;
  postureTimeline?: Array<{ timestamp: number; posture: string; tiltAngle: number }>;
  postureStats?: {
    uprightPercentage: number;
    leftTiltPercentage: number;
    rightTiltPercentage: number;
    slouchingPercentage: number;
    totalTiltCount: number;
    avgTiltDuration: number;
  } | null;
  mouseHeatmap?: Array<{ x: number; y: number; intensity: number }>;
  contentInterests?: Array<{ region: string; hoverTime: number; clickCount: number; percentage: number }>;
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const sessionId = session?.id;
  const { responses, startTime, isCompleted, resetAssessment, behaviorData: storeBehaviorData } = useAssessmentStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showBehaviorSection, setShowBehaviorSection] = useState(true);
  const hasSavedRef = useRef(false);

  // 세션 없으면 홈으로
  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  // 결과가 없으면 진단 페이지로
  useEffect(() => {
    if (!isCompleted || responses.length === 0) {
      router.push('/assessment');
    }
  }, [isCompleted, responses.length, router]);

  // 결과 계산
  const result = useMemo(() => {
    if (responses.length === 0 || !startTime) return null;

    // RawResponse를 QuestionResponse로 변환
    const questionResponses: QuestionResponse[] = responses.map((r) => ({
      questionId: r.questionId,
      category: r.questionId.split('-')[0] as CognitiveCategory,
      answer: r.answer,
      isCorrect: r.isCorrect || false,
      responseTime: r.responseTime,
      points: r.isCorrect ? 3 : 0, // 기본 점수 (실제로는 문항별로 다를 수 있음)
      maxPoints: 3,
    }));

    return calculateAssessmentResult(questionResponses, startTime, Date.now());
  }, [responses, startTime]);

  // 행동 데이터 계산
  const behaviorData: BehaviorDataType | null = useMemo(() => {
    if (!responses || responses.length === 0) return null;

    const responseTimes = responses.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      responseTime: responseTimes,
      hesitationCount: storeBehaviorData?.hesitationCount || 0,
      correctionCount: storeBehaviorData?.correctionCount || 0,
      avgResponseTime: Math.round(avgResponseTime),
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      responseTimeVariance: calculateVariance(responseTimes),
      emotionTimeline: storeBehaviorData?.emotionTimeline || [],
      emotionDistribution: calculateEmotionDistribution(storeBehaviorData?.emotionTimeline || []),
      dominantEmotion: getDominantEmotion(storeBehaviorData?.emotionTimeline || []),
      postureTimeline: [],
      postureStats: null,
      mouseHeatmap: [],
      contentInterests: [],
    };
  }, [responses, storeBehaviorData]);

  // 응답 시간 차트 데이터
  const responseTimeChartData = useMemo(() => {
    if (!responses || responses.length === 0) return [];

    return responses.map((r, index) => ({
      questionIndex: index,
      responseTime: r.responseTime,
      isCorrect: r.isCorrect,
      category: r.questionId.split('-')[0],
    }));
  }, [responses]);

  // 결과 서버에 저장 (한 번만 실행)
  useEffect(() => {
    if (result && sessionId && !hasSavedRef.current) {
      hasSavedRef.current = true;
      setIsSaving(true);
      setSaveError(null);

      fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...result,
          behaviorData: behaviorData ? {
            hesitationCount: behaviorData.hesitationCount,
            correctionCount: behaviorData.correctionCount,
            emotionTimeline: behaviorData.emotionTimeline,
            emotionDistribution: behaviorData.emotionDistribution,
            dominantEmotion: behaviorData.dominantEmotion,
            postureTimeline: behaviorData.postureTimeline,
            postureStats: behaviorData.postureStats,
            mouseHeatmap: behaviorData.mouseHeatmap,
            contentInterests: behaviorData.contentInterests,
          } : undefined,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('저장 실패');
          }
        })
        .catch((err) => {
          console.error('Failed to save result:', err);
          setSaveError('결과 저장에 실패했습니다.');
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  }, [result, sessionId, behaviorData]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--neutral-600)]">결과를 계산하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const riskConfig = riskLevelConfig[result.riskLevel];
  const weakAreas = analyzeWeakAreas(result.categoryScores);
  const strongAreas = analyzeStrongAreas(result.categoryScores);
  const recommendations = getTrainingRecommendations(result.categoryScores);

  // 위험도별 색상
  const riskColors = {
    normal: 'bg-[var(--success)] text-white',
    mild_caution: 'bg-[var(--warning)] text-white',
    mci_suspected: 'bg-orange-500 text-white',
    consultation_recommended: 'bg-[var(--danger)] text-white',
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-50)] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--neutral-900)] mb-2">
            평가 결과
          </h1>
          <p className="text-[var(--neutral-600)]">
            {new Date(result.completedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* 총점 카드 */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="text-center">
            {/* 점수 */}
            <div className="mb-4">
              <span className="text-6xl font-bold text-[var(--primary)]">
                {result.totalScore}
              </span>
              <span className="text-2xl text-[var(--neutral-400)]">
                / {result.maxScore}
              </span>
            </div>

            {/* 퍼센트 */}
            <div className="mb-6">
              <span className="text-xl text-[var(--neutral-600)]">
                {result.percentage}점
              </span>
            </div>

            {/* 위험도 배지 */}
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold ${riskColors[result.riskLevel]}`}
            >
              <span className="text-2xl">
                {result.riskLevel === 'normal' && '✓'}
                {result.riskLevel === 'mild_caution' && '⚠'}
                {result.riskLevel === 'mci_suspected' && '⚠'}
                {result.riskLevel === 'consultation_recommended' && '!'}
              </span>
              {riskConfig.label}
            </div>

            {/* 설명 */}
            <p className="mt-4 text-[var(--neutral-600)] max-w-md mx-auto">
              {riskConfig.description}
            </p>
          </div>
        </Card>

        {/* 인지 기능 분포 */}
        <Card variant="bordered" padding="md" className="mb-6">
          <CardHeader
            title="인지 기능 분포"
            subtitle="6개 영역 분석"
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
              {result.categoryScores.map((cs) => {
                const config = categoryConfig[cs.category];
                const bgColor =
                  cs.percentage >= 85
                    ? 'bg-green-50 border-green-200'
                    : cs.percentage >= 70
                      ? 'bg-yellow-50 border-yellow-200'
                      : cs.percentage >= 55
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-red-50 border-red-200';
                const textColor =
                  cs.percentage >= 85
                    ? 'text-green-700'
                    : cs.percentage >= 70
                      ? 'text-yellow-700'
                      : cs.percentage >= 55
                        ? 'text-orange-700'
                        : 'text-red-700';
                return (
                  <div key={cs.category} className={`p-4 rounded-xl border ${bgColor} text-center`}>
                    <span className="text-2xl block mb-2">{config.icon}</span>
                    <p className="text-sm font-medium text-[var(--neutral-700)]">{cs.name}</p>
                    <p className={`text-2xl font-bold ${textColor}`}>{cs.percentage}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 영역별 점수 */}
        <Card variant="bordered" padding="md" className="mb-6">
          <CardHeader title="영역별 점수" subtitle="6개 인지 기능 영역 분석" />
          <CardContent>
            <div className="space-y-4">
              {result.categoryScores.map((cs) => {
                const config = categoryConfig[cs.category];
                const barColor =
                  cs.percentage >= 85
                    ? 'bg-[var(--success)]'
                    : cs.percentage >= 70
                      ? 'bg-[var(--warning)]'
                      : cs.percentage >= 55
                        ? 'bg-orange-500'
                        : 'bg-[var(--danger)]';

                return (
                  <div key={cs.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{config.icon}</span>
                        <span className="font-medium text-[var(--neutral-700)]">
                          {cs.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[var(--neutral-900)]">
                          {cs.score}
                        </span>
                        <span className="text-[var(--neutral-400)]">
                          / {cs.maxScore}
                        </span>
                        <span className="ml-2 text-sm text-[var(--neutral-500)]">
                          ({cs.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${cs.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--neutral-500)]">
                      정답률: {cs.questionsCorrect}/{cs.questionsTotal} · 평균 응답시간:{' '}
                      {(cs.averageResponseTime / 1000).toFixed(1)}초
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 강점/취약 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 강점 영역 */}
          <Card variant="bordered" padding="md">
            <CardHeader
              title="강점 영역"
              subtitle={strongAreas.length > 0 ? '우수한 인지 기능' : ''}
            />
            <CardContent>
              {strongAreas.length > 0 ? (
                <div className="space-y-2">
                  {strongAreas.map((category) => {
                    const config = categoryConfig[category];
                    return (
                      <div
                        key={category}
                        className="flex items-center gap-2 p-3 bg-[var(--success)]/10 rounded-lg"
                      >
                        <span className="text-xl">{config.icon}</span>
                        <span className="font-medium text-[var(--success)]">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[var(--neutral-500)] text-sm">
                  모든 영역에서 향상의 여지가 있습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 취약 영역 */}
          <Card variant="bordered" padding="md">
            <CardHeader
              title="개선 필요 영역"
              subtitle={weakAreas.length > 0 ? '집중 훈련 권장' : ''}
            />
            <CardContent>
              {weakAreas.length > 0 ? (
                <div className="space-y-2">
                  {weakAreas.map((category) => {
                    const config = categoryConfig[category];
                    return (
                      <div
                        key={category}
                        className="flex items-center gap-2 p-3 bg-[var(--warning)]/10 rounded-lg"
                      >
                        <span className="text-xl">{config.icon}</span>
                        <span className="font-medium text-[var(--warning)]">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[var(--neutral-500)] text-sm">
                  모든 영역이 양호합니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 훈련 추천 */}
        {recommendations.length > 0 && (
          <Card variant="bordered" padding="md" className="mb-6">
            <CardHeader title="훈련 추천" subtitle="맞춤 인지 훈련 프로그램" />
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => {
                  const config = categoryConfig[rec.category];
                  const priorityColors = {
                    high: 'border-l-[var(--danger)]',
                    medium: 'border-l-[var(--warning)]',
                    low: 'border-l-[var(--primary)]',
                  };

                  return (
                    <div
                      key={rec.category}
                      className={`p-4 bg-white border-l-4 ${priorityColors[rec.priority]} rounded-r-lg shadow-sm`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{config.icon}</span>
                        <span className="font-medium text-[var(--neutral-800)]">
                          {config.name} 훈련
                        </span>
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-[var(--danger)]/10 text-[var(--danger)]'
                              : rec.priority === 'medium'
                                ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                                : 'bg-[var(--primary)]/10 text-[var(--primary)]'
                          }`}
                        >
                          {rec.priority === 'high'
                            ? '높음'
                            : rec.priority === 'medium'
                              ? '중간'
                              : '낮음'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--neutral-600)]">{rec.reason}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 행동 분석 섹션 토글 */}
        <div className="mb-6">
          <button
            onClick={() => setShowBehaviorSection(!showBehaviorSection)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <h3 className="font-semibold text-[var(--neutral-800)]">행동 분석 결과</h3>
                <p className="text-sm text-[var(--neutral-500)]">
                  응답 시간, 망설임, 수정 횟수 등 상세 행동 데이터
                </p>
              </div>
            </div>
            <span className={`text-2xl transition-transform ${showBehaviorSection ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* 행동 분석 상세 섹션 */}
        {showBehaviorSection && behaviorData && (
          <div className="space-y-6 mb-6">
            {/* 행동 지표 카드 */}
            <BehaviorMetrics
              data={{
                hesitationCount: behaviorData.hesitationCount,
                correctionCount: behaviorData.correctionCount,
                avgResponseTime: behaviorData.avgResponseTime,
                maxResponseTime: behaviorData.maxResponseTime,
                minResponseTime: behaviorData.minResponseTime,
                responseTimeVariance: behaviorData.responseTimeVariance,
              }}
              className="border border-[var(--neutral-200)]"
            />

            {/* 응답 시간 분석 */}
            {responseTimeChartData.length > 0 && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">📈 문항별 응답 시간</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {responseTimeChartData.map((item, i) => {
                    const timeInSec = (item.responseTime / 1000).toFixed(1);
                    const avgInSec = behaviorData.avgResponseTime / 1000;
                    const isAboveAvg = item.responseTime > behaviorData.avgResponseTime;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm text-[var(--neutral-500)] w-16">문항 {item.questionIndex + 1}</span>
                        <div className="flex-1 h-4 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.isCorrect === false ? 'bg-red-400' : 'bg-blue-400'}`}
                            style={{ width: `${Math.min((item.responseTime / (avgInSec * 2 * 1000)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-16 text-right ${isAboveAvg ? 'text-orange-600' : 'text-green-600'}`}>
                          {timeInSec}초
                        </span>
                        {item.isCorrect === false && <span className="text-xs text-red-500">오답</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--neutral-200)] flex items-center justify-between">
                  <span className="text-sm text-[var(--neutral-500)]">평균 응답 시간</span>
                  <span className="font-semibold text-[var(--neutral-700)]">{(behaviorData.avgResponseTime / 1000).toFixed(1)}초</span>
                </div>
              </Card>
            )}

            {/* 감정 분포 (데이터가 있는 경우) */}
            {behaviorData.emotionDistribution && behaviorData.emotionDistribution.length > 0 && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">😊 감정/표정 분포</h3>
                <div className="space-y-3">
                  {behaviorData.emotionDistribution.map((item, i) => {
                    const emotionEmoji: Record<string, string> = {
                      happy: '😊', sad: '😢', angry: '😠', surprised: '😲',
                      neutral: '😐', fearful: '😨', disgusted: '🤢'
                    };
                    const emotionLabel: Record<string, string> = {
                      happy: '행복', sad: '슬픔', angry: '화남', surprised: '놀람',
                      neutral: '중립', fearful: '두려움', disgusted: '혐오'
                    };
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-2xl w-8">{emotionEmoji[item.emotion] || '😐'}</span>
                        <span className="text-sm text-[var(--neutral-600)] w-16">{emotionLabel[item.emotion] || item.emotion}</span>
                        <div className="flex-1 h-4 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--neutral-700)] w-12 text-right">{item.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* 자세 분석 (데이터가 있는 경우) */}
            {behaviorData.postureStats && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">🧘 자세 분석</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{behaviorData.postureStats.uprightPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">바른 자세</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">{behaviorData.postureStats.leftTiltPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">왼쪽 기울임</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">{behaviorData.postureStats.rightTiltPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">오른쪽 기울임</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{behaviorData.postureStats.slouchingPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">구부정</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 관심도 분석 (데이터가 있는 경우) */}
            {behaviorData.contentInterests && behaviorData.contentInterests.length > 0 && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">🔍 콘텐츠 관심도</h3>
                <div className="space-y-3">
                  {behaviorData.contentInterests.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-[var(--neutral-600)] w-24">{item.region}</span>
                      <div className="flex-1 h-4 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[var(--neutral-700)] w-12 text-right">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 데이터가 충분하지 않은 경우 안내 */}
            {(!behaviorData.emotionDistribution || behaviorData.emotionDistribution.length === 0) &&
              !behaviorData.postureStats && (
              <div className="p-6 bg-[var(--info)]/10 rounded-xl text-center">
                <span className="text-3xl mb-2 block">📹</span>
                <p className="text-[var(--info)] font-medium">
                  표정/자세 분석 데이터가 없습니다
                </p>
                <p className="text-sm text-[var(--neutral-500)] mt-1">
                  다음 평가에서 웹캠을 활성화하면 더 상세한 행동 분석을 받아볼 수 있습니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 소요 시간 */}
        <Card variant="bordered" padding="md" className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-[var(--neutral-600)]">총 소요 시간</span>
            <span className="text-xl font-bold text-[var(--neutral-800)]">
              {Math.floor(result.duration / 60000)}분{' '}
              {Math.floor((result.duration % 60000) / 1000)}초
            </span>
          </div>
        </Card>

        {/* 저장 상태 */}
        {saveError && (
          <div className="mb-4 p-4 bg-[var(--danger)]/10 text-[var(--danger)] rounded-lg text-center">
            {saveError}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => {
              resetAssessment();
              router.push('/assessment');
            }}
          >
            다시 평가하기
          </Button>
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              resetAssessment();
              router.push('/');
            }}
          >
            홈으로 돌아가기
          </Button>
        </div>

        {/* 면책 조항 */}
        <p className="mt-8 text-center text-xs text-[var(--neutral-400)]">
          본 결과는 참고용이며, 정확한 진단을 위해서는 전문 의료기관의 상담을 권장합니다.
        </p>
      </div>
    </div>
  );
}
