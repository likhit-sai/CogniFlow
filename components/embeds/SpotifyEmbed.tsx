
import React from 'react';

interface SpotifyEmbedProps {
  url: string;
}

const getSpotifyEmbedUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'open.spotify.com' && urlObj.pathname.startsWith('/track/')) {
            return `https://open.spotify.com/embed${urlObj.pathname}`;
        }
        return null;
    } catch (e) {
        return null;
    }
}

const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({ url }) => {
  const embedUrl = getSpotifyEmbedUrl(url);

  if (!embedUrl) {
    return <div className="my-4 p-2 bg-red-900/50 text-red-300 rounded-md">Invalid Spotify Track URL: {url}</div>;
  }

  return (
    <div className="my-4">
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg shadow-lg"
      ></iframe>
    </div>
  );
};

export default SpotifyEmbed;