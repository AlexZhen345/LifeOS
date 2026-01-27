export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (stats: AchievementStats) => boolean;
  unlocked: boolean;
}

export interface AchievementStats {
  totalTasksCompleted: number;
  consecutiveDays: number;
  attributes: {
    INT: number;
    VIT: number;
    CHA: number;
    GOLD: number;
    WIL: number;
  };
  goalsCompleted: number;
  level: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    name: '崭露头角',
    icon: '🌱',
    description: '完成第1个任务',
    condition: (stats) => stats.totalTasksCompleted >= 1,
    unlocked: false,
  },
  {
    id: 'consecutive_3_days',
    name: '坚持不懈',
    icon: '🔥',
    description: '连续 3 天完成任务',
    condition: (stats) => stats.consecutiveDays >= 3,
    unlocked: false,
  },
  {
    id: 'total_10_tasks',
    name: '学霸之路',
    icon: '📚',
    description: '累计完成 10 个任务',
    condition: (stats) => stats.totalTasksCompleted >= 10,
    unlocked: false,
  },
  {
    id: 'all_attributes',
    name: '全能发展',
    icon: '🌟',
    description: '5 个属性都 > 0',
    condition: (stats) =>
      stats.attributes.INT > 0 &&
      stats.attributes.VIT > 0 &&
      stats.attributes.CHA > 0 &&
      stats.attributes.GOLD > 0 &&
      stats.attributes.WIL > 0,
    unlocked: false,
  },
  {
    id: 'int_50',
    name: '智者之名',
    icon: '💡',
    description: 'INT 属性达到 50',
    condition: (stats) => stats.attributes.INT >= 50,
    unlocked: false,
  },
  {
    id: 'wil_30',
    name: '铁人意志',
    icon: '💪',
    description: 'WIL 属性达到 30',
    condition: (stats) => stats.attributes.WIL >= 30,
    unlocked: false,
  },
  {
    id: 'goals_5',
    name: '周目达人',
    icon: '🎯',
    description: '完成 5 个目标',
    condition: (stats) => stats.goalsCompleted >= 5,
    unlocked: false,
  },
  {
    id: 'level_5',
    name: '等级提升',
    icon: '⬆️',
    description: '达到 Lv 5',
    condition: (stats) => stats.level >= 5,
    unlocked: false,
  },
];
