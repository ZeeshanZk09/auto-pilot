'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, FileSpreadsheet, Upload as UploadIcon } from 'lucide-react';

export default function UploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProcessStatus('success');
      toast.success('File processed and entries created!');
    } catch (error) {
      console.error('Processing error:', error);
      setProcessStatus('error');
      toast.error('Failed to process Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Upload Excel</h2>
        <p className='text-muted-foreground'>Upload your articles in bulk using an Excel file.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='flex flex-col'>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>
              Support .xlsx and .csv formats. Required columns: Title, Content, Keywords, Website.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex-1 flex flex-col justify-center'>
            <div className='relative group'>
              <input
                type='file'
                accept='.xlsx,.csv'
                onChange={handleFileChange}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                disabled={isProcessing}
              />
              <div className='flex flex-col items-center justify-center border-dashed border-2 hover:bg-muted transition-colors rounded-xl p-8 py-12'>
                <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
                  <UploadIcon className='text-primary' />
                </div>
                <p className='text-sm font-medium'>
                  {isProcessing ? 'Processing...' : 'Click or drag to upload Excel file'}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>Max file size: 4MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guidelines</CardTitle>
            <CardDescription>Follow these rules for successful processing.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex gap-3 items-start'>
              <div className='bg-blue-100 p-2 rounded text-blue-600'>
                <FileSpreadsheet size={16} />
              </div>
              <div className='text-sm'>
                <p className='font-semibold'>Format Requirements</p>
                <p className='text-muted-foreground'>
                  First row must be headers: Title, Content, Keywords, Website (URL or Name).
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start'>
              <div className='bg-amber-100 p-2 rounded text-amber-600'>
                <AlertCircle size={16} />
              </div>
              <div className='text-sm'>
                <p className='font-semibold'>Website Match</p>
                <p className='text-muted-foreground'>
                  Ensure the website name matches an existing entry in your Websites manager.
                </p>
              </div>
            </div>
            {isProcessing && (
              <div className='mt-8 space-y-2 animate-pulse'>
                <div className='flex justify-between text-sm'>
                  <span>Processing file...</span>
                  <span>70%</span>
                </div>
                <Progress value={70} />
              </div>
            )}
            {processStatus === 'success' && (
              <div className='mt-8 p-4 bg-green-50 text-green-700 rounded-lg flex gap-3 items-center'>
                <CheckCircle2 size={20} />
                <span className='text-sm font-medium'>
                  Batch processed successfully! You can view the articles in the Articles tab.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
