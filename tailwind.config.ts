// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Montserrat → 한글 폴백
        mont: [
          'var(--font-montserrat)',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
