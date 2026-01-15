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

    // 최근 2개의 진단 결과 조회 (현재 + 이전)
    const assessments = await prisma.assessment.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (assessments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          current: null,
          previous: null,
          changes: null,
          totalAssessments: 0,
        },
      });
    }

    const current = assessments[0];
    const previous = assessments.length > 1 ? assessments[1] : null;

    // 총 진단 횟수
    const totalAssessments = await prisma.assessment.count({
      where: { sessionId },
    });

    // 총 훈련 횟수 및 시간
    const trainingStats = await prisma.trainingSession.aggregate({
      where: { sessionId },
      _count: true,
      _sum: {
        durationSeconds: true,
      },
    });

    // 변화량 계산
    const changes = previous
      ? {
          totalScore: (current.totalScore ?? 0) - (previous.totalScore ?? 0),
          memoryScore: (current.memoryScore ?? 0) - (previous.memoryScore ?? 0),
          calculationScore: (current.calculationScore ?? 0) - (previous.calculationScore ?? 0),
          languageScore: (current.languageScore ?? 0) - (previous.languageScore ?? 0),
          attentionScore: (current.attentionScore ?? 0) - (previous.attentionScore ?? 0),
          executiveScore: (current.executiveScore ?? 0) - (previous.executiveScore ?? 0),
          visuospatialScore: (current.visuospatialScore ?? 0) - (previous.visuospatialScore ?? 0),
        }
      : null;

    // 취약 영역 분석 (70점 미만)
    const weakAreas: string[] = [];
    const categoryScores = [
      { name: '기억력', key: 'memory', score: current.memoryScore ?? 0, maxScore: 20 },
      { name: '계산력', key: 'calculation', score: current.calculationScore ?? 0, maxScore: 15 },
      { name: '언어력', key: 'language', score: current.languageScore ?? 0, maxScore: 20 },
      { name: '주의력', key: 'attention', score: current.attentionScore ?? 0, maxScore: 15 },
      { name: '실행기능', key: 'executive', score: current.executiveScore ?? 0, maxScore: 15 },
      { name: '시공간력', key: 'visuospatial', score: current.visuospatialScore ?? 0, maxScore: 15 },
    ];

    categoryScores.forEach((cat) => {
      const percentage = (cat.score / cat.maxScore) * 100;
      if (percentage < 70) {
        weakAreas.push(cat.name);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        current: {
          id: current.id,
          totalScore: current.totalScore,
          memoryScore: current.memoryScore,
          calculationScore: current.calculationScore,
          languageScore: current.languageScore,
          attentionScore: current.attentionScore,
          executiveScore: current.executiveScore,
          visuospatialScore: current.visuospatialScore,
          riskLevel: current.riskLevel,
          createdAt: current.createdAt,
        },
        previous: previous
          ? {
              id: previous.id,
              totalScore: previous.totalScore,
              createdAt: previous.createdAt,
            }
          : null,
        changes,
        weakAreas,
        categoryScores,
        totalAssessments,
        trainingStats: {
          totalSessions: trainingStats._count,
          totalMinutes: Math.round((trainingStats._sum.durationSeconds ?? 0) / 60),
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}
