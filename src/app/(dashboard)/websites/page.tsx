'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Website } from '@/types';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
  });

  const fetchWebsites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/websites');
      setWebsites(response.data);
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      toast.error('Failed to fetch websites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/websites', formData);
      toast.success('Website added successfully');
      setIsAddDialogOpen(false);
      setFormData({ name: '', url: '', username: '', password: '' });
      fetchWebsites();
    } catch (error) {
      console.error('Failed to add website:', error);
      toast.error('Failed to add website');
    }
  };

  const handleDeleteWebsite = async (id: number) => {
    if (!confirm('Are you sure you want to delete this website?')) return;
    try {
      await axios.delete(`/api/websites/${id}`);
      toast.success('Website deleted');
      fetchWebsites();
    } catch (error) {
      console.error('Failed to delete website:', error);
      toast.error('Failed to delete website');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Websites</h2>
          <p className='text-muted-foreground'>Manage your WordPress PBN network.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus size={16} /> Add Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddWebsite}>
              <DialogHeader>
                <DialogTitle>Add WordPress Website</DialogTitle>
                <DialogDescription>
                  Enter the WordPress site details and REST API credentials.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Site Name</Label>
                  <Input
                    id='name'
                    placeholder='My Blog'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='url'>WordPress URL</Label>
                  <Input
                    id='url'
                    placeholder='https://example.com'
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    placeholder='admin'
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='password'>Application Password</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='**** **** **** ****'
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <p className='text-xs text-muted-foreground'>
                    Use a WordPress Application Password for better security.
                  </p>
                </div>
              </div>
              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={async () => {
                    if (!formData.url || !formData.username || !formData.password) {
                      toast.error('Fill in URL, Username, and Password first');
                      return;
                    }
                    toast.promise(axios.post('/api/websites/test', formData), {
                      loading: 'Testing connection...',
                      success: () => 'Connection successful!',
                      error: (err) => err.response?.data || 'Connection failed',
                    });
                  }}
                >
                  Test Connection
                </Button>
                <Button type='submit'>Save Website</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className='rounded-md border bg-card'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8'>
                  <RefreshCw className='animate-spin inline mr-2 text-muted-foreground' size={20} />
                  Loading websites...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && websites.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                  No websites found. Add your first site to get started.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              websites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className='font-medium'>{site.name}</TableCell>
                  <TableCell>{site.url}</TableCell>
                  <TableCell>{site.username}</TableCell>
                  <TableCell>
                    <Badge
                      variant={site.status === 'active' ? 'default' : 'destructive'}
                      className='gap-1'
                    >
                      {site.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteWebsite(site.id)}
                      className='text-destructive hover:text-destructive hover:bg-destructive/10'
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
