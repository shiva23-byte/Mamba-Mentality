import React from 'react';
import { cn } from '../lib/utils';

export default function AudioWave({ isPlaying, className }) {
  if (!isPlaying) return null;

  return (
    <div className={cn('audio-wave-container', className)}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className={`audio-wave-bar animate-wave-${i}`}
          style={{
            height: '100%',
            animationDelay: `${(i - 1) * 0.1}s`,
            animation: `wave 1.2s ease-in-out ${(i - 1) * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
