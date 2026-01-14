import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = parseInt(id);

    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '유효하지 않은 평가 ID입니다.' } },
        { status: 400 }
      );
    }

    // 평가 결과 조회
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '평가 결과를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '평가 결과 조회에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = parseInt(id);

    if (isNaN(assessmentId)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '유효하지 않은 평가 ID입니다.' } },
        { status: 400 }
      );
    }

    // 평가 결과 삭제
    await prisma.assessment.delete({
      where: { id: assessmentId },
    });

    return NextResponse.json({
      success: true,
      message: '평가 결과가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '평가 결과 삭제에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
