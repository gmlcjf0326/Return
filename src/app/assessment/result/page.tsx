'use client';

import { useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSessionStore } from '@/store/sessionStore';
import {
  calculateAssessmentResult,
  riskLevelConfig,
  analyzeWeakAreas,
  analyzeStrongAreas,
  getTrainingRecommendations,
  type QuestionResponse,
  type RiskLevel,
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

// DB 데이터를 결과 페이지 형식으로 변환하는 함수
interface TransformedResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  riskLevel: RiskLevel;
  categoryScores: Array<{
    category: CognitiveCategory;
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    questionsCorrect: number;
    questionsTotal: number;
    averageResponseTime: number;
  }>;
  completedAt: number;
  duration: number;
}

function transformDbData(assessment: {
  totalScore?: number | null;
  memoryScore?: number | null;
  calculationScore?: number | null;
  languageScore?: number | null;
  attentionScore?: number | null;
  executiveScore?: number | null;
  visuospatialScore?: number | null;
  riskLevel?: string | null;
  createdAt: Date | string;
  behaviorData?: string | null;
}): TransformedResult {
  const totalMaxScore = 100;

  const categoryScores: TransformedResult['categoryScores'] = [
    { category: 'memory' as CognitiveCategory, name: '기억력', score: assessment.memoryScore || 0, maxScore: 20 },
    { category: 'calculation' as CognitiveCategory, name: '계산력', score: assessment.calculationScore || 0, maxScore: 15 },
    { category: 'language' as CognitiveCategory, name: '언어력', score: assessment.languageScore || 0, maxScore: 20 },
    { category: 'attention' as CognitiveCategory, name: '주의력', score: assessment.attentionScore || 0, maxScore: 15 },
    { category: 'executive' as CognitiveCategory, name: '실행기능', score: assessment.executiveScore || 0, maxScore: 15 },
    { category: 'visuospatial' as CognitiveCategory, name: '시공간력', score: assessment.visuospatialScore || 0, maxScore: 15 },
  ].map(cs => ({
    ...cs,
    percentage: cs.maxScore > 0 ? Math.round((cs.score / cs.maxScore) * 100) : 0,
    questionsCorrect: 0,
    questionsTotal: 0,
    averageResponseTime: 0,
  }));

  // 새 위험도 레벨 + 이전 값 호환 매핑
  const riskLevelMapping: Record<string, RiskLevel> = {
    // 새 값
    excellent: 'excellent',
    mild_caution: 'mild_caution',
    caution: 'caution',
    severe: 'severe',
    // 이전 값 호환
    normal: 'excellent',
    mci_suspected: 'caution',
    consultation_recommended: 'severe',
  };

  const riskLevel: RiskLevel = riskLevelMapping[assessment.riskLevel || ''] || 'mild_caution';

  return {
    totalScore: assessment.totalScore || 0,
    maxScore: totalMaxScore,
    percentage: assessment.totalScore || 0,
    riskLevel,
    categoryScores,
    completedAt: new Date(assessment.createdAt).getTime(),
    duration: 0,
  };
}

function AssessmentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');

  const { session } = useSessionStore();
  const sessionId = session?.id;
  const { responses, startTime, isCompleted, resetAssessment, behaviorData: storeBehaviorData } = useAssessmentStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showBehaviorSection, setShowBehaviorSection] = useState(true);
  const hasSavedRef = useRef(false);
  // 컴포넌트 마운트 시점의 종료 시간을 lazy initializer로 캡처 (순수 함수 규칙 준수)
  const [endTime] = useState(() => Date.now());

  // DB 결과 로딩 상태
  const [dbResult, setDbResult] = useState<TransformedResult | null>(null);
  const [dbBehaviorData, setDbBehaviorData] = useState<BehaviorDataType | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // DB에서 결과 가져오기 (id가 있을 때)
  useEffect(() => {
    if (recordId) {
      setIsLoadingDb(true);
      setDbError(null);
      fetch(`/api/assessment/${recordId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDbResult(transformDbData(data.data));
            // DB에서 behaviorData 파싱
            if (data.data.behaviorData) {
              try {
                const parsed = typeof data.data.behaviorData === 'string'
                  ? JSON.parse(data.data.behaviorData)
                  : data.data.behaviorData;
                setDbBehaviorData({
                  responseTime: parsed.responseTime || [],
                  hesitationCount: parsed.hesitationCount || 0,
                  correctionCount: parsed.correctionCount || 0,
                  avgResponseTime: parsed.avgResponseTime || 0,
                  maxResponseTime: parsed.maxResponseTime,
                  minResponseTime: parsed.minResponseTime,
                  responseTimeVariance: parsed.responseTimeVariance,
                  emotionTimeline: parsed.emotionTimeline || [],
                  emotionDistribution: parsed.emotionDistribution || [],
                  dominantEmotion: parsed.dominantEmotion,
                  postureTimeline: parsed.postureTimeline || [],
                  postureStats: parsed.postureStats,
                  mouseHeatmap: parsed.mouseHeatmap || [],
                  contentInterests: parsed.contentInterests || [],
                });
              } catch (e) {
                console.error('Failed to parse behaviorData:', e);
              }
            }
          } else {
            setDbError(data.error?.message || '결과를 불러올 수 없습니다.');
          }
        })
        .catch(() => setDbError('서버 연결에 실패했습니다.'))
        .finally(() => setIsLoadingDb(false));
    }
  }, [recordId]);

  // 세션 없으면 홈으로 (단, recordId가 있으면 DB 결과 표시 가능)
  useEffect(() => {
    if (!session && !recordId) {
      router.push('/');
    }
  }, [session, recordId, router]);

  // 결과가 없으면 진단 페이지로 (단, recordId가 있으면 DB 결과를 기다림)
  useEffect(() => {
    if (recordId) return; // id가 있으면 DB 결과를 기다림
    if (!isCompleted || responses.length === 0) {
      router.push('/assessment');
    }
  }, [recordId, isCompleted, responses.length, router]);

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

    return calculateAssessmentResult(questionResponses, startTime, endTime);
  }, [responses, startTime, endTime]);

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

  // 응답 시간 차트 데이터 (로컬 또는 DB에서)
  const responseTimeChartData = useMemo(() => {
    // 로컬 responses가 있으면 사용
    if (responses && responses.length > 0) {
      return responses.map((r, index) => ({
        questionIndex: index,
        responseTime: r.responseTime,
        isCorrect: r.isCorrect,
        category: r.questionId.split('-')[0],
      }));
    }

    // DB에서 로드된 behaviorData의 responseTime 배열 사용
    if (dbBehaviorData?.responseTime && dbBehaviorData.responseTime.length > 0) {
      return dbBehaviorData.responseTime.map((time, index) => ({
        questionIndex: index,
        responseTime: time,
        isCorrect: undefined, // DB에서는 정답 여부 정보가 없을 수 있음
        category: 'unknown',
      }));
    }

    return [];
  }, [responses, dbBehaviorData]);

  // 결과 서버에 저장 (한 번만 실행)
  // recordId가 있으면 이미 저장된 결과를 보는 것이므로 저장하지 않음
  useEffect(() => {
    if (recordId) return; // 히스토리에서 보는 경우 저장 안 함
    if (!isCompleted || !startTime) return; // 미완료 상태에서 방문한 경우 저장 안 함
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
  }, [recordId, result, sessionId, isCompleted, startTime, behaviorData]);

  // 최종 결과 데이터 (DB 결과 우선)
  const displayResult = dbResult || result;

  // 최종 행동 데이터 (DB 데이터 우선)
  const displayBehaviorData = dbBehaviorData || behaviorData;

  // DB 로딩 중
  if (isLoadingDb) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--neutral-600)]">결과를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  // DB 에러
  if (dbError) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[var(--neutral-800)] mb-2">결과를 불러올 수 없습니다</h2>
          <p className="text-[var(--neutral-600)] mb-6">{dbError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setDbError(null);
                setIsLoadingDb(true);
                fetch(`/api/assessment/${recordId}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      setDbResult(transformDbData(data.data));
                    } else {
                      setDbError(data.error?.message || '결과를 불러올 수 없습니다.');
                    }
                  })
                  .catch(() => setDbError('서버 연결에 실패했습니다.'))
                  .finally(() => setIsLoadingDb(false));
              }}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-deep)] transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/assessment')}
              className="px-6 py-3 border border-[var(--neutral-300)] text-[var(--neutral-700)] rounded-xl font-medium hover:bg-[var(--neutral-100)] transition-colors"
            >
              진단 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!displayResult) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--neutral-600)]">결과를 계산하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const riskConfig = riskLevelConfig[displayResult.riskLevel];
  const weakAreas = analyzeWeakAreas(displayResult.categoryScores);
  const strongAreas = analyzeStrongAreas(displayResult.categoryScores);
  const recommendations = getTrainingRecommendations(displayResult.categoryScores);

  // 위험도별 색상
  const riskColors: Record<RiskLevel, string> = {
    excellent: 'bg-[var(--success)] text-white',
    mild_caution: 'bg-[var(--warning)] text-white',
    caution: 'bg-orange-500 text-white',
    severe: 'bg-[var(--danger)] text-white',
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
            {new Date(displayResult.completedAt).toLocaleDateString('ko-KR', {
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
                {displayResult.totalScore}
              </span>
              <span className="text-2xl text-[var(--neutral-400)]">
                / {displayResult.maxScore}
              </span>
            </div>

            {/* 퍼센트 */}
            <div className="mb-6">
              <span className="text-xl text-[var(--neutral-600)]">
                {displayResult.percentage}점
              </span>
            </div>

            {/* 위험도 배지 */}
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold ${riskColors[displayResult.riskLevel]}`}
            >
              <span className="text-2xl">
                {displayResult.riskLevel === 'excellent' && '✓'}
                {displayResult.riskLevel === 'mild_caution' && '⚠'}
                {displayResult.riskLevel === 'caution' && '⚠'}
                {displayResult.riskLevel === 'severe' && '!'}
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
              {displayResult.categoryScores.map((cs) => {
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
              {displayResult.categoryScores.map((cs) => {
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
              subtitle={strongAreas.length > 0 ? '우수한 인지 기능' : '발전 가능성'}
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
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[var(--primary)]/5 rounded-lg">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <p className="font-medium text-[var(--primary)]">성장 잠재력</p>
                      <p className="text-xs text-[var(--neutral-500)]">꾸준한 훈련으로 모든 영역을 발전시킬 수 있습니다</p>
                    </div>
                  </div>
                  <div className="text-center py-2">
                    <p className="text-sm text-[var(--neutral-600)]">
                      현재는 두드러진 강점 영역이 없지만,
                    </p>
                    <p className="text-sm text-[var(--neutral-600)]">
                      <span className="font-semibold text-[var(--primary)]">맞춤 훈련</span>을 통해 인지 기능을 향상시킬 수 있습니다.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 bg-[var(--neutral-50)] rounded-lg">
                      <span className="text-lg">📚</span>
                      <p className="text-[10px] text-[var(--neutral-500)] mt-1">꾸준한 학습</p>
                    </div>
                    <div className="text-center p-2 bg-[var(--neutral-50)] rounded-lg">
                      <span className="text-lg">🎯</span>
                      <p className="text-[10px] text-[var(--neutral-500)] mt-1">목표 설정</p>
                    </div>
                    <div className="text-center p-2 bg-[var(--neutral-50)] rounded-lg">
                      <span className="text-lg">💪</span>
                      <p className="text-[10px] text-[var(--neutral-500)] mt-1">반복 훈련</p>
                    </div>
                  </div>
                </div>
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
        {showBehaviorSection && displayBehaviorData && (
          <div className="space-y-6 mb-6">
            {/* 행동 지표 카드 */}
            <BehaviorMetrics
              data={{
                hesitationCount: displayBehaviorData.hesitationCount,
                correctionCount: displayBehaviorData.correctionCount,
                avgResponseTime: displayBehaviorData.avgResponseTime,
                maxResponseTime: displayBehaviorData.maxResponseTime,
                minResponseTime: displayBehaviorData.minResponseTime,
                responseTimeVariance: displayBehaviorData.responseTimeVariance,
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
                    const avgInSec = displayBehaviorData.avgResponseTime / 1000;
                    const isAboveAvg = item.responseTime > displayBehaviorData.avgResponseTime;
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
                  <span className="font-semibold text-[var(--neutral-700)]">{(displayBehaviorData.avgResponseTime / 1000).toFixed(1)}초</span>
                </div>
              </Card>
            )}

            {/* 감정 분포 (데이터가 있는 경우) */}
            {displayBehaviorData.emotionDistribution && displayBehaviorData.emotionDistribution.length > 0 && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">😊 감정/표정 분포</h3>

                {/* 주요 감정 요약 */}
                <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <div className="text-center">
                    <span className="text-4xl block mb-1">
                      {displayBehaviorData.dominantEmotion === 'happy' ? '😊' :
                       displayBehaviorData.dominantEmotion === 'neutral' ? '😐' :
                       displayBehaviorData.dominantEmotion === 'confused' ? '😕' :
                       displayBehaviorData.dominantEmotion === 'anxious' ? '😰' :
                       displayBehaviorData.dominantEmotion === 'sad' ? '😢' :
                       displayBehaviorData.dominantEmotion === 'surprised' ? '😮' : '😐'}
                    </span>
                    <span className="text-xs text-[var(--neutral-500)]">주요 감정</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--neutral-800)]">
                      {displayBehaviorData.dominantEmotion === 'happy' ? '긍정적이고 편안한 상태' :
                       displayBehaviorData.dominantEmotion === 'neutral' ? '차분하고 집중된 상태' :
                       displayBehaviorData.dominantEmotion === 'confused' ? '문항에 대해 고민하는 모습' :
                       displayBehaviorData.dominantEmotion === 'anxious' ? '약간의 긴장감이 관찰됨' :
                       displayBehaviorData.dominantEmotion === 'sad' ? '어려움을 느끼는 모습' :
                       displayBehaviorData.dominantEmotion === 'surprised' ? '새로운 문항에 대한 반응' : '평온한 상태'}
                    </p>
                    <p className="text-sm text-[var(--neutral-500)] mt-1">
                      평가 중 {displayBehaviorData.emotionDistribution[0]?.percentage || 0}%의 시간 동안 관찰됨
                    </p>
                  </div>
                </div>

                {/* 감정 분포 바 차트 */}
                <div className="space-y-3">
                  {displayBehaviorData.emotionDistribution.map((item, i) => {
                    const emotionConfig: Record<string, { emoji: string; label: string; color: string; bgColor: string }> = {
                      happy: { emoji: '😊', label: '행복/만족', color: 'bg-green-400', bgColor: 'bg-green-50' },
                      neutral: { emoji: '😐', label: '중립/집중', color: 'bg-gray-400', bgColor: 'bg-gray-50' },
                      confused: { emoji: '😕', label: '혼란/당황', color: 'bg-yellow-400', bgColor: 'bg-yellow-50' },
                      anxious: { emoji: '😰', label: '불안/긴장', color: 'bg-orange-400', bgColor: 'bg-orange-50' },
                      sad: { emoji: '😢', label: '슬픔/어려움', color: 'bg-blue-400', bgColor: 'bg-blue-50' },
                      surprised: { emoji: '😮', label: '놀람', color: 'bg-purple-400', bgColor: 'bg-purple-50' },
                      angry: { emoji: '😠', label: '화남', color: 'bg-red-400', bgColor: 'bg-red-50' },
                    };
                    const config = emotionConfig[item.emotion] || { emoji: '😐', label: item.emotion, color: 'bg-gray-400', bgColor: 'bg-gray-50' };

                    return (
                      <div key={i} className={`flex items-center gap-3 p-2 ${config.bgColor} rounded-lg`}>
                        <span className="text-2xl w-8">{config.emoji}</span>
                        <span className="text-sm text-[var(--neutral-700)] w-20 font-medium">{config.label}</span>
                        <div className="flex-1 h-4 bg-white/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${config.color} rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[var(--neutral-800)] w-14 text-right">{item.percentage}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* 감정 해석 안내 */}
                <div className="mt-4 pt-4 border-t border-[var(--neutral-200)]">
                  <p className="text-xs text-[var(--neutral-500)] flex items-start gap-2">
                    <span className="text-sm">💡</span>
                    <span>
                      {displayBehaviorData.emotionDistribution.some(e => e.emotion === 'happy' && e.percentage > 20)
                        ? '긍정적인 감정이 많이 관찰되어 평가 환경이 좋았습니다.'
                        : displayBehaviorData.emotionDistribution.some(e => e.emotion === 'confused' && e.percentage > 40)
                        ? '혼란스러운 표정이 자주 관찰되었습니다. 어려운 문항이 있었을 수 있습니다.'
                        : displayBehaviorData.emotionDistribution.some(e => e.emotion === 'anxious' && e.percentage > 30)
                        ? '긴장감이 관찰되었습니다. 편안한 환경에서 재평가를 권장합니다.'
                        : '다양한 감정이 관찰되었습니다. 이는 정상적인 평가 반응입니다.'}
                    </span>
                  </p>
                </div>
              </Card>
            )}

            {/* 자세 분석 (데이터가 있는 경우) */}
            {displayBehaviorData.postureStats && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">🧘 자세 분석</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{displayBehaviorData.postureStats.uprightPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">바른 자세</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">{displayBehaviorData.postureStats.leftTiltPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">왼쪽 기울임</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-600">{displayBehaviorData.postureStats.rightTiltPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">오른쪽 기울임</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{displayBehaviorData.postureStats.slouchingPercentage}%</p>
                    <p className="text-sm text-[var(--neutral-600)]">구부정</p>
                  </div>
                </div>
              </Card>
            )}

            {/* 관심도 분석 (데이터가 있는 경우) */}
            {displayBehaviorData.contentInterests && displayBehaviorData.contentInterests.length > 0 && (
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-[var(--neutral-800)] mb-4">🔍 콘텐츠 관심도</h3>
                <div className="space-y-3">
                  {displayBehaviorData.contentInterests.map((item, i) => (
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
            {(!displayBehaviorData.emotionDistribution || displayBehaviorData.emotionDistribution.length === 0) &&
              !displayBehaviorData.postureStats && (
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
              {Math.floor(displayResult.duration / 60000)}분{' '}
              {Math.floor((displayResult.duration % 60000) / 1000)}초
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

export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--neutral-600)]">결과를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <AssessmentResultContent />
    </Suspense>
  );
}
