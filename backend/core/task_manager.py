"""
任务管理器
负责任务的创建、完成、统计等逻辑
"""
from typing import Dict, List, Any
from datetime import datetime


class TaskManager:
    """任务管理器（临时内存存储，后续可换成数据库）"""
    
    def __init__(self):
        self.tasks: Dict[str, List[Dict]] = {}  # {user_id: [tasks]}
        self.user_stats: Dict[str, Dict] = {}   # {user_id: stats}
    
    def create_task(self, user_id: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        创建任务
        
        Args:
            user_id: 用户ID
            task_data: 任务数据
            
        Returns:
            创建的任务
        """
        if user_id not in self.tasks:
            self.tasks[user_id] = []
        
        task = {
            "id": f"task_{len(self.tasks[user_id]) + 1}",
            "title": task_data.get("title"),
            "description": task_data.get("description"),
            "difficulty": task_data.get("difficulty", 3),
            "estimated_time": task_data.get("estimated_time", 30),
            "reward_exp": task_data.get("reward_exp", 50),
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        self.tasks[user_id].append(task)
        return task
    
    def get_tasks(self, user_id: str, status: str = None) -> List[Dict]:
        """
        获取任务列表
        
        Args:
            user_id: 用户ID
            status: 筛选状态 (pending/completed)
            
        Returns:
            任务列表
        """
        if user_id not in self.tasks:
            return []
        
        tasks = self.tasks[user_id]
        
        if status:
            tasks = [t for t in tasks if t["status"] == status]
        
        return tasks
    
    def complete_task(self, user_id: str, task_id: str) -> Dict[str, Any]:
        """
        完成任务
        
        Args:
            user_id: 用户ID
            task_id: 任务ID
            
        Returns:
            完成结果（包含经验值奖励）
        """
        tasks = self.tasks.get(user_id, [])
        task = next((t for t in tasks if t["id"] == task_id), None)
        
        if not task:
            raise ValueError("任务不存在")
        
        if task["status"] == "completed":
            raise ValueError("任务已完成")
        
        # 标记完成
        task["status"] = "completed"
        task["completed_at"] = datetime.now().isoformat()
        
        # 更新用户统计
        if user_id not in self.user_stats:
            self.user_stats[user_id] = {"tasks_completed": 0, "total_exp": 0}
        
        self.user_stats[user_id]["tasks_completed"] += 1
        self.user_stats[user_id]["total_exp"] += task["reward_exp"]
        
        return {
            "task": task,
            "exp_gained": task["reward_exp"],
            "total_exp": self.user_stats[user_id]["total_exp"],
            "tasks_completed": self.user_stats[user_id]["tasks_completed"]
        }
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """获取用户统计数据"""
        return self.user_stats.get(user_id, {
            "tasks_completed": 0,
            "total_exp": 0,
            "streak_days": 0
        })


# 全局实例
task_manager = TaskManager()
