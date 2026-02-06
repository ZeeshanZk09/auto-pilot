import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard-sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className='flex h-screen bg-background text-foreground'>
      <Sidebar />

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto p-4 lg:p-8'>
        <div className='max-w-6xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}
