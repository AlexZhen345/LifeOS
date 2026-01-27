import { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';

interface GoalCompleteModalProps {
  onClose: () => void;
}

export function GoalCompleteModal({ onClose }: GoalCompleteModalProps) {
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
        className={`relative bg-gradient-to-br from-[#ff9ec4] via-[#ffc4db] to-[#ffe8f0] rounded-3xl p-8 shadow-2xl text-center transform transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {/* Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#ff9ec4', '#66d9ff', '#a8e6cf', '#ffe066', '#c7a3ff'][
                  Math.floor(Math.random() * 5)
                ],
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/30 rounded-full mb-4 animate-bounce-slow">
            <PartyPopper className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>

          {/* Text */}
          <div className="mb-4">
            <p className="ios-text text-6xl mb-2">🎉</p>
            <h2 className="ios-title text-3xl text-white font-bold mb-2">
              目标达成！
            </h2>
            <p className="ios-text text-lg text-white/90 font-medium">
              所有任务已完成，真棒！
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(-10deg); }
          75% { transform: translateY(-10px) rotate(10deg); }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
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
