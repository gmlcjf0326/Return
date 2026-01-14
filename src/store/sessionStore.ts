import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Session, ProfileData } from '@/types';

interface SessionState {
  session: Session | null;
  isInitialized: boolean;

  // Actions
  initSession: () => Promise<Session>;
  loadSession: (sessionId: string) => Promise<Session | null>;
  updateProfile: (profileData: Partial<ProfileData>) => void;
  updateNickname: (nickname: string) => void;
  updateBirthYear: (birthYear: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,
      isInitialized: false,

      // 새 세션 생성
      initSession: async () => {
        const existingSession = get().session;

        // 이미 세션이 있으면 반환
        if (existingSession) {
          // 서버에 마지막 활동 시간 업데이트
          try {
            await fetch(`/api/session/${existingSession.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lastActiveAt: new Date() }),
            });
          } catch (error) {
            console.error('Failed to update session:', error);
          }

          set({ isInitialized: true });
          return existingSession;
        }

        // 새 세션 생성
        const newSession: Session = {
          id: uuidv4(),
          createdAt: new Date(),
          lastActiveAt: new Date(),
        };

        // 서버에 세션 저장
        try {
          const response = await fetch('/api/session/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession),
          });

          if (!response.ok) {
            throw new Error('Failed to create session');
          }
        } catch (error) {
          console.error('Failed to create session on server:', error);
          // 서버 실패해도 로컬에는 저장
        }

        set({ session: newSession, isInitialized: true });
        return newSession;
      },

      // 기존 세션 로드
      loadSession: async (sessionId: string) => {
        try {
          const response = await fetch(`/api/session/${sessionId}`);

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          const session = data.data as Session;

          set({ session, isInitialized: true });
          return session;
        } catch (error) {
          console.error('Failed to load session:', error);
          return null;
        }
      },

      // 프로필 업데이트
      updateProfile: (profileData: Partial<ProfileData>) => {
        const currentSession = get().session;
        if (!currentSession) return;

        const updatedSession: Session = {
          ...currentSession,
          profileData: {
            ...currentSession.profileData,
            ...profileData,
          },
        };

        set({ session: updatedSession });

        // 서버에도 업데이트
        fetch(`/api/session/${currentSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileData: updatedSession.profileData }),
        }).catch(console.error);
      },

      // 닉네임 업데이트
      updateNickname: (nickname: string) => {
        const currentSession = get().session;
        if (!currentSession) return;

        const updatedSession: Session = {
          ...currentSession,
          nickname,
        };

        set({ session: updatedSession });

        fetch(`/api/session/${currentSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname }),
        }).catch(console.error);
      },

      // 출생년도 업데이트
      updateBirthYear: (birthYear: number) => {
        const currentSession = get().session;
        if (!currentSession) return;

        const updatedSession: Session = {
          ...currentSession,
          birthYear,
        };

        set({ session: updatedSession });

        fetch(`/api/session/${currentSession.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ birthYear }),
        }).catch(console.error);
      },

      // 세션 초기화
      clearSession: () => {
        set({ session: null, isInitialized: false });
      },
    }),
    {
      name: 'rememory-session',
      partialize: (state) => ({ session: state.session }),
    }
  )
);

export default useSessionStore;
