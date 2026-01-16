/**
 * 원고지 스타일 컴포넌트
 * 한 글자씩 셀에 배치하여 원고지 형태로 텍스트 표시
 */

'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ManuscriptPaperProps {
  /** 표시할 텍스트 */
  text: string;
  /** 한 줄당 글자 수 (기본: 20) */
  charsPerRow?: number;
  /** 표시할 최대 줄 수 (기본: 10) */
  maxRows?: number;
  /** 세로쓰기 여부 */
  vertical?: boolean;
  /** 제목 */
  title?: string;
  /** 날짜 */
  date?: string;
  /** 추가 클래스 */
  className?: string;
  /** 폰트 크기 (기본: normal) */
  fontSize?: 'small' | 'normal' | 'large';
}

export default function ManuscriptPaper({
  text,
  charsPerRow = 20,
  maxRows = 10,
  vertical = false,
  title,
  date,
  className,
  fontSize = 'normal',
}: ManuscriptPaperProps) {
  // 텍스트를 글자 배열로 변환 (공백 포함)
  const characters = useMemo(() => {
    // 줄바꿈을 공백으로 대체하고 글자 배열로 분리
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    const chars = [...cleanText];

    // 최대 글자 수 제한
    const maxChars = charsPerRow * maxRows;
    if (chars.length > maxChars) {
      return chars.slice(0, maxChars - 3).concat(['·', '·', '·']);
    }

    // 빈 칸으로 채우기 (원고지 느낌)
    const totalCells = charsPerRow * maxRows;
    while (chars.length < totalCells) {
      chars.push('');
    }

    return chars;
  }, [text, charsPerRow, maxRows]);

  // 줄 단위로 분리
  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < characters.length; i += charsPerRow) {
      result.push(characters.slice(i, i + charsPerRow));
    }
    return result.slice(0, maxRows);
  }, [characters, charsPerRow, maxRows]);

  // 폰트 크기 클래스
  const fontSizeClass = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
  }[fontSize];

  // 셀 크기 클래스
  const cellSizeClass = {
    small: 'w-6 h-6',
    normal: 'w-8 h-8',
    large: 'w-10 h-10',
  }[fontSize];

  return (
    <div
      className={cn(
        'manuscript-paper bg-amber-50 rounded-lg p-4 shadow-inner',
        vertical && 'writing-vertical',
        className
      )}
    >
      {/* 헤더 */}
      {(title || date) && (
        <div className="manuscript-header flex justify-between items-center mb-4 pb-2 border-b-2 border-amber-200">
          {title && (
            <h3 className="text-lg font-bold text-amber-900">{title}</h3>
          )}
          {date && (
            <span className="text-sm text-amber-700">{date}</span>
          )}
        </div>
      )}

      {/* 원고지 그리드 */}
      <div
        className={cn(
          'manuscript-grid',
          vertical ? 'flex flex-row-reverse gap-0' : 'flex flex-col gap-0'
        )}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              'manuscript-row flex',
              vertical ? 'flex-col' : 'flex-row'
            )}
          >
            {row.map((char, charIndex) => (
              <div
                key={charIndex}
                className={cn(
                  'manuscript-cell',
                  cellSizeClass,
                  'flex items-center justify-center',
                  'border border-amber-200',
                  'bg-white/50',
                  // 5글자마다 굵은 테두리 (원고지 스타일)
                  !vertical && charIndex > 0 && charIndex % 5 === 0 && 'border-l-2 border-l-amber-300',
                  vertical && rowIndex > 0 && rowIndex % 5 === 0 && 'border-t-2 border-t-amber-300',
                  // 첫 줄 상단 테두리
                  rowIndex === 0 && 'border-t-2 border-t-amber-300',
                  // 마지막 줄 하단 테두리
                  rowIndex === rows.length - 1 && 'border-b-2 border-b-amber-300',
                  // 첫 글자 좌측 테두리
                  charIndex === 0 && 'border-l-2 border-l-amber-300',
                  // 마지막 글자 우측 테두리
                  charIndex === row.length - 1 && 'border-r-2 border-r-amber-300'
                )}
              >
                <span
                  className={cn(
                    fontSizeClass,
                    'font-handwriting text-amber-900',
                    char === '' && 'opacity-0'
                  )}
                >
                  {char || '　'}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 하단 장식선 */}
      <div className="manuscript-footer mt-4 pt-2 border-t border-amber-200 flex justify-end">
        <span className="text-xs text-amber-500">
          {characters.filter(c => c !== '' && c !== ' ').length}자
        </span>
      </div>
    </div>
  );
}

export { ManuscriptPaper };
