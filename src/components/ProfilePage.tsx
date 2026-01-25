import { useState, useEffect } from 'react';
import { Character } from '../App';
import { Achievement } from './achievements';
import { Brain, Heart, Sparkle, Coins, Flame, TrendingUp, Award, Star, Settings, ChevronRight } from 'lucide-react';
import { UserProfileEditor } from './UserProfileEditor';
import { getUserData, UserData } from '../services/userDatabase';

interface ProfilePageProps {
  character: Character;
  achievements: Achievement[];
  todayTasksCompleted: number;
  totalTasksCompleted: number;
}

const ATTRIBUTE_INFO = {
  INT: { name: '智力', icon: Brain, color: 'text-[#5a7d8c]', bgColor: 'bg-[#5a7d8c]/10', description: '知识与技能发展' },
  VIT: { name: '体质', icon: Heart, color: 'text-[#3d7a54]', bgColor: 'bg-[#3d7a54]/10', description: '身体健康与活力' },
  CHA: { name: '魅力', icon: Sparkle, color: 'text-[#d88e99]', bgColor: 'bg-[#d88e99]/10', description: '社交与沟通能力' },
  GOLD: { name: '财富', icon: Coins, color: 'text-[#d4a832]', bgColor: 'bg-[#d4a832]/10', description: '财务增长' },
  WIL: { name: '意志', icon: Flame, color: 'text-[#8b6f9f]', bgColor: 'bg-[#8b6f9f]/10', description: '纪律与坚持' },
};

export function ProfilePage({ character, achievements, todayTasksCompleted, totalTasksCompleted }: ProfilePageProps) {
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setUserData(getUserData());
  }, []);

  const refreshUserData = () => {
    setUserData(getUserData());
  };

  const xpProgress = character.xpForNextLevel > 0 ? (character.xp / character.xpForNextLevel) * 100 : 0;
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#e8e3d6]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
          <h1 className="text-2xl font-light text-[#1a1a1a]">个人档案</h1>
          <button
            onClick={() => setShowProfileEditor(true)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div className="space-y-6">
          {/* Character Overview */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2d5f3f] to-[#1e4029] rounded-2xl flex items-center justify-center text-white text-2xl font-light shadow-lg">
                {character.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-light text-[#1a1a1a] mb-1">{character.name}</h2>
                <div className="flex items-center gap-3 text-sm text-[#4a4a4a]">
                  <span>等级 {character.level}</span>
                  <span className="text-[#e8e3d6]">·</span>
                  <span>{character.xp} / {character.xpForNextLevel} XP</span>
                </div>
                {userData?.profile.occupation && (
                  <div className="text-xs text-gray-500 mt-1">{userData.profile.occupation}</div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="h-3 bg-[#f5f1e8] rounded-full overflow-hidden border border-[#e8e3d6]">
                <div
                  className="h-full bg-gradient-to-r from-[#2d5f3f] to-[#3d7a54] rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-light text-[#1a1a1a] mb-1">{todayTasksCompleted}</div>
                <div className="text-sm text-[#4a4a4a]">今日完成任务</div>
              </div>
              <div>
                <div className="text-3xl font-light text-[#1a1a1a] mb-1">{totalTasksCompleted}</div>
                <div className="text-sm text-[#4a4a4a]">累计完成任务</div>
              </div>
            </div>
          </div>

          {/* 个人设置入口 */}
          <button
            onClick={() => setShowProfileEditor(true)}
            className="w-full bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl p-5 shadow-sm flex items-center justify-between hover:border-[#2d5f3f]/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2d5f3f]/10 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#2d5f3f]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-[#1a1a1a]">个人设置</div>
                <div className="text-xs text-gray-500">设置你的信息，让 AI 更了解你</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* 用户技能标签 */}
          {userData && (userData.skills.skills.length > 0 || userData.skills.learningGoals.length > 0) && (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-[#4a4a4a] mb-4">我的标签</h3>
              <div className="space-y-3">
                {userData.skills.skills.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">已掌握技能</div>
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.skills.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {userData.skills.learningGoals.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">学习目标</div>
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.learningGoals.map((goal, i) => (
                        <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attributes */}
          <div>
            <h3 className="text-sm font-medium text-[#4a4a4a] mb-4 px-1">属性面板</h3>
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl divide-y-2 divide-[#f5f1e8] shadow-sm">
              {Object.entries(ATTRIBUTE_INFO).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <div key={key} className="p-6 flex items-center gap-4">
                    <div className={`w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center border border-[#e8e3d6]`}>
                      <Icon className={`w-6 h-6 ${info.color}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-0.5">{info.name}</div>
                      <div className="text-xs text-[#737373]">{info.description}</div>
                    </div>
                    <div className="text-2xl font-light text-[#1a1a1a]">
                      {character.attributes[key as keyof typeof character.attributes]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-medium text-[#4a4a4a]">成就墙</h3>
              <span className="text-sm text-[#4a4a4a]">
                {unlockedCount} / {totalAchievements}
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl p-6 shadow-sm">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon === '🌱' ? TrendingUp :
                             achievement.icon === '🔥' ? Flame :
                             achievement.icon === '📚' ? Brain :
                             achievement.icon === '🌟' ? Sparkle :
                             achievement.icon === '💡' ? Brain :
                             achievement.icon === '💪' ? Heart :
                             achievement.icon === '🎯' ? TrendingUp :
                             Award;
                  
                  return (
                    <div key={achievement.id} className="text-center">
                      <div
                        className={`w-full aspect-square rounded-2xl flex items-center justify-center mb-2 transition-all border-2 ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-[#ffd96b] to-[#f5c344] border-[#d4a832] shadow-md'
                            : 'bg-[#faf7f0] border-[#e8e3d6]'
                        }`}
                      >
                        {achievement.unlocked ? (
                          <Star className="w-8 h-8 text-[#1e4029] fill-[#1e4029]" strokeWidth={1.5} />
                        ) : (
                          <Icon className="w-8 h-8 text-[#a0a0a0]" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className={`text-xs ${achievement.unlocked ? 'text-[#1a1a1a] font-medium' : 'text-[#a0a0a0]'}`}>
                        {achievement.unlocked ? achievement.name : '???'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {unlockedAchievements.length > 0 && (
                <div className="pt-6 border-t-2 border-[#f5f1e8] space-y-3">
                  <h4 className="text-xs font-medium text-[#737373] uppercase tracking-wide mb-4">已解锁</h4>
                  {unlockedAchievements.map((achievement) => {
                    const Icon = achievement.icon === '🌱' ? TrendingUp :
                               achievement.icon === '🔥' ? Flame :
                               achievement.icon === '📚' ? Brain :
                               achievement.icon === '🌟' ? Sparkle :
                               achievement.icon === '💡' ? Brain :
                               achievement.icon === '💪' ? Heart :
                               achievement.icon === '🎯' ? TrendingUp :
                               Award;
                    
                    return (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#ffd96b]/20 to-[#f5c344]/20 border-2 border-[#f5c344]/30 rounded-2xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#ffd96b] to-[#f5c344] rounded-xl flex items-center justify-center border border-[#d4a832]">
                          <Star className="w-5 h-5 text-[#1e4029] fill-[#1e4029]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#1a1a1a]">{achievement.name}</div>
                          <div className="text-xs text-[#4a4a4a]">{achievement.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* User Profile Editor Modal */}
      {showProfileEditor && (
        <UserProfileEditor 
          onClose={() => setShowProfileEditor(false)} 
          onSave={refreshUserData}
        />
      )}
    </div>
  );
}
