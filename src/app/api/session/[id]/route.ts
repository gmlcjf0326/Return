import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import type { ApiResponse, Session } from '@/types';

// GET /api/session/[id] - 세션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: '세션을 찾을 수 없습니다.',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        id: session.id,
        nickname: session.nickname ?? undefined,
        birthYear: session.birthYear ?? undefined,
        profileData: session.profileData as Session['profileData'],
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt ?? undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get session:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SESSION_GET_FAILED',
        message: '세션 조회에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH /api/session/[id] - 세션 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, birthYear, profileData, lastActiveAt } = body;

    const session = await prisma.session.update({
      where: { id },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(birthYear !== undefined && { birthYear }),
        ...(profileData !== undefined && { profileData }),
        lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : new Date(),
      },
    });

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        id: session.id,
        nickname: session.nickname ?? undefined,
        birthYear: session.birthYear ?? undefined,
        profileData: session.profileData as Session['profileData'],
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt ?? undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update session:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SESSION_UPDATE_FAILED',
        message: '세션 업데이트에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
