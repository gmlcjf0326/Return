'use client';

import { Modal } from '@/components/ui';
import AssessmentDemo from './AssessmentDemo';
import MemoryGameDemo from './MemoryGameDemo';
import CalculationDemo from './CalculationDemo';
import LanguageDemo from './LanguageDemo';
import ReminiscenceDemo from './ReminiscenceDemo';

export type DemoType = 'assessment' | 'memory' | 'calculation' | 'language' | 'reminiscence';

interface DemoModalProps {
  type: DemoType;
  onClose: () => void;
}

const DEMO_TITLES: Record<DemoType, string> = {
  assessment: '인지 진단 체험',
  memory: '기억력 게임 체험',
  calculation: '계산력 게임 체험',
  language: '언어력 게임 체험',
  reminiscence: '회상 대화 체험',
};

export default function DemoModal({ type, onClose }: DemoModalProps) {
  const renderDemo = () => {
    switch (type) {
      case 'assessment':
        return <AssessmentDemo onClose={onClose} />;
      case 'memory':
        return <MemoryGameDemo onClose={onClose} />;
      case 'calculation':
        return <CalculationDemo onClose={onClose} />;
      case 'language':
        return <LanguageDemo onClose={onClose} />;
      case 'reminiscence':
        return <ReminiscenceDemo onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={DEMO_TITLES[type]}
      size="md"
    >
      {renderDemo()}
    </Modal>
  );
}
