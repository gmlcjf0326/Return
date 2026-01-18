import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse, TrainingSession, TrainingType } from '@/types';

interface StartTrainingRequest {
  sessionId: string;
  trainingType: TrainingType;
  level?: number;
}

// POST /api/training/start - 훈련 세션 시작
export async function POST(request: NextRequest) {
  try {
    const body: StartTrainingRequest = await request.json();
    const { sessionId, trainingType, level = 1 } = body;

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

    // 세션 확인 또는 생성
    await prisma.session.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        lastActiveAt: new Date(),
      },
      update: {
        lastActiveAt: new Date(),
      },
    });

    // 훈련 세션 생성
    const trainingSession = await prisma.trainingSession.create({
      data: {
        sessionId,
        trainingType,
        engagementScore: 0,
        completionRate: 0,
        performanceData: JSON.stringify({
          level,
          score: 0,
          accuracy: 0,
          averageResponseTime: 0,
          mistakes: 0,
        }),
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
    console.error('Failed to start training session:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'TRAINING_START_FAILED',
        message: '훈련 세션 시작에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
