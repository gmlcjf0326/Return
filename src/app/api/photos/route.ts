import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - 사진 목록 조회
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

    const photos = await prisma.photo.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    // Transform for frontend
    const transformedPhotos = photos.map((photo) => ({
      id: String(photo.id),
      fileName: photo.fileName,
      fileUrl: photo.fileUrl,
      uploadedAt: photo.createdAt.toISOString(),
      autoTags: photo.autoTags ? JSON.parse(photo.autoTags) : null,
      userTags: photo.userTags ? JSON.parse(photo.userTags) : [],
      isAnalyzed: !!photo.autoTags,
    }));

    return NextResponse.json({ photos: transformedPhotos });
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// DELETE - 사진 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    await prisma.photo.delete({
      where: { id: parseInt(photoId, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
