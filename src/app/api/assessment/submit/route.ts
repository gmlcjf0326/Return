import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import type { RiskLevel } from '@/types';

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
        behaviorData: JSON.stringify({
          duration,
          categoryScores,
        }),
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
