/**
 * 회상 대화 채팅 API
 * TODO: [REAL_DATA] 실제 데이터베이스 연동 시 prisma 로직 활성화
 * TODO: [LLM_API] 실제 LLM API 연동
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateReminiscenceResponse, type Message } from '@/lib/ai/llm';
import { getRandomFollowUpQuestion, getRandomHintQuestion } from '@/data/reminiscenceQuestions';
import type { PhotoData, PhotoCategory } from '@/components/photos/PhotoCard';
import type { UserProfileForChat } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, sessionId, message, conversationHistory, photoData, userProfile } = body as {
      photoId: string;
      sessionId: string;
      message: string;
      conversationHistory?: Array<{ role: string; content: string }>;
      photoData?: PhotoData;
      userProfile?: UserProfileForChat;
    };

    if (!photoId || !sessionId || !message) {
      return NextResponse.json(
        { error: 'photoId, sessionId, and message are required' },
        { status: 400 }
      );
    }

    let photo: PhotoData | null = null;

    // 클라이언트에서 전달된 photoData가 있으면 사용 (더미 데이터 지원)
    if (photoData) {
      photo = photoData as PhotoData;
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
        }
      } catch (dbError) {
        console.error('Database query failed:', dbError);
      }
    }

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const category: PhotoCategory = photo.category || 'daily';

    // 대화 기록 변환
    const history: Message[] = (conversationHistory || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    );

    // TODO: [LLM_API] 실제 LLM으로 응답 생성
    let assistantResponse: string;
    try {
      assistantResponse = await generateReminiscenceResponse(photo, history, message, userProfile);
    } catch (error) {
      console.error('Failed to generate response:', error);
      assistantResponse = generateFallbackResponse(category, history.length);
    }

    // 힌트 질문 생성
    const hintQuestion = getRandomHintQuestion(category);

    // 대화 기록 저장 (더미 데이터가 아닌 경우만)
    if (!photo.isDummy) {
      try {
        await prisma.reminiscenceLog.create({
          data: {
            sessionId,
            photoId: parseInt(photoId, 10),
            aiQuestion: history[history.length - 1]?.content || '',
            userResponse: message,
            responseAnalysis: JSON.stringify({
              timestamp: new Date().toISOString(),
              messageLength: message.length,
              category,
            }),
          },
        });
      } catch (dbError) {
        console.error('Failed to save reminiscence log:', dbError);
        // DB 저장 실패해도 대화는 계속
      }
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      hintQuestion,
      conversationLength: history.length + 1,
    });
  } catch (error) {
    console.error('Failed to process chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

/**
 * 기본 응답 생성 (API 실패 시)
 */
function generateFallbackResponse(category: PhotoCategory, conversationLength: number): string {
  if (conversationLength >= 6) {
    // 대화가 충분히 진행됨
    return '오늘 정말 좋은 이야기를 나눠주셔서 감사해요. 이 추억이 소중하게 느껴지네요. 혹시 더 이야기하고 싶은 부분이 있으신가요?';
  }

  const responses = [
    '그렇군요! 더 자세히 말씀해 주시겠어요?',
    '참 좋은 이야기네요. 그때 기분이 어떠셨나요?',
    '흥미로운 이야기에요. 그 외에 기억나시는 게 있으신가요?',
    '네, 잘 들었어요. 그 순간이 특별했던 이유가 있을까요?',
    '좋은 추억 같아요. 함께 있던 분들은 누구였나요?',
  ];

  // 카테고리별 추가 질문
  const categoryQuestions: Record<PhotoCategory, string[]> = {
    family: ['가족분들 성격은 어떠셨나요?', '그때 먹었던 음식이 기억나시나요?'],
    travel: ['여행지의 날씨는 어땠나요?', '그곳에서 가장 인상 깊었던 것은요?'],
    event: ['이날을 위해 어떤 준비를 하셨나요?', '어떤 선물을 주고받으셨나요?'],
    nature: ['그곳의 소리나 냄새가 기억나시나요?', '자주 가시던 곳인가요?'],
    daily: ['평소 좋아하시던 활동이 있으셨나요?', '그때와 지금 달라진 것이 있나요?'],
    friends: ['이 친구분과 어떻게 알게 되셨나요?', '함께 자주 하시던 활동이 있었나요?'],
  };

  const allResponses = [...responses, ...(categoryQuestions[category] || [])];

  return allResponses[Math.floor(Math.random() * allResponses.length)];
}
