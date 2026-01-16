'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// 마우스 위치 기록
export interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
  duration?: number; // 해당 위치에 머무른 시간 (ms)
}

// 클릭 기록
export interface ClickRecord {
  x: number;
  y: number;
  timestamp: number;
  target?: string; // 클릭된 요소의 식별자
}

// 콘텐츠 영역 관심도
export interface ContentInterest {
  region: string;
  hoverTime: number; // ms
  clickCount: number;
  percentage: number;
}

// 히트맵 데이터 (그리드 기반)
export interface HeatmapCell {
  x: number; // 그리드 x 좌표 (0~gridSize-1)
  y: number; // 그리드 y 좌표 (0~gridSize-1)
  intensity: number; // 0~1 사이 값
  hoverTime: number; // ms
  clickCount: number;
}

// 훅 옵션
interface UseMouseTrackingOptions {
  enabled?: boolean;
  trackingInterval?: number; // 위치 기록 간격 (ms)
  gridSize?: number; // 히트맵 그리드 크기
  containerRef?: React.RefObject<HTMLElement>;
}

// 훅 반환 타입
interface UseMouseTrackingReturn {
  isTracking: boolean;
  mousePositions: MousePosition[];
  clickRecords: ClickRecord[];
  heatmapData: HeatmapCell[];
  contentInterests: ContentInterest[];
  currentPosition: { x: number; y: number } | null;
  startTracking: () => void;
  stopTracking: () => void;
  clearData: () => void;
  getHeatmapIntensity: (x: number, y: number) => number;
}

// 콘텐츠 영역 정의
const CONTENT_REGIONS = {
  question: { name: '문항 텍스트', selector: '.question-text, h2' },
  options: { name: '선택지 영역', selector: '.options-area, button' },
  timer: { name: '타이머', selector: '.timer, [class*="timer"]' },
  navigation: { name: '네비게이션', selector: '.navigation, nav' },
  input: { name: '입력 영역', selector: 'input, textarea' },
  other: { name: '기타', selector: '*' },
};

export function useMouseTracking(options: UseMouseTrackingOptions = {}): UseMouseTrackingReturn {
  const {
    enabled = true,
    trackingInterval = 100,
    gridSize = 10,
    containerRef,
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [mousePositions, setMousePositions] = useState<MousePosition[]>([]);
  const [clickRecords, setClickRecords] = useState<ClickRecord[]>([]);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);

  const lastPositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 히트맵 데이터 계산
  const heatmapData = calculateHeatmap(mousePositions, clickRecords, gridSize);

  // 콘텐츠 관심도 계산
  const contentInterests = calculateContentInterests(mousePositions, clickRecords);

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isTracking) return;

    const now = Date.now();
    const container = containerRef?.current || document.body;
    const rect = container.getBoundingClientRect();

    // 상대 좌표로 변환 (0~1 범위)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // 경계 체크
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    setCurrentPosition({ x: e.clientX, y: e.clientY });

    // 이전 위치에 머무른 시간 계산
    if (lastPositionRef.current) {
      const duration = now - lastPositionRef.current.timestamp;

      // 일정 시간 이상 머물렀으면 기록
      if (duration >= trackingInterval) {
        setMousePositions(prev => [
          ...prev,
          {
            x: lastPositionRef.current!.x,
            y: lastPositionRef.current!.y,
            timestamp: lastPositionRef.current!.timestamp,
            duration,
          },
        ]);
      }
    }

    lastPositionRef.current = { x, y, timestamp: now };
  }, [isTracking, trackingInterval, containerRef]);

  // 클릭 핸들러
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isTracking) return;

    const container = containerRef?.current || document.body;
    const rect = container.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // 클릭된 요소 식별
    const target = (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown';

    setClickRecords(prev => [
      ...prev,
      {
        x,
        y,
        timestamp: Date.now(),
        target,
      },
    ]);
  }, [isTracking, containerRef]);

  // 주기적 위치 기록
  const recordPosition = useCallback(() => {
    if (!isTracking || !lastPositionRef.current) return;

    const now = Date.now();
    const duration = now - lastPositionRef.current.timestamp;

    setMousePositions(prev => [
      ...prev,
      {
        x: lastPositionRef.current!.x,
        y: lastPositionRef.current!.y,
        timestamp: lastPositionRef.current!.timestamp,
        duration,
      },
    ]);

    lastPositionRef.current.timestamp = now;
  }, [isTracking]);

  // 추적 시작
  const startTracking = useCallback(() => {
    if (!enabled) return;

    setIsTracking(true);

    // 주기적 기록 시작
    trackingIntervalRef.current = setInterval(recordPosition, trackingInterval);
  }, [enabled, recordPosition, trackingInterval]);

  // 추적 중지
  const stopTracking = useCallback(() => {
    setIsTracking(false);

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  // 데이터 초기화
  const clearData = useCallback(() => {
    setMousePositions([]);
    setClickRecords([]);
    lastPositionRef.current = null;
  }, []);

  // 특정 좌표의 히트맵 강도 조회
  const getHeatmapIntensity = useCallback((x: number, y: number): number => {
    const cell = heatmapData.find(c => c.x === x && c.y === y);
    return cell?.intensity || 0;
  }, [heatmapData]);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!isTracking) return;

    const container = containerRef?.current || document;

    container.addEventListener('mousemove', handleMouseMove as EventListener);
    container.addEventListener('click', handleClick as EventListener);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove as EventListener);
      container.removeEventListener('click', handleClick as EventListener);
    };
  }, [isTracking, handleMouseMove, handleClick, containerRef]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isTracking,
    mousePositions,
    clickRecords,
    heatmapData,
    contentInterests,
    currentPosition,
    startTracking,
    stopTracking,
    clearData,
    getHeatmapIntensity,
  };
}

