import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse, Session } from '@/types';

// UUID v4 형식 검증
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nickname, birthYear, profileData } = body;

    // 필수 필드 검증
    if (!id || typeof id !== 'string') {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '세션 ID가 필요합니다.',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // UUID 형식 검증
    if (!UUID_REGEX.test(id)) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '유효한 UUID 형식이 아닙니다.',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // birthYear 검증 (선택적)
    if (birthYear !== undefined && birthYear !== null) {
      const year = Number(birthYear);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        const response: ApiResponse<null> = {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '유효한 출생연도가 아닙니다.',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

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
