'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card } from '@/components/ui';
import { generateCalculationProblems, CALCULATION_LEVELS, type CalculationProblem } from '@/data/training-data';
import { useSessionStore } from '@/store/sessionStore';

interface CalculationGameProps {
  level?: number;
  onComplete?: (score: number, accuracy: number) => void;
  onExit?: () => void;
}

export function CalculationGame({ level = 1, onComplete, onExit }: CalculationGameProps) {
  const { session } = useSessionStore();
  const levelConfig = CALCULATION_LEVELS[level - 1] || CALCULATION_LEVELS[0];

  const [problems, setProblems] = useState<CalculationProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levelConfig.timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 문제 생성
  useEffect(() => {
    const generatedProblems = generateCalculationProblems(level, levelConfig.problemCount);
    setProblems(generatedProblems);
    startTimeRef.current = Date.now();
  }, [level, levelConfig.problemCount]);

  // 타이머
  useEffect(() => {
    if (!isCompleted && problems.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCompleted, problems.length]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const accuracy = problems.length > 0 ? Math.round((correctCount / problems.length) * 100) : 0;

    // API 호출하여 결과 저장
    if (session?.id) {
      fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          trainingType: 'calculation_game',
          durationSeconds: levelConfig.timeLimit - timeLeft,
          engagementScore: accuracy,
          completionRate: currentIndex / problems.length,
          performanceData: {
            level,
            score,
            accuracy,
            averageResponseTime: responseTimes.length > 0
              ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
              : 0,
            mistakes: problems.length - correctCount,
          },
        }),
      }).catch(console.error);
    }

    onComplete?.(score, accuracy);
  }, [correctCount, problems.length, session?.id, levelConfig.timeLimit, timeLeft, currentIndex, level, score, responseTimes, onComplete]);

  const handleAnswer = useCallback((answer: number) => {
    if (showResult || isCompleted) return;

    const currentProblem = problems[currentIndex];
    const responseTime = Date.now() - startTimeRef.current;
    setResponseTimes(prev => [...prev, responseTime]);

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentProblem.answer;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      // 빠른 응답에 보너스 점수
      const timeBonus = Math.max(0, Math.floor((5000 - responseTime) / 100));
      setScore(prev => prev + 100 + timeBonus);
    }

    // 다음 문제로 이동
    setTimeout(() => {
      if (currentIndex + 1 >= problems.length) {
        handleComplete();
      } else {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        startTimeRef.current = Date.now();
      }
    }, 1000);
  }, [currentIndex, problems, showResult, isCompleted, handleComplete]);

  const handleRestart = useCallback(() => {
    const generatedProblems = generateCalculationProblems(level, levelConfig.problemCount);
    setProblems(generatedProblems);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(levelConfig.timeLimit);
    setIsCompleted(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setResponseTimes([]);
    startTimeRef.current = Date.now();
  }, [level, levelConfig]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (problems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">문제 준비 중...</p>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  // 완료 화면
  if (isCompleted) {
    const accuracy = Math.round((correctCount / problems.length) * 100);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 * 10) / 10
      : 0;

    return (
      <Card className="max-w-lg mx-auto p-8">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
            accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <span className={`text-4xl font-bold ${
              accuracy >= 80 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {accuracy}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">계산력 게임 완료!</h2>
          <p className="text-slate-600">
            {accuracy >= 80 ? '훌륭합니다! 계산 실력이 뛰어나시네요!' :
             accuracy >= 60 ? '잘하셨어요! 조금만 더 연습하면 완벽해질 거예요!' :
             '괜찮아요! 연습하면 더 좋아질 거예요!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-sm text-slate-500 mb-1">총 점수</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{score}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-sm text-slate-500 mb-1">정답률</p>
            <p className="text-2xl font-bold text-[var(--success)]">{correctCount}/{problems.length}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-sm text-slate-500 mb-1">평균 응답시간</p>
            <p className="text-2xl font-bold text-slate-700">{avgResponseTime}초</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl text-center">
            <p className="text-sm text-slate-500 mb-1">레벨</p>
            <p className="text-2xl font-bold text-slate-700">{level}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onExit}>
            나가기
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleRestart}>
            다시 하기
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상태 표시 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">진행</p>
          <p className="text-2xl font-bold text-[var(--primary)]">{currentIndex + 1}/{problems.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">남은 시간</p>
          <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>
            {formatTime(timeLeft)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-slate-500 mb-1">점수</p>
          <p className="text-2xl font-bold text-[var(--success)]">{score}</p>
        </Card>
      </div>

      {/* 진행 바 */}
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 문제 카드 */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500 mb-2">문제 {currentIndex + 1}</p>
          <p className="text-4xl font-bold text-slate-800">{currentProblem.question}</p>
        </div>

        {/* 선택지 */}
        <div className="grid grid-cols-2 gap-4">
          {currentProblem.options.map((option, index) => {
            let buttonClass = 'p-6 text-2xl font-bold rounded-xl border-2 transition-all ';

            if (showResult) {
              if (option === currentProblem.answer) {
                buttonClass += 'bg-green-100 border-green-500 text-green-700';
              } else if (option === selectedAnswer) {
                buttonClass += 'bg-red-100 border-red-500 text-red-700';
              } else {
                buttonClass += 'bg-slate-50 border-slate-200 text-slate-400';
              }
            } else {
              buttonClass += 'bg-white border-slate-200 text-slate-700 hover:border-[var(--primary)] hover:bg-[var(--primary-light)]/10 cursor-pointer';
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 컨트롤 */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onExit}>
          나가기
        </Button>
      </div>
    </div>
  );
}
