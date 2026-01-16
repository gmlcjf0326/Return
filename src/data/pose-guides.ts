/**
 * 동작/자세 진단을 위한 가이드 데이터
 */

// 동작 유형
export type MovementType =
  | 'hand_raise_left'    // 왼손 들기
  | 'hand_raise_right'   // 오른손 들기
  | 'hand_raise_both'    // 양손 들기
  | 'arms_spread'        // 팔 벌리기
  | 'touch_nose'         // 코 만지기
  | 'touch_ear_left'     // 왼쪽 귀 만지기
  | 'touch_ear_right'    // 오른쪽 귀 만지기
  | 'thumbs_up'          // 엄지 척
  | 'wave_hand'          // 손 흔들기
  | 'clap_hands'         // 박수
  | 'smile'              // 미소 짓기
  | 'close_eyes'         // 눈 감기
  | 'open_mouth'         // 입 벌리기
  | 'head_tilt_left'     // 고개 왼쪽으로
  | 'head_tilt_right';   // 고개 오른쪽으로

// 동작 가이드 인터페이스
export interface PoseGuide {
  id: MovementType;
  name: string;
  description: string;
  instruction: string;
  icon: string;
  category: 'hand' | 'arm' | 'face' | 'head';
  difficulty: 1 | 2 | 3;
  targetDuration: number; // 유지해야 하는 시간 (ms)
  keyPoints?: string[]; // 확인할 주요 포인트
}

