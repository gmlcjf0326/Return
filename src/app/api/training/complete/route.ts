import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import type { ApiResponse, TrainingSession, TrainingType, PerformanceData } from '@/types';

interface CompleteTrainingRequest {
  sessionId: string;
  trainingType: TrainingType;
  durationSeconds: number;
  engagementScore: number;
  completionRate: number;
  performanceData: PerformanceData;
}

// POST /api/training/complete - 훈련 세션 완료
export async function POST(request: NextRequest) {
  try {
    const body: CompleteTrainingRequest = await request.json();
    const {
      sessionId,
      trainingType,
      durationSeconds,
      engagementScore,
      completionRate,
      performanceData,
    } = body;

    if (!sessionId || !trainingType) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '세션 ID와 훈련 타입이 필요합니다.',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 세션 업데이트
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActiveAt: new Date(),
      },
    });

    // 훈련 세션 저장
    const trainingSession = await prisma.trainingSession.create({
      data: {
        sessionId,
        trainingType,
        durationSeconds,
        engagementScore,
        completionRate,
        performanceData: JSON.stringify(performanceData),
      },
    });

    const response: ApiResponse<{ trainingSession: TrainingSession }> = {
      success: true,
      data: {
        trainingSession: {
          id: trainingSession.id,
          sessionId: trainingSession.sessionId,
          trainingType: trainingSession.trainingType as TrainingType,
          durationSeconds: trainingSession.durationSeconds ?? undefined,
          engagementScore: trainingSession.engagementScore ?? undefined,
          completionRate: trainingSession.completionRate
            ? Number(trainingSession.completionRate)
            : undefined,
          performanceData: trainingSession.performanceData
            ? JSON.parse(trainingSession.performanceData)
            : undefined,
          createdAt: trainingSession.createdAt,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to complete training session:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'TRAINING_COMPLETE_FAILED',
        message: '훈련 세션 저장에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/training/complete - 훈련 이력 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!sessionId) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '세션 ID가 필요합니다.',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const trainingSessions = await prisma.trainingSession.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formattedSessions: TrainingSession[] = trainingSessions.map((session) => ({
      id: session.id,
      sessionId: session.sessionId,
      trainingType: session.trainingType as TrainingType,
      durationSeconds: session.durationSeconds ?? undefined,
      engagementScore: session.engagementScore ?? undefined,
      completionRate: session.completionRate
        ? Number(session.completionRate)
        : undefined,
      performanceData: session.performanceData
        ? JSON.parse(session.performanceData)
        : undefined,
      createdAt: session.createdAt,
    }));

    const response: ApiResponse<{ trainingSessions: TrainingSession[] }> = {
      success: true,
      data: {
        trainingSessions: formattedSessions,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get training history:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'TRAINING_HISTORY_FAILED',
        message: '훈련 이력 조회에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
