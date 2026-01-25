import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setVisible(true), 100);
    
    // Auto close after 3 seconds
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
        className={`relative bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-3xl p-8 shadow-2xl text-center transform transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Sparkles Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="sparkle sparkle-1"></div>
          <div className="sparkle sparkle-2"></div>
          <div className="sparkle sparkle-3"></div>
          <div className="sparkle sparkle-4"></div>
          <div className="sparkle sparkle-5"></div>
          <div className="sparkle sparkle-6"></div>
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-bounce-slow">
            <TrendingUp className="w-10 h-10 text-white" strokeWidth={3} />
          </div>

          {/* Text */}
          <h2 className="ios-title text-3xl text-white mb-2 font-bold">
            恭喜升级！
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
            <p className="ios-text text-5xl text-white font-bold">
              Lv {newLevel}
            </p>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="ios-text text-lg text-white/90 font-medium">
            你变得更强大了！
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: sparkle 2s ease-in-out infinite;
        }

        .sparkle-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: 30%;
          right: 20%;
          animation-delay: 0.3s;
        }

        .sparkle-3 {
          bottom: 30%;
          left: 15%;
          animation-delay: 0.6s;
        }

        .sparkle-4 {
          bottom: 20%;
          right: 25%;
          animation-delay: 0.9s;
        }

        .sparkle-5 {
          top: 50%;
          left: 10%;
          animation-delay: 1.2s;
        }

        .sparkle-6 {
          top: 50%;
          right: 10%;
          animation-delay: 1.5s;
        }

        .ios-title {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          letter-spacing: -0.02em;
        }

        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }
      `}</style>
    </div>
  );
}
