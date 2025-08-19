import { Noto_Sans_KR } from 'next/font/google';
import { Montserrat } from 'next/font/google';

export const noto = Noto_Sans_KR({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'], // Dev Mode에 나온 웨이트만 남기세요
  variable: '--font-sans',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});
