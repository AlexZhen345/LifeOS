"""
数据模型定义 (Pydantic Schemas)
"""
from pydantic import BaseModel
from typing import Optional


class TaskBase(BaseModel):
    """任务基础模型"""
    title: str
    description: str = ""
    difficulty: int = 3
    estimated_time: int = 30
    reward_exp: Optional[int] = None


class TaskCreate(TaskBase):
    """创建任务请求"""
    user_id: str = "default_user"


class Task(TaskBase):
    """任务完整模型"""
    id: str
    status: str = "pending"
    created_at: str
    completed_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class TaskComplete(BaseModel):
    """完成任务请求"""
    user_id: str = "default_user"
    task_id: str


class UserStats(BaseModel):
    """用户统计"""
    tasks_completed: int = 0
    total_exp: int = 0
    streak_days: int = 0
