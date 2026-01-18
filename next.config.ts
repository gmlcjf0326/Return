import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 비활성화 (MediaPipe 호환성 문제)
  // Webpack을 사용하여 MediaPipe 모듈 스텁 처리

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      // TODO: [REAL_DATA] 더미 이미지용 Picsum Photos - 실제 데이터 전환 시 제거 가능
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },

  // 실험적 기능
  experimental: {
    // 서버 액션 활성화
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Turbopack 설정 (빈 설정 - webpack 사용 명시)
  turbopack: {},

  // 환경 변수 (클라이언트에 노출할 변수)
  env: {
    NEXT_PUBLIC_APP_NAME: 'Re:turn',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack 설정 - MediaPipe 모듈 스텁 처리
  webpack: (config, { isServer }) => {
    // MediaPipe 모듈을 빈 모듈로 대체 (TensorFlow.js 백엔드 사용 시 불필요)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mediapipe/face_mesh': false,
      '@mediapipe/pose': false,
    };

    // 클라이언트 빌드에서 fs 모듈 제외
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
