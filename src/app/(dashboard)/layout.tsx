'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Globe,
  LogOut,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Upload Excel',
    href: '/upload',
    icon: Upload,
  },
  {
    title: 'Articles',
    href: '/articles',
    icon: FileText,
  },
  {
    title: 'Live Links',
    href: '/links',
    icon: CheckCircle2,
  },
  {
    title: 'Websites',
    href: '/websites',
    icon: Globe,
  },
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className='flex h-screen bg-background text-foreground'>
      {/* Mobile Sidebar Toggle */}
      <div className='lg:hidden absolute top-4 left-4 z-50'>
        <Button variant='outline' size='icon' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0',
          !isSidebarOpen && '-translate-x-full'
        )}
      >
        <div className='flex flex-col h-full p-4'>
          <div className='mb-8 px-2 flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <span className='text-primary-foreground font-bold'>AP</span>
            </div>
            <h1 className='text-xl font-bold tracking-tight'>AutoPilot</h1>
          </div>

          <nav className='flex-1 space-y-1'>
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            ))}
          </nav>

          <div className='mt-auto pt-4 border-t'>
            <Button
              variant='ghost'
              className='w-full justify-start gap-3 text-muted-foreground hover:text-destructive'
              onClick={() => signOut()}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-y-auto p-4 lg:p-8'>
        <div className='max-w-6xl mx-auto'>{children}</div>
      </main>
    </div>
  );
}
