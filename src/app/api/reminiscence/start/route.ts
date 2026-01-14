import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateReminiscenceQuestions } from '@/lib/ai/vision';

export async function POST(request: NextRequest) {
  try {
    const { photoId, sessionId } = await request.json();

    if (!photoId || !sessionId) {
      return NextResponse.json(
        { error: 'photoId and sessionId are required' },
        { status: 400 }
      );
    }

    // 사진 정보 조회
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(photoId, 10) },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    if (!photo.autoTags) {
      return NextResponse.json(
        { error: 'Photo has not been analyzed yet' },
        { status: 400 }
      );
    }

    // 세션 정보 조회 (출생년도 등)
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    const autoTags = JSON.parse(photo.autoTags);

    // 회상 질문 생성
    let questions: string[];
    try {
      questions = await generateReminiscenceQuestions(autoTags, {
        birthYear: session?.birthYear ?? undefined,
      });
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // 기본 질문 사용
      questions = [
        '이 사진에서 무엇이 보이시나요?',
        '이 장면을 보니 어떤 기분이 드시나요?',
        '비슷한 경험을 해보신 적이 있으신가요?',
        '이때 누구와 함께 계셨나요?',
        '이 사진에서 가장 기억에 남는 것은 무엇인가요?',
      ];
    }

    // 초기 메시지 생성
    const greeting = generateGreeting(autoTags);
    const firstQuestion = questions[0];

    const initialMessage = `${greeting}\n\n${firstQuestion}`;

    return NextResponse.json({
      success: true,
      initialMessage,
      questions,
      photoAnalysis: autoTags,
    });
  } catch (error) {
    console.error('Failed to start reminiscence session:', error);
    return NextResponse.json(
      { error: 'Failed to start reminiscence session' },
      { status: 500 }
    );
  }
}

function generateGreeting(autoTags: {
  scene: string;
  peopleCount: number;
  estimatedEra: string;
  mood: string;
  description?: string;
}): string {
  const greetings = [
    '안녕하세요! 함께 이 사진에 대해 이야기해 볼까요?',
    '이 사진을 보니 참 좋은 추억이 담겨있는 것 같네요.',
    '이 사진이 정말 인상적이에요. 같이 살펴볼까요?',
  ];

  let greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // 사진 설명 추가
  if (autoTags.description) {
    greeting += `\n\n${autoTags.description}`;
  }

  // 컨텍스트에 따른 추가 설명
  if (autoTags.scene === '가족모임' || autoTags.scene === '명절') {
    greeting += '\n\n가족들과 함께한 특별한 순간처럼 보이네요.';
  } else if (autoTags.scene === '여행') {
    greeting += '\n\n여행 중 찍은 사진 같아요. 어디로 가셨을까요?';
  } else if (autoTags.peopleCount > 3) {
    greeting += `\n\n${autoTags.peopleCount}명이나 함께 계시네요! 모임이 있었나 봐요.`;
  }

  return greeting;
}
