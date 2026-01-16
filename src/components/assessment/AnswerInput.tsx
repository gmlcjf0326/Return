'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuestionType } from '@/data/assessment-questions';
import Button from '@/components/ui/Button';

interface AnswerInputProps {
  /** 문항 타입 */
  type: QuestionType;
  /** 선택지 (객관식인 경우) */
  options?: string[];
  /** 현재 답변 */
  value: string | string[] | number | null;
  /** 답변 변경 핸들러 */
  onChange: (value: string | string[] | number) => void;
  /** 답변 제출 핸들러 */
  onSubmit: () => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 힌트 텍스트 */
  hint?: string;
  /** 다중 선택 가능 여부 (객관식) */
  multiSelect?: boolean;
  /** 입력 필드 참조 */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function AnswerInput({
  type,
  options = [],
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = '답변을 입력하세요',
  hint,
  multiSelect = false,
  inputRef,
}: AnswerInputProps) {
  const [localValue, setLocalValue] = useState<string>('');
  const [sequenceAnswers, setSequenceAnswers] = useState<string[]>([]);
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[]>([]);

  // value 변경 시 로컬 상태 동기화
  useEffect(() => {
    if (typeof value === 'string') {
      setLocalValue(value);
      setMultiSelectAnswers([]);
    } else if (Array.isArray(value)) {
      setSequenceAnswers(value);
      setMultiSelectAnswers(value);
    } else if (typeof value === 'number') {
      setLocalValue(String(value));
    } else {
      setLocalValue('');
      setSequenceAnswers([]);
      setMultiSelectAnswers([]);
    }
  }, [value]);

  // 텍스트 입력 핸들러
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // 숫자 입력 핸들러
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      if (newValue !== '') {
        onChange(Number(newValue));
      }
    },
    [onChange]
  );

  // 객관식 선택 핸들러 (단일 선택)
  const handleOptionSelect = useCallback(
    (option: string) => {
      onChange(option);
    },
    [onChange]
  );

  // 다중 선택 핸들러
  const handleMultiSelect = useCallback(
    (option: string) => {
      const newSelection = multiSelectAnswers.includes(option)
        ? multiSelectAnswers.filter((s) => s !== option)
        : [...multiSelectAnswers, option];
      setMultiSelectAnswers(newSelection);
      onChange(newSelection);
    },
    [multiSelectAnswers, onChange]
  );

  // 순서 배열 핸들러
  const handleSequenceSelect = useCallback(
    (option: string) => {
      const newSequence = sequenceAnswers.includes(option)
        ? sequenceAnswers.filter((s) => s !== option)
        : [...sequenceAnswers, option];
      setSequenceAnswers(newSequence);
      onChange(newSequence);
    },
    [sequenceAnswers, onChange]
  );

  // 순서 초기화
  const handleResetSequence = useCallback(() => {
    setSequenceAnswers([]);
    onChange([]);
  }, [onChange]);

  // Enter 키 제출
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !disabled) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit, disabled]
  );

  // 객관식 (multiple_choice) - 다중 선택 지원
  if (type === 'multiple_choice' && options.length > 0) {
    const isSelected = (option: string) => {
      if (multiSelect) {
        return multiSelectAnswers.includes(option);
      }
      return value === option;
    };

    const hasSelection = multiSelect ? multiSelectAnswers.length > 0 : !!value;

    return (
      <div className="space-y-3">
        {/* 다중 선택 안내 */}
        {multiSelect && (
          <div className="flex items-center gap-2 text-sm text-[var(--primary)] bg-[var(--primary-lighter)] px-4 py-2 rounded-lg">
            <span>📌</span>
            <span>여러 개를 선택할 수 있습니다. ({multiSelectAnswers.length}개 선택됨)</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {options.map((option, index) => {
            const selected = isSelected(option);
            const selectedIndex = multiSelect ? multiSelectAnswers.indexOf(option) : -1;

            return (
              <button
                key={index}
                onClick={() => multiSelect ? handleMultiSelect(option) : handleOptionSelect(option)}
                disabled={disabled}
                className={`
                  w-full min-h-[64px] px-6 py-4 text-left text-lg
                  rounded-xl border-2 transition-all duration-200
                  ${
                    selected
                      ? 'border-[var(--primary)] bg-[var(--primary-lighter)] text-[var(--primary-deep)] font-medium'
                      : 'border-[var(--neutral-200)] bg-white hover:border-[var(--primary-light)] hover:bg-[var(--neutral-50)]'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}
                `}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${
                        selected
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--neutral-200)] text-[var(--neutral-600)]'
                      }
                    `}
                  >
                    {multiSelect && selected ? selectedIndex + 1 : index + 1}
                  </span>
                  {option}
                  {multiSelect && selected && (
                    <span className="ml-auto text-[var(--primary)]">✓</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {hint && (
          <p className="text-sm text-[var(--neutral-500)] mt-2">{hint}</p>
        )}

        <Button
          onClick={onSubmit}
          disabled={disabled || !hasSelection}
          size="lg"
          fullWidth
          className="mt-4"
        >
          다음 문항
        </Button>
      </div>
    );
  }

  // 순서 배열 (sequence)
  if (type === 'sequence' && options.length > 0) {
    return (
      <div className="space-y-4">
        {/* 선택된 순서 표시 */}
        <div className="min-h-[60px] p-4 bg-[var(--neutral-50)] rounded-xl border-2 border-dashed border-[var(--neutral-300)]">
          {sequenceAnswers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sequenceAnswers.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
                >
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[var(--neutral-400)] text-center">
              아래 항목을 순서대로 선택하세요
            </p>
          )}
        </div>

        {/* 선택 옵션들 */}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = sequenceAnswers.includes(option);
            const selectedIndex = sequenceAnswers.indexOf(option);

            return (
              <button
                key={index}
                onClick={() => handleSequenceSelect(option)}
                disabled={disabled}
                className={`
                  min-h-[56px] px-4 py-3 text-base
                  rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary-lighter)] text-[var(--primary-deep)]'
                      : 'border-[var(--neutral-200)] bg-white hover:border-[var(--primary-light)]'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="flex items-center justify-between">
                  {option}
                  {isSelected && (
                    <span className="w-6 h-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {selectedIndex + 1}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleResetSequence}
            variant="outline"
            disabled={disabled || sequenceAnswers.length === 0}
            className="flex-1"
          >
            다시 선택
          </Button>
          <Button
            onClick={onSubmit}
            disabled={disabled || sequenceAnswers.length === 0}
            size="lg"
            className="flex-1"
          >
            다음 문항
          </Button>
        </div>

        {hint && (
          <p className="text-sm text-[var(--neutral-500)]">{hint}</p>
        )}
      </div>
    );
  }

  // 텍스트 입력 (text_input, recall)
  if (type === 'text_input' || type === 'recall') {
    return (
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus
          className={`
            w-full h-[64px] px-6 text-xl
            border-2 border-[var(--neutral-300)] rounded-xl
            focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lighter)]
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--neutral-100)]' : 'bg-white'}
          `}
        />

        {hint && (
          <p className="text-sm text-[var(--neutral-500)]">{hint}</p>
        )}

        <Button
          onClick={onSubmit}
          disabled={disabled || !localValue.trim()}
          size="lg"
          fullWidth
        >
          다음 문항
        </Button>
      </div>
    );
  }

  // 패턴 매칭, 반응 테스트 (pattern_match, reaction)
  if (type === 'pattern_match' || type === 'reaction') {
    return (
      <div className="space-y-4">
        {options.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={disabled}
                className={`
                  min-h-[80px] px-6 py-4 text-lg font-medium
                  rounded-xl border-2 transition-all duration-150
                  ${
                    value === option
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--neutral-200)] bg-white hover:border-[var(--primary)] hover:bg-[var(--primary-lighter)]'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="number"
            value={localValue}
            onChange={handleNumberChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full h-[64px] px-6 text-xl text-center font-mono
              border-2 border-[var(--neutral-300)] rounded-xl
              focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lighter)]
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--neutral-100)]' : 'bg-white'}
            `}
          />
        )}

        {hint && (
          <p className="text-sm text-[var(--neutral-500)]">{hint}</p>
        )}

        <Button
          onClick={onSubmit}
          disabled={disabled || (!value && !localValue)}
          size="lg"
          fullWidth
        >
          다음 문항
        </Button>
      </div>
    );
  }

  // 기본 텍스트 입력
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={localValue}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full h-[64px] px-6 text-xl
          border-2 border-[var(--neutral-300)] rounded-xl
          focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lighter)]
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--neutral-100)]' : 'bg-white'}
        `}
      />

      {hint && (
        <p className="text-sm text-[var(--neutral-500)]">{hint}</p>
      )}

      <Button
        onClick={onSubmit}
        disabled={disabled || !localValue.trim()}
        size="lg"
        fullWidth
      >
        다음 문항
      </Button>
    </div>
  );
}
