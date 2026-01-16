'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface Question {
  id: number;
  type: 'antonym' | 'proverb' | 'association';
  question: string;
  options: string[];
  correctIndex: number;
}

const DEMO_QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'antonym',
    question: '"크다"의 반대말은?',
    options: ['작다', '낮다', '좁다', '얇다'],
    correctIndex: 0,
  },
  {
    id: 2,
    type: 'proverb',
    question: '"가는 말이 고와야 ___"',
    options: ['들리는 말이 곱다', '오는 말이 곱다', '가는 길이 좋다', '하는 일이 좋다'],
    correctIndex: 1,
  },
  {
    id: 3,
    type: 'association',
    question: '봄, 여름, 가을, ?',
    options: ['겨울', '눈', '추위', '연말'],
    correctIndex: 0,
  },
];

const TYPE_LABELS = {
  antonym: '반의어',
  proverb: '속담',
  association: '단어 연상',
};

interface LanguageDemoProps {
  onClose: () => void;
}

export default function LanguageDemo({ onClose }: LanguageDemoProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = DEMO_QUESTIONS[currentQuestion].correctIndex === index;

    setAnswers([...answers, isCorrect]);
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < DEMO_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 800);
  };

  const question = DEMO_QUESTIONS[currentQuestion];

  if (showResult) {
    return (
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--info-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📖</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--neutral-800)] mb-2">완료!</h3>
          <p className="text-[var(--neutral-600)]">
            {DEMO_QUESTIONS.length}문제 중 {score}문제 정답
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
              <p className="text-xs text-[var(--neutral-500)] mb-1">
                {TYPE_LABELS[q.type]}
              </p>
              <p className="text-sm font-medium">{q.question}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">
                정답: {q.options[q.correctIndex]}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[var(--neutral-100)] rounded-xl p-4 mb-6">
          <p className="text-sm text-[var(--neutral-600)]">
            실제 언어력 훈련에서는 어휘력, 이해력, 표현력 등 다양한 영역의 문제를 풀어볼 수 있습니다.
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
          <span className="px-2 py-1 bg-[var(--info-light)] text-[var(--info)] rounded-full text-xs">
            {TYPE_LABELS[question.type]}
          </span>
          <span>{currentQuestion + 1}/{DEMO_QUESTIONS.length}</span>
        </div>
        <div className="h-2 bg-[var(--neutral-200)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--info)] transition-all"
            style={{ width: `${((currentQuestion + 1) / DEMO_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 문제 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-6 text-center">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correctIndex === index;
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
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${bgColor} ${borderColor}`}
              >
                <span className="font-medium text-[var(--neutral-700)]">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-center text-[var(--neutral-500)]">
        알맞은 답을 선택해주세요
      </p>
    </div>
  );
}
