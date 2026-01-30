# LifeOS

个人任务管理系统

## 技术栈

- **前端**: React 18 + Vite + TailwindCSS + Radix UI
- **后端**: FastAPI + Python
- **AI**: 通义千问 API

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/AlexZhen345/LifeOS.git
cd LifeOS
```

### 2. 后端启动

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入 DASHSCOPE_API_KEY
uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. 前端启动

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. 访问

- 前端: http://localhost:5173
- 后端API: http://localhost:8000/docs

## 项目结构

```
LifeOS/
├── backend/
│   ├── api/routes/      # API路由 (ai.py, tasks.py)
│   ├── core/            # 业务逻辑 (llm_client.py, task_manager.py, game_engine.py)
│   └── app.py
├── frontend/
│   └── src/
│       ├── components/
│       └── services/apiService.ts
└── model/
    └── prompts/         # Prompt模板
```

## 环境变量

**backend/.env**
```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
HOST=0.0.0.0
PORT=8000
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 注意事项

**别人下载代码后需要**:
1. 安装依赖: 
   - 后端: `cd backend && pip install -r requirements.txt`
   - 前端: `cd frontend && npm install`
2. 配置环境变量: 
   - 后端: `cd backend && cp .env.example .env`
   - 前端: `cd frontend && cp .env.example .env`
3. 填入通义千问API Key (在 `backend/.env` 的 `DASHSCOPE_API_KEY`)
4. 分别启动后端和前端
