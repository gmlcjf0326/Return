// 훈련 데모 시나리오 데이터 (~30초로 단축)

import { DemoData } from '../types';

export const trainingDemoData: DemoData = {
  id: 'training-demo',
  title: '두뇌 훈련 체험',
  description: '맞춤형 인지 훈련 과정을 영상처럼 체험해보세요',
  totalDuration: 30000, // 30초로 단축
  scenes: [
    {
      id: 'title',
      type: 'title',
      duration: 1500,
      title: '두뇌 훈련 체험',
      description: '맞춤형 인지 훈련 프로그램',
      transition: 'fade',
    },
    {
      id: 'training-menu',
      type: 'screen',
      duration: 2000,
      screenType: 'training-select',
      title: '훈련 선택 화면',
      description: '다양한 훈련 프로그램 중 선택',
      transition: 'slide-left',
    },
    {
      id: 'memory-click',
      type: 'action',
      duration: 1500,
      screenType: 'training-select',
      actionLabel: '기억력 훈련 선택',
      // 기억력 카드: 2x2 그리드 왼쪽 상단 (pt-16 패딩 고려)
      highlight: { x: 30, y: 32 },
    },
    {
      id: 'card-game',
      type: 'screen',
      duration: 2000,
      screenType: 'memory-game',
      title: '카드 매칭 게임',
      description: '같은 그림 카드 찾기',
      transition: 'slide-left',
    },
    {
      id: 'card-match',
      type: 'action',
      duration: 2500,
      screenType: 'memory-game-play',
      actionLabel: '카드 뒤집기',
      // 카드 그리드 내 특정 카드 (4x3 그리드의 2번째 줄)
      highlight: { x: 30, y: 42 },
    },
    {
      id: 'calc-click',
      type: 'action',
      duration: 1500,
      screenType: 'training-select',
      actionLabel: '계산력 훈련 선택',
      // 계산력 카드: 2x2 그리드 오른쪽 상단 (pt-16 패딩 고려)
      highlight: { x: 70, y: 32 },
      transition: 'slide-left',
    },
    {
      id: 'calc-game',
      type: 'screen',
      duration: 2000,
      screenType: 'calculation-game',
      title: '계산력 퍼즐',
      description: '빠른 암산 훈련',
      transition: 'slide-left',
    },
    {
      id: 'calc-answer',
      type: 'action',
      duration: 2000,
      screenType: 'calculation-game',
      actionLabel: '42 입력',
      // 숫자패드 중앙 영역 (3x4 그리드)
      highlight: { x: 50, y: 48 },
    },
    {
      id: 'reminiscence',
      type: 'screen',
      duration: 2500,
      screenType: 'reminiscence',
      title: '회상 대화',
      description: '사진과 함께 추억 이야기',
      transition: 'slide-left',
    },
    {
      id: 'chat',
      type: 'action',
      duration: 2000,
      screenType: 'reminiscence-chat',
      actionLabel: '메시지 전송',
      // 전송 버튼: 입력 영역 오른쪽 (pb-32 바로 위)
      highlight: { x: 85, y: 68 },
    },
    {
      id: 'diary',
      type: 'screen',
      duration: 2500,
      screenType: 'diary-result',
      title: '그림일기 생성',
      description: 'AI가 대화를 바탕으로 그림일기 생성',
      transition: 'fade',
    },
    {
      id: 'result',
      type: 'result',
      duration: 3000,
      screenType: 'training-result',
      title: '훈련 결과',
      description: '오늘의 훈련 성과',
      transition: 'slide-up',
    },
    {
      id: 'complete',
      type: 'title',
      duration: 1500,
      title: '체험 완료',
      description: '직접 훈련을 시작해보세요!',
      transition: 'fade',
    },
  ],
};
