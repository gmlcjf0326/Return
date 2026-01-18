import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createServerSupabaseClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Supabase Storage 버킷 이름
const STORAGE_BUCKET = 'photos';

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

    const supabase = createServerSupabaseClient();
    const uploadedPhotos = [];

    for (const file of files) {
      // 파일 확장자 추출
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueName = `${sessionId}/${uuidv4()}.${ext}`;

      // 파일을 ArrayBuffer로 변환
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uniqueName, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        // 버킷이 없는 경우 자동 생성 시도 (첫 실행 시)
        if (uploadError.message?.includes('not found')) {
          return NextResponse.json(
            {
              error: 'Storage bucket not configured',
              message: 'Supabase Storage에 "photos" 버킷을 생성해주세요.',
            },
            { status: 500 }
          );
        }
        throw uploadError;
      }

      // Public URL 생성
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uniqueName);

      const fileUrl = urlData.publicUrl;

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
