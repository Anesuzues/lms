import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'direct' | 'embed';
  title: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  videoType, 
  title, 
  className = "w-full aspect-video" 
}) => {
  const getEmbedUrl = (url: string, type: string) => {
    switch (type) {
      case 'youtube':
        // Convert YouTube watch URL to embed URL
        const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
      
      case 'vimeo':
        // Convert Vimeo URL to embed URL
        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
      
      case 'direct':
        return url; // Direct video file URL
      
      case 'embed':
        return url; // Already an embed URL
      
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl(videoUrl, videoType);

  if (videoType === 'direct') {
    return (
      <video 
        className={className}
        controls
        preload="metadata"
        poster="/api/placeholder/800/450"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default VideoPlayer;