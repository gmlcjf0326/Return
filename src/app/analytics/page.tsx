'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, StatusBadge, DataPanel } from '@/components/ui';
import { TrendIndicator } from '@/components/charts';
import { useSessionStore } from '@/store/sessionStore';

interface SummaryData {
  hasData: boolean;
  current: {
    id: number;
    totalScore: number;
    memoryScore: number;
    calculationScore: number;
    languageScore: number;
    attentionScore: number;
    executiveScore: number;
    visuospatialScore: number;
    riskLevel: string;
    createdAt: string;
  } | null;
  previous: {
    id: number;
    totalScore: number;
    createdAt: string;
  } | null;
  changes: {
    totalScore: number;
    memoryScore: number;
    calculationScore: number;
    languageScore: number;
    attentionScore: number;
    executiveScore: number;
    visuospatialScore: number;
  } | null;
  weakAreas: string[];
  categoryScores: {
    name: string;
    key: string;
    score: number;
    maxScore: number;
  }[];
  totalAssessments: number;
  trainingStats: {
    totalSessions: number;
    totalMinutes: number;
  };
}

interface TrendsData {
  hasData: boolean;
  trends: {
    index: number;
    date: string;
    totalScore: number;
  }[];
  categoryTrends: {
    name: string;
    key: string;
    first: number;
    latest: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    latestPercentage: number;
  }[];
}

interface TrainingStatsData {
  hasData: boolean;
  totalSessions: number;
  totalMinutes: number;
  avgSessionMinutes: number;
  byType: {
    type: string;
    label: string;
    count: number;
    totalMinutes: number;
    avgScore: number;
  }[];
  weeklyActivity: {
    date: string;
    dayLabel: string;
    minutes: number;
  }[];
}

