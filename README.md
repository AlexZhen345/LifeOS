# LifeOS

> **开箱即用**：本项目下载后按以下步骤即可启动运行,无需复杂配置

个人任务管理与游戏化成长系统

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

### 2. 配置环境变量

```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env 填入 DASHSCOPE_API_KEY (可选，不填则无法使用AI功能)

# 前端
cd ../frontend
cp .env.example .env
```

### 3. 安装依赖

**后端依赖**:
```bash
cd backend
pip install -r requirements.txt
```

**前端依赖**:
```bash
cd frontend
npm install
```

> ⚠️ **Windows用户注意**: 如遇到PowerShell执行策略限制，请使用CMD窗口执行npm命令

### 4. 启动服务

**后端**（新开终端窗口）:
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

**前端**（新开终端窗口）:
```bash
cd frontend
npm run dev
```

### 5. 访问

- 前端: http://localhost:5173
- 后端API: http://localhost:8000/docs

> 💡 **首次启动可能需要等待1-2分钟让依赖安装和服务启动完成**

### 6. 生产构建（可选）

```bash
# 前端构建
cd frontend
npm run build

# 构建产物在 frontend/build 目录
```

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

## 常见问题

### Q: Windows下npm命令报错"禁止运行脚本"?
**A**: PowerShell执行策略限制。解决方案:
- 使用CMD窗口执行npm命令
- 或在PowerShell中执行: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Q: 前端启动报错"Cannot find package 'tailwindcss'"?
**A**: 依赖未安装完成，确保先执行 `npm install` 等待完成后再运行 `npm run dev`

### Q: AI功能无法使用?
**A**: 需要在 `backend/.env` 中配置通义千问API密钥 (DASHSCOPE_API_KEY)

---

## 注意事项

**克隆项目后需要完成以下步骤**:

1. **安装依赖**: 
   - 后端: `cd backend && pip install -r requirements.txt`
   - 前端: `cd frontend && npm install`

2. **配置环境变量**: 
   - 后端: 复制 `backend/.env.example` 为 `backend/.env`
   - 前端: 复制 `frontend/.env.example` 为 `frontend/.env`

3. **填写API密钥**: 
   - 在 `backend/.env` 中填入通义千问API Key (DASHSCOPE_API_KEY)
   - 获取地址: https://dashscope.aliyun.com/

4. **启动服务**: 
   - 后端: `cd backend && python -m uvicorn app:app --host 0.0.0.0 --port 8000`
   - 前端: `cd frontend && npm run dev`
