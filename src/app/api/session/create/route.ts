import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import type { ApiResponse, Session } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nickname, birthYear, profileData } = body;

    const session = await prisma.session.create({
      data: {
        id,
        nickname,
        birthYear,
        profileData,
        lastActiveAt: new Date(),
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);

    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SESSION_CREATE_FAILED',
        message: '세션 생성에 실패했습니다.',
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
