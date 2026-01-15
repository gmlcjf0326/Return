'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { useTrainingStore } from '@/store/trainingStore';
import { useSessionStore } from '@/store/sessionStore';
import type { TrainingType } from '@/types';

interface GameResultProps {
  trainingType: TrainingType;
  onRestart?: () => void;
  onNextLevel?: () => void;
  onExit?: () => void;
  showNextLevel?: boolean;
}

export function GameResult({
  trainingType,
  onRestart,
  onNextLevel,
  onExit,
  showNextLevel = false,
}: GameResultProps) {
  const { session } = useSessionStore();
  const {
    gameState,
    currentLevel,
    score,
    accuracy,
    mistakes,
    isCompleted,
    completeTraining,
  } = useTrainingStore();

  // 결과 저장
  useEffect(() => {
    if (isCompleted && session?.id) {
      completeTraining(session.id);
    }
  }, [isCompleted, session?.id, completeTraining]);

  const getGrade = () => {
    if (accuracy >= 90) return { grade: 'S', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (accuracy >= 80) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-100' };
    if (accuracy >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (accuracy >= 60) return { grade: 'C', color: 'text-purple-500', bg: 'bg-purple-100' };
    return { grade: 'D', color: 'text-slate-500', bg: 'bg-slate-100' };
  };

  const grade = getGrade();
  const moves = gameState?.moves || 0;
  const elapsedTime = gameState?.elapsedTime || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const getTrainingTypeName = (type: TrainingType) => {
    const names: Record<TrainingType, string> = {
      memory_game: '기억력 게임',
      calculation_game: '계산력 게임',
      language_game: '언어력 게임',
      attention_game: '주의력 게임',
      reminiscence: '회상 대화',
    };
    return names[type] || type;
  };

  const getMessage = () => {
    if (accuracy >= 90) return '완벽해요! 정말 대단합니다! 🎉';
    if (accuracy >= 80) return '훌륭해요! 아주 잘하셨습니다! 👏';
    if (accuracy >= 70) return '잘하셨어요! 조금만 더 연습하면 완벽해질 거예요! 💪';
    if (accuracy >= 60) return '좋은 시작이에요! 계속 도전해보세요! 🌟';
    return '괜찮아요! 연습하면 더 좋아질 거예요! 😊';
  };

  return (
    <Card className="max-w-lg mx-auto p-8">
      {/* 등급 표시 */}
      <div className="text-center mb-8">
        <div className={`w-24 h-24 ${grade.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className={`text-5xl font-bold ${grade.color}`}>{grade.grade}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {getTrainingTypeName(trainingType)} 완료!
        </h2>
        <p className="text-slate-600">{getMessage()}</p>
      </div>

      {/* 상세 결과 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">레벨</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{currentLevel}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">총 점수</p>
          <p className="text-2xl font-bold text-[var(--success)]">{score}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">정확도</p>
          <p className="text-2xl font-bold text-[var(--info)]">{accuracy}%</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">소요 시간</p>
          <p className="text-2xl font-bold text-slate-700">{formatTime(elapsedTime)}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">시도 횟수</p>
          <p className="text-2xl font-bold text-slate-700">{moves}회</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">실수</p>
          <p className="text-2xl font-bold text-red-500">{mistakes}회</p>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onExit}
        >
          나가기
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onRestart}
        >
          다시 하기
        </Button>
        {showNextLevel && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={onNextLevel}
          >
            다음 레벨 →
          </Button>
        )}
      </div>

      {/* 팁 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">팁</p>
            <p className="text-xs text-blue-600 mt-1">
              {trainingType === 'memory_game' && '카드 위치를 기억하려면 비슷한 이모지끼리 그룹을 지어 기억해보세요.'}
              {trainingType === 'calculation_game' && '암산을 빠르게 하려면 10의 보수를 활용해보세요.'}
              {trainingType === 'language_game' && '단어를 떠올릴 때 관련된 이미지를 상상해보세요.'}
              {trainingType === 'attention_game' && '집중력을 높이려면 규칙적인 호흡을 유지해보세요.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
