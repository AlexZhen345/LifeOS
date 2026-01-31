""" 封装 LLM Client. """
import os
import json
from typing import Dict, List, Optional
from datetime import datetime, date

import dashscope


SYSTEM_PROMPT = """
你是一个善于日常泛用任务的规划小助手，能合理分析用户的输入，制定出具体的任务列表。注意，今天的日期（年-月-日）是：{today}，是 {weekday}。

你设计出的每个任务需要有：

* 标题（title）：该任务的简要标题
* 内容描述（description）：该任务的内容描述
* 日期时间（datetime)：以 年-月-日 即 YYYY-MM-DD 的格式给出该任务需要在哪日完成
* 预计耗时（estimated_time）：一个整型值，表示计划完成该任务所需时间，单位：分钟
* 难度等级（difficulty）：一个整型值，表示该任务的难度等级，共 1～3 级。“1级”表示简易，“2级”表示中等难度，“3级”表示困难。
* 属性奖励（rewards）：表示用户完成该子任务后可以获得的属性值，包含“智力（INT）、体力（VIT）”两个维度。可获取哪个维度的属性值，取决于该子任务本身的内容。比如，知识学习类任务可获取智力值。而身体锻炼类任务可以获取体力值。每个属性可获取值的范围在 0～5 之间，具体值与任务难度高度相关。你需要综合考虑任务性质与难度，来设计合理的可获取的属性值。

有时候，用户描述的是一个一次性的任务，你需要基于用户的描述，完成该任务的设计。

有时候用户描述的一个任务可能需要拆分为多个任务在不同的日期完成，比如”第一天完成子任务一，第二天完成子任务二，第三天完成子任务三，从而完成整个任务“，这时你设计的任务列表要具体到子任务这个粒度。

有时候，用户描述的可能是一个周期性任务，比如“每周一完成一次，持续一个月”。对于这种周期性任务，每次都需要创建个任务实例，即对于未来一个月的每个周一都需要创建一个任务实例。

注意，有时候，用户提供的任务描述偏笼统，信息可能不足。当你认为用户目前提供的信息不足以让制定出合适的任务列表时，你可以向用户发起提问，让用户提供更多的描述。比如：对于“我要锻炼身体”这样笼统的描述，你可以提问用户“想通过什么方式来锻炼身体？时长多少？安排在周几？”，让用户补充更多细节。当然，你还可以向用户提供一些合理的参考建议。。

为方便后续处理与解析，你的输出应当以 JSON 给出。当你认为用户提供的信息不足，需要进一步沟通时，输出示例如下：

{{  
    "is_finished": False,
    "response": "你的提问或者提示内容",
    "tasks": None
}}

而当你认为用户提供的信息可以比较好地设计出任务列表，不再需要进一步沟通时，输出示例如下：

{{ 
    "is_finished": True,
    "response": "已基于您的描述，制定了相应的任务列表",
    "tasks": [
        {{
            "title": "任务标题",
            "description": "具体的任务描述",
            "datetime": "2026-01-01",
            "estimated_time": 30,
            "difficulty": 1,
            "rewards": {{
                "INT": 1,
                "VIT": 4
            }}
        }}
    ]
}}

当你认为用户提供的信息可以指定出明确的任务列表后，你需要以 JSON 的格式给出

"""


class LLMClient:
    """ LLM 客户端 """

    def __init__(self, model_name: str = "qwen3-max", max_retries: int = 3):
        """ 初始化客户端 """
        # 通义千问模型列表：https://help.aliyun.com/zh/model-studio/models
        self.model_name = model_name    # 调用模型的名称

        self.max_retries = max_retries  # 最大重试次数

        # 存储用户的聊天记录；暂定每位用户只维护一个 session，当该 session 关闭时，聊天记录即被清空。
        # 典型的 messages 是：{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}
        self.history_dict: Dict[str, List[Dict[str, str]]]= {}      # used_id -> messages: List[Dict]


    def chat(self, user_id: str, user_input: str) -> Optional[str]:
        """ 与 LLM 进行对话；对于笼统的描述，需要在多次对话中才能收集到足够的信息来规划任务。
        
        Args:
            user_id (str): 该用户的唯一 ID 标识
            user_input (str): 该用户当前轮次的输入文本内容
        """
        today = datetime.now().strftime("%Y-%m-%d")
        weekday = date.today().weekday()

        # 读取该 session 的对话记录，并加入 user_input
        if user_id not in self.history_dict:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT.format(today=today, weekday=weekday)},
                {"role": "user", "content": user_input}
            ]
        else:
            messages = self.history_dict[user_id].copy()
            messages.append({"role": "user", "content": user_input})

        print("\n============= DEBUG ============")
        print(messages)
        print("============= DEBUG ============\n")
        
        # 发送请求
        is_success = False
        cnt = 0
        while cnt < self.max_retries and not is_success:
            try:
                response = dashscope.Generation.call(
                    api_key=os.getenv('DASHSCOPE_API_KEY'), model=self.model_name, messages=messages, result_format='message',
                    response_format={"type": "json_object"}
                )
                resp_msg = response.output.choices[0].message.content
                resp_json = json.loads(resp_msg)
            except Exception as err:
                print(f"Error to chat with LLM: {str(err)}")
                cnt += 1
            else:
                is_success = True

        if is_success:
            messages.append({"role": "assistant", "content": resp_msg})
            self.history_dict[user_id] = messages
            
        result = {"is_success": is_success, "err_msg": None if is_success else str(err), "response": resp_json}

        return result


    def clear(self, user_id: str):
        """ 当用户关闭程序时，可调用 clear 来清除掉历史记录 """
        self.history_dict.pop(user_id, None)

    
    def test_continuous_session(self, user_id: str, user_input: str):
        """ 测试连续的会话，以完成一次完整的任务制定流程 """
        print(f"USR -> {user_input}")
        is_finished = False

        while not is_finished:

            result = self.chat(user_id=user_id, user_input=user_input)
            if not result["is_success"]:
                raise Exception(f"调用 LLM API 时发生异常 -> {result['err_msg']}")
            response = result["response"]
            
            if response["is_finished"]:
                print(f"LLM -> {response['response']}")
                print("=== tasks as below ===")
                for task in response["tasks"]:
                    print(task)
                is_finished = True
            else:
                print(f"LLM -> {response['response']}")
                user_input = input("USR -> ")
                


if __name__ == "__main__":

    client = LLMClient(model_name="qwen-plus")
    result = client.test_continuous_session(user_id="startshine", user_input="我想锻炼身体")

