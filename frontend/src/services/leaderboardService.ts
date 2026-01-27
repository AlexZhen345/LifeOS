// 天梯榜服务 - 模拟数据和排行榜逻辑

import { CheckInRecord, getAccounts, getCurrentAccountId } from './userDatabase';

// 获取指定账户的用户数据
function getAccountUserData(accountId: string) {
  try {
    const data = localStorage.getItem(`quest_user_data_${accountId}`);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 天梯榜用户数据
export interface LeaderboardUser {
  id: string;
  nickname: string;
  avatar?: string; // 头像首字母
  attributes: {
    INT: number;
    VIT: number;
    CHA: number;
    GOLD: number;
    WIL: number;
  };
  level: number;
  totalScore: number; // 总分
  checkInCount: number; // 打卡次数
  streakDays: number; // 连续打卡天数
  recentCheckIns: {
    id: string;
    taskTitle: string;
    timestamp: string;
    hasPhoto: boolean;
  }[];
  isCurrentUser?: boolean;
}

// 排行榜类型
export type LeaderboardType = 'total' | 'INT' | 'VIT' | 'CHA' | 'GOLD' | 'WIL' | 'streak';

// 模拟用户数据生成
const generateMockUsers = (): LeaderboardUser[] => {
  const mockNames = [
    '学霸小明', '健身达人', '理财高手', '社交蝴蝶', '自律王者',
    '代码狂人', '早起鸟儿', '阅读达人', '跑步爱好者', '投资新手',
    '时间管理大师', '番茄工作法', '英语学习者', '考研党', '职场新人',
    '产品经理', '设计师小王', '全栈开发者', '数据分析师', '创业者'
  ];

  const generateCheckIns = (count: number): { id: string; taskTitle: string; timestamp: string; hasPhoto: boolean; }[] => {
    const tasks = [
      '完成算法练习', '阅读技术文档', '学习新框架', '跑步5公里',
      '背单词100个', '写代码2小时', '看书30分钟', '冥想15分钟',
      '整理笔记', '复习知识点', '健身训练', '学习设计', '写日报'
    ];
    
    const checkIns: { id: string; taskTitle: string; timestamp: string; hasPhoto: boolean; }[] = [];
    const now = Date.now();
    for (let i = 0; i < Math.min(count, 10); i++) {
      checkIns.push({
        id: `mock-${i}`,
        taskTitle: tasks[Math.floor(Math.random() * tasks.length)],
        timestamp: new Date(now - i * 86400000 - Math.random() * 43200000).toISOString(),
        hasPhoto: Math.random() > 0.3,
      });
    }
    return checkIns;
  };

  return mockNames.map((name, index) => {
    const INT = Math.floor(Math.random() * 200) + 50;
    const VIT = Math.floor(Math.random() * 150) + 30;
    const CHA = Math.floor(Math.random() * 100) + 20;
    const GOLD = Math.floor(Math.random() * 300) + 50;
    const WIL = Math.floor(Math.random() * 180) + 40;
    const checkInCount = Math.floor(Math.random() * 100) + 10;
    const streakDays = Math.floor(Math.random() * 30) + 1;

    return {
      id: `user-${index}`,
      nickname: name,
      avatar: name.charAt(0),
      attributes: { INT, VIT, CHA, GOLD, WIL },
      level: Math.floor((INT + VIT + CHA + GOLD + WIL) / 100) + 1,
      totalScore: INT + VIT + CHA + GOLD + WIL,
      checkInCount,
      streakDays,
      recentCheckIns: generateCheckIns(checkInCount),
    };
  });
};

// 缓存模拟数据
let mockUsers: LeaderboardUser[] | null = null;

// 获取模拟用户列表
export function getMockUsers(): LeaderboardUser[] {
  if (!mockUsers) {
    mockUsers = generateMockUsers();
  }
  return mockUsers;
}

// 获取排行榜数据
export function getLeaderboard(
  type: LeaderboardType,
  limit: number = 50,
  currentUserData?: {
    nickname: string;
    attributes: { INT: number; VIT: number; CHA: number; GOLD: number; WIL: number };
    level: number;
    checkInCount: number;
    streakDays: number;
    recentCheckIns: CheckInRecord[];
  }
): LeaderboardUser[] {
  const users = [...getMockUsers()];
  const currentAccountId = getCurrentAccountId();

  // 加载所有本地账户的数据到天梯榜
  const accounts = getAccounts();
  accounts.forEach(account => {
    const userData = getAccountUserData(account.id);
    if (userData && userData.profile?.joinLeaderboard) {
      const isCurrentAccount = account.id === currentAccountId;
      const attrs = userData.attributes || { INT: 0, VIT: 0, CHA: 0, GOLD: 0, WIL: 0, level: 1, xp: 0 };
      const localUser: LeaderboardUser = {
        id: account.id,
        nickname: userData.profile.leaderboardNickname || userData.profile.name,
        avatar: (userData.profile.leaderboardNickname || userData.profile.name).charAt(0),
        attributes: {
          INT: attrs.INT || 0,
          VIT: attrs.VIT || 0,
          CHA: attrs.CHA || 0,
          GOLD: attrs.GOLD || 0,
          WIL: attrs.WIL || 0,
        },
        level: attrs.level || 1,
        totalScore: (attrs.INT || 0) + (attrs.VIT || 0) + (attrs.CHA || 0) + (attrs.GOLD || 0) + (attrs.WIL || 0),
        checkInCount: userData.checkInRecords?.length || 0,
        streakDays: userData.stats?.streakDays || 0,
        recentCheckIns: (userData.checkInRecords || []).slice(-10).map((r: CheckInRecord) => ({
          id: r.id,
          taskTitle: r.taskTitle,
          timestamp: r.timestamp,
          hasPhoto: !!r.photoData,
        })),
        isCurrentUser: isCurrentAccount,
      };
      users.push(localUser);
    }
  });

  // 如果有当前用户数据且不在本地账户列表中（兼容旧逻辑）
  if (currentUserData) {
    const alreadyAdded = users.some(u => u.isCurrentUser);
    if (!alreadyAdded) {
      const currentUser: LeaderboardUser = {
        id: 'current-user',
        nickname: currentUserData.nickname,
        avatar: currentUserData.nickname.charAt(0),
        attributes: currentUserData.attributes,
        level: currentUserData.level,
        totalScore: Object.values(currentUserData.attributes).reduce((a, b) => a + b, 0),
        checkInCount: currentUserData.checkInCount,
        streakDays: currentUserData.streakDays,
        recentCheckIns: currentUserData.recentCheckIns.map(r => ({
          id: r.id,
          taskTitle: r.taskTitle,
          timestamp: r.timestamp,
          hasPhoto: !!r.photoData,
        })),
        isCurrentUser: true,
      };
      users.push(currentUser);
    }
  }

  // 根据类型排序
  const sortedUsers = users.sort((a, b) => {
    switch (type) {
      case 'total':
        return b.totalScore - a.totalScore;
      case 'INT':
        return b.attributes.INT - a.attributes.INT;
      case 'VIT':
        return b.attributes.VIT - a.attributes.VIT;
      case 'CHA':
        return b.attributes.CHA - a.attributes.CHA;
      case 'GOLD':
        return b.attributes.GOLD - a.attributes.GOLD;
      case 'WIL':
        return b.attributes.WIL - a.attributes.WIL;
      case 'streak':
        return b.streakDays - a.streakDays;
      default:
        return b.totalScore - a.totalScore;
    }
  });

  return sortedUsers.slice(0, limit);
}

// 获取用户在排行榜中的排名
export function getUserRank(
  type: LeaderboardType,
  userScore: number
): number {
  const users = getMockUsers();
  
  let higherCount = 0;
  users.forEach(user => {
    let score = 0;
    switch (type) {
      case 'total':
        score = user.totalScore;
        break;
      case 'INT':
        score = user.attributes.INT;
        break;
      case 'VIT':
        score = user.attributes.VIT;
        break;
      case 'CHA':
        score = user.attributes.CHA;
        break;
      case 'GOLD':
        score = user.attributes.GOLD;
        break;
      case 'WIL':
        score = user.attributes.WIL;
        break;
      case 'streak':
        score = user.streakDays;
        break;
    }
    if (score > userScore) {
      higherCount++;
    }
  });

  return higherCount + 1;
}

// 获取排行榜类型的显示名称
export function getLeaderboardTypeName(type: LeaderboardType): string {
  const names: Record<LeaderboardType, string> = {
    total: '综合实力',
    INT: '智力榜',
    VIT: '体质榜',
    CHA: '魅力榜',
    GOLD: '财富榜',
    WIL: '意志榜',
    streak: '连续打卡',
  };
  return names[type];
}

// 获取排行榜类型的图标颜色
export function getLeaderboardTypeColor(type: LeaderboardType): string {
  const colors: Record<LeaderboardType, string> = {
    total: '#2d5f3f',
    INT: '#5a7d8c',
    VIT: '#3d7a54',
    CHA: '#d88e99',
    GOLD: '#d4a832',
    WIL: '#8b6f9f',
    streak: '#f97316',
  };
  return colors[type];
}
