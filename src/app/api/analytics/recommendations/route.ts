import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface Recommendation {
  category: string;
  categoryKey: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedTraining: string;
  trainingPath: string;
}

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

    // 최근 진단 결과 조회
    const latestAssessment = await prisma.assessment.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestAssessment) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          recommendations: [],
          overallAdvice: '먼저 인지 진단을 완료해주세요. 진단 결과를 바탕으로 맞춤형 훈련을 추천해 드립니다.',
        },
      });
    }

    // 최근 훈련 이력 조회
    const recentTraining = await prisma.trainingSession.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const trainedTypes = new Set(recentTraining.map((t) => t.trainingType));

    // 카테고리별 점수 분석
    const categories = [
      {
        name: '기억력',
        key: 'memory',
        score: latestAssessment.memoryScore ?? 0,
        maxScore: 20,
        training: '기억력 게임',
        trainingPath: '/training/memory-game',
      },
      {
        name: '계산력',
        key: 'calculation',
        score: latestAssessment.calculationScore ?? 0,
        maxScore: 15,
        training: '계산력 게임',
        trainingPath: '/training/calculation',
      },
      {
        name: '언어력',
        key: 'language',
        score: latestAssessment.languageScore ?? 0,
        maxScore: 20,
        training: '언어력 게임',
        trainingPath: '/training/language',
      },
      {
        name: '주의력',
        key: 'attention',
        score: latestAssessment.attentionScore ?? 0,
        maxScore: 15,
        training: '기억력 게임',
        trainingPath: '/training/memory-game',
      },
      {
        name: '실행기능',
        key: 'executive',
        score: latestAssessment.executiveScore ?? 0,
        maxScore: 15,
        training: '계산력 게임',
        trainingPath: '/training/calculation',
      },
      {
        name: '시공간력',
        key: 'visuospatial',
        score: latestAssessment.visuospatialScore ?? 0,
        maxScore: 15,
        training: '기억력 게임',
        trainingPath: '/training/memory-game',
      },
    ];

    const recommendations: Recommendation[] = [];

    categories.forEach((cat) => {
      const percentage = (cat.score / cat.maxScore) * 100;

      if (percentage < 55) {
        recommendations.push({
          category: cat.name,
          categoryKey: cat.key,
          priority: 'high',
          title: `${cat.name} 집중 훈련 필요`,
          description: `${cat.name} 영역의 점수가 ${Math.round(percentage)}%로 낮습니다. 매일 10분씩 꾸준한 훈련을 권장합니다.`,
          suggestedTraining: cat.training,
          trainingPath: cat.trainingPath,
        });
      } else if (percentage < 70) {
        recommendations.push({
          category: cat.name,
          categoryKey: cat.key,
          priority: 'medium',
          title: `${cat.name} 개선 권장`,
          description: `${cat.name} 영역을 더 향상시킬 수 있습니다. 주 3-4회 훈련을 권장합니다.`,
          suggestedTraining: cat.training,
          trainingPath: cat.trainingPath,
        });
      } else if (percentage < 85) {
        recommendations.push({
          category: cat.name,
          categoryKey: cat.key,
          priority: 'low',
          title: `${cat.name} 유지 훈련`,
          description: `${cat.name} 영역이 양호합니다. 현재 수준을 유지하기 위해 가벼운 훈련을 지속해주세요.`,
          suggestedTraining: cat.training,
          trainingPath: cat.trainingPath,
        });
      }
    });

    // 우선순위 정렬
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // 전반적 조언 생성
    let overallAdvice = '';
    const riskLevel = latestAssessment.riskLevel;

    if (riskLevel === 'normal') {
      overallAdvice = '현재 인지 기능이 양호한 상태입니다. 건강한 생활습관을 유지하고, 정기적인 두뇌 훈련으로 인지 기능을 유지해주세요.';
    } else if (riskLevel === 'mild_caution') {
      overallAdvice = '일부 영역에서 주의가 필요합니다. 추천된 훈련을 주 3-4회 진행하시고, 한 달 후 재진단을 권장합니다.';
    } else if (riskLevel === 'mci_suspected') {
      overallAdvice = '경도인지장애가 의심됩니다. 매일 인지 훈련을 진행하시고, 전문 의료기관 상담을 권장합니다.';
    } else {
      overallAdvice = '인지 기능 저하가 관찰됩니다. 가능한 빨리 전문 의료기관을 방문하시고, 매일 인지 훈련을 병행해주세요.';
    }

    // 훈련 빈도 조언
    const lastWeekTraining = recentTraining.filter((t) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return t.createdAt >= weekAgo;
    });

    let frequencyAdvice = '';
    if (lastWeekTraining.length === 0) {
      frequencyAdvice = '최근 일주일간 훈련 기록이 없습니다. 오늘 훈련을 시작해보세요!';
    } else if (lastWeekTraining.length < 3) {
      frequencyAdvice = `최근 일주일간 ${lastWeekTraining.length}회 훈련하셨습니다. 주 3회 이상 훈련을 권장합니다.`;
    } else {
      frequencyAdvice = `최근 일주일간 ${lastWeekTraining.length}회 훈련하셨습니다. 훌륭합니다! 꾸준히 유지해주세요.`;
    }

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        recommendations: recommendations.slice(0, 5), // 최대 5개
        overallAdvice,
        frequencyAdvice,
        riskLevel,
        lastAssessmentDate: latestAssessment.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
