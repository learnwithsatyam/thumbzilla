'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Youtube, Lightbulb, AlertCircle, ExternalLink } from 'lucide-react';
import { extractVideoId, generateThumbnailUrls, type ThumbnailInfo } from '@/lib/youtube-utils';
import { ThumbnailCard } from '@/components/features/thumbzilla/ThumbnailCard';
import { useToast } from "@/hooks/use-toast";
import AdSenseBlock from '@/components/ads/AdSenseBlock';


const AppLogo = () => (
  <div className="flex items-center justify-center my-8 animate-fadeIn">
    <Youtube className="h-10 w-10 md:h-12 md:w-12 text-primary" />
    <h1 className="ml-3 md:ml-4 text-3xl md:text-4xl font-bold text-foreground">Thumbzilla</h1>
  </div>
);


export function ThumbnailDownloaderClient() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<ThumbnailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // IMPORTANT: Replace these with your actual AdSense details
  const AD_CLIENT_ID = "ca-pub-YOUR_PUBLISHER_ID"; 
  const AD_SLOT_ID_TOP = "YOUR_AD_SLOT_ID_1";
  const AD_SLOT_ID_MIDDLE = "YOUR_AD_SLOT_ID_2";
  const AD_SLOT_ID_FOOTER = "YOUR_AD_SLOT_ID_3";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setThumbnails([]);
    setVideoId(null);

    const extractedId = extractVideoId(videoUrl);

    if (!extractedId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      toast({
        title: "Error",
        description: "Invalid YouTube URL provided.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(false); // Moved loading state update here
    
    setVideoId(extractedId);
    const generatedThumbnails = generateThumbnailUrls(extractedId);
    setThumbnails(generatedThumbnails);

    const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status} ${response.statusText}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: "Download Error",
        description: `Could not download image directly. Opening in new tab. Error: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
      window.open(url, '_blank');
    }
  };
  };




  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <AppLogo />

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 animate-slideUp">
        <Input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
          className="text-base"
          aria-label="YouTube video URL"
          required
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Thumbnails...
            </>
          ) : (
            'Get Thumbnails'
          )}
        </Button>
      </form>

      <div className="my-6 md:my-8">
        <AdSenseBlock adClient={AD_CLIENT_ID} adSlot={AD_SLOT_ID_TOP} placeholderHeight="100px" />
      </div>


      {thumbnails.length > 0 && videoId && (
         <div className="my-6 md:my-8">
            <AdSenseBlock adClient={AD_CLIENT_ID} adSlot={AD_SLOT_ID_MIDDLE} adFormat="fluid" placeholderHeight="120px" />
         </div>
      )}


      {thumbnails.length > 0 && videoId && (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-foreground animate-fadeIn">Available Thumbnails</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {thumbnails.map((thumb) => (
              <ThumbnailCard key={thumb.id} thumbnail={thumb} videoId={videoId} />
            ))}
          </div>
        </>
      )}
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <div className="my-6 md:my-8">
            <AdSenseBlock adClient={AD_CLIENT_ID} adSlot={AD_SLOT_ID_FOOTER} placeholderHeight="90px" />
        </div>
        <p>&copy; {new Date().getFullYear()} Thumbzilla. All rights reserved.</p>
        <p className="mt-1">
          View YouTube video: {videoId && <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><ExternalLink className="inline h-4 w-4 ml-1"/> Link</a>}
        </p>
      </footer>
    </div>
  );
}
