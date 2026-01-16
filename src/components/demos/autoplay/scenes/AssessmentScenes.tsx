'use client';

interface SceneProps {
  screenType?: string;
}

// 진단 시작 화면 - 실제 앱 스타일
function AssessmentStartScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[var(--background)]">
      {/* 아이콘 - 실제 앱 스타일 */}
      <div className="w-20 h-20 bg-[var(--primary-lighter)] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <svg
          className="w-10 h-10 text-[var(--primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>

      {/* 제목 - 실제 앱 스타일 */}
      <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-2">인지 진단 시작</h3>
      <p className="text-[var(--neutral-600)] text-center text-sm mb-8">
        6개 인지 영역을 종합적으로 평가합니다
        <br />
        약 10-15분 소요됩니다
      </p>

      {/* 태그들 - StatusBadge 스타일 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {['기억력', '주의력', '언어력', '계산력', '실행기능', '시공간력'].map(
          (area) => (
            <span
              key={area}
              className="px-3 py-1.5 bg-[var(--primary-lighter)] text-[var(--primary-deep)] rounded-full text-xs font-medium"
            >
              {area}
            </span>
          )
        )}
      </div>

      {/* 버튼 - 실제 앱 Button 스타일 (min-h-[64px]) */}
      <div className="min-h-[64px] px-8 flex items-center justify-center bg-[var(--primary)] hover:bg-[var(--primary-deep)] rounded-xl text-white text-xl font-medium shadow-sm transition-all duration-200">
        시작하기
      </div>
    </div>
  );
}

// 카메라 권한 요청 화면 - 실제 앱 스타일
function CameraPermissionScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[var(--background)]">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-2">카메라 접근 권한</h3>
      <p className="text-[var(--neutral-600)] text-center text-sm mb-6">
        표정과 시선을 분석하여
        <br />더 정확한 진단 결과를 제공합니다
      </p>
      <div className="flex gap-3">
        <div className="px-6 py-2 bg-[var(--neutral-100)] hover:bg-[var(--neutral-200)] rounded-lg text-[var(--neutral-600)] text-sm font-medium transition-colors">
          나중에
        </div>
        <div className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors shadow-sm">
          허용
        </div>
      </div>
    </div>
  );
}

