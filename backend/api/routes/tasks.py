"""
任务相关API接口
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from core.task_manager import task_manager
from core.game_engine import GameEngine
from api.schemas.task import TaskCreate, TaskComplete

router = APIRouter()


@router.post("/tasks")
async def create_task(request: TaskCreate):
    """
    创建任务
    
    POST /api/v1/tasks
    Body: {"user_id": "user123", "title": "学习Python", "difficulty": 3}
    """
    try:
        # 如果没指定经验值，根据难度自动计算
        task_data = request.dict()
        if task_data["reward_exp"] is None:
            task_data["reward_exp"] = request.difficulty * 20
        
        task = task_manager.create_task(request.user_id, task_data)
        return {"success": True, "task": task}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks")
async def get_tasks(user_id: str = "default_user", status: Optional[str] = None):
    """
    获取任务列表
    
    GET /api/v1/tasks?user_id=user123&status=pending
    """
    try:
        tasks = task_manager.get_tasks(user_id, status)
        return {"success": True, "tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tasks/complete")
async def complete_task(request: TaskComplete):
    """
    完成任务
    
    POST /api/v1/tasks/complete
    Body: {"user_id": "user123", "task_id": "task_1"}
    """
    try:
        result = task_manager.complete_task(request.user_id, request.task_id)
        
        # 检查升级
        old_exp = result["total_exp"] - result["exp_gained"]
        level_info = GameEngine.check_level_up(old_exp, result["total_exp"])
        
        # 检查成就
        user_stats = task_manager.get_user_stats(request.user_id)
        achievements = GameEngine.check_achievement(user_stats)
        
        return {
            "success": True,
            "task": result["task"],
            "exp_gained": result["exp_gained"],
            "total_exp": result["total_exp"],
            "level_info": level_info,
            "achievements": achievements
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/stats")
async def get_stats(user_id: str = "default_user"):
    """
    获取用户统计
    
    GET /api/v1/tasks/stats?user_id=user123
    """
    try:
        stats = task_manager.get_user_stats(user_id)
        level = GameEngine.get_level_from_exp(stats.get("total_exp", 0))
        
        return {
            "success": True,
            "stats": stats,
            "level": level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
