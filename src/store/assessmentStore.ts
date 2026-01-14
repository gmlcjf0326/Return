import { create } from 'zustand';
import type {
  AssessmentQuestion,
  RawResponse,
  BehaviorData,
  EmotionRecord,
  Assessment,
} from '@/types';

interface AssessmentState {
  // 현재 진단 세션
  currentAssessmentId: number | null;
  questions: AssessmentQuestion[];
  currentQuestionIndex: number;
  responses: RawResponse[];
  behaviorData: BehaviorData;

  // UI 상태
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  questionStartTime: number | null;

  // 결과
  result: Assessment | null;

  // Actions
  startAssessment: (questions: AssessmentQuestion[]) => void;
  submitResponse: (response: RawResponse) => void;
  nextQuestion: () => void;
  recordEmotion: (emotion: EmotionRecord) => void;
  recordHesitation: () => void;
  recordCorrection: () => void;
  completeAssessment: () => Promise<void>;
  setResult: (result: Assessment) => void;
  resetAssessment: () => void;
}

const initialBehaviorData: BehaviorData = {
  responseTime: [],
  hesitationCount: 0,
  correctionCount: 0,
  emotionTimeline: [],
};

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  currentAssessmentId: null,
  questions: [],
  currentQuestionIndex: 0,
  responses: [],
  behaviorData: initialBehaviorData,
  isStarted: false,
  isCompleted: false,
  startTime: null,
  questionStartTime: null,
  result: null,

  // 진단 시작
  startAssessment: (questions: AssessmentQuestion[]) => {
    const now = Date.now();
    set({
      questions,
      currentQuestionIndex: 0,
      responses: [],
      behaviorData: initialBehaviorData,
      isStarted: true,
      isCompleted: false,
      startTime: now,
      questionStartTime: now,
      result: null,
    });
  },

  // 응답 제출
  submitResponse: (response: RawResponse) => {
    const { responses, questionStartTime } = get();
    const now = Date.now();
    const responseTime = questionStartTime ? now - questionStartTime : 0;

    const responseWithTime: RawResponse = {
      ...response,
      responseTime,
    };

    set((state) => ({
      responses: [...state.responses, responseWithTime],
      behaviorData: {
        ...state.behaviorData,
        responseTime: [...state.behaviorData.responseTime, responseTime],
      },
    }));
  },

  // 다음 문항으로
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      // 모든 문항 완료
      set({ isCompleted: true });
    } else {
      set({
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now(),
      });
    }
  },

  // 감정 기록
  recordEmotion: (emotion: EmotionRecord) => {
    set((state) => ({
      behaviorData: {
        ...state.behaviorData,
        emotionTimeline: [...state.behaviorData.emotionTimeline, emotion],
      },
    }));
  },

  // 망설임 기록
  recordHesitation: () => {
    set((state) => ({
      behaviorData: {
        ...state.behaviorData,
        hesitationCount: state.behaviorData.hesitationCount + 1,
      },
    }));
  },

  // 수정 기록
  recordCorrection: () => {
    set((state) => ({
      behaviorData: {
        ...state.behaviorData,
        correctionCount: state.behaviorData.correctionCount + 1,
      },
    }));
  },

  // 진단 완료 및 서버 전송
  completeAssessment: async () => {
    const { responses, behaviorData } = get();

    // 서버에 결과 전송
    try {
      const response = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          behaviorData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        set({ result: data.data, currentAssessmentId: data.data.id });
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  },

  // 결과 설정
  setResult: (result: Assessment) => {
    set({ result, isCompleted: true });
  },

  // 초기화
  resetAssessment: () => {
    set({
      currentAssessmentId: null,
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      behaviorData: initialBehaviorData,
      isStarted: false,
      isCompleted: false,
      startTime: null,
      questionStartTime: null,
      result: null,
    });
  },
}));

export default useAssessmentStore;