// 동작 가이드 목록
export const poseGuides: Record<MovementType, PoseGuide> = {
  hand_raise_left: {
    id: 'hand_raise_left',
    name: '왼손 들기',
    description: '왼손을 머리 위로 높이 들어주세요',
    instruction: '왼손을 천천히 머리 위로 올려주세요. 팔을 쭉 펴서 3초간 유지해주세요.',
    icon: '🙋',
    category: 'arm',
    difficulty: 1,
    targetDuration: 3000,
    keyPoints: ['left_wrist', 'left_elbow', 'left_shoulder'],
  },
  hand_raise_right: {
    id: 'hand_raise_right',
    name: '오른손 들기',
    description: '오른손을 머리 위로 높이 들어주세요',
    instruction: '오른손을 천천히 머리 위로 올려주세요. 팔을 쭉 펴서 3초간 유지해주세요.',
    icon: '🙋',
    category: 'arm',
    difficulty: 1,
    targetDuration: 3000,
    keyPoints: ['right_wrist', 'right_elbow', 'right_shoulder'],
  },
  hand_raise_both: {
    id: 'hand_raise_both',
    name: '양손 들기',
    description: '양손을 머리 위로 높이 들어주세요',
    instruction: '양손을 동시에 머리 위로 올려주세요. 두 팔을 쭉 펴서 3초간 유지해주세요.',
    icon: '🙌',
    category: 'arm',
    difficulty: 2,
    targetDuration: 3000,
    keyPoints: ['left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder'],
  },
  arms_spread: {
    id: 'arms_spread',
    name: '팔 벌리기',
    description: '양팔을 옆으로 넓게 펴주세요',
    instruction: '양팔을 어깨 높이로 옆으로 넓게 펴주세요. T자 모양을 만들어 3초간 유지해주세요.',
    icon: '🤸',
    category: 'arm',
    difficulty: 2,
    targetDuration: 3000,
    keyPoints: ['left_wrist', 'right_wrist', 'left_elbow', 'right_elbow'],
  },
  touch_nose: {
    id: 'touch_nose',
    name: '코 만지기',
    description: '검지 손가락으로 코 끝을 만져주세요',
    instruction: '오른손 검지 손가락으로 천천히 코 끝을 만져주세요.',
    icon: '👃',
    category: 'hand',
    difficulty: 2,
    targetDuration: 2000,
    keyPoints: ['right_index', 'nose'],
  },
  touch_ear_left: {
    id: 'touch_ear_left',
    name: '왼쪽 귀 만지기',
    description: '오른손으로 왼쪽 귀를 만져주세요',
    instruction: '오른손을 머리 위로 넘겨서 왼쪽 귀를 만져주세요.',
    icon: '👂',
    category: 'hand',
    difficulty: 3,
    targetDuration: 2000,
    keyPoints: ['right_wrist', 'left_ear'],
  },
  touch_ear_right: {
    id: 'touch_ear_right',
    name: '오른쪽 귀 만지기',
    description: '왼손으로 오른쪽 귀를 만져주세요',
    instruction: '왼손을 머리 위로 넘겨서 오른쪽 귀를 만져주세요.',
    icon: '👂',
    category: 'hand',
    difficulty: 3,
    targetDuration: 2000,
    keyPoints: ['left_wrist', 'right_ear'],
  },
  thumbs_up: {
    id: 'thumbs_up',
    name: '엄지 척',
    description: '엄지손가락을 위로 올려주세요',
    instruction: '오른손으로 엄지 척 동작을 해주세요. 엄지손가락을 위로 올려 2초간 유지해주세요.',
    icon: '👍',
    category: 'hand',
    difficulty: 1,
    targetDuration: 2000,
    keyPoints: ['right_thumb'],
  },
  wave_hand: {
    id: 'wave_hand',
    name: '손 흔들기',
    description: '손을 좌우로 흔들어 인사해주세요',
    instruction: '오른손을 어깨 높이로 올리고 좌우로 흔들어 인사해주세요.',
    icon: '👋',
    category: 'hand',
    difficulty: 1,
    targetDuration: 3000,
    keyPoints: ['right_wrist'],
  },
  clap_hands: {
    id: 'clap_hands',
    name: '박수',
    description: '박수를 쳐주세요',
    instruction: '양손을 모아 박수를 3번 쳐주세요.',
    icon: '👏',
    category: 'hand',
    difficulty: 2,
    targetDuration: 3000,
    keyPoints: ['left_wrist', 'right_wrist'],
  },
  smile: {
    id: 'smile',
    name: '미소 짓기',
    description: '활짝 웃어주세요',
    instruction: '카메라를 보고 활짝 웃어주세요. 3초간 미소를 유지해주세요.',
    icon: '😊',
    category: 'face',
    difficulty: 1,
    targetDuration: 3000,
    keyPoints: ['mouth', 'lips_corners'],
  },
  close_eyes: {
    id: 'close_eyes',
    name: '눈 감기',
    description: '눈을 천천히 감아주세요',
    instruction: '눈을 천천히 감고 3초간 유지해주세요.',
    icon: '😌',
    category: 'face',
    difficulty: 1,
    targetDuration: 3000,
    keyPoints: ['left_eye', 'right_eye'],
  },
  open_mouth: {
    id: 'open_mouth',
    name: '입 벌리기',
    description: '입을 크게 벌려주세요',
    instruction: '입을 크게 벌려 "아~" 소리를 내듯이 2초간 유지해주세요.',
    icon: '😮',
    category: 'face',
    difficulty: 1,
    targetDuration: 2000,
    keyPoints: ['mouth', 'jaw'],
  },
  head_tilt_left: {
    id: 'head_tilt_left',
    name: '고개 왼쪽으로',
    description: '고개를 왼쪽으로 기울여주세요',
    instruction: '고개를 왼쪽 어깨 방향으로 천천히 기울여주세요. 2초간 유지해주세요.',
    icon: '↖️',
    category: 'head',
    difficulty: 2,
    targetDuration: 2000,
    keyPoints: ['nose', 'left_ear', 'right_ear'],
  },
  head_tilt_right: {
    id: 'head_tilt_right',
    name: '고개 오른쪽으로',
    description: '고개를 오른쪽으로 기울여주세요',
    instruction: '고개를 오른쪽 어깨 방향으로 천천히 기울여주세요. 2초간 유지해주세요.',
    icon: '↗️',
    category: 'head',
    difficulty: 2,
    targetDuration: 2000,
    keyPoints: ['nose', 'left_ear', 'right_ear'],
  },
};

// 진단에 사용할 동작 목록 (쉬운 것부터)
export const assessmentMovements: MovementType[] = [
  'hand_raise_right', // 손 동작 1
  'thumbs_up',        // 손 동작 2
  'arms_spread',      // 신체 자세 1
  'hand_raise_both',  // 신체 자세 2
  'smile',            // 얼굴 표정
];

/**
 * 동작 가이드 가져오기
 */
export function getPoseGuide(movement: MovementType): PoseGuide {
  return poseGuides[movement];
}

/**
 * 카테고리별 동작 가져오기
 */
export function getPosesByCategory(category: PoseGuide['category']): PoseGuide[] {
  return Object.values(poseGuides).filter((guide) => guide.category === category);
}

/**
 * 난이도별 동작 가져오기
 */
export function getPosesByDifficulty(difficulty: 1 | 2 | 3): PoseGuide[] {
  return Object.values(poseGuides).filter((guide) => guide.difficulty === difficulty);
}

export default poseGuides;
