'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TrainingType, PerformanceData } from '@/types';

// 게임 카드 타입
export interface GameCard {
  id: string;
  value: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// 게임 레벨 설정
export interface GameLevel {
  level: number;
  gridSize: { rows: number; cols: number };
  timeLimit: number; // 초
  pairsCount: number;
}

// 게임 상태
export interface GameState {
  cards: GameCard[];
  flippedCards: string[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
  startTime: number | null;
  elapsedTime: number;
  isCompleted: boolean;
}

// 훈련 세션 상태
interface TrainingState {
  // 현재 훈련 정보
  currentTrainingId: number | null;
  trainingType: TrainingType | null;
  currentLevel: number;

  // 게임 상태
  gameState: GameState | null;
  isStarted: boolean;
  isCompleted: boolean;
  isPaused: boolean;

  // 성과 데이터
  score: number;
  accuracy: number;
  averageResponseTime: number;
  mistakes: number;

  // 이력
  recentSessions: Array<{
    id: number;
    type: TrainingType;
    score: number;
    level: number;
    completedAt: Date;
  }>;

  // 액션
  startTraining: (type: TrainingType, level?: number) => void;
  initializeMemoryGame: (level: number) => void;
  flipCard: (cardId: string) => void;
  checkMatch: () => Promise<boolean>;
  updateElapsedTime: (time: number) => void;
  completeTraining: (sessionId: string) => Promise<void>;
  pauseTraining: () => void;
  resumeTraining: () => void;
  resetTraining: () => void;
  addToHistory: (session: { id: number; type: TrainingType; score: number; level: number; completedAt: Date }) => void;
}

// 게임 레벨 설정
export const GAME_LEVELS: GameLevel[] = [
  { level: 1, gridSize: { rows: 3, cols: 4 }, timeLimit: 120, pairsCount: 6 },
  { level: 2, gridSize: { rows: 4, cols: 4 }, timeLimit: 150, pairsCount: 8 },
  { level: 3, gridSize: { rows: 4, cols: 5 }, timeLimit: 180, pairsCount: 10 },
  { level: 4, gridSize: { rows: 5, cols: 6 }, timeLimit: 240, pairsCount: 15 },
];

// 카드 이모지 목록
const CARD_EMOJIS = [
  { value: 'apple', emoji: '🍎' },
  { value: 'banana', emoji: '🍌' },
  { value: 'grape', emoji: '🍇' },
  { value: 'orange', emoji: '🍊' },
  { value: 'strawberry', emoji: '🍓' },
  { value: 'watermelon', emoji: '🍉' },
  { value: 'cherry', emoji: '🍒' },
  { value: 'peach', emoji: '🍑' },
  { value: 'pear', emoji: '🍐' },
  { value: 'lemon', emoji: '🍋' },
  { value: 'mango', emoji: '🥭' },
  { value: 'pineapple', emoji: '🍍' },
  { value: 'coconut', emoji: '🥥' },
  { value: 'avocado', emoji: '🥑' },
  { value: 'tomato', emoji: '🍅' },
];

// 카드 생성 헬퍼 함수
function createCards(pairsCount: number): GameCard[] {
  const selectedEmojis = CARD_EMOJIS.slice(0, pairsCount);
  const cards: GameCard[] = [];

  selectedEmojis.forEach((item, index) => {
    // 각 쌍마다 2장의 카드 생성
    cards.push({
      id: `card-${index}-a`,
      value: item.value,
      emoji: item.emoji,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `card-${index}-b`,
      value: item.value,
      emoji: item.emoji,
      isFlipped: false,
      isMatched: false,
    });
  });

  // 카드 섞기 (Fisher-Yates shuffle)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

// 초기 상태
const initialState = {
  currentTrainingId: null,
  trainingType: null,
  currentLevel: 1,
  gameState: null,
  isStarted: false,
  isCompleted: false,
  isPaused: false,
  score: 0,
  accuracy: 0,
  averageResponseTime: 0,
  mistakes: 0,
  recentSessions: [],
};

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 훈련 시작
      startTraining: (type: TrainingType, level = 1) => {
        set({
          trainingType: type,
          currentLevel: level,
          isStarted: true,
          isCompleted: false,
          isPaused: false,
          score: 0,
          accuracy: 0,
          averageResponseTime: 0,
          mistakes: 0,
        });

        // 게임 타입에 따라 초기화
        if (type === 'memory_game') {
          get().initializeMemoryGame(level);
        }
      },

      // 기억력 게임 초기화
      initializeMemoryGame: (level: number) => {
        const levelConfig = GAME_LEVELS[level - 1] || GAME_LEVELS[0];
        const cards = createCards(levelConfig.pairsCount);

        set({
          gameState: {
            cards,
            flippedCards: [],
            matchedPairs: 0,
            totalPairs: levelConfig.pairsCount,
            moves: 0,
            startTime: Date.now(),
            elapsedTime: 0,
            isCompleted: false,
          },
        });
      },

      // 카드 뒤집기
      flipCard: (cardId: string) => {
        const { gameState } = get();
        if (!gameState) return;

        // 이미 2장이 뒤집혀 있거나, 이미 매칭된 카드면 무시
        if (gameState.flippedCards.length >= 2) return;

        const card = gameState.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched) return;

        const updatedCards = gameState.cards.map(c =>
          c.id === cardId ? { ...c, isFlipped: true } : c
        );

        set({
          gameState: {
            ...gameState,
            cards: updatedCards,
            flippedCards: [...gameState.flippedCards, cardId],
          },
        });
      },

