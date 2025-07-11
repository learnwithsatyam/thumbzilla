import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script'; // Import Script

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Thumbzilla - YouTube Thumbnail Downloader',
  description: 'Download YouTube video thumbnails in various resolutions and get AI suggestions for the best one.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
          GOOGLE ADSENSE SCRIPT
          Replace 'ca-pub-YOUR_PUBLISHER_ID' with your actual AdSense Publisher ID.
          This script should be placed in the <head> of your document.
        */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4002946265718650"
     crossOrigin="anonymous"></script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4002946265718650"
          crossOrigin="anonymous"
          strategy="afterInteractive" // Loads after the page becomes interactive
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
