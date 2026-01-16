'use client';

import type { AssessmentQuestion, CognitiveCategory } from '@/data/assessment-questions';
import { categoryConfig } from '@/data/assessment-questions';
import Card from '@/components/ui/Card';
import AnswerInput from './AnswerInput';
import Timer from './Timer';

interface QuestionCardProps {
  /** 문항 데이터 */
  question: AssessmentQuestion;
  /** 현재 답변 */
  answer: string | string[] | number | null;
  /** 답변 변경 핸들러 */
  onAnswerChange: (value: string | string[] | number) => void;
  /** 답변 제출 핸들러 */
  onSubmit: () => void;
  /** 시간 초과 핸들러 */
  onTimeUp?: () => void;
  /** 타이머 실행 여부 */
  timerRunning?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 입력 필드 참조 (자동 포커스용) */
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** 문항 인덱스 - 타이머 리셋용 */
  questionIndex?: number;
}

export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  onTimeUp,
  timerRunning = true,
  disabled = false,
  inputRef,
  questionIndex,
}: QuestionCardProps) {
  const config = categoryConfig[question.category];

  // 난이도 표시
  const difficultyStars = '★'.repeat(question.difficulty) + '☆'.repeat(3 - question.difficulty);
  const difficultyLabel = ['쉬움', '보통', '어려움'][question.difficulty - 1];

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-2xl mx-auto">
      {/* 상단: 카테고리 및 타이머 */}
      <div className="flex items-start justify-between mb-6">
        {/* 카테고리 배지 */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              bg-[var(--primary-lighter)]
            `}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--neutral-800)]">
              {config.name}
            </h3>
            <p className="text-sm text-[var(--neutral-500)]">
              {config.description}
            </p>
          </div>
        </div>

        {/* 타이머 */}
        <Timer
          duration={question.timeLimit}
          isRunning={timerRunning && !disabled}
          onTimeUp={onTimeUp}
          size="md"
          warningThreshold={Math.min(10, Math.floor(question.timeLimit * 0.2))}
          questionIndex={questionIndex}
        />
      </div>

      {/* 문항 메타 정보 */}
      <div className="flex items-center gap-4 mb-4 text-sm text-[var(--neutral-500)]">
        <span className="flex items-center gap-1">
          <span className="text-[var(--warning)]">{difficultyStars}</span>
          <span>{difficultyLabel}</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-[var(--neutral-300)]" />
        <span>{question.points}점</span>
      </div>

      {/* 문항 안내 (있는 경우) */}
      {question.instruction && (
        <div className="mb-4 p-4 bg-[var(--info)]/10 border border-[var(--info)]/30 rounded-xl">
          <p className="text-sm text-[var(--info)] font-medium">
            💡 {question.instruction}
          </p>
        </div>
      )}

      {/* 문항 질문 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--neutral-900)] leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* 답변 입력 영역 */}
      <AnswerInput
        type={question.type}
        options={question.options}
        value={answer}
        onChange={onAnswerChange}
        onSubmit={onSubmit}
        disabled={disabled}
        placeholder="답변을 입력하세요"
        hint={question.hint}
        multiSelect={question.multiSelect}
        inputRef={inputRef}
      />
    </Card>
  );
}

// 문항 미리보기 카드 (간략 버전)
interface QuestionPreviewCardProps {
  question: AssessmentQuestion;
  index: number;
  isCompleted?: boolean;
  isCorrect?: boolean;
  onClick?: () => void;
}

export function QuestionPreviewCard({
  question,
  index,
  isCompleted = false,
  isCorrect,
  onClick,
}: QuestionPreviewCardProps) {
  const config = categoryConfig[question.category];

  return (
    <Card
      variant="bordered"
      padding="sm"
      hoverable
      clickable={!!onClick}
      onClick={onClick}
      className={`
        ${isCompleted ? 'border-l-4' : ''}
        ${isCorrect === true ? 'border-l-[var(--success)]' : ''}
        ${isCorrect === false ? 'border-l-[var(--danger)]' : ''}
        ${isCompleted && isCorrect === undefined ? 'border-l-[var(--neutral-400)]' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        {/* 번호 */}
        <span
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${
              isCompleted
                ? isCorrect
                  ? 'bg-[var(--success)] text-white'
                  : isCorrect === false
                    ? 'bg-[var(--danger)] text-white'
                    : 'bg-[var(--neutral-400)] text-white'
                : 'bg-[var(--neutral-200)] text-[var(--neutral-600)]'
            }
          `}
        >
          {isCompleted ? (isCorrect ? '✓' : '✗') : index + 1}
        </span>

        {/* 카테고리 아이콘 */}
        <span className="text-lg">{config.icon}</span>

        {/* 문항 요약 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--neutral-700)] truncate">
            {question.question}
          </p>
          <p className="text-xs text-[var(--neutral-500)]">
            {config.name} · {question.points}점
          </p>
        </div>
      </div>
    </Card>
  );
}
