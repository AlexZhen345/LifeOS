"""
LLM 客户端封装
负责调用大语言模型API
"""
import os
import sys
import requests
from typing import Optional, Dict, Any

# 添加模型模块到路径
sys.path.append(os.path.join(os.path.dirname(__file__), '../../model'))
from prompts.task_generation import get_task_prompt


class LLMClient:
    """通义千问客户端"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY")
        self.api_url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
        self.model = "qwen-plus"
        
    def chat(self, messages: list, temperature: float = 0.7, max_tokens: int = 2000) -> Dict[str, Any]:
        """
        调用聊天接口
        
        Args:
            messages: 对话消息列表，格式：[{"role": "user", "content": "..."}]
            temperature: 温度参数，越高越随机
            max_tokens: 最大生成token数
            
        Returns:
            API响应结果
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def generate_tasks(self, user_goal: str, available_time: str, username: str = "用户") -> Dict[str, Any]:
        """
        生成任务列表
        
        Args:
            user_goal: 用户目标
            available_time: 可用时间
            username: 用户名
            
        Returns:
            生成的任务列表
        """
        # 使用模型组提供的Prompt模板
        prompt = get_task_prompt(
            username=username,
            goal=user_goal,
            available_time=available_time
        )
        
        messages = [{"role": "user", "content": prompt}]
        return self.chat(messages)
