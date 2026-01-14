import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { photoId, sessionId, message, conversationHistory } = await request.json();

    if (!photoId || !sessionId || !message) {
      return NextResponse.json(
        { error: 'photoId, sessionId, and message are required' },
        { status: 400 }
      );
    }

    // 사진 정보 조회
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(photoId, 10) },
    });

    if (!photo || !photo.autoTags) {
      return NextResponse.json(
        { error: 'Photo not found or not analyzed' },
        { status: 404 }
      );
    }

    const autoTags = JSON.parse(photo.autoTags);

    // 시스템 프롬프트 구성
    const systemPrompt = buildSystemPrompt(autoTags);

    // 대화 기록 구성
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 기존 대화 기록 추가
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      });
    }

    // 현재 메시지 추가
    messages.push({ role: 'user', content: message });

    // GPT 응답 생성
    let assistantResponse: string;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 500,
        temperature: 0.8,
      });

      assistantResponse = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성하지 못했습니다.';
    } catch (error) {
      console.error('GPT API error:', error);
      // 기본 응답
      assistantResponse = generateFallbackResponse(message, autoTags);
    }

    // 대화 기록 저장
    try {
      await prisma.reminiscenceLog.create({
        data: {
          sessionId,
          photoId: parseInt(photoId, 10),
          aiQuestion: messages[messages.length - 2]?.content || '',
          userResponse: message,
          responseAnalysis: JSON.stringify({
            timestamp: new Date().toISOString(),
            messageLength: message.length,
          }),
        },
      });
    } catch (dbError) {
      console.error('Failed to save reminiscence log:', dbError);
      // DB 저장 실패해도 대화는 계속
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
    });
  } catch (error) {
    console.error('Failed to process chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(autoTags: {
  scene: string;
  peopleCount: number;
  estimatedEra: string;
  locationType: string;
  mood: string;
  objects: string[];
  description: string;
}): string {
  return `당신은 치매 환자 또는 경도인지장애(MCI) 환자를 위한 회상치료 전문 상담사입니다.
사용자가 업로드한 사진을 보며 따뜻하고 공감적인 대화를 나눕니다.

## 대화 원칙
1. 항상 친절하고 따뜻한 톤을 유지하세요.
2. 짧고 명확한 문장을 사용하세요.
3. 환자의 응답을 긍정적으로 받아들이고 격려하세요.
4. 과거의 좋은 기억을 떠올리게 하는 질문을 하세요.
5. 오감(시각, 청각, 후각, 미각, 촉각)과 관련된 질문을 섞어주세요.
6. 환자가 대답하기 어려워하면 힌트를 주거나 다른 주제로 자연스럽게 넘어가세요.
7. 응답은 2-3문장 정도로 짧게 하고, 마지막에 새로운 질문을 포함하세요.

## 현재 사진 정보
- 장면: ${autoTags.scene}
- 인원 수: ${autoTags.peopleCount}명
- 추정 시대: ${autoTags.estimatedEra}
- 장소 유형: ${autoTags.locationType}
- 분위기: ${autoTags.mood}
- 감지된 물체: ${autoTags.objects.join(', ')}
- AI 설명: ${autoTags.description}

## 대화 예시
사용자: "여기는 우리 집이에요."
상담사: "아, 집에서 찍은 사진이군요! 참 따뜻해 보이네요. 이 사진을 찍을 때 어떤 일이 있었나요?"

사용자: "잘 기억이 안 나요."
상담사: "괜찮아요, 천천히 생각해 보셔도 됩니다. 사진 속에 있는 분들은 누구인가요? 가족이신가요?"

응답은 항상 한국어로 하고, 따뜻하고 공감하는 어조를 유지하세요.`;
}

function generateFallbackResponse(message: string, autoTags: {
  scene: string;
  peopleCount: number;
  mood: string;
}): string {
  const responses = [
    '그렇군요! 더 자세히 말씀해 주시겠어요?',
    '참 좋은 이야기네요. 그때 기분이 어떠셨나요?',
    '흥미로운 이야기에요. 그 외에 기억나시는 게 있으신가요?',
    '네, 잘 들었어요. 그 순간이 특별했던 이유가 있을까요?',
    '좋은 추억 같아요. 함께 있던 분들은 누구였나요?',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
