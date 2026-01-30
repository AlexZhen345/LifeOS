# LifeOS API 接口文档

> 后端组维护，前端组参考

## 基础信息

- **Base URL**: `http://localhost:7860/api/v1`
- **Content-Type**: `application/json`

---

## AI 接口

### 1. 生成任务列表

**接口**: `POST /ai/generate-tasks`

**请求体**:
```json
{
  "goal": "学习Python编程",
  "available_time": "每天1小时"
}
```

**响应**:
```json
{
  "choices": [{
    "message": {
      "content": "{\"tasks\": [...]}"
    }
  }]
}
```

---

### 2. 通用聊天

**接口**: `POST /ai/chat`

**请求体**:
```json
{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7
}
```

**响应**:
```json
{
  "choices": [{
    "message": {
      "content": "你好！我是你的成长伙伴..."
    }
  }]
}
```

---

## 任务管理接口

### 1. 创建任务

**接口**: `POST /tasks`

**请求体**:
```json
{
  "user_id": "user123",
  "title": "完成Python作业",
  "description": "第3章习题",
  "difficulty": 3,
  "estimated_time": 60
}
```

**响应**:
```json
{
  "success": true,
  "task": {
    "id": "task_1",
    "title": "完成Python作业",
    "status": "pending",
    "reward_exp": 60,
    ...
  }
}
```

---

### 2. 获取任务列表

**接口**: `GET /tasks`

**查询参数**:
- `user_id`: 用户ID（必填）
- `status`: 筛选状态，可选值：`pending`、`completed`

**示例**: `GET /tasks?user_id=user123&status=pending`

**响应**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task_1",
      "title": "完成Python作业",
      "status": "pending",
      ...
    }
  ]
}
```

---

### 3. 完成任务

**接口**: `POST /tasks/complete`

**请求体**:
```json
{
  "user_id": "user123",
  "task_id": "task_1"
}
```

**响应**:
```json
{
  "success": true,
  "task": {...},
  "exp_gained": 60,
  "total_exp": 320,
  "level_info": {
    "level_up": true,
    "old_level": 2,
    "new_level": 3
  },
  "achievements": [
    {
      "id": "task_master",
      "name": "任务大师",
      "desc": "完成10个任务"
    }
  ]
}
```

---

### 4. 获取用户统计

**接口**: `GET /tasks/stats`

**查询参数**:
- `user_id`: 用户ID

**示例**: `GET /tasks/stats?user_id=user123`

**响应**:
```json
{
  "success": true,
  "stats": {
    "tasks_completed": 15,
    "total_exp": 850,
    "streak_days": 7
  },
  "level": 4
}
```

---

## 错误响应

所有接口错误统一返回格式：

```json
{
  "detail": "错误信息"
}
```

常见状态码：
- `400`: 请求参数错误
- `500`: 服务器内部错误

---

## 前端调用示例

```typescript
import API from '@/services/apiService';

// 生成任务
const result = await API.ai.generateTasks('学习Git', '每天30分钟');

// 创建任务
await API.task.createTask({
  title: '阅读文档',
  difficulty: 2
});

// 获取任务列表
const { tasks } = await API.task.getTasks('user123', 'pending');

// 完成任务
const result = await API.task.completeTask('user123', 'task_1');
console.log(`获得经验：${result.exp_gained}`);
```

---

## 接口变更记录

| 日期 | 接口 | 变更内容 | 负责人 |
|------|------|---------|--------|
| 2026-01-27 | 全部 | 初始版本 | 后端组 |
