'use client';

import type { ThumbnailInfo } from '@/lib/youtube-utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface ThumbnailCardProps {
  thumbnail: ThumbnailInfo;
  videoId: string;
}

export function ThumbnailCard({ thumbnail, videoId }: ThumbnailCardProps) {
  const handleDownload = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      // Fetch the image as a blob
      const response = await fetch(thumbnail.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${videoId}-${thumbnail.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if blob download fails
      window.open(thumbnail.url, '_blank');
    }
  };


  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{thumbnail.label}</CardTitle>
        <CardDescription>{thumbnail.resolution}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 aspect-video relative">
        <Image
          src={thumbnail.url}
          alt={`${thumbnail.label} thumbnail for video ${videoId}`}
          width={thumbnail.width}
          height={thumbnail.height}
          className="object-cover w-full h-full"
          data-ai-hint="youtube thumbnail"
          unoptimized // YouTube images are already optimized
          onError={(e) => {
            // Handle broken images - you could set a placeholder or hide it
            (e.target as HTMLImageElement).src = `https://placehold.co/${thumbnail.width}x${thumbnail.height}.png?text=Not+Available`;
          }}
        />
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90">
          <a
            href={thumbnail.url}
            onClick={handleDownload}
            target="_blank" // Fallback for browsers that don't support download attribute well or if JS fails
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
