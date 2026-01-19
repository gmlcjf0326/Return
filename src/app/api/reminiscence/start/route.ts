/**
 * 회상 대화 시작 API
 * TODO: [REAL_DATA] 실제 데이터베이스 연동 시 prisma 로직 활성화
 * TODO: [LLM_API] 실제 LLM API 연동
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateInitialQuestion } from '@/lib/ai/llm';
import { getRandomInitialQuestion, getRandomFollowUpQuestion } from '@/data/reminiscenceQuestions';
import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';
import type { UserProfileForChat } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, sessionId, photoData, userProfile } = body as {
      photoId: string;
      sessionId: string;
      photoData?: PhotoData;
      userProfile?: UserProfileForChat;
    };

    if (!photoId || !sessionId) {
      return NextResponse.json(
        { error: 'photoId and sessionId are required' },
        { status: 400 }
      );
    }

    let photo: PhotoData | null = null;
    let autoTags: PhotoData['autoTags'] = undefined;

    // 클라이언트에서 전달된 photoData가 있으면 사용 (더미 데이터 지원)
    if (photoData) {
      photo = photoData as PhotoData;
      autoTags = photo.autoTags;
    } else {
      // TODO: [REAL_DATA] 데이터베이스에서 사진 조회
      try {
        const dbPhoto = await prisma.photo.findUnique({
          where: { id: parseInt(photoId, 10) },
        });

        if (dbPhoto && dbPhoto.fileName && dbPhoto.fileUrl) {
          photo = {
            id: dbPhoto.id.toString(),
            fileName: dbPhoto.fileName,
            fileUrl: dbPhoto.fileUrl,
            uploadedAt: dbPhoto.createdAt.toISOString(),
            takenDate: dbPhoto.createdAt?.toISOString(),
            isAnalyzed: !!dbPhoto.autoTags,
            autoTags: dbPhoto.autoTags ? JSON.parse(dbPhoto.autoTags) : null,
          };
          autoTags = photo.autoTags;
        }
      } catch (dbError) {
        console.error('Database query failed:', dbError);
        // DB 에러 시 photoData가 없으면 실패
        if (!photoData) {
          return NextResponse.json(
            { error: 'Photo not found' },
            { status: 404 }
          );
        }
      }
    }

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // 카테고리 결정
    const category: PhotoCategory = photo.category || 'daily';

    // 회상 질문 생성
    const questions = generateQuestionSet(category);

    // 초기 메시지 생성
    const greeting = generateGreeting(category, autoTags);

    // TODO: [LLM_API] 실제 LLM으로 초기 질문 생성
    let firstQuestion: string;
    try {
      firstQuestion = await generateInitialQuestion(photo, userProfile);
    } catch (error) {
      console.error('Failed to generate initial question:', error);
      firstQuestion = getRandomInitialQuestion(category);
    }

    const initialMessage = `${greeting}\n\n${firstQuestion}`;

    return NextResponse.json({
      success: true,
      initialMessage,
      questions,
      photoAnalysis: autoTags,
      category,
    });
  } catch (error) {
    console.error('Failed to start reminiscence session:', error);
    return NextResponse.json(
      { error: 'Failed to start reminiscence session' },
      { status: 500 }
    );
  }
}

/**
 * 카테고리별 질문 세트 생성
 */
function generateQuestionSet(category: PhotoCategory): string[] {
  const questions: string[] = [];

  // 초기 질문 2개
  questions.push(getRandomInitialQuestion(category));
  questions.push(getRandomInitialQuestion(category));

  // 후속 질문 3개
  for (let i = 0; i < 3; i++) {
    questions.push(getRandomFollowUpQuestion(category));
  }

  return questions;
}

/**
 * 카테고리별 인사말 생성
 */
function generateGreeting(
  category: PhotoCategory,
  autoTags?: PhotoData['autoTags']
): string {
  const greetings: Record<PhotoCategory, string[]> = {
    family: [
      '안녕하세요! 가족분들과 함께한 소중한 사진이네요.',
      '이 사진을 보니 따뜻한 가족 모임이 느껴져요.',
      '가족 사진이군요! 정말 행복해 보이세요.',
    ],
    travel: [
      '안녕하세요! 멋진 여행 사진이네요.',
      '어디로 여행을 가셨는지 궁금해지는 사진이에요.',
      '정말 아름다운 곳에 다녀오셨네요!',
    ],
    event: [
      '안녕하세요! 특별한 날의 사진 같아요.',
      '축하할 일이 있으셨나 봐요!',
      '기념할 만한 순간이 담긴 사진이네요.',
    ],
    nature: [
      '안녕하세요! 아름다운 풍경 사진이네요.',
      '자연 속에서 찍은 사진이 정말 평화로워 보여요.',
      '힐링되는 풍경이에요.',
    ],
    daily: [
      '안녕하세요! 일상의 한 장면이 담긴 사진이네요.',
      '소소하지만 특별한 순간 같아요.',
      '따뜻한 일상이 느껴지는 사진이에요.',
    ],
    friends: [
      '안녕하세요! 친구분들과 함께한 사진이네요.',
      '좋은 친구들과 함께 찍은 사진 같아요.',
      '즐거운 시간을 보내셨나 봐요!',
    ],
  };

  const categoryGreetings = greetings[category] || greetings.daily;
  const greeting = categoryGreetings[Math.floor(Math.random() * categoryGreetings.length)];

  // AI 분석 정보(description)는 AI 컨텍스트로만 사용하고, 사용자에게 직접 표시하지 않음
  // 기술적인 설명(픽셀 아트, 이미지 스타일 등)이 포함될 수 있어 제거

  return greeting;
}
