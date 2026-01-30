# 🌟 LifeOS - 人生成长伴侣

> AI驱动的个人任务规划与成长助手

## 项目结构

```
lifeos/
├── frontend/     # 🎨 前端 - React + Vite
├── backend/      # ⚙️ 后端 - FastAPI + Gradio
├── model/        # 🤖 模型 - Prompt/RAG/微调
├── docs/         # 📖 文档
└── deploy/       # 🚀 部署配置
```

## 团队分工

| 角色 | 负责模块 | 职责 |
|------|---------|------|
| **模型组** | `model/` | 模型优化、Prompt设计、RAG、微调 |
| **前端组** | `frontend/` | Web界面、UI交互体验 |
| **后端组** | `backend/` + `deploy/` | API开发、游戏逻辑、部署 |
| **产品指导** | `docs/` | 产品方向、用户体验 |

## 核心文件说明

### 后端核心
- `backend/api/routes/ai.py` - AI接口（生成任务、聊天）
- `backend/api/routes/tasks.py` - 任务管理接口
- `backend/core/llm_client.py` - LLM客户端封装
- `backend/core/game_engine.py` - 游戏引擎（经验值、等级、成就）
- `backend/core/task_manager.py` - 任务管理器

### 前端核心
- `frontend/src/services/apiService.ts` - **统一API调用封装**
- `frontend/src/components/` - React组件

### 模型核心
- `model/prompts/task_generation.py` - 任务生成Prompt模板
- `model/config.py` - 模型配置

## 快速开始

### 前端开发
```bash
cd frontend
cp .env.example .env  # 配置环境变量
npm install
npm run dev
```

### 后端开发
```bash
cd backend
cp .env.example .env  # 配置API密钥
pip install -r requirements.txt
python app.py
```

访问：
- 前端应用：http://localhost:7860/app/
- API文档：http://localhost:7860/docs

### 模型开发
```bash
cd model
pip install -r requirements.txt
```

## API接口

详见 [docs/API_DOCS.md](./docs/API_DOCS.md)

### 主要接口
- `POST /api/v1/ai/generate-tasks` - AI生成任务
- `POST /api/v1/tasks` - 创建任务
- `POST /api/v1/tasks/complete` - 完成任务
- `GET /api/v1/tasks/stats` - 用户统计

## 分支规范

- `main` - 稳定发布版
- `develop` - 开发主分支
- `feature/frontend-*` - 前端功能分支
- `feature/backend-*` - 后端功能分支
- `feature/model-*` - 模型功能分支

## 协作流程

详见 [CONTRIBUTING.md](./CONTRIBUTING.md) 和 [docs/TEAM_GUIDE.md](./docs/TEAM_GUIDE.md)

## 环境配置

### 后端 (.env)
```bash
DASHSCOPE_API_KEY=your_api_key_here
```

### 前端 (.env)
```bash
VITE_API_BASE_URL=http://localhost:7860/api/v1
```
