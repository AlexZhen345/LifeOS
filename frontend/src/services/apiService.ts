/**
 * API服务封装
 * 统一管理所有后端API调用
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * 通用请求函数
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * AI相关API
 */
export const aiAPI = {
  /**
   * AI生成任务
   */
  generateTasks: async (goal: string, availableTime: string = '30分钟') => {
    return request('/ai/generate-tasks', {
      method: 'POST',
      body: JSON.stringify({ goal, available_time: availableTime }),
    });
  },
  
  /**
   * 通用聊天
   */
  chat: async (messages: Array<{role: string; content: string}>, temperature: number = 0.7) => {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, temperature }),
    });
  },
};

/**
 * 任务相关API
 */
export const taskAPI = {
  /**
   * 创建任务
   */
  createTask: async (taskData: {
    user_id?: string;
    title: string;
    description?: string;
    difficulty?: number;
    estimated_time?: number;
  }) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },
  
  /**
   * 获取任务列表
   */
  getTasks: async (userId: string = 'default_user', status?: string) => {
    const params = new URLSearchParams({ user_id: userId });
    if (status) params.append('status', status);
    
    return request(`/tasks?${params.toString()}`);
  },
  
  /**
   * 完成任务
   */
  completeTask: async (userId: string, taskId: string) => {
    return request('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, task_id: taskId }),
    });
  },
  
  /**
   * 获取用户统计
   */
  getStats: async (userId: string = 'default_user') => {
    return request(`/tasks/stats?user_id=${userId}`);
  },
};

/**
 * 导出统一API对象
 */
export const API = {
  ai: aiAPI,
  task: taskAPI,
};

export default API;
