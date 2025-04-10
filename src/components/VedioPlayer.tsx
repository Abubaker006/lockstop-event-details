// components/VideoPlayer.tsx
import React from 'react';

interface VideoPlayerProps {
  src: string; // Video source URL or path
  className?: string; // Optional Tailwind classes
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className = '' }) => {
  return (
    <div className={`relative w-full  max-w-xl mx-auto ${className}`}>
      <video
        controls
        className="w-full rounded-lg shadow-lg"
        src={src}
        autoPlay={true} // Set to true if you want it to play automatically
        muted // Add if you want autoplay with sound off (required by some browsers)
        loop={false} // Optional: loop the video
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;