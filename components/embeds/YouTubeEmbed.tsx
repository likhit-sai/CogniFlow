
import React from 'react';

interface YouTubeEmbedProps {
  url: string;
}

const getYouTubeID = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url }) => {
  const videoId = getYouTubeID(url);

  if (!videoId) {
    return <div className="my-4 p-2 bg-red-900/50 text-red-300 rounded-md">Invalid YouTube URL: {url}</div>;
  }

  return (
    <div className="my-4 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;