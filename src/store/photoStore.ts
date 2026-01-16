/**
 * 사진 상태 관리 Store
 * TODO: [REAL_DATA] 실제 사진 업로드 연동 시 더미 데이터 로직 제거
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PhotoData } from '@/components/photos/PhotoCard';
import { dummyPhotos } from '@/data/dummyPhotos';

interface PhotoStore {
  photos: PhotoData[];
  selectedPhotoId: string | null;
  isInitialized: boolean;

  // Actions
  addPhoto: (photo: PhotoData) => void;
  addPhotos: (photos: PhotoData[]) => void;
  updatePhoto: (id: string, updates: Partial<PhotoData>) => void;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string | null) => void;
  getPhotoById: (id: string) => PhotoData | undefined;
  clearPhotos: () => void;
  initializeDummyData: () => void;
}

export const usePhotoStore = create<PhotoStore>()(
  persist(
    (set, get) => ({
      photos: [],
      selectedPhotoId: null,
      isInitialized: false,

      addPhoto: (photo) =>
        set((state) => ({
          photos: [photo, ...state.photos],
        })),

      addPhotos: (newPhotos) =>
        set((state) => ({
          photos: [...newPhotos, ...state.photos],
        })),

      updatePhoto: (id, updates) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
          selectedPhotoId: state.selectedPhotoId === id ? null : state.selectedPhotoId,
        })),

      selectPhoto: (id) => set({ selectedPhotoId: id }),

      getPhotoById: (id) => get().photos.find((p) => p.id === id),

      clearPhotos: () => set({ photos: [], selectedPhotoId: null }),

      // TODO: [REAL_DATA] 실제 데이터 연동 시 이 함수 호출 제거
      initializeDummyData: () => {
        const state = get();
        if (!state.isInitialized) {
          // 더미 데이터만 로드 (기존 실제 데이터가 있으면 유지)
          const existingRealPhotos = state.photos.filter(p => !p.isDummy);
          set({
            photos: [...existingRealPhotos, ...dummyPhotos],
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'return-photos',
      partialize: (state) => ({
        photos: state.photos,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
