/**
 * 카테고리 필터 탭 컴포넌트
 * TODO: [REAL_DATA] 사용자 커스텀 카테고리 지원 시 확장
 */

'use client';

import { cn } from '@/lib/utils';
import { photoCategories, type CategoryInfo } from '@/data/photoCategories';
import type { PhotoCategory } from '@/components/photos/PhotoCard';

interface CategoryFilterProps {
  selectedCategory: PhotoCategory | null;
  onCategoryChange: (category: PhotoCategory | null) => void;
  photoCounts?: Record<PhotoCategory | 'all', number>;
  className?: string;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  photoCounts,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-2 pb-2">
        {/* 전체 버튼 */}
        <FilterButton
          isSelected={selectedCategory === null}
          onClick={() => onCategoryChange(null)}
          label="전체"
          icon="📸"
          count={photoCounts?.all}
        />

        {/* 카테고리별 버튼 */}
        {photoCategories.map((category) => (
          <FilterButton
            key={category.id}
            isSelected={selectedCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            label={category.label}
            icon={category.icon}
            color={category.color}
            count={photoCounts?.[category.id]}
          />
        ))}
      </div>
    </div>
  );
}

interface FilterButtonProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  color?: string;
  count?: number;
}

function FilterButton({
  isSelected,
  onClick,
  label,
  icon,
  color,
  count,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
        'border-2 whitespace-nowrap',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary shadow-md'
          : 'bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-accent'
      )}
      style={isSelected && color ? { backgroundColor: color, borderColor: color } : undefined}
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-1 px-1.5 py-0.5 text-xs rounded-full',
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export { CategoryFilter };
