// src/components/ads/AdSenseBlock.tsx
'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AdSenseBlockProps {
  className?: string;
  style?: React.CSSProperties;
  adClient: string; // e.g., "ca-pub-YOUR_PUBLISHER_ID"
  adSlot: string;   // e.g., "YOUR_AD_SLOT_ID"
  adFormat?: string; // e.g., "auto", "rectangle", "vertical", "horizontal"
  responsive?: boolean;
  placeholderHeight?: string | number;
}

export function AdSenseBlock({
  className,
  style,
  adClient,
  adSlot,
  adFormat = 'auto',
  responsive = true,
  placeholderHeight = '90px',
}: AdSenseBlockProps) {
  useEffect(() => {
    // This effect attempts to initialize ads if the AdSense script is loaded.
    // AdSense usually handles this automatically when it finds <ins> tags.
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, [adClient, adSlot, adFormat]); // Re-run if key ad props change

  if (!adClient || !adSlot || adClient === "ca-pub-YOUR_PUBLISHER_ID" || adSlot.startsWith("YOUR_AD_SLOT_ID")) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted border border-dashed border-border text-muted-foreground rounded-md',
          className
        )}
        style={{ minHeight: placeholderHeight, ...style }}
        data-ai-hint="ad placeholder"
      >
        <p className="text-sm p-4 text-center">
          Advertisement Placeholder <br /> (Configure with your AdSense Client & Slot ID)
        </p>
      </div>
    );
  }

  // This is the structure Google AdSense expects.
  // Ensure the AdSense script is loaded in your <head> (see layout.tsx).
  return (
    <div className={cn("flex justify-center items-center w-full", className)} style={{minHeight: placeholderHeight, ...style}} data-ai-hint="advertisement area">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%'}}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

export default AdSenseBlock;
