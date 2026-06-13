import './globals.css';
import { Inter } from 'next/font/google';

import Alert from '@/components/Alert';
import Provider from '@/provider';

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-google-sans',
});

export const metadata = {
  description: '별도 로그인 없이 링크 하나로 참여하는 WebRTC 기반 화상 회의 서비스',
  title: 'MeetProject',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang='ko'>
      <body className='relative flex h-svh w-svw'>
        <Alert />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
