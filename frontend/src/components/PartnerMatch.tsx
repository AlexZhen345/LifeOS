import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Send, 
  X, 
  Heart,
  MessageCircle,
  Target,
  Sparkles,
  Clock,
  ChevronRight,
  Check,
  Filter
} from 'lucide-react';
import { 
  PartnerProfile, 
  MatchRequest,
  ChatMessage,
  getPartners, 
  getMatchingPartners,
  updatePartnerProfile,
  toggleLookingForPartner,
  getMatchRequests,
  sendMatchRequest,
  updateMatchRequestStatus,
  getMatchedPartners,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  getUnreadCount,
  formatTimeAgo 
} from '../services/communityService';
import { getCurrentAccountId, getUserData } from '../services/userDatabase';
import { Character } from '../App';

interface PartnerMatchProps {
  character: Character;
  onUnreadChange?: () => void;
}

const INTEREST_OPTIONS = [
  '编程', '学习', '阅读', '健身', '跑步', '早起', 
  '冥想', '写作', '理财', '投资', '语言学习', '音乐',
  '绘画', '摄影', '旅行', '烹饪', '游戏', '自律'
];

const GOAL_OPTIONS = [
  '提升编程能力', '养成阅读习惯', '考研', '考证',
  '增肌减脂', '跑完马拉松', '保持健康', '早睡早起',
  '每日冥想', '学习英语', '学习新技能', '财务自由',
  '写作出书', '创业', '减肥', '戒烟戒酒'
];

