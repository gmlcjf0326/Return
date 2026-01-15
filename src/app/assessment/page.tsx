'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSessionStore } from '@/store/sessionStore';
import { createAssessmentSet, categoryConfig } from '@/data/assessment-questions';
import type { AssessmentQuestion as DataQuestion, CognitiveCategory } from '@/data/assessment-questions';
import { checkAnswer, calculateQuestionScore } from '@/lib/scoring';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { QuestionCard, AssessmentProgress } from '@/components/assessment';

// 데이터 타입을 스토어 타입으로 변환
function convertQuestion(q: DataQuestion): import('@/types').AssessmentQuestion {
  return {
    id: q.id,
    category: q.category,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer,
    timeLimit: q.timeLimit,
    points: q.points,
  };
}

export default function AssessmentPage() {
  const router = useRouter();
  const { session, initSession } = useSessionStore();

  // Assessment store
  const {
    questions,
    currentQuestionIndex,
    isStarted,
    isCompleted,
    startAssessment,
    submitResponse,
    nextQuestion,
    recordCorrection,
    resetAssessment,
    startTime,
  } = useAssessmentStore();

  // 로컬 상태
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number | null>(null);
  const [originalQuestions, setOriginalQuestions] = useState<DataQuestion[]>([]);
  const [completedCategories, setCompletedCategories] = useState<CognitiveCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 문항 (원본 데이터)
  const currentOriginalQuestion = originalQuestions[currentQuestionIndex];
  const currentQuestion = questions[currentQuestionIndex];

  // 진단 시작
  const handleStartAssessment = useCallback(() => {
    const questionSet = createAssessmentSet();
    setOriginalQuestions(questionSet);
    const convertedQuestions = questionSet.map(convertQuestion);
    startAssessment(convertedQuestions);
    setCompletedCategories([]);
    setCurrentAnswer(null);
  }, [startAssessment]);

  // 답변 변경
  const handleAnswerChange = useCallback(
    (value: string | string[] | number) => {
      // 이전 답변이 있으면 수정으로 기록
      if (currentAnswer !== null && currentAnswer !== value) {
        recordCorrection();
      }
      setCurrentAnswer(value);
    },
    [currentAnswer, recordCorrection]
  );

  // 답변 제출
  const handleSubmitAnswer = useCallback(async () => {
    if (currentAnswer === null || !currentOriginalQuestion || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 정답 체크
      const isCorrect = checkAnswer(currentOriginalQuestion, currentAnswer);

      // 응답 제출
      submitResponse({
        questionId: currentOriginalQuestion.id,
        answer: typeof currentAnswer === 'object' ? JSON.stringify(currentAnswer) : currentAnswer,
        responseTime: 0, // store에서 자동 계산
        isCorrect,
      });

      // 카테고리 완료 체크
      const currentCategory = currentOriginalQuestion.category;
      const categoryQuestions = originalQuestions.filter(
        (q) => q.category === currentCategory
      );
      const answeredInCategory = useAssessmentStore
        .getState()
        .responses.filter((r) =>
          categoryQuestions.some((q) => q.id === r.questionId)
        ).length;

      if (answeredInCategory + 1 >= categoryQuestions.length) {
        setCompletedCategories((prev) =>
          prev.includes(currentCategory) ? prev : [...prev, currentCategory]
        );
      }

      // 다음 문항으로
      nextQuestion();
      setCurrentAnswer(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentAnswer,
    currentOriginalQuestion,
    isSubmitting,
    submitResponse,
    nextQuestion,
    originalQuestions,
  ]);

  // 시간 초과 처리
  const handleTimeUp = useCallback(() => {
    if (currentOriginalQuestion) {
      // 시간 초과 시 빈 응답으로 제출
      submitResponse({
        questionId: currentOriginalQuestion.id,
        answer: '',
        responseTime: currentOriginalQuestion.timeLimit * 1000,
        isCorrect: false,
      });
      nextQuestion();
      setCurrentAnswer(null);
    }
  }, [currentOriginalQuestion, submitResponse, nextQuestion]);

  // 진단 완료 시 결과 페이지로 이동
  useEffect(() => {
    if (isCompleted && startTime) {
      router.push('/assessment/result');
    }
  }, [isCompleted, startTime, router]);

  // 세션 확인 및 생성
  useEffect(() => {
    initSession();
  }, [initSession]);

  // 시작 전 화면
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--neutral-900)] mb-2">
              인지 기능 평가
            </h1>
            <p className="text-lg text-[var(--neutral-600)]">
              6개 영역의 인지 기능을 측정합니다
            </p>
          </div>

          {/* 안내 카드 */}
          <Card variant="elevated" padding="lg" className="mb-6">
            <CardHeader title="평가 안내" subtitle="시작 전 꼭 읽어주세요" />
            <CardContent>
              <ul className="space-y-3 text-[var(--neutral-700)]">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    1
                  </span>
                  <span>총 30문항으로 구성되어 있으며, 약 15-20분 소요됩니다.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    2
                  </span>
                  <span>각 문항에는 제한 시간이 있습니다. 시간 내에 답변해 주세요.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    3
                  </span>
                  <span>조용하고 편안한 환경에서 진행하는 것을 권장합니다.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    4
                  </span>
                  <span>결과는 참고용이며, 정확한 진단은 전문 의료기관에서 받으세요.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 평가 영역 카드 */}
          <Card variant="bordered" padding="md" className="mb-8">
            <CardHeader title="평가 영역" subtitle="6개 인지 기능 영역" />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.entries(categoryConfig) as [CognitiveCategory, typeof categoryConfig.memory][]).map(
                  ([key, config]) => (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-2 p-4 bg-[var(--neutral-50)] rounded-xl"
                    >
                      <span className="text-2xl">{config.icon}</span>
                      <span className="text-sm font-medium text-[var(--neutral-700)]">
                        {config.name}
                      </span>
                      <span className="text-xs text-[var(--neutral-500)]">
                        {config.maxPoints}점
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* 시작 버튼 */}
          <Button onClick={handleStartAssessment} size="xl" fullWidth>
            평가 시작하기
          </Button>
        </div>
      </div>
    );
  }

  // 문항 표시 화면
  if (currentOriginalQuestion && currentQuestion) {
    return (
      <div className="min-h-screen bg-[var(--neutral-50)] py-6 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 상단 진행률 */}
          <div className="mb-6">
            <AssessmentProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              currentCategory={currentOriginalQuestion.category}
              completedCategories={completedCategories}
            />
          </div>

          {/* 문항 카드 */}
          <QuestionCard
            question={currentOriginalQuestion}
            answer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitAnswer}
            onTimeUp={handleTimeUp}
            timerRunning={!isSubmitting}
            disabled={isSubmitting}
          />

          {/* 하단 네비게이션 */}
          <div className="mt-6 flex justify-between items-center text-sm text-[var(--neutral-500)]">
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('평가를 종료하시겠습니까? 진행 상황이 저장되지 않습니다.')) {
                  resetAssessment();
                  router.push('/');
                }
              }}
            >
              평가 종료
            </Button>
            <span>
              문항 {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  return (
    <div className="min-h-screen bg-[var(--neutral-50)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--neutral-600)]">평가를 준비하고 있습니다...</p>
      </div>
    </div>
  );
}
