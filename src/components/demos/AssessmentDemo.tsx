'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: 1,
    question: '다음 중 과일이 아닌 것은?',
    options: ['사과', '배', '당근', '포도'],
    correctIndex: 2,
  },
  {
    id: 2,
    question: '오늘의 요일을 맞춰보세요. 지금은 무슨 요일인가요?',
    options: ['월요일', '수요일', '금요일', '일요일'],
    correctIndex: -1, // 시연용 - 정답 없음
  },
  {
    id: 3,
    question: '다음 숫자의 다음에 올 숫자는? 2, 4, 6, 8, ?',
    options: ['9', '10', '11', '12'],
    correctIndex: 1,
  },
];

interface AssessmentDemoProps {
  onClose: () => void;
}

export default function AssessmentDemo({ onClose }: AssessmentDemoProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = DEMO_QUESTIONS[currentQuestion].correctIndex === index ||
      DEMO_QUESTIONS[currentQuestion].correctIndex === -1;

    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }

    // 다음 문항으로 이동 또는 결과 표시
    setTimeout(() => {
      if (currentQuestion < DEMO_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const question = DEMO_QUESTIONS[currentQuestion];

  if (showResult) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">체험 완료!</h3>
          <p className="text-[var(--neutral-600)]">
            {DEMO_QUESTIONS.length}문항 중 {score}문항 정답
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {DEMO_QUESTIONS.map((q, index) => (
            <div
              key={q.id}
              className={`p-4 rounded-xl ${
                answers[index] ? 'bg-[var(--success-light)]' : 'bg-[var(--danger-light)]'
              }`}
            >
              <p className="text-sm font-medium">{q.question}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">
                {answers[index] ? '정답' : '오답'}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 인지 진단에서는 기억력, 주의력, 언어력, 계산력, 실행기능, 시공간력 등
            6개 영역을 종합적으로 평가합니다.
          </p>
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 진행률 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[var(--neutral-500)] mb-2">
          <span>문항 {currentQuestion + 1}/{DEMO_QUESTIONS.length}</span>
          <span>체험 모드</span>
        </div>
        <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all"
            style={{ width: `${((currentQuestion + 1) / DEMO_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 문제 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correctIndex === index || question.correctIndex === -1;
            const showFeedback = selectedAnswer !== null;

            let bgColor = 'bg-white hover:bg-[var(--neutral-50)]';
            let borderColor = 'border-[var(--neutral-200)]';

            if (showFeedback && isSelected) {
              if (isCorrect) {
                bgColor = 'bg-[var(--success-light)]';
                borderColor = 'border-[var(--success)]';
              } else {
                bgColor = 'bg-[var(--danger-light)]';
                borderColor = 'border-[var(--danger)]';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor} ${
                  selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="font-medium text-[var(--neutral-700)]">
                  {index + 1}. {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-center text-[var(--neutral-500)]">
        이것은 체험용 데모입니다. 실제 진단은 더 다양한 문항으로 구성됩니다.
      </p>
    </div>
  );
}
