/**
 * localStorage 마이그레이션 유틸리티
 * 기존 rememory 키에서 return 키로 변경
 */

const MIGRATION_KEY_MAP: Record<string, string> = {
  'rememory-session': 'return-session',
  'rememory-photos': 'return-photos',
  'rememory-training': 'return-training',
};

const MIGRATION_VERSION_KEY = 'return-migration-version';
const CURRENT_MIGRATION_VERSION = 1;

/**
 * 기존 localStorage 데이터를 새 키로 마이그레이션
 * 브라우저에서만 실행됨
 */
export function migrateLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    // 이미 마이그레이션 완료된 경우 스킵
    const migrationVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
    if (migrationVersion && parseInt(migrationVersion, 10) >= CURRENT_MIGRATION_VERSION) {
      return;
    }

    // 각 키에 대해 마이그레이션 수행
    Object.entries(MIGRATION_KEY_MAP).forEach(([oldKey, newKey]) => {
      const oldData = localStorage.getItem(oldKey);

      if (oldData) {
        // 새 키에 데이터가 없는 경우에만 마이그레이션
        const newData = localStorage.getItem(newKey);
        if (!newData) {
          localStorage.setItem(newKey, oldData);
          console.log(`[Storage Migration] Migrated: ${oldKey} → ${newKey}`);
        }

        // 기존 키 삭제
        localStorage.removeItem(oldKey);
        console.log(`[Storage Migration] Removed old key: ${oldKey}`);
      }
    });

    // 마이그레이션 버전 기록
    localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION.toString());
    console.log('[Storage Migration] Migration completed successfully');
  } catch (error) {
    console.error('[Storage Migration] Error during migration:', error);
  }
}

/**
 * 모든 Re:turn 관련 localStorage 데이터 초기화
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    Object.values(MIGRATION_KEY_MAP).forEach((key) => {
      localStorage.removeItem(key);
    });

    // 기존 키도 삭제 (마이그레이션 안 된 경우 대비)
    Object.keys(MIGRATION_KEY_MAP).forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('[Storage] All app data cleared');
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
  }
}

/**
 * 특정 저장소 초기화
 */
export function clearStorage(type: 'session' | 'photos' | 'training'): void {
  if (typeof window === 'undefined') return;

  const key = `return-${type}`;
  try {
    localStorage.removeItem(key);
    console.log(`[Storage] Cleared: ${key}`);
  } catch (error) {
    console.error(`[Storage] Error clearing ${key}:`, error);
  }
}
