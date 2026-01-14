'use client';

import { useCallback, useState, useRef } from 'react';
import Button from '@/components/ui/Button';

interface PhotoUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export default function PhotoUploader({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
}: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
          continue;
        }
        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: 파일 크기가 ${maxSizeMB}MB를 초과합니다.`);
          continue;
        }
        valid.push(file);
      }

      if (valid.length > maxFiles) {
        errors.push(`최대 ${maxFiles}개 파일만 업로드할 수 있습니다.`);
        valid.splice(maxFiles);
      }

      return { valid, errors };
    },
    [maxFiles, maxSizeMB, acceptedTypes]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const { valid, errors } = validateFiles(fileArray);

      if (errors.length > 0) {
        setError(errors.join('\n'));
      } else {
        setError(null);
      }

      if (valid.length === 0) return;

      // 미리보기 생성
      const newPreviews = valid.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);

      // 업로드
      setIsUploading(true);
      try {
        await onUpload(valid);
        // 성공 시 미리보기 제거
        newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
        setPreviews([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : '업로드 실패');
      } finally {
        setIsUploading(false);
      }
    },
    [validateFiles, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, isUploading, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const removePreview = useCallback((index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-[var(--neutral-300)] hover:border-[var(--primary-light)] hover:bg-[var(--neutral-50)]'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="space-y-3">
          {/* 아이콘 */}
          <div className="text-5xl">
            {isUploading ? '⏳' : isDragging ? '📥' : '📷'}
          </div>

          {/* 텍스트 */}
          <div>
            <p className="text-lg font-medium text-[var(--neutral-700)]">
              {isUploading
                ? '업로드 중...'
                : isDragging
                  ? '여기에 놓으세요'
                  : '사진을 드래그하거나 클릭하여 업로드'}
            </p>
            <p className="text-sm text-[var(--neutral-500)] mt-1">
              JPG, PNG, WebP • 최대 {maxSizeMB}MB • {maxFiles}개까지
            </p>
          </div>

          {/* 버튼 */}
          {!isUploading && !isDragging && (
            <Button
              variant="secondary"
              size="md"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              disabled={disabled}
            >
              파일 선택
            </Button>
          )}

          {/* 로딩 */}
          {isUploading && (
            <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto" />
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg">
          <p className="text-sm text-[var(--danger)] whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* 미리보기 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative group aspect-square">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
