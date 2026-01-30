# 🎨 前端模块 (Frontend)

> **负责人**: 前端组同学  
> **技术栈**: React 18 + Vite + TailwindCSS + Radix UI

## 目录结构

```
frontend/
├── src/
│   ├── components/      # React组件
│   ├── services/
│   │   └── apiService.ts  # **API调用封装**
│   └── styles/          # 全局样式
├── .env.example         # 环境变量模板
├── package.json
└── vite.config.ts
```

## 快速开始

```bash
# 配置环境变量
cp .env.example .env
# 编辑.env，配置VITE_API_BASE_URL

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问：http://localhost:7860/app/

## 开发规范

1. **组件命名**: PascalCase，如 `TaskCreationModal.tsx`
2. **样式**: 优先使用 TailwindCSS 类名
3. **状态管理**: 使用 React Hooks
4. **API调用**: 统一在 `services/` 目录下封装

## 与后端对接

使用 `src/services/apiService.ts` 统一调用后端API：

```typescript
import API from '@/services/apiService';

// 生成任务
const result = await API.ai.generateTasks('学习Git', '30分钟');

// 完成任务
await API.task.completeTask('user123', 'task_1');
```

详见 [docs/API_DOCS.md](../docs/API_DOCS.md)