// 히트맵 데이터 계산
function calculateHeatmap(
  positions: MousePosition[],
  clicks: ClickRecord[],
  gridSize: number
): HeatmapCell[] {
  const grid: Map<string, HeatmapCell> = new Map();

  // 그리드 초기화
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      grid.set(`${x}-${y}`, {
        x,
        y,
        intensity: 0,
        hoverTime: 0,
        clickCount: 0,
      });
    }
  }

  // 마우스 위치 데이터 집계
  positions.forEach(pos => {
    const gridX = Math.min(Math.floor(pos.x * gridSize), gridSize - 1);
    const gridY = Math.min(Math.floor(pos.y * gridSize), gridSize - 1);
    const key = `${gridX}-${gridY}`;
    const cell = grid.get(key);

    if (cell) {
      cell.hoverTime += pos.duration || 100;
    }
  });

  // 클릭 데이터 집계
  clicks.forEach(click => {
    const gridX = Math.min(Math.floor(click.x * gridSize), gridSize - 1);
    const gridY = Math.min(Math.floor(click.y * gridSize), gridSize - 1);
    const key = `${gridX}-${gridY}`;
    const cell = grid.get(key);

    if (cell) {
      cell.clickCount++;
      cell.hoverTime += 500; // 클릭 위치에 추가 가중치
    }
  });

  // 강도 정규화
  const cells = Array.from(grid.values());
  const maxHoverTime = Math.max(...cells.map(c => c.hoverTime), 1);

  cells.forEach(cell => {
    cell.intensity = cell.hoverTime / maxHoverTime;
  });

  return cells;
}

// 콘텐츠 관심도 계산
function calculateContentInterests(
  positions: MousePosition[],
  clicks: ClickRecord[]
): ContentInterest[] {
  // 영역별 집계 (간단한 y좌표 기반 분류)
  const regions: Record<string, { hoverTime: number; clickCount: number }> = {
    top: { hoverTime: 0, clickCount: 0 },      // 상단 (문항/타이머)
    middle: { hoverTime: 0, clickCount: 0 },   // 중앙 (선택지/입력)
    bottom: { hoverTime: 0, clickCount: 0 },   // 하단 (버튼/네비게이션)
  };

  // 마우스 위치 데이터 분류
  positions.forEach(pos => {
    const region = pos.y < 0.33 ? 'top' : pos.y < 0.66 ? 'middle' : 'bottom';
    regions[region].hoverTime += pos.duration || 100;
  });

  // 클릭 데이터 분류
  clicks.forEach(click => {
    const region = click.y < 0.33 ? 'top' : click.y < 0.66 ? 'middle' : 'bottom';
    regions[region].clickCount++;
  });

  // 비율 계산
  const totalHoverTime = Object.values(regions).reduce((sum, r) => sum + r.hoverTime, 0) || 1;

  const regionNames: Record<string, string> = {
    top: '문항/타이머 영역',
    middle: '답변/선택지 영역',
    bottom: '버튼/네비게이션',
  };

  return Object.entries(regions).map(([key, data]) => ({
    region: regionNames[key],
    hoverTime: data.hoverTime,
    clickCount: data.clickCount,
    percentage: Math.round((data.hoverTime / totalHoverTime) * 100),
  }));
}

// 히트맵 색상 생성 유틸리티
export function getHeatmapColor(intensity: number): string {
  // 파랑 -> 초록 -> 노랑 -> 빨강
  const hue = (1 - intensity) * 240; // 240(파랑) -> 0(빨강)
  return `hsl(${hue}, 70%, 50%)`;
}

export default useMouseTracking;