export function PartnerMatch({ character, onUnreadChange }: PartnerMatchProps) {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [myProfile, setMyProfile] = useState<PartnerProfile | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMatchRequest, setShowMatchRequest] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');
  const [matchTargetPartner, setMatchTargetPartner] = useState<PartnerProfile | null>(null); // 发送请求的目标搭子
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'matched'>('discover');
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  
  // 聊天相关状态
  const [matchedPartners, setMatchedPartners] = useState<PartnerProfile[]>([]);
  const [chatPartner, setChatPartner] = useState<PartnerProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [allPartners, setAllPartners] = useState<PartnerProfile[]>([]); // 所有用户（用于查找请求发送者）
  const [showSuccessToast, setShowSuccessToast] = useState(false); // 发送成功提示

  const currentUserId = getCurrentAccountId() || 'anonymous';
  const userData = getUserData();

  // 编辑表单状态
  const [editIntroduction, setEditIntroduction] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editGoals, setEditGoals] = useState<string[]>([]);
  const [editIsLooking, setEditIsLooking] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allPartnersData = getPartners();
    setAllPartners(allPartnersData); // 保存所有用户
    
    const myPartnerProfile = allPartnersData.find(p => p.id === currentUserId);
    
    if (myPartnerProfile) {
      setMyProfile(myPartnerProfile);
      setEditIntroduction(myPartnerProfile.introduction);
      setEditInterests(myPartnerProfile.interests);
      setEditGoals(myPartnerProfile.goals);
      setEditIsLooking(myPartnerProfile.isLooking);
    } else {
      // 创建默认档案
      const defaultProfile: PartnerProfile = {
        id: currentUserId,
        name: character.name,
        avatar: character.name.charAt(0).toUpperCase(),
        level: character.level,
        interests: [],
        goals: [],
        introduction: '',
        attributes: character.attributes,
        isLooking: false,
        matchTags: [],
        lastActive: new Date().toISOString(),
      };
      setMyProfile(defaultProfile);
    }

    // 获取其他正在寻找搭子的用户
    const otherPartners = allPartnersData.filter(p => p.id !== currentUserId && p.isLooking);
    setPartners(otherPartners);

    // 获取匹配请求
    const requests = getMatchRequests(currentUserId);
    setMatchRequests(requests);

    // 获取已匹配的搭子
    const matched = getMatchedPartners(currentUserId);
    setMatchedPartners(matched);

    // 获取未读消息总数
    setTotalUnread(getUnreadCount(currentUserId));
  };

  const handleSaveProfile = () => {
    if (!myProfile) return;

    const updatedProfile: PartnerProfile = {
      ...myProfile,
      name: character.name,
      avatar: character.name.charAt(0).toUpperCase(),
      level: character.level,
      attributes: character.attributes,
      introduction: editIntroduction,
      interests: editInterests,
      goals: editGoals,
      isLooking: editIsLooking,
      matchTags: [...editInterests, ...editGoals],
      lastActive: new Date().toISOString(),
    };

    updatePartnerProfile(updatedProfile);
    setMyProfile(updatedProfile);
    setShowEditProfile(false);
    loadData();
  };

  const handleSendMatchRequest = () => {
    if (!matchTargetPartner || !matchMessage.trim()) return;

    sendMatchRequest(currentUserId, matchTargetPartner.id, matchMessage.trim());
    setMatchMessage('');
    setShowMatchRequest(false);
    setMatchTargetPartner(null);
    
    // 显示发送成功提示
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
    
    loadData();
  };

  // 打开发送请求弹窗
  const openMatchRequestModal = (partner: PartnerProfile) => {
    setMatchTargetPartner(partner);
    setSelectedPartner(null); // 关闭详情弹窗
    setShowMatchRequest(true);
  };

  const handleAcceptRequest = (requestId: string) => {
    updateMatchRequestStatus(requestId, 'accepted');
    loadData();
    onUnreadChange?.();
  };

  const handleRejectRequest = (requestId: string) => {
    updateMatchRequestStatus(requestId, 'rejected');
    loadData();
    onUnreadChange?.();
  };

  const toggleInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(editInterests.filter(i => i !== interest));
    } else if (editInterests.length < 5) {
      setEditInterests([...editInterests, interest]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (editGoals.includes(goal)) {
      setEditGoals(editGoals.filter(g => g !== goal));
    } else if (editGoals.length < 3) {
      setEditGoals([...editGoals, goal]);
    }
  };

  const toggleFilterInterest = (interest: string) => {
    if (filterInterests.includes(interest)) {
      setFilterInterests(filterInterests.filter(i => i !== interest));
    } else {
      setFilterInterests([...filterInterests, interest]);
    }
  };

  const filteredPartners = filterInterests.length > 0
    ? partners.filter(p => p.interests.some(i => filterInterests.includes(i)))
    : partners;

  const pendingRequests = matchRequests.filter(r => r.toUserId === currentUserId && r.status === 'pending');

  // 打开聊天
  const openChat = (partner: PartnerProfile) => {
    setChatPartner(partner);
    const messages = getChatMessages(currentUserId, partner.id);
    setChatMessages(messages);
    markMessagesAsRead(currentUserId, partner.id);
    setTotalUnread(getUnreadCount(currentUserId));
    onUnreadChange?.();
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!chatPartner || !newMessage.trim()) return;
    
    const message = sendChatMessage(currentUserId, chatPartner.id, newMessage.trim());
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // 关闭聊天
  const closeChat = () => {
    setChatPartner(null);
    setChatMessages([]);
    setNewMessage('');
    loadData();
  };

  return (
    <div className="space-y-4">
      {/* 我的搭子档案 */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-[#1a1a1a]">我的搭子档案</h3>
          <button
            onClick={() => setShowEditProfile(true)}
            className="text-sm text-[#2d5f3f] hover:text-[#3d7a54] font-medium"
          >
            编辑
          </button>
        </div>

        {myProfile ? (
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] flex items-center justify-center text-white font-medium">
              {myProfile.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[#1a1a1a]">{myProfile.name}</span>
                <span className="text-xs text-[#737373]">Lv.{myProfile.level}</span>
                {myProfile.isLooking ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">寻找中</span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">未开启</span>
                )}
              </div>
              {myProfile.introduction ? (
                <p className="text-sm text-[#4a4a4a] mb-2">{myProfile.introduction}</p>
              ) : (
                <p className="text-sm text-[#a0a0a0] mb-2">点击编辑添加自我介绍</p>
              )}
              {myProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {myProfile.interests.map((interest, index) => (
                    <span key={index} className="px-2 py-0.5 bg-[#f5f1e8] text-[#2d5f3f] text-xs rounded-lg">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#a0a0a0]">点击编辑创建你的搭子档案</p>
        )}

        {/* 发起寻找按钮 */}
        {myProfile && (
          <div className="mt-4">
            {myProfile.isLooking ? (
              <button
                onClick={() => {
                  toggleLookingForPartner(currentUserId, false);
                  loadData();
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                停止寻找
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!myProfile.introduction || myProfile.interests.length === 0) {
                    // 如果档案不完整，先打开编辑弹窗
                    setShowEditProfile(true);
                  } else {
                    toggleLookingForPartner(currentUserId, true);
                    loadData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-2.5 rounded-xl font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                开始寻找搭子
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'discover'
              ? 'bg-[#2d5f3f] text-white'
              : 'text-[#737373] hover:text-[#1a1a1a]'
          }`}
        >
          <Search className="w-4 h-4" />
          发现
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'requests'
              ? 'bg-[#2d5f3f] text-white'
              : 'text-[#737373] hover:text-[#1a1a1a]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          请求
          {pendingRequests.length > 0 && (
            <span 
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                top: '-2px', 
                right: '-2px', 
                zIndex: 50,
                backgroundColor: '#ef4444',
                border: '2px solid white'
              }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('matched')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
            activeTab === 'matched'
              ? 'bg-[#2d5f3f] text-white'
              : 'text-[#737373] hover:text-[#1a1a1a]'
          }`}
        >
          <Heart className="w-4 h-4" />
          搭子
          {totalUnread > 0 && (
            <span 
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                top: '-2px', 
                right: '-2px', 
                zIndex: 50,
                backgroundColor: '#ef4444',
                border: '2px solid white'
              }}
            />
          )}
        </button>
      </div>

      {activeTab === 'discover' ? (
        <>
          {/* 筛选按钮 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#737373]">
              {filteredPartners.length} 位搭子正在寻找伙伴
            </span>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filterInterests.length > 0
                  ? 'bg-[#2d5f3f] text-white'
                  : 'bg-white border border-[#e8e3d6] text-[#737373] hover:text-[#1a1a1a]'
              }`}
            >
              <Filter className="w-4 h-4" />
              筛选{filterInterests.length > 0 ? ` (${filterInterests.length})` : ''}
            </button>
          </div>

          {/* 筛选面板 */}
          {showFilter && (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#1a1a1a]">按兴趣筛选</span>
                {filterInterests.length > 0 && (
                  <button
                    onClick={() => setFilterInterests([])}
                    className="text-xs text-[#2d5f3f]"
                  >
                    清除
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleFilterInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      filterInterests.includes(interest)
                        ? 'bg-[#2d5f3f] text-white'
                        : 'bg-[#f5f1e8] text-[#4a4a4a] hover:bg-[#ebe7de]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 搭子列表 */}
          <div className="space-y-3">
            {filteredPartners.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-12 text-center shadow-sm">
                <Users className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
                <p className="text-[#737373]">暂无符合条件的搭子</p>
                <p className="text-sm text-[#a0a0a0] mt-2">试试调整筛选条件</p>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedPartner(partner)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-medium">
                      {partner.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1a1a1a]">{partner.name}</span>
                        <span className="text-xs text-[#737373]">Lv.{partner.level}</span>
                        <span className="flex items-center gap-0.5 text-xs text-[#a0a0a0]">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(partner.lastActive)}
                        </span>
                      </div>
                      <p className="text-sm text-[#4a4a4a] line-clamp-2 mb-2">{partner.introduction}</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.interests.slice(0, 4).map((interest, index) => (
                          <span key={index} className="px-2 py-0.5 bg-[#f5f1e8] text-[#2d5f3f] text-xs rounded-lg">
                            {interest}
                          </span>
                        ))}
                        {partner.interests.length > 4 && (
                          <span className="px-2 py-0.5 bg-[#f5f1e8] text-[#737373] text-xs rounded-lg">
                            +{partner.interests.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#a0a0a0] flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : activeTab === 'requests' ? (
        /* 匹配请求列表 */
        <div className="space-y-3">
          {matchRequests.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-12 text-center shadow-sm">
              <MessageCircle className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
              <p className="text-[#737373]">暂无匹配请求</p>
            </div>
          ) : (
            matchRequests.map((request) => {
              const isIncoming = request.toUserId === currentUserId;
              // 使用 allPartners 而不是 partners，确保能找到所有用户（包括关闭寻找的）
              const otherPartner = allPartners.find(p => 
                p.id === (isIncoming ? request.fromUserId : request.toUserId)
              );

              return (
                <div
                  key={request.id}
                  className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-medium">
                      {otherPartner?.avatar || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1a1a1a]">{otherPartner?.name || '用户'}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : request.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {request.status === 'pending' ? '待处理' : request.status === 'accepted' ? '已接受' : '已拒绝'}
                        </span>
                      </div>
                      <p className="text-sm text-[#4a4a4a] mb-2">{request.message}</p>
                      <span className="text-xs text-[#a0a0a0]">{formatTimeAgo(request.createdAt)}</span>
                      
                      {isIncoming && request.status === 'pending' && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#2d5f3f] text-white rounded-xl text-sm font-medium hover:bg-[#3d7a54] transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            接受
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* 我的搭子列表 */
        <div className="space-y-3">
          {matchedPartners.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-12 text-center shadow-sm">
              <Heart className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
              <p className="text-[#737373]">还没有搭子</p>
              <p className="text-sm text-[#a0a0a0] mt-2">去发现页面寻找志同道合的伙伴吧</p>
            </div>
          ) : (
            matchedPartners.map((partner) => {
              const unread = getUnreadCount(currentUserId, partner.id);
              return (
                <div
                  key={partner.id}
                  className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => openChat(partner)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] flex items-center justify-center text-white font-medium">
                        {partner.avatar}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1a1a1a]">{partner.name}</span>
                        <span className="text-xs text-[#737373]">Lv.{partner.level}</span>
                      </div>
                      <p className="text-sm text-[#4a4a4a] truncate">
                        {partner.introduction || '点击开始聊天'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#a0a0a0] flex-shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 搭子详情弹窗 */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="px-4 py-3 border-b border-[#e8e3d6] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1a1a1a]">搭子详情</h3>
              <button onClick={() => setSelectedPartner(null)} className="p-1">
                <X className="w-5 h-5 text-[#737373]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* 基本信息 */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xl font-medium">
                  {selectedPartner.avatar}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1a1a1a]">{selectedPartner.name}</p>
                  <p className="text-sm text-[#737373]">Lv.{selectedPartner.level}</p>
                </div>
              </div>

              {/* 自我介绍 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a832]" />
                  自我介绍
                </h4>
                <p className="text-sm text-[#4a4a4a] bg-[#f5f1e8] rounded-xl p-3">
                  {selectedPartner.introduction || '暂无介绍'}
                </p>
              </div>

              {/* 兴趣爱好 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#d88e99]" />
                  兴趣爱好
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.interests.length > 0 ? (
                    selectedPartner.interests.map((interest, index) => (
                      <span key={index} className="px-3 py-1.5 bg-[#f5f1e8] text-[#2d5f3f] text-sm rounded-xl">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#a0a0a0]">暂无</span>
                  )}
                </div>
              </div>

              {/* 目标 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#2d5f3f]" />
                  目标
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.goals.length > 0 ? (
                    selectedPartner.goals.map((goal, index) => (
                      <span key={index} className="px-3 py-1.5 bg-[#2d5f3f]/10 text-[#2d5f3f] text-sm rounded-xl">
                        {goal}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#a0a0a0]">暂无</span>
                  )}
                </div>
              </div>

              {/* 属性 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#1a1a1a] mb-2">属性分布</h4>
                <div className="grid grid-cols-5 gap-2">
                  {(['INT', 'VIT', 'CHA', 'GOLD', 'WIL'] as const).map((attr) => (
                    <div key={attr} className="text-center">
                      <div className="w-full aspect-square rounded-xl bg-[#f5f1e8] flex items-center justify-center mb-1">
                        <span className="text-sm font-bold text-[#2d5f3f]">
                          {selectedPartner.attributes[attr]}
                        </span>
                      </div>
                      <span className="text-xs text-[#737373]">{attr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 发送请求按钮 - 移到内容区域内 */}
              <div className="pt-2">
                <button
                  onClick={() => openMatchRequestModal(selectedPartner)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  发送搭子请求
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发送匹配请求弹窗 */}
      {showMatchRequest && matchTargetPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e8e3d6] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1a1a1a]">发送搭子请求</h3>
              <button onClick={() => { setShowMatchRequest(false); setMatchTargetPartner(null); }} className="p-1">
                <X className="w-5 h-5 text-[#737373]" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-[#4a4a4a]">
                向 <span className="font-medium text-[#1a1a1a]">{matchTargetPartner.name}</span> 发送搭子请求
              </p>
              <textarea
                value={matchMessage}
                onChange={(e) => setMatchMessage(e.target.value)}
                placeholder="介绍一下你自己，为什么想成为TA的搭子..."
                className="w-full px-3 py-2 bg-[#f5f1e8] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/20"
                rows={4}
              />
              <button
                onClick={handleSendMatchRequest}
                disabled={!matchMessage.trim()}
                className="w-full bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发送请求
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑档案弹窗 */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-[#e8e3d6] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#1a1a1a]">编辑搭子档案</h3>
              <button onClick={() => setShowEditProfile(false)} className="p-1">
                <X className="w-5 h-5 text-[#737373]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* 开启寻找 */}
              <div className="flex items-center justify-between p-3 bg-[#f5f1e8] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">开启寻找搭子</p>
                  <p className="text-xs text-[#737373]">开启后其他用户可以看到你</p>
                </div>
                <button
                  onClick={() => setEditIsLooking(!editIsLooking)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    editIsLooking ? 'bg-[#2d5f3f]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    editIsLooking ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* 自我介绍 */}
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-2 block">自我介绍</label>
                <textarea
                  value={editIntroduction}
                  onChange={(e) => setEditIntroduction(e.target.value)}
                  placeholder="介绍一下你自己，让其他人更了解你..."
                  className="w-full px-3 py-2 bg-[#f5f1e8] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/20"
                  rows={3}
                />
              </div>

              {/* 兴趣爱好 */}
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-2 block">
                  兴趣爱好 <span className="text-[#a0a0a0] font-normal">（最多选5个）</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        editInterests.includes(interest)
                          ? 'bg-[#2d5f3f] text-white'
                          : 'bg-[#f5f1e8] text-[#4a4a4a] hover:bg-[#ebe7de]'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* 目标 */}
              <div>
                <label className="text-sm font-medium text-[#1a1a1a] mb-2 block">
                  目标 <span className="text-[#a0a0a0] font-normal">（最多选3个）</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        editGoals.includes(goal)
                          ? 'bg-[#2d5f3f] text-white'
                          : 'bg-[#f5f1e8] text-[#4a4a4a] hover:bg-[#ebe7de]'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl font-medium transition-colors"
                >
                  保存档案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 聊天弹窗 */}
      {chatPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-2xl h-[80vh] sm:h-[600px] flex flex-col mx-4">
            {/* 聊天头部 */}
            <div className="px-4 py-3 border-b border-[#e8e3d6] flex items-center gap-3">
              <button onClick={closeChat} className="p-1">
                <X className="w-5 h-5 text-[#737373]" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] flex items-center justify-center text-white font-medium">
                {chatPartner.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1a1a1a]">{chatPartner.name}</p>
                <p className="text-xs text-[#737373]">Lv.{chatPartner.level}</p>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-[#a0a0a0] text-sm py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#d4a832]" />
                  <p>你们已成为搭子啦！</p>
                  <p className="mt-1">开始聊天吧～</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-[#2d5f3f] text-white rounded-br-sm'
                            : 'bg-[#f5f1e8] text-[#1a1a1a] rounded-bl-sm'
                        }`}
                        style={{ 
                          maxWidth: '50%',
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                        }}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-[#a0a0a0]'}`}>
                          {formatTimeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 输入框 */}
            <div className="px-4 py-3 border-t border-[#e8e3d6] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2.5 bg-[#f5f1e8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/20"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2.5 bg-[#2d5f3f] text-white rounded-xl disabled:opacity-50 transition-colors hover:bg-[#3d7a54]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 发送成功提示 */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]">
          <div className="bg-[#2d5f3f] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">请求发送成功！</span>
          </div>
        </div>
      )}
    </div>
  );
}
