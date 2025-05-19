'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Youtube, Lightbulb, AlertCircle, ExternalLink } from 'lucide-react';
import { extractVideoId, generateThumbnailUrls, type ThumbnailInfo } from '@/lib/youtube-utils';
import { ThumbnailCard } from './ThumbnailCard';
import type { SuggestBestThumbnailOutput } from '@/ai/flows/suggest-thumbnail';
import { suggestBestThumbnail } from '@/ai/flows/suggest-thumbnail'; // Ensure this path is correct
import { useToast } from "@/hooks/use-toast";


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
  const [suggestedThumbnail, setSuggestedThumbnail] = useState<SuggestBestThumbnailOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setThumbnails([]);
    setSuggestedThumbnail(null);
    setVideoId(null);

    const extractedId = extractVideoId(videoUrl);

    if (!extractedId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Invalid YouTube URL provided.",
        variant: "destructive",
      });
      return;
    }
    
    setVideoId(extractedId);
    const generatedThumbnails = generateThumbnailUrls(extractedId);
    setThumbnails(generatedThumbnails);

    // AI Suggestion
    try {
      const thumbnailUrlList = generatedThumbnails.map(t => t.url);
      if (thumbnailUrlList.length > 0) {
        const suggestion = await suggestBestThumbnail({ thumbnailUrls: thumbnailUrlList });
        setSuggestedThumbnail(suggestion);
      }
    } catch (aiError) {
      console.error('AI suggestion failed:', aiError);
      setError('Thumbnails loaded, but AI suggestion failed. You can still download thumbnails.');
      toast({
        title: "AI Suggestion Error",
        description: "Could not get AI thumbnail suggestion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSuggested = async (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status} ${response.statusText}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${videoId}-ai-suggested.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
      toast({
        title: "Download Error",
        description: "Could not download image directly. Opening in new tab.",
        variant: "destructive",
      });
    }
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

      {error && !isLoading && (
         <Alert variant="destructive" className="mb-8 animate-shake">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestedThumbnail && videoId && (
        <Card className="mb-12 bg-card border-primary shadow-2xl animate-fadeIn" data-ai-hint="suggestion card">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-primary" />
              <CardTitle className="text-2xl font-semibold text-primary">AI Thumbnail Suggestion</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground pt-1">Our AI thinks this is the best thumbnail for your video:</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 items-center p-6">
            <div className="aspect-video relative rounded-lg overflow-hidden shadow-md">
              <Image
                src={suggestedThumbnail.bestThumbnailUrl}
                alt="AI suggested best thumbnail"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-300"
                data-ai-hint="ai suggestion"
                unoptimized
                 onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/640x360.png`;
                }}
              />
            </div>
            <div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">{suggestedThumbnail.reason}</p>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                <a 
                  href={suggestedThumbnail.bestThumbnailUrl} 
                  onClick={(e) => handleDownloadSuggested(e, suggestedThumbnail.bestThumbnailUrl)}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Suggested
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
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
        <p>&copy; {new Date().getFullYear()} Thumbzilla. All rights reserved.</p>
        <p className="mt-1">
          View YouTube video: {videoId && <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"><ExternalLink className="inline h-4 w-4 ml-1"/> Link</a>}
        </p>
      </footer>
    </div>
  );
}
