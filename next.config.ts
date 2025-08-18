import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    //typedRoutes: true,
    // ⬇️ Sequelize와 mysql2는 서버 컴포넌트 외부 패키지로 처리(번들 축소/충돌 방지)
    serverComponentsExternalPackages: [
      'sequelize',
      'mysql2',
      'sequelize-typescript',
      'pg',
      'pg-hstore',
    ],
  },
  images: {
    remotePatterns: [],
  },
  eslint: {
    // keep build failing when ESLint errors exist
    ignoreDuringBuilds: false,
  },
  typescript: {
    // keep build failing when TS errors exist
    ignoreBuildErrors: false,
  },

  // ⬇️ pg / pg-hstore는 선택적 의존성이라 서버 번들에서 제외
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 중복 push를 피하기 위해 간단 가드(옵션)
      const asAny = config.externals as any;
      if (Array.isArray(asAny)) {
        asAny.push('pg', 'pg-hstore');
      }
    }
    return config;
  },
};

export default nextConfig;
