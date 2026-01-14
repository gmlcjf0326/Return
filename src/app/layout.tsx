import type { Metadata, Viewport } from 'next';
import Script from "next/script";
import './globals.css';

export const metadata: Metadata = {
  title: 'ReMemory - AI 기반 회상치료 플랫폼',
  description:
    '멀티모달 AI를 활용한 치매 조기 진단 및 회상치료 훈련 플랫폼',
  keywords: ['치매', '회상치료', 'AI', '인지훈련', '경도인지장애', 'MCI'],
  authors: [{ name: 'ReMemory Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"
            strategy="lazyOnload"
          />
        )}
        {/* Pretendard Font */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased min-h-screen">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white border-b border-[var(--neutral-200)] shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div>
                  <h1 className="text-lg font-bold text-[var(--neutral-800)]">
                    ReMemory
                  </h1>
                  <p className="text-xs text-[var(--neutral-500)]">
                    AI 기반 회상치료 플랫폼
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-[var(--neutral-100)] rounded-lg transition-colors">
                  <svg
                    className="w-6 h-6 text-[var(--neutral-600)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t border-[var(--neutral-200)] py-4">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm text-[var(--neutral-500)]">
                ReMemory - AI 기반 회상치료 플랫폼
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