      // 매칭 확인
      checkMatch: async () => {
        const { gameState } = get();
        if (!gameState || gameState.flippedCards.length !== 2) return false;

        const [firstId, secondId] = gameState.flippedCards;
        const firstCard = gameState.cards.find(c => c.id === firstId);
        const secondCard = gameState.cards.find(c => c.id === secondId);

        if (!firstCard || !secondCard) return false;

        const isMatch = firstCard.value === secondCard.value;

        // 약간의 딜레이 후 결과 처리
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isMatch) {
          // 매칭 성공
          const updatedCards = gameState.cards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          );

          const newMatchedPairs = gameState.matchedPairs + 1;
          const isCompleted = newMatchedPairs === gameState.totalPairs;

          set(state => ({
            gameState: {
              ...gameState,
              cards: updatedCards,
              flippedCards: [],
              matchedPairs: newMatchedPairs,
              moves: gameState.moves + 1,
              isCompleted,
            },
            score: state.score + 100,
            isCompleted,
          }));

          return true;
        } else {
          // 매칭 실패 - 카드 다시 뒤집기
          const updatedCards = gameState.cards.map(c =>
            c.id === firstId || c.id === secondId
              ? { ...c, isFlipped: false }
              : c
          );

          set(state => ({
            gameState: {
              ...gameState,
              cards: updatedCards,
              flippedCards: [],
              moves: gameState.moves + 1,
            },
            mistakes: state.mistakes + 1,
          }));

          return false;
        }
      },

      // 경과 시간 업데이트
      updateElapsedTime: (time: number) => {
        const { gameState } = get();
        if (!gameState) return;

        set({
          gameState: {
            ...gameState,
            elapsedTime: time,
          },
        });
      },

      // 훈련 완료
      completeTraining: async (sessionId: string) => {
        const state = get();
        if (!state.trainingType) return;

        const { gameState, currentLevel, score, mistakes } = state;
        const moves = gameState?.moves || 0;
        const totalPairs = gameState?.totalPairs || 1;
        const elapsedTime = gameState?.elapsedTime || 0;

        // 정확도 계산: 맞춘 쌍 / 총 시도 횟수
        const accuracy = moves > 0 ? Math.round((totalPairs / moves) * 100) : 0;
        // 평균 응답 시간
        const avgResponseTime = moves > 0 ? Math.round(elapsedTime / moves) : 0;

        const performanceData: PerformanceData = {
          level: currentLevel,
          score,
          accuracy,
          averageResponseTime: avgResponseTime,
          mistakes,
        };

        try {
          const response = await fetch('/api/training/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              trainingType: state.trainingType,
              durationSeconds: Math.round(elapsedTime),
              engagementScore: accuracy,
              completionRate: 1.0,
              performanceData,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.trainingSession) {
              get().addToHistory({
                id: data.trainingSession.id,
                type: state.trainingType,
                score,
                level: currentLevel,
                completedAt: new Date(),
              });
            }
          }
        } catch (error) {
          console.error('Failed to save training session:', error);
        }

        set({
          isCompleted: true,
          accuracy,
          averageResponseTime: avgResponseTime,
        });
      },

      // 일시정지
      pauseTraining: () => {
        set({ isPaused: true });
      },

      // 재개
      resumeTraining: () => {
        set({ isPaused: false });
      },

      // 초기화
      resetTraining: () => {
        set({
          ...initialState,
          recentSessions: get().recentSessions, // 이력은 유지
        });
      },

      // 이력 추가
      addToHistory: (session) => {
        set(state => ({
          recentSessions: [session, ...state.recentSessions].slice(0, 10), // 최근 10개만 유지
        }));
      },
    }),
    {
      name: 'rememory-training',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSessions: state.recentSessions,
      }),
    }
  )
);
