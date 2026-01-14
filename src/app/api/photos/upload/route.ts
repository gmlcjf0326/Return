import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 업로드 디렉토리
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'photos');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const files = formData.getAll('files') as File[];

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 생성
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploadedPhotos = [];

    for (const file of files) {
      // 파일 확장자 추출
      const ext = path.extname(file.name).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      // 파일 저장
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // 웹 접근 가능한 URL
      const fileUrl = `/uploads/photos/${uniqueName}`;

      // DB에 저장
      const photo = await prisma.photo.create({
        data: {
          sessionId,
          fileName: file.name,
          fileUrl,
          // autoTags는 분석 후 추가
        },
      });

      uploadedPhotos.push({
        id: String(photo.id),
        fileName: photo.fileName,
        fileUrl: photo.fileUrl,
        uploadedAt: photo.createdAt.toISOString(),
        autoTags: null,
        userTags: [],
        isAnalyzed: false,
      });
    }

    return NextResponse.json({
      success: true,
      photos: uploadedPhotos,
    });
  } catch (error) {
    console.error('Failed to upload photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}
