import type { Metadata } from 'next';
import { Libre_Baskerville, Work_Sans } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import LinangkitBorder from '@/components/LinangkitBorder';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kamus Bajau Sama — Pangkalan Data & Warisan Leksikal Terbuka',
  description:
    'Sebuah kamus digital terbuka dan inisiatif pemeliharaan bahasa Bajau Samah. Cari maksud perkataan, sebutan, morfologi imbuhan, dan variasi dialek.',
  keywords: [
    'Kamus Bajau Sama',
    'Bajau Samah',
    'Bahasa Bajau',
    'Kamus Bajau Melayu',
    'Sabah Language',
    'Kota Belud',
    'Tuaran',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms" className={`${libreBaskerville.variable} ${workSans.variable}`}>
      <body className="font-body bg-background text-text-main min-h-screen relative antialiased selection:bg-slate-900 selection:text-white">
        <LanguageProvider>
          <LinangkitBorder />
          <div className="flex-1 flex flex-col pl-[calc(var(--linangkit-width)+18px)] md:pl-[calc(var(--linangkit-width)+40px)] pr-4 md:pr-12 pt-7 md:pt-9 pb-12 max-w-[1440px] mx-auto w-full min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
