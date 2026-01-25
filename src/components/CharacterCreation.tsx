import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Brain, Heart, Sparkle, Coins, Flame } from 'lucide-react';

interface CharacterCreationProps {
  onCreateCharacter: (name: string) => void;
  onBack?: () => void;
}

export function CharacterCreation({ onCreateCharacter, onBack }: CharacterCreationProps) {
  const [characterName, setCharacterName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName.trim()) {
      onCreateCharacter(characterName.trim());
    }
  };

  const attributes = [
    { icon: Brain, label: '智力', key: 'INT', color: 'text-[#5a7d8c]', bg: 'bg-[#5a7d8c]/10' },
    { icon: Heart, label: '体质', key: 'VIT', color: 'text-[#3d7a54]', bg: 'bg-[#3d7a54]/10' },
    { icon: Sparkle, label: '魅力', key: 'CHA', color: 'text-[#d88e99]', bg: 'bg-[#d88e99]/10' },
    { icon: Coins, label: '财富', key: 'GOLD', color: 'text-[#d4a832]', bg: 'bg-[#d4a832]/10' },
    { icon: Flame, label: '意志', key: 'WIL', color: 'text-[#8b6f9f]', bg: 'bg-[#8b6f9f]/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8] px-6 py-8">
      {/* 返回按钮 */}
      {onBack && (
        <div className="max-w-lg mx-auto mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#737373] hover:text-[#2d5f3f] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-lg w-full">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light tracking-tight text-[#1a1a1a]">
                创建档案
              </h2>
              <p className="text-[#4a4a4a]">
                建立你的身份开始
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <label htmlFor="character-name" className="block text-sm font-medium text-[#4a4a4a]">
                显示名称
              </label>
              <input
                id="character-name"
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="输入你的名字"
                className="w-full px-4 py-3.5 bg-white border-2 border-[#e8e3d6] rounded-2xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f] focus:border-transparent transition-all"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-[#737373] text-right">
                {characterName.length}/20
              </p>
            </div>

            {/* Initial Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#4a4a4a]">初始属性</h3>
              <div className="bg-[#faf7f0] border-2 border-[#e8e3d6] rounded-2xl p-6">
                <div className="grid grid-cols-5 gap-4">
                  {attributes.map((attr) => (
                    <div key={attr.key} className="text-center space-y-2">
                      <div className={`${attr.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto border border-[#e8e3d6]`}>
                        <attr.icon className={`w-5 h-5 ${attr.color}`} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs text-[#737373] font-medium">{attr.key}</div>
                        <div className="text-sm text-[#a0a0a0] mt-1">0</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#737373] text-center">
                等级 1 · 所有属性从基准线开始
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!characterName.trim()}
              className="w-full inline-flex items-center justify-center gap-3 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#2d5f3f] disabled:hover:shadow-lg group"
            >
              <span className="font-medium">继续</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
