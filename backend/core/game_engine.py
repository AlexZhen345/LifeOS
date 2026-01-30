"""
游戏核心引擎
负责经验值、等级、成就等游戏化逻辑
"""
from typing import Dict, Any


class GameEngine:
    """游戏引擎"""
    
    # 等级经验值配置
    LEVEL_EXP_TABLE = {
        1: 0,
        2: 100,
        3: 250,
        4: 500,
        5: 1000,
        6: 2000,
        7: 3500,
        8: 5500,
        9: 8000,
        10: 11000,
    }
    
    @staticmethod
    def calculate_exp_reward(difficulty: int, time_spent: int) -> int:
        """
        计算经验值奖励
        
        Args:
            difficulty: 任务难度 (1-5)
            time_spent: 完成用时（分钟）
            
        Returns:
            获得的经验值
        """
        base_exp = difficulty * 20
        time_bonus = min(time_spent // 5, 20)  # 最多+20经验
        return base_exp + time_bonus
    
    @staticmethod
    def get_level_from_exp(total_exp: int) -> int:
        """
        根据总经验值计算等级
        
        Args:
            total_exp: 总经验值
            
        Returns:
            当前等级
        """
        for level in range(10, 0, -1):
            if total_exp >= GameEngine.LEVEL_EXP_TABLE[level]:
                return level
        return 1
    
    @staticmethod
    def check_level_up(old_exp: int, new_exp: int) -> Dict[str, Any]:
        """
        检查是否升级
        
        Args:
            old_exp: 旧经验值
            new_exp: 新经验值
            
        Returns:
            {"level_up": bool, "old_level": int, "new_level": int}
        """
        old_level = GameEngine.get_level_from_exp(old_exp)
        new_level = GameEngine.get_level_from_exp(new_exp)
        
        return {
            "level_up": new_level > old_level,
            "old_level": old_level,
            "new_level": new_level
        }
    
    @staticmethod
    def check_achievement(user_stats: Dict[str, Any]) -> list:
        """
        检查成就触发
        
        Args:
            user_stats: 用户统计数据
            
        Returns:
            解锁的成就列表
        """
        achievements = []
        
        # 任务完成数成就
        tasks_completed = user_stats.get("tasks_completed", 0)
        if tasks_completed == 1:
            achievements.append({"id": "first_task", "name": "初出茅庐", "desc": "完成第一个任务"})
        elif tasks_completed == 10:
            achievements.append({"id": "task_master", "name": "任务大师", "desc": "完成10个任务"})
        elif tasks_completed == 50:
            achievements.append({"id": "task_legend", "name": "传奇执行者", "desc": "完成50个任务"})
        
        # 连续签到成就
        streak_days = user_stats.get("streak_days", 0)
        if streak_days == 7:
            achievements.append({"id": "week_warrior", "name": "一周勇士", "desc": "连续签到7天"})
        elif streak_days == 30:
            achievements.append({"id": "month_hero", "name": "月度英雄", "desc": "连续签到30天"})
        
        return achievements
