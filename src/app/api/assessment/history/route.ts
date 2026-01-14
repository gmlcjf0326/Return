import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') ?? '10');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '세션 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 세션의 평가 이력 조회
    const assessments = await prisma.assessment.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error('Failed to fetch assessment history:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '평가 이력 조회에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
