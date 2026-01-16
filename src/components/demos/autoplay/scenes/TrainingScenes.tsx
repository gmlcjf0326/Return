'use client';

interface SceneProps {
  screenType?: string;
}

// 훈련 선택 화면 - 실제 앱 스타일
function TrainingSelectScreen() {
  const items = [
    { icon: '🎴', name: '기억력', desc: '카드 매칭', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { icon: '🔢', name: '계산력', desc: '암산 퍼즐', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { icon: '📖', name: '언어력', desc: '단어 퀴즈', bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { icon: '💬', name: '회상', desc: '추억 대화', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4">훈련 프로그램 선택</h3>

      {/* 모듈 카드 - 실제 앱 hover 스타일 */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-2xl border border-[var(--neutral-200)] shadow-sm p-4 cursor-pointer group hover:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 mb-3 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <h4 className={`${item.textColor} font-bold text-base`}>{item.name}</h4>
              <p className="text-[var(--neutral-500)] text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[var(--neutral-400)] text-xs text-center mt-4">
        원하는 훈련을 선택하세요
      </p>
    </div>
  );
}

// 기억력 게임 화면 - 실제 앱 스타일
function MemoryGameScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--neutral-800)]">카드 매칭</h3>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 text-sm font-medium bg-emerald-100 px-2 py-1 rounded-full">매칭: 0/6</span>
        </div>
      </div>

      {/* 게임 통계 카드 - 실제 앱 스타일 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">레벨</p>
          <p className="text-lg font-bold text-[var(--primary)]">1</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">시도</p>
          <p className="text-lg font-bold text-[var(--neutral-700)]">0</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">시간</p>
          <p className="text-lg font-bold text-[var(--neutral-700)]">0:00</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">점수</p>
          <p className="text-lg font-bold text-emerald-600">0</p>
        </div>
      </div>

      {/* 게임 카드 - 실제 앱 스타일 */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {Array.from({ length: 12 }).map((_, idx) => {
          const isFlipped = idx === 2 || idx === 7;
          return (
            <div
              key={idx}
              className={`rounded-xl flex items-center justify-center text-2xl transition-all ${
                isFlipped
                  ? 'bg-white shadow-lg border-2 border-green-400 bg-green-50'
                  : 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] shadow-lg border-2 border-[var(--primary-light)]'
              }`}
            >
              {isFlipped ? (
                <span className="text-3xl animate-bounce">🍎</span>
              ) : (
                <span className="text-white text-opacity-80 text-2xl">?</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <p className="text-[var(--neutral-500)] text-sm">같은 그림의 카드를 찾으세요</p>
      </div>
    </div>
  );
}

// 기억력 게임 플레이 화면 - 실제 앱 스타일
function MemoryGamePlayScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--neutral-800)]">카드 매칭</h3>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 text-sm font-medium bg-emerald-100 px-2 py-1 rounded-full">매칭: 2/6</span>
        </div>
      </div>

      {/* 게임 통계 카드 - 실제 앱 스타일 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">레벨</p>
          <p className="text-lg font-bold text-[var(--primary)]">1</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">시도</p>
          <p className="text-lg font-bold text-[var(--neutral-700)]">5</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">시간</p>
          <p className="text-lg font-bold text-[var(--neutral-700)]">0:23</p>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-2 text-center">
          <p className="text-xs text-[var(--neutral-500)]">점수</p>
          <p className="text-lg font-bold text-emerald-600">40</p>
        </div>
      </div>

      {/* 게임 카드 - 실제 앱 스타일 */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {Array.from({ length: 12 }).map((_, idx) => {
          const matched = [0, 5, 2, 7];
          const flipped = [3, 9];
          const isMatched = matched.includes(idx);
          const isFlipped = flipped.includes(idx);

          return (
            <div
              key={idx}
              className={`rounded-xl flex items-center justify-center text-2xl transition-all ${
                isMatched
                  ? 'bg-white shadow-lg border-2 border-green-400 bg-green-50 opacity-60'
                  : isFlipped
                  ? 'bg-white shadow-lg border-2 border-blue-400 bg-blue-50'
                  : 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] shadow-lg border-2 border-[var(--primary-light)]'
              }`}
            >
              {isMatched ? (
                <span className="text-3xl">{idx < 3 ? '🍎' : '🌸'}</span>
              ) : isFlipped ? (
                <span className="text-3xl">🚗</span>
              ) : (
                <span className="text-white text-opacity-80 text-2xl">?</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <p className="text-emerald-600 text-sm font-medium">잘하고 있어요!</p>
      </div>
    </div>
  );
}

// 계산력 게임 화면 - 실제 앱 스타일
function CalculationGameScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--neutral-800)]">암산 퍼즐</h3>
        <div className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">문제 3/10</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-[var(--neutral-800)] mb-6">24 + 18 = ?</div>

        {/* 숫자 버튼 - 실제 스타일 */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '←', '확인'].map(
            (key) => (
              <button
                key={key}
                className={`py-4 rounded-xl border-2 text-xl font-medium transition-all ${
                  key === '확인'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-sm'
                    : key === '←'
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
                    : 'border-[var(--neutral-200)] bg-white text-[var(--neutral-700)] hover:border-[var(--primary)] hover:bg-[var(--primary-lighter)]/30'
                }`}
              >
                {key}
              </button>
            )
          )}
        </div>
      </div>

      {/* 입력 디스플레이 - 실제 스타일 */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="px-4 py-2 bg-white border-2 border-[var(--neutral-200)] rounded-xl text-[var(--neutral-800)] font-bold text-xl shadow-sm">
          4
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-xl text-blue-700 font-bold text-xl border-2 border-blue-400 shadow-sm">
          2
        </div>
      </div>
    </div>
  );
}

// 언어력 게임 화면 - 실제 앱 스타일
function LanguageGameScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--neutral-800)]">단어 퀴즈</h3>
        <div className="text-purple-600 text-sm font-medium bg-purple-100 px-2 py-1 rounded-full">점수: 80</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-[var(--neutral-500)] text-sm mb-2">빈칸에 들어갈 단어는?</p>
        <div className="text-xl font-medium text-[var(--neutral-800)] mb-6 text-center">
          &quot;봄이 오면 꽃이 ___&quot;
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {['진다', '핀다', '운다', '난다'].map((word, idx) => (
            <div
              key={word}
              className={`py-3 rounded-xl text-center font-medium transition-colors ${
                idx === 1
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                  : 'bg-white text-[var(--neutral-600)] border border-[var(--neutral-200)] hover:border-[var(--neutral-300)]'
              }`}
            >
              {word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 회상 대화 화면 - 실제 앱 스타일
function ReminiscenceScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4">회상 대화</h3>

      <div className="flex-1 flex flex-col">
        {/* 가상 사진 영역 */}
        <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mb-4 border border-amber-200">
          <div className="text-4xl">📸</div>
        </div>

        {/* AI 질문 - 실제 채팅 스타일 */}
        <div className="bg-white rounded-xl p-3 mb-3 border border-[var(--neutral-200)] shadow-sm">
          <p className="text-[var(--neutral-700)] text-sm">
            이 사진은 어디서 찍으셨나요? 그때의 기억이 떠오르시나요?
          </p>
        </div>

        {/* 사용자 응답 - 실제 채팅 스타일 */}
        <div className="bg-amber-100 rounded-xl p-3 ml-8 border border-amber-200">
          <p className="text-amber-800 text-sm">
            이건 작년 가을에 가족들과 등산 갔을 때...
          </p>
        </div>
      </div>
    </div>
  );
}

// 회상 대화 채팅 화면 - 실제 앱 스타일
function ReminiscenceChatScreen() {
  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      <div className="p-4 border-b border-[var(--neutral-200)] bg-white">
        <h3 className="text-lg font-bold text-[var(--neutral-800)]">회상 대화</h3>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* AI 메시지 - 실제 ChatInterface 스타일 */}
        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--neutral-100)] text-[var(--neutral-800)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[var(--primary-lighter)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--neutral-500)]">AI 도우미</span>
          </div>
          <p className="text-sm">등산은 자주 가셨나요? 가장 기억에 남는 산은 어디인가요?</p>
        </div>

        {/* 사용자 메시지 */}
        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--primary)] text-white ml-auto">
          <p className="text-sm">북한산을 자주 갔어요. 정상에서 보는 서울 야경이 참 좋았죠.</p>
        </div>

        {/* AI 메시지 */}
        <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[var(--neutral-100)] text-[var(--neutral-800)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[var(--primary-lighter)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[var(--neutral-500)]">AI 도우미</span>
          </div>
          <p className="text-sm">북한산 정상에서의 풍경이 정말 아름다웠겠네요. 누구와 함께 가셨나요?</p>
        </div>
      </div>

      {/* 입력 영역 - 실제 앱 스타일 */}
      <div className="border-t border-[var(--neutral-200)] p-4 bg-white">
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 border border-[var(--neutral-200)] rounded-xl text-[var(--neutral-400)] text-sm bg-white">
            메시지를 입력하세요...
          </div>
          <button className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-xl flex items-center justify-center transition-colors shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 그림일기 결과 화면 - 실제 앱 스타일
function DiaryResultScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4">오늘의 그림일기</h3>

      <div className="flex-1 flex flex-col items-center">
        {/* 가상 그림일기 이미지 */}
        <div className="w-full h-40 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 border border-sky-200">
          <div className="text-center">
            <div className="text-4xl mb-2">🏔️</div>
            <p className="text-[var(--neutral-500)] text-xs">AI 생성 이미지</p>
          </div>
        </div>

        {/* 일기 내용 - Card 스타일 */}
        <div className="w-full bg-white rounded-xl p-4 border border-[var(--neutral-200)] shadow-sm">
          <p className="text-[var(--neutral-700)] text-sm leading-relaxed">
            오늘은 가족들과 함께 갔던 북한산 등산을 떠올렸습니다. 정상에서 바라본
            서울의 야경이 참 아름다웠던 기억이 생생합니다...
          </p>
          <div className="mt-3 text-right text-[var(--neutral-400)] text-xs">
            2025년 1월 15일
          </div>
        </div>
      </div>
    </div>
  );
}

// 훈련 결과 화면 - 실제 앱 스타일
function TrainingResultScreen() {
  return (
    <div className="flex flex-col h-full p-6 bg-[var(--background)]">
      <h3 className="text-lg font-bold text-[var(--neutral-800)] mb-4 text-center">
        오늘의 훈련 결과
      </h3>

      <div className="flex items-center justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">A+</div>
            <div className="text-xs text-emerald-500">등급</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {[
          { name: '기억력 훈련', score: 95, time: '5분', color: 'purple' },
          { name: '계산력 훈련', score: 88, time: '4분', color: 'blue' },
          { name: '언어력 훈련', score: 92, time: '3분', color: 'green' },
          { name: '회상 대화', score: 100, time: '8분', color: 'amber' },
        ].map((item) => {
          const colorClasses: Record<string, string> = {
            purple: 'text-purple-600',
            blue: 'text-blue-600',
            green: 'text-green-600',
            amber: 'text-amber-600',
          };
          return (
            <div
              key={item.name}
              className="flex items-center justify-between bg-white rounded-xl p-3 border border-[var(--neutral-200)] shadow-sm"
            >
              <span className="text-[var(--neutral-700)] text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[var(--neutral-400)] text-xs">{item.time}</span>
                <span className={`font-bold ${colorClasses[item.color]}`}>{item.score}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto text-center">
        <p className="text-emerald-600 text-sm font-medium">오늘도 수고하셨습니다!</p>
      </div>
    </div>
  );
}

// 메인 씬 렌더러
export function TrainingScene({ screenType }: SceneProps) {
  switch (screenType) {
    case 'training-select':
      return <TrainingSelectScreen />;
    case 'memory-game':
      return <MemoryGameScreen />;
    case 'memory-game-play':
      return <MemoryGamePlayScreen />;
    case 'calculation-game':
      return <CalculationGameScreen />;
    case 'language-game':
      return <LanguageGameScreen />;
    case 'reminiscence':
      return <ReminiscenceScreen />;
    case 'reminiscence-chat':
      return <ReminiscenceChatScreen />;
    case 'diary-result':
      return <DiaryResultScreen />;
    case 'training-result':
      return <TrainingResultScreen />;
    default:
      return null;
  }
}
