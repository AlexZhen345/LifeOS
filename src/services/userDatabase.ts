// 用户数据库服务 - 使用 localStorage 存储用户信息
// 支持多账户隔离存储

// ==================== 账户管理相关 ====================

// 账户信息
export interface AccountInfo {
  id: string;          // 账户唯一ID
  name: string;        // 账户名称（显示用）
  createdAt: string;   // 创建时间
  lastActiveAt: string; // 最后活跃时间
}

// 账户列表存储 key
const ACCOUNTS_KEY = 'quest_accounts_list';
// 当前账户 ID 存储 key
const CURRENT_ACCOUNT_KEY = 'quest_current_account';
// 用户数据存储 key 前缀
const USER_DATA_PREFIX = 'quest_user_data_';

// 获取所有账户列表
export function getAccounts(): AccountInfo[] {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取账户列表失败:', error);
    return [];
  }
}

// 保存账户列表
function saveAccounts(accounts: AccountInfo[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('保存账户列表失败:', error);
  }
}

// 获取当前账户ID
export function getCurrentAccountId(): string | null {
  try {
    return localStorage.getItem(CURRENT_ACCOUNT_KEY);
  } catch (error) {
    console.error('读取当前账户ID失败:', error);
    return null;
  }
}

// 设置当前账户ID
export function setCurrentAccountId(accountId: string): void {
  try {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, accountId);
    // 更新账户最后活跃时间
    const accounts = getAccounts();
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      account.lastActiveAt = new Date().toISOString();
      saveAccounts(accounts);
    }
  } catch (error) {
    console.error('设置当前账户ID失败:', error);
  }
}

// 创建新账户
export function createAccount(name: string): AccountInfo {
  const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newAccount: AccountInfo = {
    id: accountId,
    name,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  
  const accounts = getAccounts();
  accounts.push(newAccount);
  saveAccounts(accounts);
  
  // 设置为当前账户
  setCurrentAccountId(accountId);
  
  // 初始化该账户的用户数据
  const userData = getDefaultUserData(name);
  saveUserDataForAccount(accountId, userData);
  
  return newAccount;
}

// 删除账户
export function deleteAccount(accountId: string): boolean {
  try {
    const accounts = getAccounts();
    const filteredAccounts = accounts.filter(a => a.id !== accountId);
    
    if (filteredAccounts.length === accounts.length) {
      return false; // 账户不存在
    }
    
    saveAccounts(filteredAccounts);
    
    // 删除该账户的用户数据
    localStorage.removeItem(`${USER_DATA_PREFIX}${accountId}`);
    
    // 如果删除的是当前账户，切换到其他账户或清空
    if (getCurrentAccountId() === accountId) {
      if (filteredAccounts.length > 0) {
        setCurrentAccountId(filteredAccounts[0].id);
      } else {
        localStorage.removeItem(CURRENT_ACCOUNT_KEY);
      }
    }
    
    return true;
  } catch (error) {
    console.error('删除账户失败:', error);
    return false;
  }
}

// 切换账户
export function switchAccount(accountId: string): boolean {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === accountId);
  
  if (!account) {
    return false;
  }
  
  setCurrentAccountId(accountId);
  return true;
}

// 获取当前账户的存储 key
function getCurrentStorageKey(): string {
  const accountId = getCurrentAccountId();
  if (!accountId) {
    // 兼容旧版本：如果没有账户系统，使用默认 key
    return 'quest_user_data';
  }
  return `${USER_DATA_PREFIX}${accountId}`;
}

// 为指定账户保存用户数据
function saveUserDataForAccount(accountId: string, userData: UserData): void {
  try {
    userData.updatedAt = new Date().toISOString();
    localStorage.setItem(`${USER_DATA_PREFIX}${accountId}`, JSON.stringify(userData));
  } catch (error) {
    console.error('保存用户数据失败:', error);
  }
}

