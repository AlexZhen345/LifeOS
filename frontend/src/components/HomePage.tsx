import { useState, useEffect } from 'react';
import React from 'react';
import { Character } from '../App';
import { Plus, ChevronDown, Brain, Heart, Sparkle, Coins, Flame, Check, X, Star, Calendar, ChevronLeft, ChevronRight, Users, Sun } from 'lucide-react';
import { TaskCreationModal, Task } from './TaskCreationModal';
import { DayPlannerModal, ScheduleItem } from './DayPlannerModal';
import { DayScheduleView } from './DayScheduleView';
import { FloatingReward } from './FloatingReward';
import { LevelUpModal } from './LevelUpModal';
import { GoalCompleteModal } from './GoalCompleteModal';
import { AchievementUnlockModal } from './AchievementUnlockModal';
import { Achievement } from './achievements';
import { PhotoCheckIn } from './PhotoCheckIn';
import { addTasksToHistory, addCheckInRecord, getUserData, saveUserData, getCurrentAccountId } from '../services/userDatabase';
import { Calendar as CalendarPicker } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface HomePageProps {
  character: Character;
  onUpdateCharacter: (character: Character) => void;
  onTaskCompleted: () => void;
  onGoalCompleted: () => void;
  achievements: Achievement[];
  onAchievementsUpdate: (achievements: Achievement[]) => void;
  onSwitchAccount?: () => void;
}

interface FloatingRewardData {
  id: string;
  rewards: Record<string, number>;
  x: number;
  y: number;
}

const ATTRIBUTE_INFO = {
  INT: { name: '智力', icon: Brain, color: 'text-[#5a7d8c]', bgColor: 'bg-[#5a7d8c]/10' },
  VIT: { name: '体质', icon: Heart, color: 'text-[#3d7a54]', bgColor: 'bg-[#3d7a54]/10' },
  CHA: { name: '魅力', icon: Sparkle, color: 'text-[#d88e99]', bgColor: 'bg-[#d88e99]/10' },
  GOLD: { name: '财富', icon: Coins, color: 'text-[#d4a832]', bgColor: 'bg-[#d4a832]/10' },
  WIL: { name: '意志', icon: Flame, color: 'text-[#8b6f9f]', bgColor: 'bg-[#8b6f9f]/10' },
};

const XP_PER_TASK = 20;

// 获取带账户前缀的日程存储 key
const getScheduleStorageKey = (dateStr: string): string => {
  const accountId = getCurrentAccountId();
  const prefix = accountId ? `schedule_${accountId}_` : 'schedule_';
  return prefix + dateStr;
};