interface RecommendationsData {
  hasData: boolean;
  recommendations: {
    category: string;
    categoryKey: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    suggestedTraining: string;
    trainingPath: string;
  }[];
  overallAdvice: string;
  frequencyAdvice: string;
  riskLevel: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const sessionId = session?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [trainingStats, setTrainingStats] = useState<TrainingStatsData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);

  const fetchData = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);

    // 개별 API 호출을 Promise.allSettled로 처리하여 일부 실패해도 다른 데이터는 표시
    const results = await Promise.allSettled([
      fetch(`/api/analytics/summary?sessionId=${sessionId}`).then(res => res.json()),
      fetch(`/api/analytics/trends?sessionId=${sessionId}`).then(res => res.json()),
      fetch(`/api/analytics/training-stats?sessionId=${sessionId}`).then(res => res.json()),
      fetch(`/api/analytics/recommendations?sessionId=${sessionId}`).then(res => res.json()),
    ]);

    // 개별 결과 처리
    if (results[0].status === 'fulfilled' && results[0].value.success) {
      setSummary(results[0].value.data);
    } else {
      console.error('Failed to fetch summary:', results[0].status === 'rejected' ? results[0].reason : 'API error');
    }

    if (results[1].status === 'fulfilled' && results[1].value.success) {
      setTrends(results[1].value.data);
    } else {
      console.error('Failed to fetch trends:', results[1].status === 'rejected' ? results[1].reason : 'API error');
    }

    if (results[2].status === 'fulfilled' && results[2].value.success) {
      setTrainingStats(results[2].value.data);
    } else {
      console.error('Failed to fetch training stats:', results[2].status === 'rejected' ? results[2].reason : 'API error');
    }

    if (results[3].status === 'fulfilled' && results[3].value.success) {
      setRecommendations(results[3].value.data);
    } else {
      console.error('Failed to fetch recommendations:', results[3].status === 'rejected' ? results[3].reason : 'API error');
    }

    setIsLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }
    fetchData();
  }, [session, router, fetchData]);

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'normal':
        return <StatusBadge status="normal">정상</StatusBadge>;
      case 'mild_caution':
        return <StatusBadge status="caution">경도 주의</StatusBadge>;
      case 'mci_suspected':
        return <StatusBadge status="warning">MCI 의심</StatusBadge>;
      case 'consultation_recommended':
        return <StatusBadge status="danger">전문 상담 권장</StatusBadge>;
      default:
        return <StatusBadge status="info">{level}</StatusBadge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const hasAnyData = summary?.hasData || trends?.hasData || trainingStats?.hasData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  홈
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-800">분석 리포트</h1>
                <p className="text-sm text-slate-500">Analytics Dashboard</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              새로고침
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasAnyData ? (
          /* 데이터 없음 */
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">분석할 데이터가 없습니다</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                인지 진단을 완료하면 상세한 분석 리포트를 확인할 수 있습니다.
                진단 결과에 기반한 맞춤형 훈련도 추천받을 수 있어요.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/assessment">
                  <Button variant="primary" size="lg">인지 진단 시작</Button>
                </Link>
                <Link href="/training">
                  <Button variant="outline" size="lg">훈련 시작</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* 요약 섹션 */}
            {summary?.hasData && summary.current && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  현재 상태 요약
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* 총점 */}
                  <Card className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm text-slate-500">종합 점수</span>
                      {getRiskLevelBadge(summary.current.riskLevel)}
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-slate-800">{summary.current.totalScore}</span>
                      <span className="text-lg text-slate-400 mb-1">/100</span>
                    </div>
                    {summary.changes && (
                      <div className="mt-2">
                        <TrendIndicator value={summary.changes.totalScore} />
                      </div>
                    )}
                  </Card>

                  {/* 진단 횟수 */}
                  <Card className="p-6">
                    <span className="text-sm text-slate-500">총 진단 횟수</span>
                    <div className="flex items-end gap-2 mt-4">
                      <span className="text-4xl font-bold text-slate-800">{summary.totalAssessments}</span>
                      <span className="text-lg text-slate-400 mb-1">회</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      마지막: {new Date(summary.current.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </Card>

                  {/* 훈련 시간 */}
                  <Card className="p-6">
                    <span className="text-sm text-slate-500">총 훈련 시간</span>
                    <div className="flex items-end gap-2 mt-4">
                      <span className="text-4xl font-bold text-slate-800">{summary.trainingStats.totalMinutes}</span>
                      <span className="text-lg text-slate-400 mb-1">분</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      {summary.trainingStats.totalSessions}회 훈련 완료
                    </p>
                  </Card>
                </div>

                {/* 영역별 점수 */}
                <Card className="p-6">
                  <h3 className="text-base font-semibold text-slate-700 mb-4">영역별 점수</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {summary.categoryScores.map((cat) => {
                      const percentage = Math.round((cat.score / cat.maxScore) * 100);
                      const changeValue = summary.changes ? summary.changes[`${cat.key}Score` as keyof typeof summary.changes] : 0;
                      return (
                        <div key={cat.key} className="text-center p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-500 mb-2">{cat.name}</p>
                          <p className="text-2xl font-bold text-slate-800">{percentage}%</p>
                          <p className="text-xs text-slate-400">{cat.score}/{cat.maxScore}</p>
                          {changeValue !== 0 && (
                            <div className="mt-1">
                              <TrendIndicator value={changeValue} size="sm" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* 취약 영역 알림 */}
                {summary.weakAreas.length > 0 && (
                  <Card className="p-6 bg-amber-50 border-amber-100 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">취약 영역 감지</h4>
                        <p className="text-sm text-amber-700">
                          {summary.weakAreas.join(', ')} 영역의 점수가 70% 미만입니다. 해당 영역의 집중 훈련을 권장합니다.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </section>
            )}

            {/* 호전 상황 요약 */}
            {trends?.hasData && trends.trends.length > 1 && summary?.changes && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  호전 상황 분석
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* 최근 변화 */}
                  <Card className={`p-6 ${summary.changes.totalScore >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">이전 대비 변화</span>
                      <span className={`text-2xl ${summary.changes.totalScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.changes.totalScore >= 0 ? '📈' : '📉'}
                      </span>
                    </div>
                    <div className="text-3xl font-bold mb-1" style={{
                      color: summary.changes.totalScore >= 0 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {summary.changes.totalScore >= 0 ? '+' : ''}{summary.changes.totalScore}점
                    </div>
                    <p className="text-sm text-slate-500">
                      {summary.changes.totalScore > 5 ? '큰 폭으로 향상되었습니다!' :
                       summary.changes.totalScore > 0 ? '조금씩 나아지고 있습니다.' :
                       summary.changes.totalScore === 0 ? '점수가 유지되고 있습니다.' :
                       summary.changes.totalScore > -5 ? '약간 하락했습니다. 집중 훈련이 필요합니다.' :
                       '점수가 하락했습니다. 전문 상담을 권장합니다.'}
                    </p>
                  </Card>

                  {/* 향상된 영역 */}
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">향상된 영역</span>
                      <span className="text-2xl">✨</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(summary.changes)
                        .filter(([key, value]) => key !== 'totalScore' && value > 0)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(([key, value]) => {
                          const categoryNames: Record<string, string> = {
                            memoryScore: '기억력',
                            calculationScore: '계산력',
                            languageScore: '언어력',
                            attentionScore: '주의력',
                            executiveScore: '실행력',
                            visuospatialScore: '공간지각력',
                          };
                          return (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-blue-700">{categoryNames[key] || key}</span>
                              <span className="text-green-600 font-medium">+{value}</span>
                            </div>
                          );
                        })}
                      {Object.entries(summary.changes).filter(([key, value]) => key !== 'totalScore' && value > 0).length === 0 && (
                        <p className="text-sm text-blue-600">아직 향상된 영역이 없습니다</p>
                      )}
                    </div>
                  </Card>

                  {/* 주의 영역 */}
                  <Card className="p-6 bg-amber-50 border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">집중 필요 영역</span>
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(summary.changes)
                        .filter(([key, value]) => key !== 'totalScore' && value < 0)
                        .sort((a, b) => (a[1] as number) - (b[1] as number))
                        .slice(0, 3)
                        .map(([key, value]) => {
                          const categoryNames: Record<string, string> = {
                            memoryScore: '기억력',
                            calculationScore: '계산력',
                            languageScore: '언어력',
                            attentionScore: '주의력',
                            executiveScore: '실행력',
                            visuospatialScore: '공간지각력',
                          };
                          return (
                            <div key={key} className="flex items-center justify-between text-sm">
                              <span className="text-amber-700">{categoryNames[key] || key}</span>
                              <span className="text-red-600 font-medium">{value}</span>
                            </div>
                          );
                        })}
                      {Object.entries(summary.changes).filter(([key, value]) => key !== 'totalScore' && value < 0).length === 0 && (
                        <p className="text-sm text-amber-600">모든 영역이 유지 또는 향상 중</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* 종합 호전 상황 메시지 */}
                <Card className={`p-6 mb-6 ${
                  summary.changes.totalScore > 5 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  summary.changes.totalScore >= 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                  'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      summary.changes.totalScore > 5 ? 'bg-green-100' :
                      summary.changes.totalScore >= 0 ? 'bg-blue-100' :
                      'bg-amber-100'
                    }`}>
                      {summary.changes.totalScore > 5 ? '🎉' :
                       summary.changes.totalScore >= 0 ? '👍' : '💪'}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        summary.changes.totalScore > 5 ? 'text-green-800' :
                        summary.changes.totalScore >= 0 ? 'text-blue-800' :
                        'text-amber-800'
                      }`}>
                        {summary.changes.totalScore > 5 ? '훌륭해요! 크게 향상되었습니다!' :
                         summary.changes.totalScore > 0 ? '좋아요! 점진적으로 향상 중입니다.' :
                         summary.changes.totalScore === 0 ? '안정적으로 유지되고 있습니다.' :
                         '집중 훈련으로 다시 향상시킬 수 있습니다!'}
                      </h3>
                      <p className={`text-sm ${
                        summary.changes.totalScore > 5 ? 'text-green-600' :
                        summary.changes.totalScore >= 0 ? 'text-blue-600' :
                        'text-amber-600'
                      }`}>
                        {summary.changes.totalScore > 5 ? '꾸준한 훈련의 효과가 나타나고 있습니다. 이 추세를 유지하세요!' :
                         summary.changes.totalScore > 0 ? '규칙적인 훈련을 지속하면 더 큰 향상을 기대할 수 있습니다.' :
                         summary.changes.totalScore === 0 ? '취약 영역에 집중하면 전체 점수 향상에 도움이 됩니다.' :
                         '취약 영역을 파악하고 맞춤형 훈련에 집중해보세요.'}
                      </p>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* 점수 추이 그래프 */}
            {trends?.hasData && trends.trends.length > 1 && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  점수 변화 추이
                </h2>

                <Card className="p-6">
                  <h3 className="text-base font-semibold text-slate-700 mb-4">종합 점수 추이</h3>
                  <div className="space-y-3">
                    {trends.trends.map((t, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 w-16">{t.index}회차</span>
                        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${t.totalScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 w-12 text-right">{t.totalScore}점</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 영역별 변화 */}
                <Card className="p-6 mt-4">
                  <h3 className="text-base font-semibold text-slate-700 mb-4">영역별 변화</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {trends.categoryTrends.map((cat) => (
                      <div key={cat.key} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                          <TrendIndicator value={cat.change} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-800">{cat.latestPercentage}%</span>
                          {cat.trend === 'up' && (
                            <span className="text-xs text-green-600">▲ 향상</span>
                          )}
                          {cat.trend === 'down' && (
                            <span className="text-xs text-red-500">▼ 하락</span>
                          )}
                          {cat.trend === 'stable' && (
                            <span className="text-xs text-slate-400">— 유지</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* 훈련 통계 */}
            {trainingStats?.hasData && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  훈련 통계
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 유형별 통계 */}
                  <Card className="p-6">
                    <h3 className="text-base font-semibold text-slate-700 mb-4">훈련 유형별 현황</h3>
                    <div className="space-y-4">
                      {trainingStats.byType.map((t) => {
                        const maxCount = Math.max(...trainingStats.byType.map(x => x.count)) || 1;
                        const percentage = (t.count / maxCount) * 100;
                        const color = t.type === 'memory' ? 'bg-purple-500' : t.type === 'calculation' ? 'bg-blue-500' : 'bg-green-500';
                        return (
                          <div key={t.type}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-slate-600">{t.label}</span>
                              <span className="text-sm text-slate-500">{t.count}회 / {t.totalMinutes}분</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* 주간 활동 */}
                  <Card className="p-6">
                    <h3 className="text-base font-semibold text-slate-700 mb-4">주간 활동량</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {trainingStats.weeklyActivity.map((w, i) => {
                        const maxMinutes = Math.max(...trainingStats.weeklyActivity.map(x => x.minutes)) || 1;
                        const heightPercent = w.minutes > 0 ? Math.max((w.minutes / maxMinutes) * 100, 10) : 0;
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-full h-24 flex items-end justify-center mb-2">
                              <div
                                className={`w-8 rounded-t transition-all ${w.minutes > 0 ? 'bg-blue-500' : 'bg-slate-200'}`}
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{w.dayLabel}</span>
                            <span className="text-xs font-medium text-slate-700">{w.minutes}분</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-center border-t pt-4">
                      <p className="text-sm text-slate-500">
                        주간 총 훈련 시간:{' '}
                        <span className="font-semibold text-slate-700">
                          {trainingStats.weeklyActivity.reduce((sum, w) => sum + w.minutes, 0)}분
                        </span>
                      </p>
                    </div>
                  </Card>
                </div>
              </section>
            )}

            {/* AI 추천 */}
            {recommendations?.hasData && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI 맞춤 추천
                </h2>

                {/* 전반적 조언 */}
                <Card className="p-6 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">전문가 조언</h3>
                      <p className="text-blue-700">{recommendations.overallAdvice}</p>
                      <p className="text-sm text-blue-600 mt-2">{recommendations.frequencyAdvice}</p>
                    </div>
                  </div>
                </Card>

                {/* 추천 훈련 */}
                {recommendations.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-700">추천 훈련</h3>
                    {recommendations.recommendations.map((rec, i) => (
                      <Card key={i} className={`p-4 border ${getPriorityColor(rec.priority)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                                rec.priority === 'medium' ? 'bg-amber-200 text-amber-800' :
                                'bg-green-200 text-green-800'
                              }`}>
                                {rec.priority === 'high' ? '우선' : rec.priority === 'medium' ? '권장' : '유지'}
                              </span>
                              <span className="font-semibold text-slate-800">{rec.title}</span>
                            </div>
                            <p className="text-sm text-slate-600">{rec.description}</p>
                          </div>
                          <Link href={rec.trainingPath}>
                            <Button variant="outline" size="sm">
                              훈련하기
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 빠른 액션 */}
            <section className="flex gap-4 justify-center pt-4">
              <Link href="/assessment">
                <Button variant="primary" size="lg">새 진단 시작</Button>
              </Link>
              <Link href="/training">
                <Button variant="outline" size="lg">훈련하러 가기</Button>
              </Link>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
