import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Website {
  id: number;
  name: string;
  url: string;
  username: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
}

export interface Article {
  id: number;
  originalTitle: string;
  spunTitle?: string | null;
  status: 'pending' | 'spinning' | 'ready' | 'publishing' | 'published' | 'failed';
  liveUrl?: string | null;
  websiteId?: number | null;
  publishedAt?: Date | null;
  createdAt: Date;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}