// 格式化日期为 YYYY-MM-DD（使用本地时间，避免 toISOString 的时区问题）
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化日期显示
const formatDateDisplay = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return '今天';
  if (isSameDay(date, yesterday)) return '昨天';
  if (isSameDay(date, tomorrow)) return '明天';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekDays[date.getDay()]}`;
};

export function HomePage({ 
  character, 
  onUpdateCharacter, 
  onTaskCompleted, 
  onGoalCompleted,
  achievements,
  onAchievementsUpdate,
  onSwitchAccount
}: HomePageProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDayPlanner, setShowDayPlanner] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [daySchedule, setDaySchedule] = useState<ScheduleItem[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardData[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [showGoalComplete, setShowGoalComplete] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [showPhotoCheckIn, setShowPhotoCheckIn] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [pendingEvent, setPendingEvent] = useState<React.MouseEvent | null>(null);
  const [pendingScheduleItemId, setPendingScheduleItemId] = useState<string | null>(null); // 从日程触发的打卡
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 从数据库加载任务
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      // 从任务历史记录中加载未完成的任务
      const activeTasks = userData.taskHistory
        .filter(task => !task.completed)
        .map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          duration: task.duration,
          scheduledDate: task.scheduledDate,
          rewards: task.rewards,
          completed: task.completed,
        }));
      setTasks(activeTasks);
    }
  }, []);

  // 加载选择日期的日程
  useEffect(() => {
    const dateStr = formatDateToString(selectedDate);
    const storageKey = getScheduleStorageKey(dateStr);
    const savedSchedule = localStorage.getItem(storageKey);
    
    if (savedSchedule) {
      try {
        setDaySchedule(JSON.parse(savedSchedule));
      } catch (e) {
        console.error('加载日程失败:', e);
        setDaySchedule([]);
      }
    } else {
      setDaySchedule([]);
    }
  }, [selectedDate]);

  // 保存日程到 localStorage（按日期存储，带账户隔离）
  const handleSaveSchedule = (schedule: ScheduleItem[], targetDate: string) => {
    const storageKey = getScheduleStorageKey(targetDate);
    localStorage.setItem(storageKey, JSON.stringify(schedule));
    // 如果保存的是当前选择日期的日程，更新状态
    const selectedDateStr = formatDateToString(selectedDate);
    if (targetDate === selectedDateStr) {
      setDaySchedule(schedule);
    }
  };

  // 清空日程
  const handleClearSchedule = () => {
    const dateStr = formatDateToString(selectedDate);
    const storageKey = getScheduleStorageKey(dateStr);
    localStorage.removeItem(storageKey);
    setDaySchedule([]);
  };

  // 切换日程项完成状态（同步任务）
  const handleToggleScheduleItem = (itemId: string, linkedTaskId?: string) => {
    const scheduleItem = daySchedule.find(i => i.id === itemId);
    if (!scheduleItem) return;
    
    const willBeCompleted = !scheduleItem.completed;
    
    // 如果有关联任务且要完成，需要触发打卡流程
    if (linkedTaskId && willBeCompleted) {
      const task = tasks.find(t => t.id === linkedTaskId);
      if (task && !task.completed) {
        // 记录是从日程触发的，设置 pending 状态
        setPendingScheduleItemId(itemId);
        setPendingTaskId(linkedTaskId);
        setPendingEvent({ target: document.body } as unknown as React.MouseEvent);
        setShowPhotoCheckIn(true);
        return;
      }
    }
    
    // 非任务项或取消完成，直接更新日程状态
    const updatedSchedule = daySchedule.map(item => 
      item.id === itemId ? { ...item, completed: willBeCompleted } : item
    );
    setDaySchedule(updatedSchedule);
    const dateStr = formatDateToString(selectedDate);
    const storageKey = getScheduleStorageKey(dateStr);
    localStorage.setItem(storageKey, JSON.stringify(updatedSchedule));
    
    // 如果有关联任务且取消完成，同步取消任务
    if (linkedTaskId && !willBeCompleted) {
      const task = tasks.find(t => t.id === linkedTaskId);
      if (task && task.completed) {
        const syntheticEvent = { target: document.body } as unknown as React.MouseEvent;
        completeTaskLogic(linkedTaskId, syntheticEvent, null);
      }
    }
  };

  // 删除日程项
  const handleDeleteScheduleItem = (itemId: string) => {
    const updatedSchedule = daySchedule.filter(item => item.id !== itemId);
    setDaySchedule(updatedSchedule);
    const dateStr = formatDateToString(selectedDate);
    const storageKey = getScheduleStorageKey(dateStr);
    localStorage.setItem(storageKey, JSON.stringify(updatedSchedule));
  };

  // 保存任务到数据库
  const saveTasksToDatabase = (updatedTasks: Task[]) => {
    const userData = getUserData();
    if (userData) {
      // 更新任务历史记录中的任务完成状态
      updatedTasks.forEach(task => {
        const historyTask = userData.taskHistory.find(t => t.id === task.id);
        if (historyTask) {
          historyTask.completed = task.completed;
        }
      });
      saveUserData(userData);
    }
  };

  const today = formatDateToString(new Date());
  const selectedDateStr = formatDateToString(selectedDate);
  const displayTasks = tasks.filter(t => t.scheduledDate === selectedDateStr);
  const isToday = selectedDateStr === today;
  const completedCount = displayTasks.filter((t) => t.completed).length;
  const totalCount = displayTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const xpProgress = character.xpForNextLevel > 0 ? (character.xp / character.xpForNextLevel) * 100 : 0;

  useEffect(() => {
    if (totalCount > 0 && completedCount === totalCount && completedCount > prevCompletedCount) {
      setShowGoalComplete(true);
      onGoalCompleted();
    }
    setPrevCompletedCount(completedCount);
  }, [completedCount, totalCount]);

  const handleCreateTasks = (newTasks: Task[]) => {
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
    // 将任务添加到历史记录
    const historyTasks = newTasks.map(task => ({
      title: task.title,
      description: task.description,
      scheduledDate: task.scheduledDate,
      duration: task.duration,
      completed: false,
      rewards: task.rewards,
    }));
    addTasksToHistory(historyTasks);
  };

  const calculateLevelUp = (currentXP: number, currentLevel: number, currentXPForNext: number) => {
    let xp = currentXP;
    let level = currentLevel;
    let xpForNext = currentXPForNext;
    let leveledUp = false;

    while (xp >= xpForNext) {
      xp -= xpForNext;
      level += 1;
      xpForNext = level * 100;
      leveledUp = true;
    }

    return { xp, level, xpForNext, leveledUp };
  };

  const handleToggleTask = (taskId: string, event: React.MouseEvent) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // 如果是完成任务，先显示打卡界面
    if (newCompleted) {
      setPendingTaskId(taskId);
      setPendingEvent(event);
      setShowPhotoCheckIn(true);
      return;
    }

    // 取消完成任务
    completeTaskLogic(taskId, event, null);
  };

  // 实际完成任务的逻辑
  const completeTaskLogic = (taskId: string, event: React.MouseEvent | null, photoData: string | null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t));
    setTasks(updatedTasks);

    // 保存到数据库
    saveTasksToDatabase(updatedTasks);
    
    // 同步更新日程中关联的项目
    const linkedScheduleItem = daySchedule.find(item => item.linkedTaskId === taskId);
    if (linkedScheduleItem && linkedScheduleItem.completed !== newCompleted) {
      const updatedSchedule = daySchedule.map(item => 
        item.linkedTaskId === taskId ? { ...item, completed: newCompleted } : item
      );
      setDaySchedule(updatedSchedule);
      const dateStr = formatDateToString(selectedDate);
      const storageKey = getScheduleStorageKey(dateStr);
      localStorage.setItem(storageKey, JSON.stringify(updatedSchedule));
    }

    const updatedCharacter = { ...character };
    
    Object.entries(task.rewards).forEach(([key, value]) => {
      const attrKey = key as keyof typeof character.attributes;
      if (newCompleted) {
        updatedCharacter.attributes[attrKey] += Number(value);
      } else {
        updatedCharacter.attributes[attrKey] -= Number(value);
      }
    });

    if (newCompleted) {
      updatedCharacter.xp += XP_PER_TASK;
      onTaskCompleted();
      
      // 添加打卡记录
      addCheckInRecord({
        taskId: task.id,
        taskTitle: task.title,
        photoData: photoData || undefined,
        timestamp: new Date().toISOString(),
        rewards: task.rewards,
      });
      
      const levelUpResult = calculateLevelUp(
        updatedCharacter.xp,
        updatedCharacter.level,
        updatedCharacter.xpForNextLevel
      );

      updatedCharacter.xp = levelUpResult.xp;
      updatedCharacter.level = levelUpResult.level;
      updatedCharacter.xpForNextLevel = levelUpResult.xpForNext;

      if (levelUpResult.leveledUp) {
        setNewLevel(levelUpResult.level);
        setShowLevelUp(true);
      }

      const newlyUnlocked = achievements.find((a) => !a.unlocked && a.id === 'first_task');
      if (newlyUnlocked) {
        const updatedAchievements = achievements.map((a) =>
          a.id === 'first_task' ? { ...a, unlocked: true } : a
        );
        onAchievementsUpdate(updatedAchievements);
        setUnlockedAchievement(newlyUnlocked);
        setShowAchievementUnlock(true);
      }
    } else {
      updatedCharacter.xp = Math.max(0, updatedCharacter.xp - XP_PER_TASK);
    }

    onUpdateCharacter(updatedCharacter);

    if (newCompleted && event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const rewards = { ...task.rewards, XP: XP_PER_TASK };
      const newFloatingReward: FloatingRewardData = {
        id: `reward-${Date.now()}`,
        rewards,
        x: rect.left + rect.width / 2,
        y: rect.top,
      };
      setFloatingRewards([...floatingRewards, newFloatingReward]);
    }
  };

  // 处理打卡确认
  const handlePhotoCheckInConfirm = (photoData: string | null) => {
    setShowPhotoCheckIn(false);
    if (pendingTaskId && pendingEvent) {
      completeTaskLogic(pendingTaskId, pendingEvent, photoData);
      
      // 如果是从日程触发的打卡，同时更新日程项状态
      if (pendingScheduleItemId) {
        const updatedSchedule = daySchedule.map(item => 
          item.id === pendingScheduleItemId ? { ...item, completed: true } : item
        );
        setDaySchedule(updatedSchedule);
        const dateStr = formatDateToString(selectedDate);
        const storageKey = getScheduleStorageKey(dateStr);
        localStorage.setItem(storageKey, JSON.stringify(updatedSchedule));
      }
    }
    setPendingTaskId(null);
    setPendingEvent(null);
    setPendingScheduleItemId(null);
  };

  // 处理打卡取消
  const handlePhotoCheckInCancel = () => {
    setShowPhotoCheckIn(false);
    setPendingTaskId(null);
    setPendingEvent(null);
    setPendingScheduleItemId(null);
  };

  const handleRemoveFloatingReward = (id: string) => {
    setFloatingRewards(floatingRewards.filter((r) => r.id !== id));
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.completed) {
      const updatedCharacter = { ...character };
      Object.entries(task.rewards).forEach(([key, value]) => {
        const attrKey = key as keyof typeof character.attributes;
        updatedCharacter.attributes[attrKey] -= Number(value);
      });
      updatedCharacter.xp = Math.max(0, updatedCharacter.xp - XP_PER_TASK);
      onUpdateCharacter(updatedCharacter);
    }
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    
    // 从数据库中移除任务（标记为已完成并从活动任务中移除）
    const userData = getUserData();
    if (userData) {
      const taskIndex = userData.taskHistory.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        // 如果该任务在历史记录中存在，则更新其状态
        userData.taskHistory[taskIndex].completed = true; // 标记为已完成
        saveUserData(userData);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-[#e8e3d6]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {/* 用户头像/切换按钮 */}
              <button
                onClick={onSwitchAccount}
                className="w-11 h-11 bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] rounded-xl flex items-center justify-center text-white font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                title="切换账户"
              >
                {character.name.charAt(0).toUpperCase()}
              </button>
              <div>
                <h1 className="text-2xl font-light text-[#1a1a1a] mb-1">{character.name}</h1>
                <div className="flex items-center gap-3 text-sm text-[#4a4a4a]">
                  <span>等级 {character.level}</span>
                  <span className="text-[#e8e3d6]">·</span>
                  <span>{character.xp} / {character.xpForNextLevel} XP</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDayPlanner(true)}
                className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg border border-amber-400"
                style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }}
              >
                <Sun className="w-4 h-4 text-white" strokeWidth={2} />
                <span className="font-medium text-white">规划我的一天</span>
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">新建任务</span>
              </button>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-8">
            <div className="h-2.5 bg-[#f5f1e8] rounded-full overflow-hidden border border-[#e8e3d6]">
              <div
                className="h-full bg-gradient-to-r from-[#2d5f3f] to-[#3d7a54] rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(ATTRIBUTE_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <div key={key} className="text-center">
                  <div className={`inline-flex items-center justify-center w-11 h-11 ${info.bgColor} rounded-xl mb-2 border border-[#e8e3d6]`}>
                    <Icon className={`w-5 h-5 ${info.color}`} strokeWidth={1.5} />
                  </div>
                  <div className="text-xs text-[#737373] mb-1">{key}</div>
                  <div className="text-lg font-light text-[#1a1a1a]">
                    {character.attributes[key as keyof typeof character.attributes]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-24">
        {/* 任务标题与日期选择 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-[#1a1a1a]">
              {isToday ? '今日任务' : formatDateDisplay(selectedDate)}
            </h2>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#4a4a4a] hover:text-[#1a1a1a] bg-white/90 border border-[#e8e3d6] hover:border-[#2d5f3f]/30 rounded-xl transition-all">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span>选择日期</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-[#e8e3d6]" align="start">
                <div className="p-3">
                  <CalendarPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }
                    }}
                    defaultMonth={selectedDate}
                  />
                  <button
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowDatePicker(false);
                    }}
                    className="w-full mt-2 text-sm text-[#2d5f3f] hover:text-[#3d7a54] py-2 border border-[#e8e3d6] rounded-lg hover:bg-[#f5f1e8] transition-all"
                  >
                    返回今天
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {totalCount > 0 && (
            <span className="text-sm text-[#737373]">{completedCount}/{totalCount} 完成</span>
          )}
        </div>

        {/* 进度条 */}
        {totalCount > 0 && (
          <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#737373]">完成进度</span>
              <span className="text-xs text-[#4a4a4a]">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-[#f5f1e8] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2d5f3f] to-[#3d7a54] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 日程视图 - 选择日期有日程时显示 */}
        {daySchedule.length > 0 && (
          <DayScheduleView
            schedule={daySchedule}
            onToggleComplete={handleToggleScheduleItem}
            onDeleteItem={handleDeleteScheduleItem}
            onClearSchedule={handleClearSchedule}
          />
        )}

        {/* 任务列表 */}
        <div className="space-y-3">
          {displayTasks.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#e8e3d6] rounded-3xl p-12 text-center shadow-sm">
              <div className="max-w-sm mx-auto space-y-4">
                <div className="w-14 h-14 bg-[#faf7f0] border-2 border-[#e8e3d6] rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-[#a0a0a0]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[#1a1a1a] mb-2">
                    {isToday ? '今天还没有任务' : `${formatDateDisplay(selectedDate)}没有任务`}
                  </h3>
                  <p className="text-sm text-[#4a4a4a]">
                    {isToday ? '点击上方按钮创建新任务' : '点击上方日期选择其他日期'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            displayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white/90 backdrop-blur-sm border-2 rounded-3xl transition-all shadow-sm ${
                    task.completed
                      ? 'border-[#e8e3d6] opacity-60'
                      : 'border-[#e8e3d6] hover:border-[#2d5f3f]/30 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={(e) => handleToggleTask(task.id, e)}
                        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all mt-0.5 ${
                          task.completed
                            ? 'bg-[#2d5f3f] border-[#2d5f3f]'
                            : 'border-[#a0a0a0] hover:border-[#2d5f3f]'
                        }`}
                      >
                        {task.completed && <Check className="w-full h-full text-white p-0.5" strokeWidth={3} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base mb-2 ${
                            task.completed ? 'line-through text-[#a0a0a0]' : 'text-[#1a1a1a]'
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-[#737373]">{task.duration} 分钟</span>
                          <span className="text-xs text-[#8b6f9f]">+{XP_PER_TASK} XP</span>
                          {Object.entries(task.rewards).map(([key, value]) => {
                            const info = ATTRIBUTE_INFO[key as keyof typeof ATTRIBUTE_INFO];
                            const Icon = info?.icon;
                            return Icon ? (
                              <span key={key} className={`inline-flex items-center gap-1 text-xs ${info.color}`}>
                                <Icon className="w-3 h-3" strokeWidth={2} />
                                +{value}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        className="flex-shrink-0 text-[#a0a0a0] hover:text-[#4a4a4a] transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedTaskId === task.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {expandedTaskId === task.id && (
                      <div className="mt-6 pt-6 border-t-2 border-[#f5f1e8]">
                        {task.description && (
                          <p className="text-sm text-[#4a4a4a] mb-4">{task.description}</p>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          删除任务
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
      </main>

      {/* Modals */}
      {showTaskModal && (
        <TaskCreationModal onClose={() => setShowTaskModal(false)} onCreateTasks={handleCreateTasks} />
      )}

      {showDayPlanner && (
        <DayPlannerModal 
          onClose={() => setShowDayPlanner(false)} 
          onSaveSchedule={handleSaveSchedule}
          existingTasks={displayTasks.filter(t => !t.completed)}
          targetDate={selectedDate}
        />
      )}

      {showLevelUp && (
        <LevelUpModal newLevel={newLevel} onClose={() => setShowLevelUp(false)} />
      )}

      {showGoalComplete && (
        <GoalCompleteModal onClose={() => setShowGoalComplete(false)} />
      )}

      {showAchievementUnlock && unlockedAchievement && (
        <AchievementUnlockModal
          achievement={unlockedAchievement}
          onClose={() => setShowAchievementUnlock(false)}
        />
      )}

      {/* Photo Check-in Modal */}
      {showPhotoCheckIn && pendingTaskId && (
        <PhotoCheckIn
          taskTitle={tasks.find(t => t.id === pendingTaskId)?.title || ''}
          onConfirm={handlePhotoCheckInConfirm}
          onCancel={handlePhotoCheckInCancel}
        />
      )}

      {floatingRewards.map((reward) => (
        <div key={reward.id}>
          <FloatingReward
            rewards={reward.rewards}
            startX={reward.x}
            startY={reward.y}
            onComplete={() => handleRemoveFloatingReward(reward.id)}
          />
        </div>
      ))}
    </div>
  );
}
