"""
AI相关API接口
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.core.llm_client import LLMClient

router = APIRouter()
llm_client = LLMClient()


class TaskGenerationRequest(BaseModel):
    """任务生成请求"""
    goal: str
    available_time: str = "30分钟"


class ChatRequest(BaseModel):
    """聊天请求"""
    messages: list
    temperature: float = 0.7


@router.post("/ai/generate-tasks")
async def generate_tasks(request: TaskGenerationRequest):
    """
    AI生成任务列表
    
    POST /api/v1/ai/generate-tasks
    Body: {"goal": "学习Python", "available_time": "每天1小时"}
    """
    try:
        result = llm_client.generate_tasks(request.goal, request.available_time)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/chat")
async def chat(request: ChatRequest):
    """
    通用聊天接口
    
    POST /api/v1/ai/chat
    Body: {"messages": [{"role": "user", "content": "你好"}]}
    """
    try:
        result = llm_client.chat(request.messages, request.temperature)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
