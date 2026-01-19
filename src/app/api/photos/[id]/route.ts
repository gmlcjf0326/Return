import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * PATCH /api/photos/[id]
 * 사진 태그 및 정보 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id, 10);

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userTags, userDescription, category } = body;

    // 사진 존재 여부 확인
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 구성
    const updateData: {
      userTags?: string;
      userDescription?: string;
      sceneType?: string;
    } = {};

    if (userTags !== undefined) {
      updateData.userTags = JSON.stringify(userTags);
    }

    if (userDescription !== undefined) {
      updateData.userDescription = userDescription;
    }

    if (category !== undefined) {
      updateData.sceneType = category;
    }

    // DB 업데이트
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      photo: {
        id: String(updatedPhoto.id),
        userTags: updatedPhoto.userTags ? JSON.parse(updatedPhoto.userTags) : [],
        userDescription: updatedPhoto.userDescription,
        category: updatedPhoto.sceneType,
      },
    });
  } catch (error) {
    console.error('Failed to update photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photos/[id]
 * 개별 사진 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id, 10);

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: String(photo.id),
        fileName: photo.fileName,
        fileUrl: photo.fileUrl,
        uploadedAt: photo.createdAt.toISOString(),
        autoTags: photo.autoTags ? JSON.parse(photo.autoTags) : null,
        userTags: photo.userTags ? JSON.parse(photo.userTags) : [],
        userDescription: photo.userDescription,
        category: photo.sceneType,
        isAnalyzed: !!photo.autoTags,
      },
    });
  } catch (error) {
    console.error('Failed to get photo:', error);
    return NextResponse.json(
      { error: 'Failed to get photo' },
      { status: 500 }
    );
  }
}
