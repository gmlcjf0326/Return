import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PhotoData } from '@/components/photos/PhotoCard';

interface PhotoStore {
  photos: PhotoData[];
  selectedPhotoId: string | null;

  // Actions
  addPhoto: (photo: PhotoData) => void;
  addPhotos: (photos: PhotoData[]) => void;
  updatePhoto: (id: string, updates: Partial<PhotoData>) => void;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string | null) => void;
  getPhotoById: (id: string) => PhotoData | undefined;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>()(
  persist(
    (set, get) => ({
      photos: [],
      selectedPhotoId: null,

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
    }),
    {
      name: 'rememory-photos',
      partialize: (state) => ({
        photos: state.photos,
      }),
    }
  )
);
