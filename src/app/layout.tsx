import type { Metadata, Viewport } from 'next';
import Script from "next/script";
import Header from '@/components/layout/Header';
import StorageMigration from '@/components/layout/StorageMigration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Re:turn - AI 기반 회상치료 플랫폼',
  description:
    '멀티모달 AI를 활용한 치매 조기 진단 및 회상치료 훈련 플랫폼',
  keywords: ['치매', '회상치료', 'AI', '인지훈련', '경도인지장애', 'MCI'],
  authors: [{ name: 'Re:turn Team' }],
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
        {/* localStorage 마이그레이션 */}
        <StorageMigration />

        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t border-[var(--neutral-200)] py-4">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm text-[var(--neutral-500)]">
                Re:turn - AI 기반 회상치료 플랫폼
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
