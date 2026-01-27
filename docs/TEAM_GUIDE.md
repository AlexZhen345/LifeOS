# 🚀 LifeOS 团队协作指南（小白版）

> 本文档帮助团队成员快速上手协作开发，即使你是Git新手也能轻松参与！

---

## 📋 目录

1. [团队分工](#团队分工)
2. [环境准备](#环境准备)
3. [第一次参与项目](#第一次参与项目)
4. [日常开发流程](#日常开发流程)
5. [各组工作指南](#各组工作指南)
6. [跨组对接规范](#跨组对接规范)
7. [常见问题](#常见问题)

---

## 👥 团队分工

| 角色 | 成员 | 负责目录 | 主要工作 |
|------|------|---------|---------|
| **模型组** | 学长 + 1位同学 | `model/` | Prompt设计、RAG、模型微调 |
| **前端组** | 1位同学 | `frontend/` | 页面UI、交互体验 |
| **后端组** | 1位同学 | `backend/` + `deploy/` | API开发、部署上线 |
| **产品指导** | 灿姐 | `docs/` | 产品方向、体验把关 |

---

## 🛠️ 环境准备

### 1. 安装 Git

**Windows**: 下载安装 https://git-scm.com/download/win

安装完成后，打开命令行输入以下命令配置身份：
```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 2. 安装开发工具

| 组别 | 需要安装 |
|------|---------|
| **前端组** | [Node.js](https://nodejs.org/) (选LTS版本) |
| **后端组** | [Python 3.10+](https://www.python.org/downloads/) |
| **模型组** | [Python 3.10+](https://www.python.org/downloads/) |

### 3. 推荐编辑器

[VS Code](https://code.visualstudio.com/) - 免费、好用、插件丰富

---

## 🎬 第一次参与项目

### Step 1: 克隆项目到本地

```bash
git clone https://github.com/AlexZhen345/LifeOS.git
cd LifeOS
```

### Step 2: 切换到开发分支

```bash
git checkout develop
```

> 如果提示 `develop` 不存在，执行：`git checkout -b develop`

### Step 3: 安装依赖

**前端组**：
```bash
cd frontend
npm install
npm run dev    # 启动开发服务器，浏览器访问显示的地址
```

**后端组**：
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows激活虚拟环境
pip install -r requirements.txt
python app.py            # 启动后端服务
```

**模型组**：
```bash
cd model
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🔄 日常开发流程

### 完整流程图

```
1. 拉取最新代码
       ↓
2. 创建功能分支
       ↓
3. 写代码 + 测试
       ↓
4. 提交到自己的分支
       ↓
5. 推送到GitHub
       ↓
6. 创建Pull Request
       ↓
7. 等待审核合并
```

### 详细命令

#### 1️⃣ 开始工作前：拉取最新代码

```bash
git checkout develop
git pull origin develop
```

#### 2️⃣ 创建你的功能分支

命名规范：`feature/组别-功能名`

```bash
# 前端组示例
git checkout -b feature/frontend-login-page

# 后端组示例
git checkout -b feature/backend-task-api

# 模型组示例
git checkout -b feature/model-prompt-v2
```

#### 3️⃣ 写代码...

在你负责的目录下工作：
- 前端组：`frontend/` 目录
- 后端组：`backend/` 目录
- 模型组：`model/` 目录

#### 4️⃣ 提交你的更改

```bash
# 查看改了哪些文件
git status

# 添加所有更改
git add .

# 提交（写清楚做了什么）
git commit -m "feat(frontend): 完成登录页面UI"
```

**提交信息格式**：
```
类型(范围): 简短描述

类型：
- feat: 新功能
- fix: 修bug
- docs: 改文档
- style: 改样式（不影响功能）
- refactor: 重构代码

范围：frontend / backend / model / docs
```

#### 5️⃣ 推送到GitHub

```bash
git push origin feature/frontend-login-page
```

#### 6️⃣ 创建 Pull Request (PR)

1. 打开 https://github.com/AlexZhen345/LifeOS
2. 点击 "Compare & pull request" 按钮
3. 填写PR标题和描述
4. 选择合并到 `develop` 分支
5. 点击 "Create pull request"

#### 7️⃣ 等待审核

其他同学会review你的代码，有问题会评论，没问题就会合并。

---

## 📁 各组工作指南

### 🎨 前端组

**工作目录**：`frontend/`

**启动开发**：
```bash
cd frontend
npm run dev
```

**常见任务**：
- 新建页面：在 `src/components/` 下创建 `.tsx` 文件
- 改样式：使用 TailwindCSS 类名
- 调API：在 `src/services/` 下封装

**注意事项**：
- 组件用 PascalCase 命名，如 `LoginPage.tsx`
- 测试时打开浏览器控制台看有没有报错

---

### ⚙️ 后端组

**工作目录**：`backend/`

**启动开发**：
```bash
cd backend
python app.py
```

**常见任务**：
- 新建API：在 `api/routes/` 下添加路由
- 调用模型：在 `core/` 下封装调用逻辑

**注意事项**：
- API路径统一用 `/api/v1/` 前缀
- 返回格式统一用 JSON

---

### 🤖 模型组

**工作目录**：`model/`

**常见任务**：
- 优化Prompt：编辑 `prompts/` 下的文件
- 测试效果：写测试脚本验证输出
- 新增RAG：在 `rag/` 目录开发

**注意事项**：
- Prompt改动后告知后端组
- 输出格式变化要提前沟通

---

## 🔗 跨组对接规范

### 前端 ↔ 后端

1. **后端先出API文档**
   - 在 `docs/api_docs.md` 中定义接口
   - 前端按文档开发，可以先用Mock数据

2. **接口变更流程**
   ```
   后端：我要改XX接口的返回格式
         ↓
   后端：更新 docs/api_docs.md
         ↓
   后端：群里通知前端
         ↓
   前端：确认收到，评估影响
         ↓
   一起确定上线时间
   ```

### 后端 ↔ 模型

1. **模型组提供**：
   - Prompt模板文件
   - 调用示例代码
   - 输出格式说明

2. **后端负责**：
   - 封装调用接口
   - 处理超时和错误
   - 适配输出格式给前端

### 变更时必须做的事

| 谁改了什么 | 需要通知谁 | 怎么通知 |
|-----------|-----------|---------|
| 前端改了需要的数据 | 后端 | 群里说 + 改API文档 |
| 后端改了接口 | 前端 | 群里说 + 改API文档 |
| 模型改了输出格式 | 后端 | 群里说 + 给示例 |

---

## ❓ 常见问题

### Q: git pull 报冲突了怎么办？

```bash
# 1. 先看看哪些文件冲突了
git status

# 2. 打开冲突文件，会看到类似这样的标记：
<<<<<<< HEAD
你的代码
=======
别人的代码
>>>>>>> origin/develop

# 3. 手动选择保留哪个（或合并两者），删掉标记

# 4. 保存后
git add .
git commit -m "fix: 解决合并冲突"
```

### Q: 提交错了想撤回怎么办？

```bash
# 撤回上一次提交（代码改动保留）
git reset --soft HEAD~1
```

### Q: 想看别人的分支代码？

```bash
git fetch origin
git checkout feature/backend-xxx
```

### Q: npm install 报错？

```bash
# 删掉 node_modules 重来
rm -rf node_modules
npm install
```

### Q: Python 依赖装不上？

```bash
# 升级 pip
python -m pip install --upgrade pip

# 重新安装
pip install -r requirements.txt
```

---

## 📞 遇到问题？

1. 先看本文档找答案
2. 搜一下错误信息
3. 群里问队友
4. 实在不行找学长

---

**祝开发顺利！** 🎉
