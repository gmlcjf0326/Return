/**
 * 인지 평가 점수 계산 로직
 */

import type { CognitiveCategory, AssessmentQuestion } from '@/data/assessment-questions';
import { categoryConfig } from '@/data/assessment-questions';

// 응답 데이터 타입
export interface QuestionResponse {
  questionId: string;
  category: CognitiveCategory;
  answer: string | string[] | number | boolean;
  isCorrect: boolean;
  responseTime: number; // ms
  points: number;
  maxPoints: number;
}

// 카테고리별 점수
export interface CategoryScore {
  category: CognitiveCategory;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionsCorrect: number;
  questionsTotal: number;
  averageResponseTime: number;
}

// 전체 평가 결과
export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  riskLevel: RiskLevel;
  riskDescription: string;
  categoryScores: CategoryScore[];
  responses: QuestionResponse[];
  completedAt: string;
  duration: number; // 총 소요 시간 (ms)
}

// 위험도 레벨
export type RiskLevel = 'excellent' | 'mild_caution' | 'caution' | 'severe';

// 위험도 설정
export const riskLevelConfig: Record<RiskLevel, {
  label: string;
  description: string;
  color: string;
  minScore: number;
  maxScore: number;
}> = {
  excellent: {
    label: '우수',
    description: '현재 인지 기능이 우수한 상태입니다. 건강한 생활습관을 유지하세요.',
    color: 'success',
    minScore: 80,
    maxScore: 100,
  },
  mild_caution: {
    label: '경도 주의',
    description: '일부 영역에서 주의가 필요합니다. 정기적인 인지 훈련을 권장합니다.',
    color: 'warning',
    minScore: 60,
    maxScore: 79,
  },
  caution: {
    label: '주의',
    description: '인지 기능 저하가 관찰됩니다. 전문 의료기관 상담을 권장합니다.',
    color: 'caution',
    minScore: 50,
    maxScore: 59,
  },
  severe: {
    label: '심각',
    description: '인지 기능 저하가 심각합니다. 가능한 빨리 전문 의료기관 상담을 받으세요.',
    color: 'danger',
    minScore: 0,
    maxScore: 49,
  },
};

/**
 * 답변 정답 여부 확인
 */
export function checkAnswer(
  question: AssessmentQuestion,
  userAnswer: string | string[] | number
): boolean {
  const { correctAnswer } = question;

  // 배열 형태의 정답 (복수 선택 또는 순서 배열)
  if (Array.isArray(correctAnswer)) {
    if (Array.isArray(userAnswer)) {
      // 순서 배열 (sequence) - 순서와 내용이 정확히 일치해야 함
      if (question.type === 'sequence') {
        if (correctAnswer.length !== userAnswer.length) return false;
        return correctAnswer.every((ans, index) =>
          normalizeAnswer(ans) === normalizeAnswer(userAnswer[index])
        );
      }
      // 복수 선택 - 순서 상관없이 모두 포함되어야 함
      return correctAnswer.every((ans) =>
        userAnswer.some((ua) => normalizeAnswer(ua) === normalizeAnswer(ans))
      );
    } else {
      // 사용자 답변이 단일값인 경우 (정답 배열에 포함되면 정답)
      return correctAnswer.some(
        (ans) => normalizeAnswer(ans) === normalizeAnswer(userAnswer)
      );
    }
  }

  // 단일 정답
  return normalizeAnswer(correctAnswer) === normalizeAnswer(userAnswer);
}

/**
 * 답변 정규화 (공백 제거, 소문자 변환)
 */
