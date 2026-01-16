'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { usePhotoStore } from '@/store/photoStore';
import { useTrainingStore } from '@/store/trainingStore';
import { Button, Card, CardHeader, CardContent, Modal } from '@/components/ui';
import { clearStorage, clearAllStorage } from '@/lib/utils/storageMigration';

const INTERESTS_OPTIONS = [
  '음악', '여행', '요리', '독서', '영화',
  '운동', '정원가꾸기', '사진', '그림', '공예',
  '바둑/장기', '등산', '낚시', '골프', '수영',
];

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주',
  '대전', '울산', '세종', '경기', '강원',
  '충북', '충남', '전북', '전남', '경북',
  '경남', '제주',
];

export default function SettingsPage() {
  const router = useRouter();
  const { session, updateProfile, updateNickname, updateBirthYear, clearSession } = useSessionStore();
  const { clearPhotos } = usePhotoStore();
  const { resetTraining } = useTrainingStore();

  // 프로필 폼 상태
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [region, setRegion] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // UI 상태
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'training' | 'photos' | 'all' | null>(null);

  // 세션 데이터로 초기화
  useEffect(() => {
    if (session) {
      setNickname(session.nickname || '');
      setBirthYear(session.birthYear || '');
      setGender(session.profileData?.gender || '');
      setRegion(session.profileData?.region || '');
      setSelectedInterests(session.profileData?.interests || []);
    }
  }, [session]);

  // 관심사 토글
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // 프로필 저장
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (nickname !== session?.nickname) {
        updateNickname(nickname);
      }
      if (birthYear && birthYear !== session?.birthYear) {
        updateBirthYear(Number(birthYear));
      }
      updateProfile({
        gender: gender || undefined,
        region: region || undefined,
        interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      });

      // 성공 피드백
      alert('설정이 저장되었습니다.');
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 데이터 초기화
  const handleReset = (type: 'training' | 'photos' | 'all') => {
    setResetType(type);
    setShowResetModal(true);
  };

  const confirmReset = () => {
    switch (resetType) {
      case 'training':
        resetTraining();
        clearStorage('training');
        break;
      case 'photos':
        clearPhotos();
        clearStorage('photos');
        break;
      case 'all':
        clearSession();
        clearPhotos();
        resetTraining();
        clearAllStorage();
        router.push('/');
        break;
    }
    setShowResetModal(false);
    setResetType(null);
  };

  return (
    <div className="min-h-full bg-[var(--neutral-50)]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-lg bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] flex items-center justify-center transition-colors"
              aria-label="뒤로 가기"
            >
              <svg className="w-5 h-5 text-[var(--neutral-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--neutral-800)]">설정</h1>
              <p className="text-[var(--neutral-500)]">프로필 및 앱 설정을 관리합니다</p>
            </div>
          </div>
        </div>

        {/* 프로필 설정 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary-light)]/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--neutral-800)]">프로필 설정</h2>
                <p className="text-sm text-[var(--neutral-500)]">기본 정보를 입력해주세요</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 border-2 border-[var(--neutral-200)] rounded-xl focus:border-[var(--primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* 출생년도 */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                출생년도
              </label>
              <input
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="예: 1950"
                min="1920"
                max="2010"
                className="w-full px-4 py-3 border-2 border-[var(--neutral-200)] rounded-xl focus:border-[var(--primary)] focus:outline-none transition-colors"
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                성별
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'male', label: '남성' },
                  { value: 'female', label: '여성' },
                  { value: 'other', label: '기타' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                      className="w-5 h-5 text-[var(--primary)] border-2 border-[var(--neutral-300)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-[var(--neutral-700)]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-sm font-medium text-[var(--neutral-700)] mb-2">
                거주 지역
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[var(--neutral-200)] rounded-xl focus:border-[var(--primary)] focus:outline-none transition-colors bg-white"
              >
                <option value="">지역을 선택하세요</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 관심사 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--info-light)] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--neutral-800)]">관심사</h2>
                <p className="text-sm text-[var(--neutral-500)]">좋아하는 활동을 선택해주세요</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--neutral-100)] text-[var(--neutral-600)] hover:bg-[var(--neutral-200)]'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="mb-8">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>

        {/* 데이터 관리 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--warning-light)] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--neutral-800)]">데이터 관리</h2>
                <p className="text-sm text-[var(--neutral-500)]">저장된 데이터를 관리합니다</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => handleReset('training')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--neutral-100)] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--neutral-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-[var(--neutral-700)]">훈련 기록 초기화</p>
                  <p className="text-sm text-[var(--neutral-500)]">훈련 진행 기록을 삭제합니다</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--neutral-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => handleReset('photos')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--neutral-100)] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--neutral-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-[var(--neutral-700)]">사진 데이터 초기화</p>
                  <p className="text-sm text-[var(--neutral-500)]">업로드한 사진 데이터를 삭제합니다</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--neutral-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => handleReset('all')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--danger-light)] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-[var(--danger)]">전체 초기화</p>
                  <p className="text-sm text-[var(--neutral-500)]">모든 데이터를 삭제하고 처음부터 시작합니다</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </CardContent>
        </Card>

        {/* 앱 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--neutral-100)] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--neutral-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--neutral-800)]">앱 정보</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[var(--neutral-100)]">
                <span className="text-[var(--neutral-500)]">앱 이름</span>
                <span className="font-medium text-[var(--neutral-700)]">Re:turn</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--neutral-100)]">
                <span className="text-[var(--neutral-500)]">버전</span>
                <span className="font-medium text-[var(--neutral-700)]">1.0.0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--neutral-500)]">개발팀</span>
                <span className="font-medium text-[var(--neutral-700)]">Re:turn Team</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 초기화 확인 모달 */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="데이터 초기화"
        size="sm"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[var(--danger-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[var(--neutral-700)]">
              {resetType === 'all'
                ? '모든 데이터가 삭제되며 복구할 수 없습니다.'
                : '선택한 데이터가 삭제되며 복구할 수 없습니다.'}
            </p>
            <p className="text-sm text-[var(--neutral-500)] mt-2">
              정말 초기화하시겠습니까?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowResetModal(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-[var(--danger)] hover:bg-red-600"
              onClick={confirmReset}
            >
              초기화
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
