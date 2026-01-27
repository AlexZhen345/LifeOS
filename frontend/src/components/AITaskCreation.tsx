import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Sparkles, Loader2, Check, Edit2, Trash2, Calendar, GripVertical, Send, Bot, User } from 'lucide-react';
import { Task } from './TaskCreationModal';
import { generateAIContext, getUserData } from '../services/userDatabase';

interface AITaskCreationProps {
  onCreateTasks: (tasks: Task[]) => void;
  onClose: () => void;
}

interface ScheduledTask extends Task {
  scheduledDate: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'tasks';
  tasks?: ScheduledTask[];
}

const API_KEY = import.meta.env.VITE_DASHSCOPE_KEY || '';
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export function AITaskCreation({ onCreateTasks, onClose }: AITaskCreationProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const [currentTasks, setCurrentTasks] = useState<ScheduledTask[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的任务规划助手。告诉我你想要完成的目标，我会帮你制定详细的计划。\n\n你可以直接告诉我目标，比如"学习React"、"准备期末考试"等。',
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  // 获取北京时间的日期
  const getBeijingDate = (): Date => {
    const now = new Date();
    // 获取UTC时间，然后加上8小时得到北京时间
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (8 * 60 * 60 * 1000));
  };

  // 格式化日期
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 获取日期显示名称
  const getDateDisplayName = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = getBeijingDate();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) return '今天';
    if (dateOnly.getTime() === tomorrow.getTime()) return '明天';
    
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}/${date.getDate()} ${weekdays[date.getDay()]}`;
  };

  // 构建系统提示词
  const buildSystemPrompt = () => {
    const today = getBeijingDate();
    const todayStr = formatDate(today);
    const userContext = generateAIContext();
    const userData = getUserData();
    const dailyHours = userData?.profile.dailyAvailableHours || 4;
    const preferredDuration = userData?.skills.preferredTaskDuration || 60;

    // 告诉AI当前已有的任务情况
    const existingTasksInfo = currentTasks.length > 0 
      ? `\n【当前已规划任务】\n用户已有 ${currentTasks.length} 个任务，日期范围：${getTaskDateRange()}。如果用户要求继续规划，请从已有任务的最后日期之后开始安排新任务，避免日期重叠。如果用户要求修改现有任务，请返回修改后的完整任务列表。\n`
      : '';

    return `你是一个专业的任务规划助手，擅长通过对话帮助用户制定具体可执行的任务计划。

${userContext ? `【用户背景信息】\n${userContext}\n` : ''}${existingTasksInfo}
【对话规则】
1. 当用户提出一个目标时，你需要通过1-2个简短问题了解：
   - 计划完成的时间范围（几天/几周/几个月）
   - 每天可投入的时间
   - 是否有特定的休息日（如周末不安排）
   - 其他关键偏好

