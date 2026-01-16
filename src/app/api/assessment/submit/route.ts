import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import type { RiskLevel } from '@/types';

// 평균 계산 유틸리티
function calculateAverage(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// 분산 계산 유틸리티
function calculateVariance(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  const avg = calculateAverage(arr);
  const squaredDiffs = arr.map(x => Math.pow(x - avg, 2));
  return calculateAverage(squaredDiffs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      totalScore,
      percentage,
      riskLevel,
      categoryScores,
      responses,
      duration,
      // 행동 데이터 (새로 추가)
      behaviorData,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '세션 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 카테고리별 점수 추출
    const memoryScore = categoryScores?.find((cs: { category: string }) => cs.category === 'memory')?.score ?? 0;
    const languageScore = categoryScores?.find((cs: { category: string }) => cs.category === 'language')?.score ?? 0;
    const calculationScore = categoryScores?.find((cs: { category: string }) => cs.category === 'calculation')?.score ?? 0;
    const attentionScore = categoryScores?.find((cs: { category: string }) => cs.category === 'attention')?.score ?? 0;
    const executiveScore = categoryScores?.find((cs: { category: string }) => cs.category === 'executive')?.score ?? 0;
    const visuospatialScore = categoryScores?.find((cs: { category: string }) => cs.category === 'visuospatial')?.score ?? 0;

    // 응답 시간 배열 추출
    const responseTimes = responses?.map((r: { responseTime?: number }) => r.responseTime || 0) || [];

    // 완전한 행동 데이터 구성
    const completeBehaviorData = {
      // 기본 정보
      duration,
      categoryScores,

      // 응답 시간 분석
      responseTime: responseTimes,
      avgResponseTime: Math.round(calculateAverage(responseTimes)),
      responseTimeVariance: Math.round(calculateVariance(responseTimes)),
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,

      // 행동 지표
      hesitationCount: behaviorData?.hesitationCount || 0,
      correctionCount: behaviorData?.correctionCount || 0,

      // 감정/표정 데이터
      emotionTimeline: behaviorData?.emotionTimeline || [],
      emotionDistribution: behaviorData?.emotionDistribution || [],
      dominantEmotion: behaviorData?.dominantEmotion || 'neutral',

      // 자세 데이터
      postureTimeline: behaviorData?.postureTimeline || [],
      postureStats: behaviorData?.postureStats || null,

      // 마우스/히트맵 데이터
      mouseHeatmap: behaviorData?.mouseHeatmap || [],
      contentInterests: behaviorData?.contentInterests || [],

      // 문항별 상세 데이터
      questionBehavior: behaviorData?.questionBehavior || [],

      // 메타데이터
      recordedAt: new Date().toISOString(),
    };

    // 평가 결과 저장
    const assessment = await prisma.assessment.create({
      data: {
        sessionId,
        totalScore: totalScore ?? percentage,
        memoryScore,
        calculationScore,
        languageScore,
        attentionScore,
        executiveScore,
        visuospatialScore,
        riskLevel: riskLevel as RiskLevel,
        rawResponses: JSON.stringify(responses ?? []),
        behaviorData: JSON.stringify(completeBehaviorData),
      },
    });

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Failed to save assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '평가 결과 저장에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