// 迁移旧数据到新账户系统
export function migrateOldData(): AccountInfo | null {
  const oldData = localStorage.getItem('quest_user_data');
  if (!oldData) return null;
  
  try {
    const userData: UserData = JSON.parse(oldData);
    const name = userData.profile?.name || '用户';
    
    // 创建新账户
    const account = createAccount(name);
    
    // 保存旧数据到新账户
    saveUserDataForAccount(account.id, userData);
    
    // 删除旧数据
    localStorage.removeItem('quest_user_data');
    
    return account;
  } catch (error) {
    console.error('迁移旧数据失败:', error);
    return null;
  }
}

// ==================== 用户数据相关 ====================

// 用户基础信息
export interface UserProfile {
  name: string;
  age?: number;
  occupation?: string; // 职业
  wakeUpTime?: string; // 起床时间 HH:MM
  sleepTime?: string; // 睡觉时间 HH:MM
  dailyAvailableHours?: number; // 每日可用学习/工作时间（小时）
  preferredWorkPeriods?: ('morning' | 'afternoon' | 'evening' | 'night')[]; // 偏好的工作时段
  joinLeaderboard?: boolean; // 是否加入天梯榜
  leaderboardNickname?: string; // 天梯榜昵称（可不同于真名）
}

// 技能与偏好
export interface UserSkills {
  skills: string[]; // 已掌握的技能
  learningGoals: string[]; // 学习目标
  strengths: string[]; // 擅长领域
  weaknesses: string[]; // 薄弱领域
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic'; // 学习风格
  preferredTaskDuration?: number; // 偏好的单个任务时长（分钟）
}

// 打卡记录
export interface CheckInRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  photoData?: string; // base64 图片数据（缩略图）
  timestamp: string;
  rewards: Record<string, number>;
}

// 历史任务记录
export interface TaskHistory {
  id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  duration: number; // 预计时长
  actualDuration?: number; // 实际时长
  completed: boolean;
  category?: string; // 任务类别
  rewards: Record<string, number>;
  checkInPhoto?: string; // 打卡照片
}

// 历史统计数据
export interface UserStats {
  totalTasksCreated: number;
  totalTasksCompleted: number;
  averageCompletionRate: number; // 完成率
  averageDelayDays: number; // 平均拖延天数
  mostProductiveTime?: string; // 最高效时段
  commonDelayCategories: string[]; // 常见拖延类别
  streakDays: number; // 连续完成天数
  lastActiveDate?: string;
}

// 完整用户数据
export interface UserData {
  profile: UserProfile;
  skills: UserSkills;
  taskHistory: TaskHistory[];
  checkInRecords: CheckInRecord[]; // 打卡记录
  stats: UserStats;
  attributes: UserAttributes; // 用户属性值（用于排行榜）
  createdAt: string;
  updatedAt: string;
}

// 用户属性值
export interface UserAttributes {
  INT: number;
  VIT: number;
  CHA: number;
  GOLD: number;
  WIL: number;
  level: number;
  xp: number;
}

