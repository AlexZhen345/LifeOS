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

## 快速开始

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 后端开发
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 模型开发
```bash
cd model
pip install -r requirements.txt
```

## 分支规范

- `main` - 稳定发布版
- `develop` - 开发主分支
- `feature/frontend-*` - 前端功能分支
- `feature/backend-*` - 后端功能分支
- `feature/model-*` - 模型功能分支

## 协作流程

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)
