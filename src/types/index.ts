// ReMemory - TypeScript 타입 정의

// 세션 관련 타입
export interface Session {
  id: string;
  nickname?: string;
  birthYear?: number;
  profileData?: ProfileData;
  createdAt: Date;
  lastActiveAt?: Date;
}

export interface ProfileData {
  gender?: 'male' | 'female' | 'other';
  region?: string;
  interests?: string[];
  occupation?: string;
}

// 진단 관련 타입
export interface Assessment {
  id: number;
  sessionId: string;
  totalScore?: number;
  memoryScore?: number;
  calculationScore?: number;
  languageScore?: number;
  attentionScore?: number;
  executiveScore?: number;
  visuospatialScore?: number;
  riskLevel?: RiskLevel;
  behaviorData?: BehaviorData;
  rawResponses?: RawResponse[];
  createdAt: Date;
}

export type RiskLevel = 'normal' | 'mild_caution' | 'mci_suspected' | 'consultation_recommended';

export interface BehaviorData {
  responseTime: number[];
  hesitationCount: number;
  correctionCount: number;
  emotionTimeline: EmotionRecord[];
}

export interface EmotionRecord {
  timestamp: number;
  emotion: string;
  confidence: number;
}

export interface RawResponse {
  questionId: string;
  answer: string | number | boolean;
  responseTime: number;
  isCorrect?: boolean;
}

// 인지 평가 문항 타입
export interface AssessmentQuestion {
  id: string;
  category: CognitiveCategory;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  timeLimit?: number; // 초 단위
  points: number;
  mediaUrl?: string;
}

export type CognitiveCategory =
  | 'memory'
  | 'calculation'
  | 'language'
  | 'attention'
  | 'executive'
  | 'visuospatial';

export type QuestionType =
  | 'multiple_choice'
  | 'text_input'
  | 'voice_input'
  | 'drawing'
  | 'sequence'
  | 'reaction';

// 훈련 관련 타입
export interface TrainingSession {
  id: number;
  sessionId: string;
  trainingType: TrainingType;
  durationSeconds?: number;
  engagementScore?: number;
  completionRate?: number;
  performanceData?: PerformanceData;
  createdAt: Date;
}

export type TrainingType =
  | 'memory_game'
  | 'calculation_game'
  | 'language_game'
  | 'attention_game'
  | 'reminiscence';

export interface PerformanceData {
  level: number;
  score: number;
  accuracy: number;
  averageResponseTime: number;
  mistakes: number;
}

// 사진 관련 타입
export interface Photo {
  id: number;
  sessionId: string;
  fileUrl?: string;
  fileName?: string;
  autoTags?: PhotoTags;
  sceneType?: SceneType;
  estimatedEra?: string;
  peopleCount?: number;
  mood?: string;
  userTags?: string[];
  userDescription?: string;
  createdAt: Date;
}

export interface PhotoTags {
  scene: string;
  people_count: number;
  estimated_era: string;
  location_type: string;
  mood: string;
  objects: string[];
  description: string;
}

export type SceneType =
  | 'family_gathering'
  | 'travel'
  | 'daily_life'
  | 'event'
  | 'work'
  | 'school'
  | 'other';

// 회상 대화 타입
export interface ReminiscenceLog {
  id: number;
  sessionId: string;
  photoId?: number;
  aiQuestion?: string;
  userResponse?: string;
  responseAnalysis?: ResponseAnalysis;
  createdAt: Date;
}

export interface ResponseAnalysis {
  coherence: number; // 일관성 0-100
  detailLevel: number; // 상세도 0-100
  emotionalValence: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

// 분석 대시보드 타입
export interface AnalyticsSummary {
  sessionId: string;
  totalAssessments: number;
  averageScore: number;
  scoreHistory: ScorePoint[];
  categoryScores: CategoryScore[];
  recommendations: string[];
}

export interface ScorePoint {
  date: Date;
  score: number;
}

export interface CategoryScore {
  category: CognitiveCategory;
  currentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
}

// UI 상태 타입
export interface UIState {
  isLoading: boolean;
  isRecording: boolean;
  isCameraActive: boolean;
  currentStep: number;
  totalSteps: number;
}
