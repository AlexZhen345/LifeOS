import { ArrowRight, Sparkles, Users } from 'lucide-react';

interface WelcomePageProps {
  onStartAdventure: () => void;
  onLogin: () => void;
  hasExistingAccounts: boolean;
}

export function WelcomePage({ onStartAdventure, onLogin, hasExistingAccounts }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8] px-6 py-16">
      <div className="max-w-2xl w-full space-y-12 text-center">
        {/* Logo Mark */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#2d5f3f] to-[#1e4029] rounded-3xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-12 h-12 text-[#f5c344]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#1a1a1a]">
            LifeOS
          </h1>
          <p className="text-xl md:text-2xl text-[#4a4a4a] font-light max-w-lg mx-auto">
            将目标转化为系统性成长之旅
          </p>
        </div>

        {/* Description */}
        <div className="max-w-md mx-auto">
          <p className="text-[#737373] leading-relaxed">
            一个智能系统，将人生目标转化为可衡量的进步，
            结合战略规划与持续执行
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 space-y-4">
          {/* 开始旅程按钮 */}
          <button
            onClick={onStartAdventure}
            className="group inline-flex items-center gap-3 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="font-medium">开始旅程</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 登录已有账户 */}
          {hasExistingAccounts && (
            <div>
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-2 text-[#2d5f3f] hover:text-[#3d7a54] font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>登录已有账户</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
