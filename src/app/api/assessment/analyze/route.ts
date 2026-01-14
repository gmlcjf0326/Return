import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses, behaviorData } = body;

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: '응답 데이터가 필요합니다.' },
        },
        { status: 400 }
      );
    }

    // 간단한 분석 결과 생성
    // 추후 AI 분석을 추가할 수 있음
    const totalQuestions = responses.length;
    const correctAnswers = responses.filter((r: { isCorrect?: boolean }) => r.isCorrect).length;
    const totalScore = Math.round((correctAnswers / totalQuestions) * 100);

    // 위험도 판정
    let riskLevel: string;
    if (totalScore >= 85) {
      riskLevel = 'normal';
    } else if (totalScore >= 70) {
      riskLevel = 'mild_caution';
    } else if (totalScore >= 55) {
      riskLevel = 'mci_suspected';
    } else {
      riskLevel = 'consultation_recommended';
    }

    // 평균 응답 시간
    const avgResponseTime =
      responses.reduce((sum: number, r: { responseTime?: number }) => sum + (r.responseTime ?? 0), 0) /
      totalQuestions;

    // AI 분석 인사이트 (추후 OpenAI 연동)
    const insights = generateInsights(totalScore, behaviorData, correctAnswers, totalQuestions);

    return NextResponse.json({
      success: true,
      data: {
        totalScore,
        riskLevel,
        correctAnswers,
        totalQuestions,
        avgResponseTime,
        behaviorData,
        insights,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to analyze assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '분석에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

// 인사이트 생성 함수
function generateInsights(
  totalScore: number,
  behaviorData: { hesitationCount?: number; correctionCount?: number; responseTime?: number[] } | null,
  correctAnswers: number,
  totalQuestions: number
): string[] {
  const insights: string[] = [];

  // 점수 기반 인사이트
  if (totalScore >= 85) {
    insights.push('전반적으로 인지 기능이 양호합니다.');
  } else if (totalScore >= 70) {
    insights.push('일부 영역에서 주의가 필요합니다. 정기적인 인지 훈련을 권장합니다.');
  } else if (totalScore >= 55) {
    insights.push('인지 기능 저하가 관찰됩니다. 전문 의료기관 상담을 권장합니다.');
  } else {
    insights.push('인지 기능에 상당한 어려움이 있습니다. 가능한 빨리 전문 상담을 받으세요.');
  }

  // 행동 데이터 기반 인사이트
  if (behaviorData) {
    if (behaviorData.hesitationCount && behaviorData.hesitationCount > 5) {
      insights.push('답변에 망설임이 많이 관찰되었습니다.');
    }

    if (behaviorData.correctionCount && behaviorData.correctionCount > 3) {
      insights.push('답변 수정이 빈번하게 발생했습니다.');
    }

    if (behaviorData.responseTime && behaviorData.responseTime.length > 0) {
      const avgTime =
        behaviorData.responseTime.reduce((a, b) => a + b, 0) /
        behaviorData.responseTime.length;
      if (avgTime > 15000) {
        insights.push('평균 응답 시간이 다소 길었습니다.');
      }
    }
  }

  // 정답률 기반 인사이트
  const accuracy = (correctAnswers / totalQuestions) * 100;
  if (accuracy < 50) {
    insights.push('정답률 향상을 위한 집중 훈련이 필요합니다.');
  }

  return insights;
}
