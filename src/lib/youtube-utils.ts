export interface ThumbnailInfo {
  id: string;
  label: string;
  url: string;
  resolution: string;
  width: number;
  height: number;
}

export function extractVideoId(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === 'youtu.be') {
      videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.hostname.includes('youtube.com')) {
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v');
      } else if (parsedUrl.pathname.startsWith('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1];
      } else if (parsedUrl.pathname.startsWith('/v/')) {
        videoId = parsedUrl.pathname.split('/v/')[1];
      }
    }
  } catch (error) {
    // Fallback for non-standard URLs or if URL parsing fails
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/|attribution_link\?a=.*v%3D)([^#&?]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^#&?]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
  }
  
  // Validate video ID format (11 characters, alphanumeric with -_ )
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return videoId;
  }
  return null;
}

export function generateThumbnailUrls(videoId: string): ThumbnailInfo[] {
  if (!videoId) return [];

  const baseUrl = `https://img.youtube.com/vi/${videoId}`;

  return [
    {
      id: 'maxresdefault',
      label: 'Max Resolution',
      url: `${baseUrl}/maxresdefault.jpg`,
      resolution: '1920x1080 / 1280x720',
      width: 1280, // Default to 1280, actual could be 1920
      height: 720, // Default to 720, actual could be 1080
    },
    {
      id: 'sddefault',
      label: 'Standard Definition',
      url: `${baseUrl}/sddefault.jpg`,
      resolution: '640x480',
      width: 640,
      height: 480,
    },
    {
      id: 'hqdefault',
      label: 'High Quality',
      url: `${baseUrl}/hqdefault.jpg`,
      resolution: '480x360',
      width: 480,
      height: 360,
    },
    {
      id: 'mqdefault',
      label: 'Medium Quality',
      url: `${baseUrl}/mqdefault.jpg`,
      resolution: '320x180',
      width: 320,
      height: 180,
    },
    {
      id: 'default',
      label: 'Default',
      url: `${baseUrl}/default.jpg`,
      resolution: '120x90',
      width: 120,
      height: 90,
    },
  ];
}
