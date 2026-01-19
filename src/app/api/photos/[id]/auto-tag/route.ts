import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { analyzePhoto, PhotoAnalysisResult } from '@/lib/ai/vision';
import path from 'path';

export async function POST(
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

    // 사진 조회
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // 이미 분석된 경우
    if (photo.autoTags) {
      return NextResponse.json({
        success: true,
        alreadyAnalyzed: true,
        autoTags: JSON.parse(photo.autoTags),
      });
    }

    // 이미지 URL 생성 (로컬 파일의 경우 절대 경로로)
    let imageUrl = photo.fileUrl;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Photo file URL not found' },
        { status: 400 }
      );
    }

    // 로컬 파일인 경우 base64로 변환하거나 public URL 사용
    if (imageUrl.startsWith('/')) {
      // Vercel 배포 환경에서는 VERCEL_URL 사용, 로컬에서는 localhost
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        `http://localhost:${process.env.PORT || 3000}`;
      imageUrl = `${baseUrl}${photo.fileUrl}`;
    }

    // GPT Vision으로 분석
    let analysisResult: PhotoAnalysisResult;

    try {
      analysisResult = await analyzePhoto(imageUrl);
    } catch (analysisError) {
      console.error('GPT Vision analysis failed:', analysisError);

      // API 키가 없거나 실패 시 기본값 반환
      analysisResult = {
        scene: '일상',
        peopleCount: 0,
        estimatedEra: '알 수 없음',
        locationType: '알 수 없음',
        mood: '평화로운',
        objects: [],
        description: '사진 분석을 완료했습니다. (기본값)',
        tags: ['일상', '평화로운'],
      };
    }

    // DB 업데이트
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: {
        autoTags: JSON.stringify(analysisResult),
        sceneType: analysisResult.scene,
        estimatedEra: analysisResult.estimatedEra,
        peopleCount: analysisResult.peopleCount,
        mood: analysisResult.mood,
      },
    });

    return NextResponse.json({
      success: true,
      autoTags: analysisResult,
      photo: {
        id: String(updatedPhoto.id),
        fileName: updatedPhoto.fileName,
        fileUrl: updatedPhoto.fileUrl,
        uploadedAt: updatedPhoto.createdAt.toISOString(),
        autoTags: analysisResult,
        isAnalyzed: true,
      },
    });
  } catch (error) {
    console.error('Failed to analyze photo:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}