// 기억력 질문 화면 - 실제 앱 스타일
function MemoryQuestionScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      {/* 카테고리 배지 - 실제 앱 스타일 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary-lighter)] flex items-center justify-center text-2xl shadow-sm">
          🧠
        </div>
        <div>
          <span className="text-lg font-semibold text-[var(--neutral-800)]">기억력</span>
          <p className="text-sm text-[var(--neutral-500)]">단어 기억하기</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4">
        다음 단어들을 기억해주세요
      </h3>

      <div className="flex flex-wrap gap-3 mb-8">
        {['사과', '자동차', '시계', '나무', '연필'].map((word, idx) => (
          <div
            key={word}
            className="px-4 py-2 bg-purple-100 rounded-lg text-purple-700 font-medium border border-purple-200 shadow-sm"
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            {word}
          </div>
        ))}
      </div>

      <p className="text-[var(--neutral-500)] text-sm mb-6">
        위 단어들을 잘 기억해두세요. 잠시 후 다시 물어볼게요.
      </p>

      {/* 옵션 버튼 - 실제 AnswerInput 스타일 */}
      <div className="flex justify-center gap-4 mt-auto">
        {['기억했어요', '다시 보기'].map((opt, idx) => (
          <button
            key={opt}
            className={`min-h-[56px] px-6 py-3 rounded-xl text-base font-medium transition-all ${
              idx === 0
                ? 'bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white shadow-sm'
                : 'border-2 border-[var(--neutral-200)] bg-white hover:border-[var(--primary-light)] hover:bg-[var(--neutral-50)] text-[var(--neutral-600)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// 계산력 질문 화면 - 실제 앱 스타일
function CalculationQuestionScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      {/* 카테고리 배지 - 실제 앱 스타일 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl shadow-sm">
          🔢
        </div>
        <div>
          <span className="text-lg font-semibold text-[var(--neutral-800)]">계산력</span>
          <p className="text-sm text-[var(--neutral-500)]">연속 뺄셈</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-6">
        다음 계산의 답을 입력해주세요
      </h3>

      <div className="text-center my-8">
        <div className="text-4xl font-bold text-[var(--neutral-800)] mb-4">93 - 7 = ?</div>
        <p className="text-[var(--neutral-500)] text-sm">100에서 7씩 빼기</p>
      </div>

      {/* 입력 필드 - 실제 앱 스타일 (ring 효과) */}
      <div className="flex justify-center">
        <div className="w-40 h-[64px] px-6 text-xl border-2 border-[var(--primary)] rounded-xl bg-white flex items-center justify-center ring-2 ring-[var(--primary-lighter)] shadow-sm">
          <span className="text-2xl font-bold text-[var(--neutral-800)]">86</span>
        </div>
      </div>

      <div className="flex justify-center mt-auto">
        <button className="min-h-[56px] px-8 bg-[var(--primary)] hover:bg-[var(--primary-deep)] rounded-xl text-white text-lg font-medium transition-all shadow-sm">
          확인
        </button>
      </div>
    </div>
  );
}

// 언어력 질문 화면 - 실제 앱 스타일
function LanguageQuestionScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <span className="text-amber-600 font-bold text-sm">3</span>
        </div>
        <span className="text-[var(--neutral-500)] text-sm">언어력 테스트</span>
      </div>

      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-6">
        다음과 비슷한 의미의 단어를 고르세요
      </h3>

      <div className="text-center my-4">
        <div className="text-3xl font-bold text-amber-600">&quot;기쁨&quot;</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {['슬픔', '행복', '분노', '두려움'].map((word, idx) => (
          <div
            key={word}
            className={`p-4 rounded-xl text-center font-medium transition-colors ${
              idx === 1
                ? 'bg-amber-100 text-amber-700 border-2 border-amber-400'
                : 'bg-white text-[var(--neutral-600)] border border-[var(--neutral-200)] hover:border-[var(--neutral-300)]'
            }`}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}

// 분석 중 화면 - 실제 앱 스타일
function AnalyzingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-[var(--background)]">
      <div className="w-20 h-20 relative mb-8">
        <div className="absolute inset-0 border-4 border-[var(--neutral-200)] rounded-full" />
        <div className="absolute inset-0 border-4 border-t-[var(--primary)] rounded-full animate-spin" />
        <div className="absolute inset-3 bg-[var(--primary-lighter)] rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--primary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-bold text-[var(--neutral-800)] mb-2">분석 중...</h3>
      <p className="text-[var(--neutral-600)] text-center text-sm">
        AI가 응답을 분석하고 있습니다
        <br />
        잠시만 기다려주세요
      </p>
    </div>
  );
}

// 결과 화면 - 실제 앱 스타일
function ResultScreen() {
  // 점수 기반 색상 규칙
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200 text-green-700';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    if (score >= 55) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-red-50 border-red-200 text-red-700';
  };

  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4 text-center">
        진단 결과
      </h3>

      {/* 점수 카드 - 실제 앱 elevated 스타일 */}
      <div className="flex items-center justify-center my-4">
        <div className="shadow-lg border border-[var(--neutral-100)] rounded-2xl p-6 bg-white">
          <div className="flex items-baseline justify-center gap-1">
            <div className="text-5xl font-bold text-[var(--primary)]">85</div>
            <div className="text-xl text-[var(--neutral-400)]">/100</div>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <span className="px-4 py-1.5 bg-emerald-100 rounded-full text-emerald-700 text-sm font-semibold">
          양호
        </span>
      </div>

      {/* 카테고리별 점수 - 점수 기반 색상 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '기억력', score: 82 },
          { label: '계산력', score: 90 },
          { label: '언어력', score: 88 },
          { label: '주의력', score: 85 },
          { label: '실행기능', score: 68 },
          { label: '시공간력', score: 87 },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl p-3 text-center border shadow-sm ${getScoreColorClass(item.score)}`}
          >
            <div className="text-lg font-bold">{item.score}</div>
            <div className="text-xs opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 히스토리 화면 - 실제 앱 스타일 (Card 스타일)
function HistoryScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4">진단 이력</h3>

      <div className="space-y-3">
        {[
          { date: '2025.01.15', score: 85, change: '+3' },
          { date: '2025.01.08', score: 82, change: '+2' },
          { date: '2025.01.01', score: 80, change: '' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white rounded-xl p-4 border border-[var(--neutral-200)] shadow-sm"
          >
            <span className="text-[var(--neutral-600)] text-sm">{item.date}</span>
            <div className="flex items-center gap-2">
              <span className="text-[var(--neutral-800)] font-bold">{item.score}점</span>
              {item.change && (
                <span className="text-emerald-600 text-xs font-medium bg-emerald-100 px-2 py-0.5 rounded-full">{item.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <p className="text-[var(--neutral-400)] text-xs text-center">
          정기적인 진단으로 인지 변화를 추적하세요
        </p>
      </div>
    </div>
  );
}

// 메인 씬 렌더러
export function AssessmentScene({ screenType }: SceneProps) {
  switch (screenType) {
    case 'assessment-start':
      return <AssessmentStartScreen />;
    case 'camera-permission':
      return <CameraPermissionScreen />;
    case 'memory-question':
      return <MemoryQuestionScreen />;
    case 'calculation-question':
      return <CalculationQuestionScreen />;
    case 'language-question':
      return <LanguageQuestionScreen />;
    case 'analyzing':
      return <AnalyzingScreen />;
    case 'result':
      return <ResultScreen />;
    case 'history':
      return <HistoryScreen />;
    default:
      return null;
  }
}
