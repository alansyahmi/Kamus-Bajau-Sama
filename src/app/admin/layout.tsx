import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengurusan Pangkalan Data — Kamus Bajau Samah',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
