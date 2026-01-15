'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, StatusBadge, DataPanel } from '@/components/ui';
import { LineChart, BarChart, TrendIndicator } from '@/components/charts';
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
    try {
      const [summaryRes, trendsRes, trainingRes, recommendationsRes] = await Promise.all([
        fetch(`/api/analytics/summary?sessionId=${sessionId}`),
        fetch(`/api/analytics/trends?sessionId=${sessionId}`),
        fetch(`/api/analytics/training-stats?sessionId=${sessionId}`),
        fetch(`/api/analytics/recommendations?sessionId=${sessionId}`),
      ]);

      const [summaryData, trendsData, trainingData, recommendationsData] = await Promise.all([
        summaryRes.json(),
        trendsRes.json(),
        trainingRes.json(),
        recommendationsRes.json(),
      ]);

      if (summaryData.success) setSummary(summaryData.data);
      if (trendsData.success) setTrends(trendsData.data);
      if (trainingData.success) setTrainingStats(trainingData.data);
      if (recommendationsData.success) setRecommendations(recommendationsData.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
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
                  <LineChart
                    data={trends.trends.map((t) => ({
                      label: `${t.index}회차`,
                      value: t.totalScore,
                    }))}
                    height={250}
                    color="#3B82F6"
                    maxValue={100}
                    minValue={0}
                  />
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
                    <BarChart
                      data={trainingStats.byType.map((t) => ({
                        label: t.label.replace(' 게임', ''),
                        value: t.count,
                        color: t.type === 'memory' ? '#8B5CF6' : t.type === 'calculation' ? '#3B82F6' : '#10B981',
                      }))}
                      height={200}
                      showValues
                    />
                    <div className="mt-4 space-y-2">
                      {trainingStats.byType.map((t) => (
                        <div key={t.type} className="flex justify-between text-sm">
                          <span className="text-slate-600">{t.label}</span>
                          <span className="text-slate-500">{t.count}회 / {t.totalMinutes}분</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* 주간 활동 */}
                  <Card className="p-6">
                    <h3 className="text-base font-semibold text-slate-700 mb-4">주간 활동량</h3>
                    <BarChart
                      data={trainingStats.weeklyActivity.map((w) => ({
                        label: w.dayLabel,
                        value: w.minutes,
                        color: w.minutes > 0 ? '#3B82F6' : '#E2E8F0',
                      }))}
                      height={200}
                      showValues
                    />
                    <div className="mt-4 text-center">
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
