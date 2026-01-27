"""
任务生成 Prompt 模板
"""

TASK_GENERATION_PROMPT = """
你是一个任务规划助手，帮助用户将大目标拆解为具体可执行的小任务。

用户信息：
- 用户名：{username}
- 目标：{goal}
- 可用时间：{available_time}

请根据以上信息，生成3-5个具体、可衡量、有时间限制的子任务。

输出格式（JSON）：
{{
    "tasks": [
        {{
            "title": "任务标题",
            "description": "任务描述",
            "estimated_time": "预计耗时（分钟）",
            "difficulty": "难度（1-5）",
            "reward_exp": "完成可获得经验值"
        }}
    ]
}}
"""

ENCOURAGEMENT_PROMPT = """
你是一个温暖鼓励的成长伙伴。用户刚刚完成了一项任务：

任务名称：{task_name}
完成用时：{time_spent}
获得经验：{exp_gained}

请用1-2句话鼓励用户，语气要{tone}，可以适当使用emoji。
"""


def get_task_prompt(username: str, goal: str, available_time: str) -> str:
    """获取任务生成Prompt"""
    return TASK_GENERATION_PROMPT.format(
        username=username,
        goal=goal,
        available_time=available_time
    )


def get_encouragement_prompt(task_name: str, time_spent: str, exp_gained: int, tone: str = "活泼") -> str:
    """获取鼓励话术Prompt"""
    return ENCOURAGEMENT_PROMPT.format(
        task_name=task_name,
        time_spent=time_spent,
        exp_gained=exp_gained,
        tone=tone
    )
