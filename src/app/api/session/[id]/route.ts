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

    // profileData JSON 파싱
    let parsedProfileData: Session['profileData'] = undefined;
    if (session.profileData) {
      try {
        parsedProfileData = JSON.parse(session.profileData);
      } catch {
        parsedProfileData = undefined;
      }
    }

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        id: session.id,
        nickname: session.nickname ?? undefined,
        birthYear: session.birthYear ?? undefined,
        profileData: parsedProfileData,
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

// PATCH /api/session/[id] - 세션 업데이트 (없으면 생성)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, birthYear, profileData, lastActiveAt } = body;

    // upsert: 없으면 생성, 있으면 업데이트
    const session = await prisma.session.upsert({
      where: { id },
      create: {
        id,
        nickname: nickname ?? null,
        birthYear: birthYear ?? null,
        profileData: profileData ? JSON.stringify(profileData) : null,
        lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : new Date(),
      },
      update: {
        ...(nickname !== undefined && { nickname }),
        ...(birthYear !== undefined && { birthYear }),
        ...(profileData !== undefined && { profileData: JSON.stringify(profileData) }),
        lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : new Date(),
      },
    });

    // profileData JSON 파싱
    let parsedProfileData: Session['profileData'] = undefined;
    if (session.profileData) {
      try {
        parsedProfileData = JSON.parse(session.profileData);
      } catch {
        parsedProfileData = undefined;
      }
    }

    const response: ApiResponse<Session> = {
      success: true,
      data: {
        id: session.id,
        nickname: session.nickname ?? undefined,
        birthYear: session.birthYear ?? undefined,
        profileData: parsedProfileData,
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
