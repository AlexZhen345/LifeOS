import { useState, useEffect } from 'react';
import { Coffee, Trophy, Users, ChevronLeft } from 'lucide-react';
import { Character } from '../App';
import { TeaHouse } from './TeaHouse';
import { PartnerMatch } from './PartnerMatch';
import { LeaderboardPage } from './LeaderboardPage';
import { 
  getTeaHouseUnreadCount, 
  getPartnerTotalUnread, 
  markTeaHouseAsRead 
} from '../services/communityService';
import { getCurrentAccountId } from '../services/userDatabase';

interface CommunityPageProps {
  character: Character;
}

type CommunityTab = 'teahouse' | 'leaderboard' | 'partner';

export function CommunityPage({ character }: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>('teahouse');
  const [teaHouseUnread, setTeaHouseUnread] = useState(0);
  const [partnerUnread, setPartnerUnread] = useState(0);
  
  const currentUserId = getCurrentAccountId() || 'anonymous';

  // 加载未读数
  const loadUnreadCounts = () => {
    setTeaHouseUnread(getTeaHouseUnreadCount(currentUserId));
    setPartnerUnread(getPartnerTotalUnread(currentUserId));
  };

  useEffect(() => {
    loadUnreadCounts();
    // 定期刷新未读数
    const interval = setInterval(loadUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // 切换 tab 时处理已读状态
  const handleTabChange = (tab: CommunityTab) => {
    setActiveTab(tab);
    if (tab === 'teahouse') {
      markTeaHouseAsRead(currentUserId);
      setTeaHouseUnread(0);
    }
    // 搭子模块的已读在 PartnerMatch 组件内部处理
  };

  // 进入茶楼时标记已读
  useEffect(() => {
    if (activeTab === 'teahouse') {
      markTeaHouseAsRead(currentUserId);
      setTeaHouseUnread(0);
    }
  }, [activeTab, currentUserId]);

  const tabs = [
    { id: 'teahouse' as CommunityTab, name: '茶楼', icon: Coffee, description: '分享交流', unread: teaHouseUnread },
    { id: 'leaderboard' as CommunityTab, name: '天梯', icon: Trophy, description: '排行榜', unread: 0 },
    { id: 'partner' as CommunityTab, name: '搭子', icon: Users, description: '找伙伴', unread: partnerUnread },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#e8e3d6] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-light text-[#1a1a1a] mb-4">社区</h1>
          
          {/* Tab 切换 */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-[#2d5f3f] text-white shadow-md'
                      : 'bg-[#f5f1e8] text-[#737373] hover:text-[#1a1a1a] hover:bg-[#ebe7de]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tab.name}</span>
                  {/* 红点 */}
                  {tab.unread > 0 && (
                    <span 
                      className="absolute w-3 h-3 rounded-full"
                      style={{ 
                        top: '-4px', 
                        right: '-4px', 
                        zIndex: 50,
                        backgroundColor: '#ef4444',
                        border: '2px solid white'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-6 pb-24">
        {activeTab === 'teahouse' && (
          <TeaHouse characterName={character.name} />
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="-mx-6 -mt-6">
            <LeaderboardPage character={character} />
          </div>
        )}
        
        {activeTab === 'partner' && (
          <PartnerMatch character={character} onUnreadChange={() => loadUnreadCounts()} />
        )}
      </main>
    </div>
  );
}
