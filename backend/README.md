# ⚙️ 后端模块 (Backend)

> **负责人**: 后端组同学  
> **技术栈**: FastAPI + Gradio + Uvicorn

## 目录结构

```
backend/
├── api/
│   ├── __init__.py
│   ├── routes/          # API路由
│   │   ├── __init__.py
│   │   ├── tasks.py     # 任务相关接口
│   │   └── users.py     # 用户相关接口
│   └── schemas/         # Pydantic数据模型
│       ├── __init__.py
│       └── task.py
├── core/
│   ├── __init__.py
│   ├── game_engine.py   # 游戏核心引擎
│   └── task_manager.py  # 任务管理器
├── app.py               # FastAPI入口
├── requirements.txt
└── build/               # 前端构建产物
```

## 快速开始

```bash
# 创建虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python app.py
# 或
uvicorn app:app --reload --port 7860
```

## API设计规范

- RESTful风格
- 路径前缀: `/api/v1/`
- 响应格式: JSON
- 错误码统一处理

## 与模型组对接

调用模型服务的接口封装在 `core/` 目录下，确保：
- 异步调用
- 超时处理
- 错误重试

## 魔搭部署

参考 `deploy/modelscope/` 目录下的配置文件
