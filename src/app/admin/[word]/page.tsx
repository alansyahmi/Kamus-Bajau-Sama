import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const runtime = 'edge';

interface AdminWordPageProps {
  params: {
    word: string;
  };
}

export default function AdminWordPage({ params }: AdminWordPageProps) {
  const initialWord = decodeURIComponent(params.word || '').trim();
  return <AdminDashboard initialWord={initialWord} />;
}
