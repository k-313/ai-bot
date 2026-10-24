import React from 'react';

interface WaveformProps {
  active?: boolean;
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({ active = false, color = '#3b82f6' }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            active ? 'animate-pulse' : 'opacity-40'
          }`}
          style={{
            backgroundColor: color,
            height: active ? `${Math.sin(i * 0.8) * 16 + 18}px` : '6px',
            animationDelay: `${i * 120}ms`,
          }}
        />
      ))}
    </div>
  );
};
