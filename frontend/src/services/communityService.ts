// 社区服务 - 管理帖子、评论、搭子匹配

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  likes: string[]; // 点赞的用户ID列表
  comments: Comment[];
  createdAt: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: string[];
  createdAt: string;
  replyTo?: string; // 回复的评论ID
}

export interface PartnerProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  interests: string[];
  goals: string[];
  introduction: string;
  attributes: {
    INT: number;
    VIT: number;
    CHA: number;
    GOLD: number;
    WIL: number;
  };
  isLooking: boolean;
  matchTags: string[];
  lastActive: string;
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

// 聊天消息接口
export interface ChatMessage {
  id: string;
  chatId: string; // 两个用户ID排序后拼接
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

// 存储键
const POSTS_KEY = 'shili_community_posts';
const PARTNERS_KEY = 'shili_community_partners';
const MATCH_REQUESTS_KEY = 'shili_match_requests';
const CHAT_MESSAGES_KEY = 'shili_chat_messages';

// ====== 帖子相关 ======

// 获取所有帖子
export function getPosts(): Post[] {
  const data = localStorage.getItem(POSTS_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // 初始化一些示例帖子
  const samplePosts = generateSamplePosts();
  savePosts(samplePosts);
  return samplePosts;
}

// 保存帖子
function savePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

// 创建新帖子
export function createPost(post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt'>): Post {
  const posts = getPosts();
  const newPost: Post = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

// 点赞帖子
export function togglePostLike(postId: string, userId: string): Post | null {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  
  const post = posts[postIndex];
  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }
  
  savePosts(posts);
  return post;
}

// 添加评论
export function addComment(postId: string, comment: Omit<Comment, 'id' | 'postId' | 'likes' | 'createdAt'>): Comment | null {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  
  const newComment: Comment = {
    ...comment,
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId,
    likes: [],
    createdAt: new Date().toISOString(),
  };
  
  posts[postIndex].comments.push(newComment);
  savePosts(posts);
  return newComment;
}

// 点赞评论
export function toggleCommentLike(postId: string, commentId: string, userId: string): Comment | null {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return null;
  
  const comment = post.comments.find(c => c.id === commentId);
  if (!comment) return null;
  
  const likeIndex = comment.likes.indexOf(userId);
  if (likeIndex === -1) {
    comment.likes.push(userId);
  } else {
    comment.likes.splice(likeIndex, 1);
  }
  
  savePosts(posts);
  return comment;
}

// 删除帖子
export function deletePost(postId: string, userId: string): boolean {
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId && p.authorId === userId);
  if (postIndex === -1) return false;
  
  posts.splice(postIndex, 1);
  savePosts(posts);
  return true;
}

// ====== 搭子匹配相关 ======

// 获取搭子列表
export function getPartners(): PartnerProfile[] {
  const data = localStorage.getItem(PARTNERS_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // 初始化示例搭子
  const samplePartners = generateSamplePartners();
  savePartners(samplePartners);
  return samplePartners;
}

// 保存搭子列表
function savePartners(partners: PartnerProfile[]) {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
}

// 更新自己的搭子档案
export function updatePartnerProfile(profile: PartnerProfile) {
  const partners = getPartners();
  const existingIndex = partners.findIndex(p => p.id === profile.id);
  if (existingIndex !== -1) {
    partners[existingIndex] = profile;
  } else {
    partners.push(profile);
  }
  savePartners(partners);
}

// 切换寻找搭子状态
export function toggleLookingForPartner(userId: string, isLooking: boolean) {
  const partners = getPartners();
  const partner = partners.find(p => p.id === userId);
  if (partner) {
    partner.isLooking = isLooking;
    partner.lastActive = new Date().toISOString();
    savePartners(partners);
  }
}

// 获取匹配的搭子（根据兴趣和目标）
export function getMatchingPartners(userId: string, interests: string[], goals: string[]): PartnerProfile[] {
  const partners = getPartners();
  return partners
    .filter(p => p.id !== userId && p.isLooking)
    .map(p => {
      // 计算匹配度
      const interestMatch = p.interests.filter(i => interests.includes(i)).length;
      const goalMatch = p.goals.filter(g => goals.includes(g)).length;
      const tagMatch = p.matchTags.filter(t => [...interests, ...goals].includes(t)).length;
      return {
        ...p,
        matchScore: interestMatch * 2 + goalMatch * 3 + tagMatch,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);
}

// ====== 匹配请求相关 ======

// 获取匹配请求
export function getMatchRequests(userId: string): MatchRequest[] {
  const data = localStorage.getItem(MATCH_REQUESTS_KEY);
  const requests: MatchRequest[] = data ? JSON.parse(data) : [];
  return requests.filter(r => r.toUserId === userId || r.fromUserId === userId);
}

// 发送匹配请求
export function sendMatchRequest(fromUserId: string, toUserId: string, message: string): MatchRequest {
  const data = localStorage.getItem(MATCH_REQUESTS_KEY);
  const requests: MatchRequest[] = data ? JSON.parse(data) : [];
  
  const newRequest: MatchRequest = {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fromUserId,
    toUserId,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  localStorage.setItem(MATCH_REQUESTS_KEY, JSON.stringify(requests));
  return newRequest;
}

// 更新匹配请求状态
export function updateMatchRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
  const data = localStorage.getItem(MATCH_REQUESTS_KEY);
  const requests: MatchRequest[] = data ? JSON.parse(data) : [];
  
  const request = requests.find(r => r.id === requestId);
  if (request) {
    request.status = status;
    localStorage.setItem(MATCH_REQUESTS_KEY, JSON.stringify(requests));
  }
}

// 获取已匹配的搭子（双方已接受的请求）
export function getMatchedPartners(userId: string): PartnerProfile[] {
  const data = localStorage.getItem(MATCH_REQUESTS_KEY);
  const requests: MatchRequest[] = data ? JSON.parse(data) : [];
  
  // 找出所有已接受的请求
  const acceptedRequests = requests.filter(
    r => r.status === 'accepted' && (r.fromUserId === userId || r.toUserId === userId)
  );
  
  // 获取对方的ID
  const partnerIds = acceptedRequests.map(r => 
    r.fromUserId === userId ? r.toUserId : r.fromUserId
  );
  
  // 获取搭子详情
  const partners = getPartners();
  return partners.filter(p => partnerIds.includes(p.id));
}

// ====== 聊天相关 ======

// 生成聊天ID（两个用户ID排序后拼接）
export function getChatId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

// 获取聊天消息
export function getChatMessages(userId1: string, userId2: string): ChatMessage[] {
  const chatId = getChatId(userId1, userId2);
  const data = localStorage.getItem(CHAT_MESSAGES_KEY);
  const messages: ChatMessage[] = data ? JSON.parse(data) : [];
  return messages.filter(m => m.chatId === chatId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

// 发送聊天消息
export function sendChatMessage(senderId: string, receiverId: string, content: string): ChatMessage {
  const data = localStorage.getItem(CHAT_MESSAGES_KEY);
  const messages: ChatMessage[] = data ? JSON.parse(data) : [];
  
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    chatId: getChatId(senderId, receiverId),
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };
  
  messages.push(newMessage);
  localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  return newMessage;
}

// 标记消息为已读
export function markMessagesAsRead(userId: string, partnerId: string) {
  const data = localStorage.getItem(CHAT_MESSAGES_KEY);
  const messages: ChatMessage[] = data ? JSON.parse(data) : [];
  const chatId = getChatId(userId, partnerId);
  
  let updated = false;
  messages.forEach(m => {
    if (m.chatId === chatId && m.receiverId === userId && !m.read) {
      m.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }
}

// 获取未读消息数
export function getUnreadCount(userId: string, partnerId?: string): number {
  const data = localStorage.getItem(CHAT_MESSAGES_KEY);
  const messages: ChatMessage[] = data ? JSON.parse(data) : [];
  
  if (partnerId) {
    const chatId = getChatId(userId, partnerId);
    return messages.filter(m => m.chatId === chatId && m.receiverId === userId && !m.read).length;
  }
  
  return messages.filter(m => m.receiverId === userId && !m.read).length;
}

// 获取待处理的搭子请求数量（收到的待处理请求）
export function getPendingRequestCount(userId: string): number {
  const data = localStorage.getItem(MATCH_REQUESTS_KEY);
  const requests: MatchRequest[] = data ? JSON.parse(data) : [];
  return requests.filter(r => r.toUserId === userId && r.status === 'pending').length;
}

// 获取搭子模块的总未读数（未读消息 + 待处理请求）
export function getPartnerTotalUnread(userId: string): number {
  return getUnreadCount(userId) + getPendingRequestCount(userId);
}

// 茶楼已读状态存储
const TEAHOUSE_READ_KEY = 'shili_teahouse_read';

interface TeaHouseReadState {
  userId: string;
  lastReadTime: string;
  readPostIds: string[]; // 已读的帖子ID（针对评论）
  acknowledgedLikes: Record<string, number>; // 已确认的点赞数 { postId: likeCount }
  acknowledgedComments: Record<string, number>; // 已确认的评论数 { postId: commentCount }
}

// 获取用户的茶楼已读状态
function getTeaHouseReadState(userId: string): TeaHouseReadState {
  const data = localStorage.getItem(TEAHOUSE_READ_KEY);
  const states: TeaHouseReadState[] = data ? JSON.parse(data) : [];
  const state = states.find(s => s.userId === userId);
  return state || {
    userId,
    lastReadTime: new Date(0).toISOString(),
    readPostIds: [],
    acknowledgedLikes: {},
    acknowledgedComments: {},
  };
}

// 保存用户的茶楼已读状态
function saveTeaHouseReadState(state: TeaHouseReadState) {
  const data = localStorage.getItem(TEAHOUSE_READ_KEY);
  const states: TeaHouseReadState[] = data ? JSON.parse(data) : [];
  const existingIndex = states.findIndex(s => s.userId === state.userId);
  if (existingIndex !== -1) {
    states[existingIndex] = state;
  } else {
    states.push(state);
  }
  localStorage.setItem(TEAHOUSE_READ_KEY, JSON.stringify(states));
}

// 获取茶楼未读数（我的帖子有新点赞或评论）
export function getTeaHouseUnreadCount(userId: string): number {
  const posts = getPosts();
  const myPosts = posts.filter(p => p.authorId === userId);
  const state = getTeaHouseReadState(userId);
  
  let unreadCount = 0;
  
  myPosts.forEach(post => {
    // 检查新点赞
    const acknowledgedLikes = state.acknowledgedLikes[post.id] || 0;
    const newLikes = post.likes.length - acknowledgedLikes;
    if (newLikes > 0) unreadCount += newLikes;
    
    // 检查新评论
    const acknowledgedComments = state.acknowledgedComments[post.id] || 0;
    const newComments = post.comments.length - acknowledgedComments;
    if (newComments > 0) unreadCount += newComments;
  });
  
  return unreadCount;
}

// 标记茶楼为已读（用户进入茶楼时调用）
export function markTeaHouseAsRead(userId: string) {
  const posts = getPosts();
  const myPosts = posts.filter(p => p.authorId === userId);
  
  const state = getTeaHouseReadState(userId);
  state.lastReadTime = new Date().toISOString();
  
  myPosts.forEach(post => {
    state.acknowledgedLikes[post.id] = post.likes.length;
    state.acknowledgedComments[post.id] = post.comments.length;
  });
  
  saveTeaHouseReadState(state);
}

// 获取社区总未读数（茶楼 + 搭子）
export function getCommunityTotalUnread(userId: string): number {
  return getTeaHouseUnreadCount(userId) + getPartnerTotalUnread(userId);
}

// ====== 示例数据生成 ======

function generateSamplePosts(): Post[] {
  const sampleUsers = [
    { id: 'user_sample_1', name: '学习达人', avatar: '学' },
    { id: 'user_sample_2', name: '健身爱好者', avatar: '健' },
    { id: 'user_sample_3', name: '阅读者', avatar: '阅' },
    { id: 'user_sample_4', name: '冥想师', avatar: '冥' },
    { id: 'user_sample_5', name: '早起鸟', avatar: '早' },
  ];

  const posts: Post[] = [
    {
      id: 'post_sample_1',
      authorId: sampleUsers[0].id,
      authorName: sampleUsers[0].name,
      authorAvatar: sampleUsers[0].avatar,
      content: '今天完成了连续30天的学习打卡！感觉自己的编程能力提升了很多，分享一下我的学习方法：每天早起1小时专注学习，效果真的很好！',
      likes: ['user_sample_2', 'user_sample_3'],
      comments: [
        {
          id: 'comment_1',
          postId: 'post_sample_1',
          authorId: sampleUsers[1].id,
          authorName: sampleUsers[1].name,
          authorAvatar: sampleUsers[1].avatar,
          content: '太厉害了！我也要坚持下去',
          likes: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      tags: ['学习', '编程', '坚持'],
    },
    {
      id: 'post_sample_2',
      authorId: sampleUsers[1].id,
      authorName: sampleUsers[1].name,
      authorAvatar: sampleUsers[1].avatar,
      content: '今日健身打卡：跑步5公里 + 核心训练30分钟。坚持健身第15天，体能明显提升了！有没有小伙伴一起约跑？',
      likes: ['user_sample_1'],
      comments: [],
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      tags: ['健身', '跑步', '约伴'],
    },
    {
      id: 'post_sample_3',
      authorId: sampleUsers[2].id,
      authorName: sampleUsers[2].name,
      authorAvatar: sampleUsers[2].avatar,
      content: '推荐一本好书《原子习惯》，讲的是如何建立好习惯、戒除坏习惯。读完之后对习惯养成有了新的认识，强烈推荐给正在培养习惯的朋友们！',
      likes: ['user_sample_1', 'user_sample_3', 'user_sample_4'],
      comments: [
        {
          id: 'comment_2',
          postId: 'post_sample_3',
          authorId: sampleUsers[3].id,
          authorName: sampleUsers[3].name,
          authorAvatar: sampleUsers[3].avatar,
          content: '这本书我也看过，确实很棒！',
          likes: ['user_sample_1'],
          createdAt: new Date(Date.now() - 18000000).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      tags: ['阅读', '书籍推荐', '习惯'],
    },
    {
      id: 'post_sample_4',
      authorId: sampleUsers[3].id,
      authorName: sampleUsers[3].name,
      authorAvatar: sampleUsers[3].avatar,
      content: '冥想打卡第7天，每天15分钟的冥想真的能让人平静下来。有想要一起冥想的朋友吗？可以组个冥想小组互相监督～',
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      tags: ['冥想', '心理健康', '组队'],
    },
    {
      id: 'post_sample_5',
      authorId: sampleUsers[4].id,
      authorName: sampleUsers[4].name,
      authorAvatar: sampleUsers[4].avatar,
      content: '早起打卡第21天！5:30准时起床，完成晨跑、阅读、写晨间日记。早起的感觉真的太好了，一天的效率都提高了。',
      likes: ['user_sample_1', 'user_sample_2'],
      comments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tags: ['早起', '自律', '晨间习惯'],
    },
  ];

  return posts;
}

function generateSamplePartners(): PartnerProfile[] {
  return [
    {
      id: 'partner_sample_1',
      name: '小明',
      avatar: '明',
      level: 8,
      interests: ['编程', '阅读', '学习'],
      goals: ['提升编程能力', '养成阅读习惯', '考研'],
      introduction: '程序员一枚，想找个一起学习进步的小伙伴，可以互相监督打卡',
      attributes: { INT: 45, VIT: 20, CHA: 15, GOLD: 30, WIL: 35 },
      isLooking: true,
      matchTags: ['学习', '编程', '互相监督'],
      lastActive: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'partner_sample_2',
      name: '健身达人小李',
      avatar: '李',
      level: 12,
      interests: ['健身', '跑步', '饮食管理'],
      goals: ['增肌', '跑完马拉松', '保持健康'],
      introduction: '健身爱好者，每周去健身房4次，寻找运动伙伴一起锻炼',
      attributes: { INT: 20, VIT: 60, CHA: 25, GOLD: 15, WIL: 50 },
      isLooking: true,
      matchTags: ['健身', '跑步', '运动'],
      lastActive: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'partner_sample_3',
      name: '阅读爱好者',
      avatar: '读',
      level: 6,
      interests: ['阅读', '写作', '历史'],
      goals: ['一年读50本书', '开始写作', '学习历史'],
      introduction: '热爱阅读，想找志同道合的朋友一起读书交流心得',
      attributes: { INT: 35, VIT: 10, CHA: 30, GOLD: 20, WIL: 25 },
      isLooking: true,
      matchTags: ['阅读', '书籍', '交流'],
      lastActive: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'partner_sample_4',
      name: '早起小组长',
      avatar: '早',
      level: 15,
      interests: ['早起', '冥想', '自律'],
      goals: ['保持早起', '每日冥想', '提高专注力'],
      introduction: '早起100天打卡成功，现在招募早起小伙伴，一起5点半起床',
      attributes: { INT: 30, VIT: 35, CHA: 20, GOLD: 25, WIL: 55 },
      isLooking: true,
      matchTags: ['早起', '自律', '冥想'],
      lastActive: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'partner_sample_5',
      name: '理财新手',
      avatar: '财',
      level: 4,
      interests: ['理财', '投资', '储蓄'],
      goals: ['学习理财知识', '开始投资', '存下第一桶金'],
      introduction: '刚开始学习理财，希望找个有经验的朋友一起交流学习',
      attributes: { INT: 25, VIT: 15, CHA: 20, GOLD: 40, WIL: 20 },
      isLooking: true,
      matchTags: ['理财', '投资', '学习'],
      lastActive: new Date(Date.now() - 14400000).toISOString(),
    },
  ];
}

// 格式化时间显示
export function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
