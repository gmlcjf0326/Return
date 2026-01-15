import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') ?? '10');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // 시간순 진단 결과 조회
    const assessments = await prisma.assessment.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        totalScore: true,
        memoryScore: true,
        calculationScore: true,
        languageScore: true,
        attentionScore: true,
        executiveScore: true,
        visuospatialScore: true,
        riskLevel: true,
        createdAt: true,
      },
    });

    if (assessments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          trends: [],
          categories: [],
        },
      });
    }

    // 차트용 데이터 포맷팅
    const trends = assessments.map((a, index) => ({
      index: index + 1,
      date: a.createdAt.toISOString().split('T')[0],
      totalScore: a.totalScore ?? 0,
      memoryScore: a.memoryScore ?? 0,
      calculationScore: a.calculationScore ?? 0,
      languageScore: a.languageScore ?? 0,
      attentionScore: a.attentionScore ?? 0,
      executiveScore: a.executiveScore ?? 0,
      visuospatialScore: a.visuospatialScore ?? 0,
    }));

    // 카테고리별 추세 분석
    const latestIndex = assessments.length - 1;
    const firstIndex = 0;

    const categoryTrends = [
      {
        name: '기억력',
        key: 'memory',
        first: assessments[firstIndex].memoryScore ?? 0,
        latest: assessments[latestIndex].memoryScore ?? 0,
        maxScore: 20,
      },
      {
        name: '계산력',
        key: 'calculation',
        first: assessments[firstIndex].calculationScore ?? 0,
        latest: assessments[latestIndex].calculationScore ?? 0,
        maxScore: 15,
      },
      {
        name: '언어력',
        key: 'language',
        first: assessments[firstIndex].languageScore ?? 0,
        latest: assessments[latestIndex].languageScore ?? 0,
        maxScore: 20,
      },
      {
        name: '주의력',
        key: 'attention',
        first: assessments[firstIndex].attentionScore ?? 0,
        latest: assessments[latestIndex].attentionScore ?? 0,
        maxScore: 15,
      },
      {
        name: '실행기능',
        key: 'executive',
        first: assessments[firstIndex].executiveScore ?? 0,
        latest: assessments[latestIndex].executiveScore ?? 0,
        maxScore: 15,
      },
      {
        name: '시공간력',
        key: 'visuospatial',
        first: assessments[firstIndex].visuospatialScore ?? 0,
        latest: assessments[latestIndex].visuospatialScore ?? 0,
        maxScore: 15,
      },
    ].map((cat) => ({
      ...cat,
      change: cat.latest - cat.first,
      trend: cat.latest > cat.first ? 'up' : cat.latest < cat.first ? 'down' : 'stable',
      firstPercentage: Math.round((cat.first / cat.maxScore) * 100),
      latestPercentage: Math.round((cat.latest / cat.maxScore) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        trends,
        categoryTrends,
        totalAssessments: assessments.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
