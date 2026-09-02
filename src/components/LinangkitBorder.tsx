'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function LinangkitBorder({ variant }: { variant?: 'home' | 'entry' }) {
  const pathname = usePathname();
  const isEntry = variant === 'entry' || (pathname && pathname.startsWith('/kamus/'));

  const bgImage = isEntry ? "url('/assets/motif-2-cut.png')" : "url('/assets/Linangkit2.png')";

  return (
    <div
      className="linangkit-left-border"
      style={{ backgroundImage: bgImage }}
      aria-hidden="true"
    />
  );
}
