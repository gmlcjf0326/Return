'use client';

import { useEffect } from 'react';
import { migrateLocalStorage } from '@/lib/utils/storageMigration';

/**
 * localStorage 마이그레이션을 수행하는 클라이언트 컴포넌트
 * 앱 초기 로드 시 실행되어 기존 데이터를 새 키로 마이그레이션
 */
export default function StorageMigration() {
  useEffect(() => {
    migrateLocalStorage();
  }, []);

  // 렌더링할 UI 없음
  return null;
}
