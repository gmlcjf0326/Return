// 자동 재생 데모 타입 정의

export interface Scene {
  id: string;
  type: 'title' | 'screen' | 'action' | 'result';
  duration: number; // ms
  title?: string;
  description?: string;
  screenType?: string; // 어떤 화면을 보여줄지
  actionLabel?: string; // "버튼 클릭", "답변 선택" 등
  highlight?: {
    // 클릭 애니메이션 위치 (% 기준)
    x: number;
    y: number;
  };
  transition?: 'fade' | 'slide-left' | 'slide-up';
  content?: React.ReactNode; // 커스텀 컨텐츠
}

export interface DemoData {
  id: string;
  title: string;
  description: string;
  totalDuration: number; // 총 재생 시간 (ms)
  scenes: Scene[];
}

export type AutoplayDemoType = 'assessment' | 'training';

export interface DemoPlayerProps {
  type: AutoplayDemoType;
  onClose: () => void;
}

export interface DemoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip?: () => void;
  onClose: () => void;
}

export interface DemoProgressProps {
  currentScene: number;
  totalScenes: number;
  sceneProgress: number; // 0-100
}
