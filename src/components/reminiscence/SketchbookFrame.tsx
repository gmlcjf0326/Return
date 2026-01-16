/**
 * 스케치북 스타일 프레임 컴포넌트
 * 그림일기 결과 화면에서 사용
 */

'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SketchbookFrameProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'cream' | 'aged';
}

export default function SketchbookFrame({
  children,
  className,
  variant = 'default',
}: SketchbookFrameProps) {
  const variantStyles = {
    default: 'bg-white',
    cream: 'bg-amber-50',
    aged: 'bg-orange-50/50',
  };

  return (
    <div className={cn('relative', className)}>
      {/* 스케치북 외부 테두리 */}
      <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-3 shadow-xl">
        {/* 스프링 바인딩 장식 */}
        <div className="absolute left-4 top-0 bottom-0 w-4 flex flex-col justify-evenly">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-inner"
            />
          ))}
        </div>

        {/* 페이지 내용 */}
        <div
          className={cn(
            'ml-6 rounded-xl shadow-inner overflow-hidden',
            variantStyles[variant]
          )}
        >
          {/* 페이지 텍스처 */}
          <div
            className="relative"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 79px, #E5E5E5 79px, #E5E5E5 81px, transparent 81px),
                linear-gradient(#E5E5E5 1px, transparent 1px)
              `,
              backgroundSize: '100% 28px',
            }}
          >
            {children}
          </div>
        </div>

        {/* 페이지 그림자 효과 */}
        <div className="absolute -bottom-2 left-8 right-4 h-4 bg-gradient-to-b from-black/10 to-transparent rounded-b-xl" />
      </div>
    </div>
  );
}

export { SketchbookFrame };
