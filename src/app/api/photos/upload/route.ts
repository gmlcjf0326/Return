import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createServerSupabaseClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Supabase Storage 버킷 이름
const STORAGE_BUCKET = 'photos';

// Base64 인코딩 fallback (Supabase 실패 시)
async function fileToBase64DataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

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
    let useBase64Fallback = false;

    for (const file of files) {
      let fileUrl: string;

      if (!useBase64Fallback) {
        try {
          // 파일 확장자 추출
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const uniqueName = `${sessionId}/${uuidv4()}.${ext}`;

          // 파일을 ArrayBuffer로 변환
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Supabase Storage에 업로드
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(uniqueName, buffer, {
              contentType: file.type || 'image/jpeg',
              upsert: false,
            });

          if (uploadError) {
            console.error('Supabase Storage upload error:', uploadError);
            console.error('Error details:', {
              message: uploadError.message,
              name: uploadError.name,
              hint: 'Check if bucket "photos" exists and has proper RLS policies',
            });
            // 버킷이 없거나 권한 문제일 경우 base64 fallback 사용
            console.log('Switching to base64 fallback mode - photos will be stored as base64 data URLs');
            useBase64Fallback = true;
            fileUrl = await fileToBase64DataUrl(file);
          } else {
            // Public URL 생성
            const { data: urlData } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(uniqueName);
            fileUrl = urlData.publicUrl;
          }
        } catch (err) {
          console.error('Supabase upload failed, using base64:', err);
          useBase64Fallback = true;
          fileUrl = await fileToBase64DataUrl(file);
        }
      } else {
        // Base64 fallback 모드
        fileUrl = await fileToBase64DataUrl(file);
      }

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
      fallbackMode: useBase64Fallback,
      message: useBase64Fallback
        ? '사진이 Base64 형식으로 저장되었습니다. Supabase Storage 연동 후 클라우드 저장이 가능합니다.'
        : '사진이 클라우드에 성공적으로 업로드되었습니다.',
    });
  } catch (error) {
    console.error('Failed to upload photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos', details: String(error) },
      { status: 500 }
    );
  }
}