function normalizeAnswer(answer: string | number | string[] | boolean): string {
  if (Array.isArray(answer)) {
    return answer.map(a => String(a).trim().toLowerCase()).join(',').replace(/\s+/g, '');
  }
  return String(answer).trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * 문항별 점수 계산
 * 정답 여부와 응답 시간을 고려하여 점수 계산
 */
export function calculateQuestionScore(
  question: AssessmentQuestion,
  isCorrect: boolean,
  responseTime: number
): number {
  if (!isCorrect) return 0;

  const { points, timeLimit } = question;
  const timeLimitMs = timeLimit * 1000;

  // 기본 점수 (정답 시 100%)
  let score = points;

  // 응답 시간에 따른 보너스/감점 (선택적)
  // 제한 시간의 50% 이내: 10% 보너스
  // 제한 시간의 80% 이내: 기본 점수
  // 제한 시간 초과: 50% 감점
  if (responseTime <= timeLimitMs * 0.5) {
    score = Math.round(points * 1.1); // 10% 보너스
  } else if (responseTime > timeLimitMs) {
    score = Math.round(points * 0.5); // 50% 감점
  }

  return Math.min(score, points); // 최대 점수 초과 방지
}

/**
 * 카테고리별 점수 계산
 */
export function calculateCategoryScore(
  category: CognitiveCategory,
  responses: QuestionResponse[]
): CategoryScore {
  const categoryResponses = responses.filter((r) => r.category === category);
  const config = categoryConfig[category];

  const totalScore = categoryResponses.reduce((sum, r) => sum + r.points, 0);
  const totalMaxScore = config.maxPoints;
  const correctCount = categoryResponses.filter((r) => r.isCorrect).length;
  const totalResponseTime = categoryResponses.reduce((sum, r) => sum + r.responseTime, 0);

  return {
    category,
    name: config.name,
    score: totalScore,
    maxScore: totalMaxScore,
    percentage: Math.round((totalScore / totalMaxScore) * 100),
    questionsCorrect: correctCount,
    questionsTotal: categoryResponses.length,
    averageResponseTime:
      categoryResponses.length > 0
        ? Math.round(totalResponseTime / categoryResponses.length)
        : 0,
  };
}

/**
 * 위험도 레벨 판정
 */
export function determineRiskLevel(percentage: number): RiskLevel {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'mild_caution';
  if (percentage >= 50) return 'caution';
  return 'severe';
}

/**
 * 전체 평가 결과 계산
 */
export function calculateAssessmentResult(
  responses: QuestionResponse[],
  startTime: number,
  endTime: number
): AssessmentResult {
  const categories: CognitiveCategory[] = [
    'memory',
    'language',
    'calculation',
    'attention',
    'executive',
    'visuospatial',
  ];

  // 카테고리별 점수 계산
  const categoryScores = categories.map((category) =>
    calculateCategoryScore(category, responses)
  );

  // 총점 계산
  const totalScore = categoryScores.reduce((sum, cs) => sum + cs.score, 0);
  const maxScore = 100; // 총 100점 만점
  const percentage = Math.round((totalScore / maxScore) * 100);

  // 위험도 판정
  const riskLevel = determineRiskLevel(percentage);
  const riskConfig = riskLevelConfig[riskLevel];

  return {
    totalScore,
    maxScore,
    percentage,
    riskLevel,
    riskDescription: riskConfig.description,
    categoryScores,
    responses,
    completedAt: new Date().toISOString(),
    duration: endTime - startTime,
  };
}

/**
 * 취약 영역 분석
 */
export function analyzeWeakAreas(categoryScores: CategoryScore[]): CognitiveCategory[] {
  // 70% 미만인 영역을 취약 영역으로 판단
  return categoryScores
    .filter((cs) => cs.percentage < 70)
    .sort((a, b) => a.percentage - b.percentage)
    .map((cs) => cs.category);
}

/**
 * 강점 영역 분석
 */
export function analyzeStrongAreas(categoryScores: CategoryScore[]): CognitiveCategory[] {
  // 85% 이상인 영역을 강점 영역으로 판단
  return categoryScores
    .filter((cs) => cs.percentage >= 85)
    .sort((a, b) => b.percentage - a.percentage)
    .map((cs) => cs.category);
}

/**
 * 추천 훈련 영역 생성
 */
export function getTrainingRecommendations(categoryScores: CategoryScore[]): {
  category: CognitiveCategory;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}[] {
  return categoryScores
    .filter((cs) => cs.percentage < 85)
    .sort((a, b) => a.percentage - b.percentage)
    .map((cs) => {
      let priority: 'high' | 'medium' | 'low';
      let reason: string;

      if (cs.percentage < 55) {
        priority = 'high';
        reason = `${cs.name} 영역의 점수가 낮습니다. 집중 훈련이 필요합니다.`;
      } else if (cs.percentage < 70) {
        priority = 'medium';
        reason = `${cs.name} 영역의 개선이 필요합니다. 정기적인 훈련을 권장합니다.`;
      } else {
        priority = 'low';
        reason = `${cs.name} 영역을 유지하기 위한 가벼운 훈련을 권장합니다.`;
      }

      return {
        category: cs.category,
        priority,
        reason,
      };
    });
}

/**
 * 이전 결과와 비교
 */
export function compareWithPrevious(
  current: AssessmentResult,
  previous: AssessmentResult | null
): {
  totalScoreChange: number;
  categoryChanges: {
    category: CognitiveCategory;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[];
} | null {
  if (!previous) return null;

  const totalScoreChange = current.totalScore - previous.totalScore;

  const categoryChanges = current.categoryScores.map((currentCs) => {
    const previousCs = previous.categoryScores.find(
      (cs) => cs.category === currentCs.category
    );
    const change = previousCs ? currentCs.score - previousCs.score : 0;

    let trend: 'up' | 'down' | 'stable';
    if (change > 0) trend = 'up';
    else if (change < 0) trend = 'down';
    else trend = 'stable';

    return {
      category: currentCs.category,
      change,
      trend,
    };
  });

  return {
    totalScoreChange,
    categoryChanges,
  };
}
