import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // 전체 훈련 통계
    const allTraining = await prisma.trainingSession.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (allTraining.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          totalSessions: 0,
          totalMinutes: 0,
          byType: [],
          recentSessions: [],
          weeklyActivity: [],
        },
      });
    }

    // 유형별 통계
    const byType: Record<string, { count: number; totalMinutes: number; avgScore: number }> = {};

    allTraining.forEach((t) => {
      const type = t.trainingType;
      if (!byType[type]) {
        byType[type] = { count: 0, totalMinutes: 0, avgScore: 0 };
      }
      byType[type].count += 1;
      byType[type].totalMinutes += Math.round((t.durationSeconds ?? 0) / 60);
      byType[type].avgScore += t.engagementScore ?? 0;
    });

    // 평균 계산
    Object.keys(byType).forEach((type) => {
      byType[type].avgScore = Math.round(byType[type].avgScore / byType[type].count);
    });

    const typeLabels: Record<string, string> = {
      memory: '기억력 게임',
      calculation: '계산력 게임',
      language: '언어력 게임',
      reminiscence: '회상 대화',
    };

    const byTypeArray = Object.entries(byType).map(([type, stats]) => ({
      type,
      label: typeLabels[type] || type,
      ...stats,
    }));

    // 최근 5개 훈련
    const recentSessions = allTraining.slice(0, 5).map((t) => ({
      id: t.id,
      type: t.trainingType,
      label: typeLabels[t.trainingType] || t.trainingType,
      durationMinutes: Math.round((t.durationSeconds ?? 0) / 60),
      score: t.engagementScore,
      completionRate: t.completionRate,
      createdAt: t.createdAt,
    }));

    // 주간 활동 (최근 7일)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyData: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      weeklyData[dateStr] = 0;
    }

    allTraining.forEach((t) => {
      if (t.createdAt >= weekAgo) {
        const dateStr = t.createdAt.toISOString().split('T')[0];
        if (weeklyData[dateStr] !== undefined) {
          weeklyData[dateStr] += Math.round((t.durationSeconds ?? 0) / 60);
        }
      }
    });

    const weeklyActivity = Object.entries(weeklyData)
      .map(([date, minutes]) => ({
        date,
        dayLabel: new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' }),
        minutes,
      }))
      .reverse();

    // 총계
    const totalMinutes = allTraining.reduce(
      (sum, t) => sum + Math.round((t.durationSeconds ?? 0) / 60),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        totalSessions: allTraining.length,
        totalMinutes,
        avgSessionMinutes: Math.round(totalMinutes / allTraining.length),
        byType: byTypeArray,
        recentSessions,
        weeklyActivity,
      },
    });
  } catch (error) {
    console.error('Failed to fetch training stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training stats' },
      { status: 500 }
    );
  }
}
