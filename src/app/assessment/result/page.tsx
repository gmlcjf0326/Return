'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function AssessmentResultPage() {
  const router = useRouter();
  const { sessionId } = useSessionStore();
  const { responses, startTime, isCompleted, resetAssessment } = useAssessmentStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 세션 없으면 홈으로
  useEffect(() => {
    if (!sessionId) {
      router.push('/');
    }
  }, [sessionId, router]);

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

  // 결과 서버에 저장
  useEffect(() => {
    if (result && sessionId && !isSaving) {
      setIsSaving(true);
      setSaveError(null);

      fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...result,
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
  }, [result, sessionId, isSaving]);

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
