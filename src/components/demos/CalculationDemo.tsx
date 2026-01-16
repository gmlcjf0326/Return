'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface Problem {
  id: number;
  expression: string;
  answer: number;
  options: number[];
}

const DEMO_PROBLEMS: Problem[] = [
  {
    id: 1,
    expression: '5 + 3 = ?',
    answer: 8,
    options: [6, 7, 8, 9],
  },
  {
    id: 2,
    expression: '12 - 7 = ?',
    answer: 5,
    options: [4, 5, 6, 7],
  },
  {
    id: 3,
    expression: '4 × 6 = ?',
    answer: 24,
    options: [18, 20, 24, 28],
  },
];

interface CalculationDemoProps {
  onClose: () => void;
}

export default function CalculationDemo({ onClose }: CalculationDemoProps) {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect = DEMO_PROBLEMS[currentProblem].answer === answer;

    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentProblem < DEMO_PROBLEMS.length - 1) {
        setCurrentProblem(currentProblem + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  const problem = DEMO_PROBLEMS[currentProblem];

  if (showResult) {
    const percentage = Math.round((score / DEMO_PROBLEMS.length) * 100);

    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--primary-lighter)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-[var(--primary)]">{percentage}%</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">계산 완료!</h3>
          <p className="text-[var(--neutral-600)]">
            {DEMO_PROBLEMS.length}문제 중 {score}문제 정답
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {DEMO_PROBLEMS.map((p, index) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-4 rounded-xl ${
                answers[index] ? 'bg-[var(--success-light)]' : 'bg-[var(--danger-light)]'
              }`}
            >
              <span className="font-medium">{p.expression.replace('?', String(p.answer))}</span>
              <span className="text-sm">
                {answers[index] ? '정답' : '오답'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 계산력 훈련에서는 난이도별 다양한 연산 문제로 두뇌를 활성화시킵니다.
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
          <span>문제 {currentProblem + 1}/{DEMO_PROBLEMS.length}</span>
          <span>점수: {score}</span>
        </div>
        <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all"
            style={{ width: `${((currentProblem + 1) / DEMO_PROBLEMS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 문제 */}
      <div className="text-center mb-8">
        <div className="bg-[var(--neutral-100)] rounded-2xl p-8 mb-6">
          <p className="text-4xl font-bold text-[var(--neutral-800)]">
            {problem.expression}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {problem.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = problem.answer === option;
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
            } else if (showFeedback && isCorrect) {
              bgColor = 'bg-[var(--success-light)]';
              borderColor = 'border-[var(--success)]';
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-xl border-2 text-2xl font-bold transition-all ${bgColor} ${borderColor}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-center text-[var(--neutral-500)]">
        답을 선택해주세요
      </p>
    </div>
  );
}
