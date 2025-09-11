import type { NextConfig } from 'next';

const s3Host = process.env.S3_PUBLIC_BASE
  ? /^https?:\/\//.test(process.env.S3_PUBLIC_BASE!)
    ? new URL(process.env.S3_PUBLIC_BASE!).hostname
    : undefined
  : process.env.S3_BUCKET_NAME && process.env.AWS_REGION
    ? `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
    : undefined;

const remotePatterns = [
  ...(s3Host ? [{ protocol: 'https' as const, hostname: s3Host }] : []),
  ...(process.env.CDN_DOMAIN
    ? [{ protocol: 'https' as const, hostname: process.env.CDN_DOMAIN }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'sequelize',
    'mysql2',
    'sequelize-typescript',
    'pg',
    'pg-hstore',
    'nodemailer',
  ],
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'sequelize', 'nodemailer'],
    //typedRoutes: true,
    // ⬇️ Sequelize와 mysql2는 서버 컴포넌트 외부 패키지로 처리(번들 축소/충돌 방지)
  },
  images: {
    remotePatterns,
    // CloudFront로 전환 시 여기에 CDN 도메인 추가
    // { protocol: 'https', hostname: 'dxxxx.cloudfront.net' },
  },
  eslint: {
    // keep build failing when ESLint errors exist
    ignoreDuringBuilds: false,
  },
  typescript: {
    // keep build failing when TS errors exist
    ignoreBuildErrors: false,
  },
  compiler: { styledComponents: true },

  // pg / pg-hstore는 선택적 의존성이라 서버 번들에서 제외
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