// 默认用户数据
const getDefaultUserData = (name: string): UserData => ({
  profile: {
    name,
    dailyAvailableHours: 4,
    preferredWorkPeriods: ['morning', 'afternoon'],
    joinLeaderboard: false,
    leaderboardNickname: name,
  },
  skills: {
    skills: [],
    learningGoals: [],
    strengths: [],
    weaknesses: [],
    preferredTaskDuration: 60,
  },
  taskHistory: [],
  checkInRecords: [],
  stats: {
    totalTasksCreated: 0,
    totalTasksCompleted: 0,
    averageCompletionRate: 0,
    averageDelayDays: 0,
    commonDelayCategories: [],
    streakDays: 0,
  },
  attributes: {
    INT: 0,
    VIT: 0,
    CHA: 0,
    GOLD: 0,
    WIL: 0,
    level: 1,
    xp: 0,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// 获取用户数据
export function getUserData(): UserData | null {
  try {
    const data = localStorage.getItem(getCurrentStorageKey());
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return null;
  }
}

// 初始化用户数据
export function initUserData(name: string): UserData {
  const userData = getDefaultUserData(name);
  saveUserData(userData);
  return userData;
}

// 保存用户数据
export function saveUserData(userData: UserData): void {
  try {
    userData.updatedAt = new Date().toISOString();
    localStorage.setItem(getCurrentStorageKey(), JSON.stringify(userData));
  } catch (error) {
    console.error('保存用户数据失败:', error);
  }
}

// 更新用户基础信息
export function updateUserProfile(profile: Partial<UserProfile>): void {
  const userData = getUserData();
  if (userData) {
    userData.profile = { ...userData.profile, ...profile };
    saveUserData(userData);
  }
}

// 更新用户技能信息
export function updateUserSkills(skills: Partial<UserSkills>): void {
  const userData = getUserData();
  if (userData) {
    userData.skills = { ...userData.skills, ...skills };
    saveUserData(userData);
  }
}

// 添加任务到历史记录
export function addTaskToHistory(task: Omit<TaskHistory, 'id'>): void {
  const userData = getUserData();
  if (userData) {
    const newTask: TaskHistory = {
      ...task,
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    userData.taskHistory.push(newTask);
    userData.stats.totalTasksCreated += 1;
    saveUserData(userData);
  }
}

// 更新任务完成状态
export function updateTaskCompletion(taskId: string, completed: boolean, actualDuration?: number): void {
  const userData = getUserData();
  if (userData) {
    const task = userData.taskHistory.find(t => t.id === taskId);
    if (task) {
      task.completed = completed;
      if (completed) {
        task.completedDate = new Date().toISOString().split('T')[0];
        task.actualDuration = actualDuration;
        userData.stats.totalTasksCompleted += 1;
      }
      updateStats(userData);
      saveUserData(userData);
    }
  }
}

// 批量添加任务到历史
export function addTasksToHistory(tasks: Omit<TaskHistory, 'id'>[]): void {
  const userData = getUserData();
  if (userData) {
    tasks.forEach(task => {
      const newTask: TaskHistory = {
        ...task,
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      userData.taskHistory.push(newTask);
    });
    userData.stats.totalTasksCreated += tasks.length;
    saveUserData(userData);
  }
}

// 更新统计数据
function updateStats(userData: UserData): void {
  const { taskHistory, stats } = userData;
  
  if (taskHistory.length === 0) return;

  // 计算完成率
  const completedTasks = taskHistory.filter(t => t.completed);
  stats.averageCompletionRate = completedTasks.length / taskHistory.length;

  // 计算平均拖延天数
  const delayedTasks = completedTasks.filter(t => {
    if (!t.completedDate) return false;
    return t.completedDate > t.scheduledDate;
  });
  
  if (delayedTasks.length > 0) {
    const totalDelayDays = delayedTasks.reduce((sum, t) => {
      const scheduled = new Date(t.scheduledDate);
      const completed = new Date(t.completedDate!);
      const diffDays = Math.floor((completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    stats.averageDelayDays = totalDelayDays / delayedTasks.length;
  }

  // 更新最后活跃日期
  stats.lastActiveDate = new Date().toISOString().split('T')[0];
}

// 生成 AI 上下文摘要
export function generateAIContext(): string {
  const userData = getUserData();
  if (!userData) return '';

  const { profile, skills, stats } = userData;
  
  let context = `用户信息：\n`;
  
  // 基础信息
  if (profile.name) context += `- 姓名：${profile.name}\n`;
  if (profile.age) context += `- 年龄：${profile.age}岁\n`;
  if (profile.occupation) context += `- 职业：${profile.occupation}\n`;
  if (profile.dailyAvailableHours) context += `- 每日可用时间：${profile.dailyAvailableHours}小时\n`;
  if (profile.wakeUpTime && profile.sleepTime) {
    context += `- 作息时间：${profile.wakeUpTime} - ${profile.sleepTime}\n`;
  }
  if (profile.preferredWorkPeriods && profile.preferredWorkPeriods.length > 0) {
    const periodNames: Record<string, string> = {
      morning: '上午',
      afternoon: '下午',
      evening: '傍晚',
      night: '晚上',
    };
    const periods = profile.preferredWorkPeriods.map(p => periodNames[p]).join('、');
    context += `- 偏好工作时段：${periods}\n`;
  }

  // 技能信息
  if (skills.skills.length > 0) {
    context += `\n已掌握技能：${skills.skills.join('、')}\n`;
  }
  if (skills.learningGoals.length > 0) {
    context += `学习目标：${skills.learningGoals.join('、')}\n`;
  }
  if (skills.strengths.length > 0) {
    context += `擅长领域：${skills.strengths.join('、')}\n`;
  }
  if (skills.weaknesses.length > 0) {
    context += `薄弱领域：${skills.weaknesses.join('、')}\n`;
  }
  if (skills.preferredTaskDuration) {
    context += `偏好任务时长：${skills.preferredTaskDuration}分钟\n`;
  }

  // 历史统计
  if (stats.totalTasksCreated > 0) {
    context += `\n历史数据：\n`;
    context += `- 总任务数：${stats.totalTasksCreated}\n`;
    context += `- 完成率：${Math.round(stats.averageCompletionRate * 100)}%\n`;
    if (stats.averageDelayDays > 0) {
      context += `- 平均拖延：${stats.averageDelayDays.toFixed(1)}天\n`;
    }
    if (stats.streakDays > 0) {
      context += `- 连续完成：${stats.streakDays}天\n`;
    }
  }

  return context;
}

// 获取最近的任务历史（用于 AI 参考）
export function getRecentTaskHistory(limit: number = 20): TaskHistory[] {
  const userData = getUserData();
  if (!userData) return [];
  
  return userData.taskHistory
    .slice(-limit)
    .reverse();
}

// 清除当前账户的用户数据
export function clearUserData(): void {
  localStorage.removeItem(getCurrentStorageKey());
}

// 添加打卡记录
export function addCheckInRecord(record: Omit<CheckInRecord, 'id'>): void {
  const userData = getUserData();
  if (userData) {
    // 如果没有 checkInRecords 数组，初始化它
    if (!userData.checkInRecords) {
      userData.checkInRecords = [];
    }
    const newRecord: CheckInRecord = {
      ...record,
      id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    userData.checkInRecords.push(newRecord);
    saveUserData(userData);
  }
}

// 获取打卡记录
export function getCheckInRecords(limit: number = 50): CheckInRecord[] {
  const userData = getUserData();
  if (!userData || !userData.checkInRecords) return [];
  
  return userData.checkInRecords
    .slice(-limit)
    .reverse();
}

// 更新用户属性值（同步角色属性）
export function updateUserAttributes(attributes: Partial<UserAttributes>): void {
  const userData = getUserData();
  if (userData) {
    // 如果没有 attributes 对象，初始化它
    if (!userData.attributes) {
      userData.attributes = {
        INT: 0,
        VIT: 0,
        CHA: 0,
        GOLD: 0,
        WIL: 0,
        level: 1,
        xp: 0,
      };
    }
    userData.attributes = { ...userData.attributes, ...attributes };
    saveUserData(userData);
  }
}

// 设置天梯榜参与状态
export function setLeaderboardParticipation(join: boolean, nickname?: string): void {
  const userData = getUserData();
  if (userData) {
    userData.profile.joinLeaderboard = join;
    if (nickname) {
      userData.profile.leaderboardNickname = nickname;
    }
    saveUserData(userData);
  }
}

// 获取用于天梯榜的用户数据
export function getLeaderboardData(): {
  nickname: string;
  attributes: UserAttributes;
  checkInCount: number;
  streakDays: number;
  recentCheckIns: CheckInRecord[];
} | null {
  const userData = getUserData();
  if (!userData || !userData.profile.joinLeaderboard) return null;
  
  return {
    nickname: userData.profile.leaderboardNickname || userData.profile.name,
    attributes: userData.attributes || {
      INT: 0, VIT: 0, CHA: 0, GOLD: 0, WIL: 0, level: 1, xp: 0
    },
    checkInCount: userData.checkInRecords?.length || 0,
    streakDays: userData.stats.streakDays,
    recentCheckIns: (userData.checkInRecords || []).slice(-10).reverse(),
  };
}
