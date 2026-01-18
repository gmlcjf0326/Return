// 진단 데모 시나리오 데이터 (~25초로 단축)

import { DemoData } from '../types';

export const assessmentDemoData: DemoData = {
  id: 'assessment-demo',
  title: '인지 진단 체험',
  description: '인지 진단 과정을 영상처럼 체험해보세요',
  totalDuration: 25000, // 25초로 단축
  scenes: [
    {
      id: 'title',
      type: 'title',
      duration: 1500,
      title: '인지 진단 체험',
      description: 'AI 기반 종합 인지 평가',
      transition: 'fade',
    },
    {
      id: 'start-screen',
      type: 'screen',
      duration: 2000,
      screenType: 'assessment-start',
      title: '진단 시작 화면',
      description: '진단 안내 화면입니다',
      transition: 'slide-left',
    },
    {
      id: 'start-click',
      type: 'action',
      duration: 1500,
      screenType: 'assessment-start',
      actionLabel: '시작하기 클릭',
      // 시작하기 버튼: 중앙, justify-center 레이아웃에서 콘텐츠 하단
      // PC에서 pt-16/pb-32 패딩 고려하여 조정
      highlight: { x: 50, y: 58 },
    },
    {
      id: 'camera-permission',
      type: 'screen',
      duration: 2000,
      screenType: 'camera-permission',
      title: '카메라 권한 요청',
      description: '표정 분석을 위한 카메라 접근 요청',
      transition: 'fade',
    },
    {
      id: 'permission-allow',
      type: 'action',
      duration: 1500,
      screenType: 'camera-permission',
      actionLabel: '허용 클릭',
      // 허용 버튼: 두 버튼 중 오른쪽, justify-center 레이아웃 중앙
      highlight: { x: 56, y: 54 },
    },
    {
      id: 'question-1',
      type: 'screen',
      duration: 2000,
      screenType: 'memory-question',
      title: '문항 1: 기억력 테스트',
      description: '단어 기억하기',
      transition: 'slide-left',
    },
    {
      id: 'answer-1',
      type: 'action',
      duration: 1500,
      screenType: 'memory-question',
      actionLabel: '기억했어요 클릭',
      // 기억했어요 버튼: mt-auto로 하단 배치, 두 버튼 중 왼쪽
      // pb-32 패딩 위 영역의 하단
      highlight: { x: 40, y: 68 },
    },
    {
      id: 'question-2',
      type: 'screen',
      duration: 2000,
      screenType: 'calculation-question',
      title: '문항 2: 계산력 테스트',
      description: '간단한 계산 문제',
      transition: 'slide-left',
    },
    {
      id: 'answer-2',
      type: 'action',
      duration: 1500,
      screenType: 'calculation-question',
      actionLabel: '86 입력',
      // 입력 필드: 중앙, 컨텐츠 영역 중간
      highlight: { x: 50, y: 45 },
    },
    {
      id: 'analyzing',
      type: 'screen',
      duration: 2000,
      screenType: 'analyzing',
      title: '분석 중...',
      description: 'AI가 결과를 분석하고 있습니다',
      transition: 'fade',
    },
    {
      id: 'result',
      type: 'result',
      duration: 3000,
      screenType: 'result',
      title: '진단 결과',
      description: '종합 인지 점수와 영역별 분석',
      transition: 'slide-up',
    },
    {
      id: 'complete',
      type: 'title',
      duration: 1500,
      title: '체험 완료',
      description: '직접 진단을 시작해보세요!',
      transition: 'fade',
    },
  ],
};
