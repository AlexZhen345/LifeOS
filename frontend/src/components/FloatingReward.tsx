import { useEffect, useState } from 'react';

interface FloatingRewardProps {
  rewards: Record<string, number>;
  startX: number;
  startY: number;
  onComplete: () => void;
}

export function FloatingReward({ rewards, startX, startY, onComplete }: FloatingRewardProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const getRewardEmoji = (key: string) => {
    if (key === 'XP') return '⭐';
    const emojis: Record<string, string> = {
      INT: '🧠',
      VIT: '💪',
      CHA: '✨',
      GOLD: '💰',
      WIL: '🔥',
    };
    return emojis[key] || '⭐';
  };

  const getRewardColor = (key: string) => {
    if (key === 'XP') return '#9b59b6';
    const colors: Record<string, string> = {
      INT: '#66d9ff',
      VIT: '#a8e6cf',
      CHA: '#ff9ec4',
      GOLD: '#ffe066',
      WIL: '#c7a3ff',
    };
    return colors[key] || '#999';
  };

  return (
    <div
      className="fixed pointer-events-none z-50 animate-float-up"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
      }}
    >
      <div className="flex flex-col gap-1">
        {Object.entries(rewards).map(([key, value]) => (
          <div
            key={key}
            className="pixel-text text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg border-2 border-white"
            style={{
              backgroundColor: getRewardColor(key),
              color: 'white',
            }}
          >
            {getRewardEmoji(key)} +{value} {key} ⬆
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-30px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(0.8);
            opacity: 0;
          }
        }

        .animate-float-up {
          animation: float-up 1.5s ease-out;
        }

        .pixel-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}