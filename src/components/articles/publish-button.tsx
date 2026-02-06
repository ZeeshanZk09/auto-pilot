'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function PublishButton({ articleId }: { readonly articleId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/articles/publish', { articleId });
      if (response.data.success) {
        toast.success('Article spun and published successfully!');
        router.refresh();
      } else {
        toast.error(response.data.error || 'Failed to publish');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: string }; message: string };
      toast.error(err.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size='sm'
      variant='outline'
      className='gap-2'
      onClick={handlePublish}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className='h-3 w-3 animate-spin' />
          Spinning...
        </>
      ) : (
        <>
          <Play className='h-3 w-3' />
          Spin & Publish
        </>
      )}
    </Button>
  );
}
