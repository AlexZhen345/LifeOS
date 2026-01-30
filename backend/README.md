# ⚙️ 后端模块 (Backend)

> **负责人**: 后端组同学  
> **技术栈**: FastAPI + Gradio + Uvicorn

## 目录结构

```
backend/
├── api/
│   ├── routes/          # API路由
│   │   ├── ai.py       # AI接口
│   │   └── tasks.py    # 任务接口
│   └── schemas/        # Pydantic数据模型
│       └── task.py
├── core/
│   ├── llm_client.py   # LLM客户端
│   ├── game_engine.py  # 游戏引擎
│   └── task_manager.py # 任务管理器
├── app.py              # FastAPI入口
└── requirements.txt
```

## 快速开始

```bash
# 配置环境变量
cp .env.example .env
# 编辑.env，填入DASHSCOPE_API_KEY

# 创建虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

访问：
- API文档：http://localhost:7860/docs
- 欢迎页面：http://localhost:7860/

## 核心文件

- `api/routes/ai.py` - AI接口（生成任务、聊天）
- `api/routes/tasks.py` - 任务管理接口
- `core/llm_client.py` - LLM调用封装
- `core/game_engine.py` - 经验值、等级、成就计算
- `core/task_manager.py` - 任务增删改查（内存版）

## API设计规范

- RESTful风格
- 路径前缀: `/api/v1/`
- 响应格式: JSON
- 错误码统一处理

## 与模型组对接

模型组提供Prompt模板在 `model/prompts/`，后端在 `core/llm_client.py` 中调用。

## 部署

详见 [docs/API_DOCS.md](../docs/API_DOCS.md)