2. 收集到足够信息后，生成任务计划。任务计划必须用以下JSON格式返回：
\`\`\`json
{
  "action": "replace 或 append",
  "tasks": [
    {
      "title": "具体任务标题",
      "description": "任务描述和具体步骤",
      "duration": 60,
      "scheduledDate": "YYYY-MM-DD",
      "rewards": { "INT": 5, "WIL": 3 }
    }
  ]
}
\`\`\`

action 字段说明：
- "replace"：替换所有现有任务（用于：首次生成、用户要求调整/修改/重新安排时）
- "append"：追加到现有任务后面（仅用于：用户明确说"继续"、"接着安排下一周"等）

3. 用户可能会要求：
   - 调整已生成的任务（如"第三天任务太多"、"重新安排"）→ 使用 action: "replace"
   - 继续生成后续任务（如"继续安排下一周"）→ 使用 action: "append"

【重要：完整计划原则】
- 当用户指定"一个月"或"30天"等长期计划时，你必须一次性生成覆盖整个时间范围的完整任务计划
- 不要只生成一周然后停止，用户期望的是完整的计划
- 如果任务数量较多，可以适当精简每日任务，但必须覆盖用户指定的全部时间范围
- 例如：用户要求"一个月的锻炼计划"，你应该生成30天的任务，每天1-2个任务即可

【任务生成规则】
- 今天日期是 ${todayStr}，任务日期必须从今天开始
- 【重要】如果用户在对话中指定了每天可用时间（如"每天1小时"），必须严格按用户说的时间安排，每天任务总时长不能超过用户指定的时间
- 如果用户没有指定每天时间，则默认每天任务总时长不超过 ${dailyHours} 小时
- 单个任务时长在 ${preferredDuration} 分钟左右（15-180之间）
- 任务标题要具体可执行，包含：做什么 + 怎么做/用什么资源
- 奖励属性：INT(智力)、VIT(体质)、CHA(魅力)、GOLD(财富)、WIL(意志)，数值1-15

【重要】
- 回复要简洁友好
- 只在生成或修改任务时才输出JSON，普通对话不要输出JSON
- JSON代码块前后可以有简短的说明文字`;
  };

  // 获取所有任务（用于显示确认按钮和统计）
  const getAllTasks = (): ScheduledTask[] => {
    if (currentTasks.length > 0) {
      return currentTasks;
    }
    // 从 messages 中收集任务
    const tasksFromMessages: ScheduledTask[] = [];
    messages.forEach(msg => {
      if (msg.tasks && msg.tasks.length > 0) {
        tasksFromMessages.push(...msg.tasks);
      }
    });
    return tasksFromMessages;
  };

  // 获取当前任务的日期范围
  const getTaskDateRange = (): string => {
    const tasks = getAllTasks();
    if (tasks.length === 0) return '';
    const dates = tasks.map(t => t.scheduledDate).sort();
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    return `${getDateDisplayName(firstDate)} 至 ${getDateDisplayName(lastDate)}`;
  };

  // 清空所有任务重新开始
  const handleClearTasks = () => {
    setCurrentTasks([]);
    setMessages(messages.map(msg => {
      if (msg.tasks) {
        return { ...msg, tasks: [] };
      }
      return msg;
    }));
  };

  // 解析AI回复中的任务
  const parseTasksFromResponse = (content: string): { tasks: ScheduledTask[], action: 'replace' | 'append' } | null => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // 尝试直接匹配JSON对象
      const directJsonMatch = content.match(/\{[\s\S]*"tasks"[\s\S]*\}/);
      if (!directJsonMatch) return null;
      try {
        const parsed = JSON.parse(directJsonMatch[0]);
        return {
          tasks: parseTasks(parsed),
          action: parsed.action === 'append' ? 'append' : 'replace'
        };
      } catch {
        return null;
      }
    }
    
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return {
        tasks: parseTasks(parsed),
        action: parsed.action === 'append' ? 'append' : 'replace'
      };
    } catch {
      return null;
    }
  };

  const parseTasks = (parsed: any): ScheduledTask[] => {
    const today = getBeijingDate();
    const todayStr = formatDate(today);
    
    return parsed.tasks.map((task: any, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      title: task.title,
      description: task.description || '',
      duration: task.duration || 60,
      scheduledDate: task.scheduledDate || todayStr,
      rewards: task.rewards || { INT: 5, WIL: 3 },
      completed: false,
    }));
  };

  // 从回复中提取纯文本（移除JSON块）
  const extractTextFromResponse = (content: string): string => {
    return content
      .replace(/```json\s*[\s\S]*?\s*```/g, '')
      .replace(/\{[\s\S]*"tasks"[\s\S]*\}/g, '')
      .trim();
  };

  // 发送消息
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || loading) return;

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    // 更新对话历史
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...newHistory,
          ],
          temperature: 0.7,
          enable_search: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || '抱歉，我遇到了一些问题，请稍后再试。';

      // 解析任务
      const parseResult = parseTasksFromResponse(aiContent);
      const textContent = extractTextFromResponse(aiContent);

      // 更新对话历史
      setConversationHistory([...newHistory, { role: 'assistant', content: aiContent }]);

      if (parseResult && parseResult.tasks.length > 0) {
        const { tasks, action } = parseResult;
        
        // 根据 action 决定是替换还是追加
        if (action === 'append') {
          // 追加模式：新任务添加到现有列表
          setCurrentTasks(prev => [...prev, ...tasks]);
        } else {
          // 替换模式：清空现有任务，使用新任务
          setCurrentTasks(tasks);
        }
        
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: textContent || (action === 'append' ? '好的，我为你追加了以下任务：' : '好的，我为你生成了以下任务计划：'),
          type: 'tasks',
          tasks: tasks,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // 纯文本回复
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiContent,
          type: 'text',
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，网络出现问题，请稍后再试。',
        type: 'text',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // 处理按键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // 示例目标点击
  const handleExampleClick = (example: string) => {
    sendMessage(example);
  };

  // 任务编辑相关
  const handleEdit = (task: ScheduledTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDate(task.scheduledDate);
  };

  const handleSaveEdit = (taskId: string) => {
    setCurrentTasks(currentTasks.map((t) => 
      t.id === taskId ? { ...t, title: editTitle, description: editDescription, scheduledDate: editDate } : t
    ));
    // 同步更新messages中的tasks
    setMessages(messages.map(msg => {
      if (msg.tasks) {
        return {
          ...msg,
          tasks: msg.tasks.map(t => 
            t.id === taskId ? { ...t, title: editTitle, description: editDescription, scheduledDate: editDate } : t
          )
        };
      }
      return msg;
    }));
    setEditingId(null);
  };

  const handleDelete = (taskId: string) => {
    setCurrentTasks(currentTasks.filter((t) => t.id !== taskId));
    setMessages(messages.map(msg => {
      if (msg.tasks) {
        return {
          ...msg,
          tasks: msg.tasks.filter(t => t.id !== taskId)
        };
      }
      return msg;
    }));
  };

  // 拖拽相关
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDate: string) => {
    if (draggedTaskId) {
      const updateTasks = (tasks: ScheduledTask[]) =>
        tasks.map(task => task.id === draggedTaskId ? { ...task, scheduledDate: targetDate } : task);
      
      setCurrentTasks(updateTasks);
      setMessages(messages.map(msg => {
        if (msg.tasks) {
          return { ...msg, tasks: updateTasks(msg.tasks) };
        }
        return msg;
      }));
      setDraggedTaskId(null);
    }
  };

  // 确认创建任务
  const handleConfirm = () => {
    // 从 currentTasks 获取任务，如果为空则尝试从 messages 中收集
    let tasksToCreate = [...currentTasks];
    
    // 如果 currentTasks 为空，尝试从所有消息中收集任务
    if (tasksToCreate.length === 0) {
      messages.forEach(msg => {
        if (msg.tasks && msg.tasks.length > 0) {
          tasksToCreate = [...tasksToCreate, ...msg.tasks];
        }
      });
    }
    
    if (tasksToCreate.length > 0) {
      console.log('Creating tasks:', tasksToCreate.length);
      const tasks: Task[] = tasksToCreate.map(task => ({
        ...task,
        scheduledDate: task.scheduledDate,
      }));
      onCreateTasks(tasks);
      onClose();
    } else {
      console.warn('No tasks to create');
    }
  };

  // 按日期分组任务
  const getScheduleByDate = (tasks: ScheduledTask[]): { date: string; tasks: ScheduledTask[] }[] => {
    const scheduleMap = new Map<string, ScheduledTask[]>();
    tasks.forEach(task => {
      const existing = scheduleMap.get(task.scheduledDate) || [];
      scheduleMap.set(task.scheduledDate, [...existing, task]);
    });
    return Array.from(scheduleMap.entries())
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getRewardColor = (key: string) => {
    const colors: Record<string, string> = {
      INT: '#5a7d8c', VIT: '#3d7a54', CHA: '#d88e99', GOLD: '#d4a832', WIL: '#8b6f9f',
    };
    return colors[key] || '#999';
  };

  const getRewardIcon = (key: string) => {
    const icons: Record<string, string> = {
      INT: '🧠', VIT: '💪', CHA: '✨', GOLD: '💰', WIL: '🔥',
    };
    return icons[key] || '⭐';
  };

  // 渲染任务列表
  const renderTaskList = (tasks: ScheduledTask[]) => {
    const schedule = getScheduleByDate(tasks);
    return (
      <div className="mt-3 space-y-3">
        {schedule.map(({ date, tasks: dateTasks }) => (
          <div 
            key={date} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(date)}
          >
            <div className="bg-gradient-to-r from-[#2d5f3f]/10 to-[#3d7a54]/5 px-3 py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="ios-text text-xs font-semibold text-[#2d5f3f]">
                  {getDateDisplayName(date)}
                </span>
                <span className="ios-text text-xs text-gray-500">
                  {dateTasks.length}个任务
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {dateTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2.5 transition-colors ${draggedTaskId === task.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 mt-0.5">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="任务标题"
                            className="w-full px-2 py-1 rounded-lg border border-[#2d5f3f] focus:outline-none text-sm"
                            autoFocus
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="任务详情（可选）"
                            className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-[#2d5f3f] text-sm resize-none"
                            rows={2}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-sm"
                            />
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1 rounded-lg bg-[#2d5f3f] text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="ios-text text-sm text-gray-900 font-medium leading-tight">{task.title}</h4>
                          {task.description && (
                            <p className="ios-text text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="ios-text text-xs text-gray-400">⏱{task.duration}分钟</span>
                            <div className="flex items-center gap-1">
                              {Object.entries(task.rewards).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="ios-text text-xs px-1 py-0.5 rounded-full font-medium"
                                  style={{
                                    backgroundColor: `${getRewardColor(key)}15`,
                                    color: getRewardColor(key),
                                  }}
                                >
                                  {getRewardIcon(key)}+{value}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {editingId !== task.id && (
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleEdit(task)} className="p-1 rounded-lg hover:bg-gray-100">
                          <Edit2 className="w-3 h-3 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="p-1 rounded-lg hover:bg-gray-100">
                          <Trash2 className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[65vh]">
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-[#2d5f3f]' : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* 消息气泡 */}
              <div className={`rounded-2xl px-4 py-2.5 ${
                msg.role === 'user' 
                  ? 'bg-[#2d5f3f] text-white rounded-tr-sm' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                <p className="ios-text text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {/* 任务列表 */}
                {msg.type === 'tasks' && msg.tasks && msg.tasks.length > 0 && (
                  renderTaskList(msg.tasks)
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* 加载指示器 */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="ios-text text-sm text-gray-500">思考中...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 示例目标（仅在初始状态显示） */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/50">
            <p className="ios-text text-xs text-amber-800 font-medium mb-2">试试这些目标：</p>
            <div className="flex flex-wrap gap-2">
              {['一周学会 React', '准备期末考试', '每天健身减肥', '完成项目开发'].map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 bg-white rounded-lg border border-amber-200 ios-text text-xs text-amber-900 font-medium active:opacity-70 transition-opacity"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 确认按钮（有任务时显示） */}
      {getAllTasks().length > 0 && (
        <div className="px-4 pb-2 space-y-2">
          {/* 任务统计 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>已规划 {getAllTasks().length} 个任务（{getTaskDateRange()}）</span>
            <button
              onClick={handleClearTasks}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              清空重新开始
            </button>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full bg-[#2d5f3f] hover:bg-[#3d7a54] text-white px-4 py-3 rounded-xl ios-text font-semibold active:opacity-80 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>确认创建 {getAllTasks().length} 个任务</span>
          </button>
        </div>
      )}

      {/* 底部输入区域 */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的目标或要求..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-[#2d5f3f] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/10 transition-all ios-text text-sm"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#2d5f3f] hover:bg-[#3d7a54] text-white flex items-center justify-center active:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }
      `}</style>
    </div>
  );
}
