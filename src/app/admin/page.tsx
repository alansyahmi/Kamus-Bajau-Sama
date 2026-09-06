import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

interface AdminPageProps {
  searchParams?: {
    entry?: string;
    word?: string;
    q?: string;
  };
}

export default function AdminPage({ searchParams }: AdminPageProps) {
  return <AdminDashboard searchParams={searchParams} />;
}
