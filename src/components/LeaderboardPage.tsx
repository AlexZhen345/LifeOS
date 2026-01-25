import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, ChevronRight, Eye, EyeOff, Camera, Flame, X, Clock, Shield } from 'lucide-react';
import { Character } from '../App';
import { 
  getLeaderboard, 
  LeaderboardUser, 
  LeaderboardType, 
  getLeaderboardTypeName,
  getLeaderboardTypeColor,
  getUserRank
} from '../services/leaderboardService';
import { 
  getUserData, 
  setLeaderboardParticipation, 
  getCheckInRecords,
  CheckInRecord 
} from '../services/userDatabase';

interface LeaderboardPageProps {
  character: Character;
}

export function LeaderboardPage({ character }: LeaderboardPageProps) {
  const [activeType, setActiveType] = useState<LeaderboardType>('total');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const types: LeaderboardType[] = ['total', 'INT', 'VIT', 'CHA', 'GOLD', 'WIL', 'streak'];

  // 初始化时加载用户数据
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      const joined = userData.profile.joinLeaderboard === true;
      setIsJoined(joined);
      setNickname(userData.profile.leaderboardNickname || userData.profile.name || '冒险者');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadLeaderboard();
    }
  }, [activeType, isJoined, character, isLoading]);

  const loadLeaderboard = () => {
    const userData = getUserData();
    let currentUserData = undefined;

    // 重新读取最新的加入状态
    const actuallyJoined = userData?.profile.joinLeaderboard === true;

    if (actuallyJoined && userData) {
      currentUserData = {
        nickname: userData.profile.leaderboardNickname || userData.profile.name || '冒险者',
        attributes: character.attributes,
        level: character.level,
        checkInCount: userData.checkInRecords?.length || 0,
        streakDays: userData.stats?.streakDays || 0,
        recentCheckIns: userData.checkInRecords || [],
      };
    }

    const data = getLeaderboard(activeType, 50, currentUserData);
    setLeaderboard(data);

    // 计算当前用户排名
    if (actuallyJoined) {
      let score = 0;
      switch (activeType) {
        case 'total':
          score = Object.values(character.attributes).reduce((a, b) => a + b, 0);
          break;
        case 'streak':
          score = userData?.stats?.streakDays || 0;
          break;
        default:
          score = character.attributes[activeType as keyof typeof character.attributes] || 0;
      }
      setUserRank(getUserRank(activeType, score));
    } else {
      setUserRank(null);
    }
  };

  const handleJoinToggle = () => {
    const newValue = !isJoined;
    setIsJoined(newValue);
    // 确保昵称有值
    const finalNickname = nickname.trim() || character.name || '冒险者';
    setNickname(finalNickname);
    setLeaderboardParticipation(newValue, finalNickname);
    // 立即刷新排行榜
    setTimeout(() => loadLeaderboard(), 100);
  };

  const handleNicknameChange = () => {
    const finalNickname = nickname.trim() || character.name || '冒险者';
    setNickname(finalNickname);
    setLeaderboardParticipation(isJoined, finalNickname);
    setShowSettings(false);
    // 刷新排行榜以显示新昵称
    setTimeout(() => loadLeaderboard(), 100);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="ios-text text-sm font-bold text-gray-400 w-5 text-center">{rank}</span>;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#e8e3d6]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#d4a832]" />
              <h1 className="text-xl font-light text-[#1a1a1a]">天梯榜</h1>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Shield className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 用户排名卡片 */}
          {isJoined && userRank && (
            <div className="bg-gradient-to-r from-[#2d5f3f] to-[#3d7a54] rounded-2xl p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs mb-1">我的{getLeaderboardTypeName(activeType)}排名</p>
                  <p className="text-2xl font-bold">#{userRank}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-xs mb-1">{getLeaderboardTypeName(activeType)}分数</p>
                  <p className="text-xl font-semibold">
                    {activeType === 'total' 
                      ? Object.values(character.attributes).reduce((a, b) => a + b, 0)
                      : activeType === 'streak'
                        ? getUserData()?.stats.streakDays || 0
                        : character.attributes[activeType as keyof typeof character.attributes]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 未加入提示 */}
          {!isJoined && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <EyeOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="ios-text text-sm text-amber-800 font-medium">你尚未加入天梯榜</p>
                  <p className="ios-text text-xs text-amber-700 mt-1">加入后可以和其他用户比拼，查看他们的学习路径</p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-2 px-4 py-1.5 bg-amber-600 text-white rounded-lg ios-text text-xs font-medium"
                  >
                    立即加入
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 类型选择 */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl ios-text text-sm font-medium transition-all ${
                  activeType === type
                    ? 'text-white shadow-md'
                    : 'bg-white/80 text-gray-600 border border-gray-200'
                }`}
                style={activeType === type ? { backgroundColor: getLeaderboardTypeColor(type) } : {}}
              >
                {getLeaderboardTypeName(type)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 排行榜列表 */}
      <main className="max-w-4xl mx-auto px-6 py-6 pb-24">
        <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl overflow-hidden shadow-sm">
          {leaderboard.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-4 border-b border-gray-100 last:border-b-0 ${
                user.isCurrentUser ? 'bg-[#2d5f3f]/5' : ''
              }`}
            >
              {/* 排名 */}
              <div className="w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>

              {/* 头像 */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                user.isCurrentUser ? 'bg-[#2d5f3f]' : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                {user.avatar}
              </div>

              {/* 用户信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`ios-text text-sm font-medium ${user.isCurrentUser ? 'text-[#2d5f3f]' : 'text-gray-900'}`}>
                    {user.nickname}
                  </span>
                  {user.isCurrentUser && (
                    <span className="px-1.5 py-0.5 bg-[#2d5f3f] text-white rounded text-xs">我</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="ios-text text-xs text-gray-500">Lv.{user.level}</span>
                  <span className="text-gray-300">·</span>
                  <span className="ios-text text-xs text-gray-500">{user.checkInCount}次打卡</span>
                  {user.streakDays > 0 && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="ios-text text-xs text-orange-500 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        {user.streakDays}天
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 分数和查看按钮 */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="ios-text text-base font-semibold" style={{ color: getLeaderboardTypeColor(activeType) }}>
                    {activeType === 'total' 
                      ? user.totalScore
                      : activeType === 'streak'
                        ? user.streakDays
                        : user.attributes[activeType as keyof typeof user.attributes]}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedUser(user)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 隐私设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="ios-text text-base font-semibold text-gray-900">天梯榜设置</h3>
              <button onClick={() => setShowSettings(false)} className="p-1">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* 加入开关 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {isJoined ? (
                    <Eye className="w-5 h-5 text-[#2d5f3f]" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="ios-text text-sm font-medium text-gray-900">加入天梯榜</p>
                    <p className="ios-text text-xs text-gray-500">公开你的数据参与排名</p>
                  </div>
                </div>
                <button
                  onClick={handleJoinToggle}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    isJoined ? 'bg-[#2d5f3f]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isJoined ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* 昵称设置 */}
              {isJoined && (
                <div className="space-y-2">
                  <label className="ios-text text-sm text-gray-600 font-medium">
                    天梯榜昵称
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="设置你的昵称"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <p className="ios-text text-xs text-gray-500">
                    其他用户将看到这个昵称，而非你的真实姓名
                  </p>
                </div>
              )}

              {/* 隐私说明 */}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="ios-text text-xs text-blue-800">
                  <strong>隐私说明：</strong>加入天梯榜后，其他用户可以看到你的昵称、等级、属性数值和打卡记录。
                  你的真实姓名、职业等个人信息不会被公开。你可以随时退出天梯榜。
                </p>
              </div>

              <button
                onClick={handleNicknameChange}
                className="w-full bg-[#2d5f3f] text-white py-3 rounded-xl ios-text font-semibold"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户详情/打卡路径弹窗 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="ios-text text-base font-semibold text-gray-900">
                {selectedUser.nickname} 的打卡路径
              </h3>
              <button onClick={() => setSelectedUser(null)} className="p-1">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* 用户概览 */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-medium ${
                  selectedUser.isCurrentUser ? 'bg-[#2d5f3f]' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  {selectedUser.avatar}
                </div>
                <div>
                  <p className="ios-text text-base font-semibold text-gray-900">{selectedUser.nickname}</p>
                  <p className="ios-text text-sm text-gray-500">
                    Lv.{selectedUser.level} · 总分 {selectedUser.totalScore}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="ios-text text-xs text-gray-500">{selectedUser.checkInCount}次打卡</span>
                    {selectedUser.streakDays > 0 && (
                      <span className="ios-text text-xs text-orange-500 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" />
                        连续{selectedUser.streakDays}天
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 属性雷达 */}
              <div className="mb-6">
                <h4 className="ios-text text-sm font-medium text-gray-700 mb-3">属性分布</h4>
                <div className="grid grid-cols-5 gap-2">
                  {(['INT', 'VIT', 'CHA', 'GOLD', 'WIL'] as const).map((attr) => (
                    <div key={attr} className="text-center">
                      <div 
                        className="w-full aspect-square rounded-xl flex items-center justify-center mb-1"
                        style={{ backgroundColor: `${getLeaderboardTypeColor(attr)}20` }}
                      >
                        <span 
                          className="ios-text text-sm font-bold"
                          style={{ color: getLeaderboardTypeColor(attr) }}
                        >
                          {selectedUser.attributes[attr]}
                        </span>
                      </div>
                      <span className="ios-text text-xs text-gray-500">{attr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最近打卡记录 */}
              <div>
                <h4 className="ios-text text-sm font-medium text-gray-700 mb-3">最近打卡</h4>
                {selectedUser.recentCheckIns.length === 0 ? (
                  <p className="ios-text text-sm text-gray-500 text-center py-8">暂无打卡记录</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.recentCheckIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          checkIn.hasPhoto ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          {checkIn.hasPhoto ? (
                            <Camera className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="ios-text text-sm text-gray-900 truncate">{checkIn.taskTitle}</p>
                          <p className="ios-text text-xs text-gray-500">{formatTime(checkIn.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
