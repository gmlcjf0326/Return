import type { Metadata, Viewport } from 'next';
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
  maximumScale: 2,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Nanum Gothic Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet" />
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
