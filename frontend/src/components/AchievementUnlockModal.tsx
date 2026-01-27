import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

interface AchievementUnlockModalProps {
  achievement: {
    name: string;
    icon: string;
    description: string;
  };
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div
        className={`relative bg-gradient-to-br from-[#FFD700] via-[#FFC700] to-[#FFB700] rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full transform transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Rays Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="rays"></div>
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-xl animate-scale-pulse">
            <span className="text-5xl">{achievement.icon}</span>
          </div>

          {/* Text */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-white" />
            <h3 className="ios-text text-sm text-white/90 font-semibold uppercase tracking-wide">
              解锁新成就
            </h3>
          </div>
          <h2 
            className="text-3xl text-white mb-3 font-bold"
            style={{ fontFamily: '"Microsoft YaHei", "PingFang SC", system-ui, sans-serif' }}
          >
            {achievement.name}
          </h2>
          <p className="ios-text text-base text-white/90 font-medium">
            {achievement.description}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes rotate-rays {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }

        .rays {
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg 60deg,
            rgba(255, 255, 255, 0.3) 60deg 120deg,
            transparent 120deg 180deg,
            rgba(255, 255, 255, 0.3) 180deg 240deg,
            transparent 240deg 300deg,
            rgba(255, 255, 255, 0.3) 300deg 360deg
          );
          animation: rotate-rays 4s linear infinite;
        }

        .ios-title {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
          letter-spacing: 0.02em;
          word-break: keep-all;
        }

        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Microsoft YaHei', sans-serif;
        }
      `}</style>
    </div>
  );
}
