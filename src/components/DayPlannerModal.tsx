import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { X, Loader2, Check, Edit2, Trash2, Send, Bot, User, Sun, Clock, Coffee, Utensils, Moon, Sparkles } from 'lucide-react';
import { Task } from './TaskCreationModal';
import { generateAIContext, getUserData } from '../services/userDatabase';

interface DayPlannerModalProps {
  onClose: () => void;
  onSaveSchedule: (schedule: ScheduleItem[], targetDate: string) => void;
  existingTasks: Task[];
  targetDate: Date; // 规划的目标日期
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  duration: number;
  type: 'task' | 'meal' | 'break' | 'routine';
  rewards?: {
    INT?: number;
    VIT?: number;
    CHA?: number;
    GOLD?: number;
    WIL?: number;
  };
  completed: boolean;
  linkedTaskId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'schedule';
  schedule?: ScheduleItem[];
}

const API_KEY = import.meta.env.VITE_DASHSCOPE_KEY || '';
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meal': return <Utensils className="w-3.5 h-3.5" />;
    case 'break': return <Coffee className="w-3.5 h-3.5" />;
    case 'routine': return <Moon className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'meal': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' };
    case 'break': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
    case 'routine': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' };
    default: return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' };
  }
};

export function DayPlannerModal({ onClose, onSaveSchedule, existingTasks, targetDate }: DayPlannerModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBeijingDate = (): Date => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (8 * 60 * 60 * 1000));
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = (): string => {
    const now = getBeijingDate();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // 格式化显示日期
  const formatDisplayDate = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    
    if (target.getTime() === today.getTime()) return '今天';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (target.getTime() === tomorrow.getTime()) return '明天';
    
    const month = target.getMonth() + 1;
    const day = target.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return month + '月' + day + '日 ' + weekDays[target.getDay()];
  };

  useEffect(() => {
    const currentTime = getCurrentTime();
    const targetDateDisplay = formatDisplayDate(targetDate);
    const taskList = existingTasks.map(t => '• ' + t.title).join('\n');
    const existingTasksInfo = existingTasks.length > 0 
      ? '\n\n我注意到' + targetDateDisplay + '已经有 ' + existingTasks.length + ' 个待完成的任务：\n' + taskList + '\n\n我会把这些任务也安排进你的日程中。'
      : '';
    
    const welcomeContent = '你好！我是你的一天规划助手 ☀️\n\n让我来帮你规划【' + targetDateDisplay + '】的日程吧！' + existingTasksInfo + '\n\n请告诉我：\n1. ' + targetDateDisplay + '有什么特别的安排或约会吗？\n2. 你希望几点起床/睡觉？\n3. 有什么必须完成的重要事项吗？\n4. 有其他需求或偏好吗？（比如午休时间、运动时间等）';
    
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: welcomeContent,
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  const buildSystemPrompt = () => {
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const targetDateDisplay = formatDisplayDate(targetDate);
    const currentTime = getCurrentTime();
    const userContext = generateAIContext();
    
    const taskListStr = existingTasks.map(t => '- ' + t.title + '（预计' + t.duration + '分钟）').join('\n');
    const existingTasksInfo = existingTasks.length > 0 
      ? '\n【' + targetDateDisplay + '已有任务】\n' + taskListStr + '\n这些任务必须安排进日程中！\n'
      : '';

    const systemPrompt = '你是一个专业的日程规划助手，擅长帮助用户规划高效且平衡的一天。\n\n' +
      '【重要：时区说明】\n' +
      '所有时间均使用北京时间（UTC+8），24小时制格式如 "09:00"、"21:30"\n\n' +
      (userContext ? '【用户背景信息】\n' + userContext + '\n' : '') + existingTasksInfo +
      '【规划日期】' + targetDateStr + '（' + targetDateDisplay + '）\n' +
      '【当前北京时间】' + currentTime + '\n\n' +
      '【对话规则】\n' +
      '1. 首先通过1-2个简短问题了解用户的需求：\n' +
      '   - 今天的特别安排或约会\n' +
      '   - 作息时间偏好\n' +
      '   - 必须完成的重要事项\n' +
      '   - 其他需求（午休、运动等）\n\n' +
      '2. 收集到足够信息后，生成完整的一天日程。日程必须用以下JSON格式返回：\n' +
      '```json\n' +
      '{\n' +
      '  "schedule": [\n' +
      '    {\n' +
      '      "time": "07:00",\n' +
      '      "title": "起床洗漱",\n' +
      '      "description": "洗脸刷牙，整理仪容",\n' +
      '      "duration": 30,\n' +
      '      "type": "routine",\n' +
      '      "rewards": { "VIT": 2, "CHA": 1 }\n' +
      '    },\n' +
      '    {\n' +
      '      "time": "07:30",\n' +
      '      "title": "早餐",\n' +
      '      "description": "营养均衡的早餐",\n' +
      '      "duration": 30,\n' +
      '      "type": "meal",\n' +
      '      "rewards": { "VIT": 3 }\n' +
      '    },\n' +
      '    {\n' +
      '      "time": "09:00",\n' +
      '      "title": "学习React",\n' +
      '      "description": "按照计划学习React基础",\n' +
      '      "duration": 60,\n' +
      '      "type": "task",\n' +
      '      "rewards": { "INT": 5, "WIL": 3 }\n' +
      '    }\n' +
      '  ]\n' +
      '}\n' +
      '```\n\n' +
      '【type类型说明】\n' +
      '- "task": 学习/工作任务（绿色标记）\n' +
      '- "meal": 三餐（橙色标记）- 必须包含早餐、午餐、晚餐\n' +
      '- "break": 休息/放松（蓝色标记）\n' +
      '- "routine": 日常事务如起床、洗漱、睡觉等（紫色标记）\n\n' +
      '【日程生成规则 - 严格遵守】\n' +
      '1. 起床时间：通常 06:00-09:00，根据用户偏好调整\n' +
      '2. 早餐时间：07:00-09:00\n' +
      '3. 午餐时间：11:30-13:00\n' +
      '4. 晚餐时间：17:30-19:00（注意：这是吃饭时间，不是睡觉时间！）\n' +
      '5. 睡觉时间：通常 21:30-00:00（不能在17点、18点等傍晚时间睡觉！）\n' +
      '6. 每工作/学习1.5-2小时应安排10-15分钟休息\n' +
      '7. 如果用户有已存在的任务，必须将它们安排进日程\n' +
      '8. 时间格式必须是 "HH:MM"（24小时制北京时间）\n' +
      '9. 安排要合理，不要有时间冲突\n' +
      '10. 日程应从起床安排到睡觉，覆盖完整的一天\n\n' +
      '【奖励属性说明】\n' +
      '- INT(智力): 学习、思考类活动，数值1-10\n' +
      '- VIT(体质): 运动、饮食、休息类，数值1-10\n' +
      '- CHA(魅力): 社交、形象管理类，数值1-10\n' +
      '- GOLD(财富): 工作、理财类，数值1-10\n' +
      '- WIL(意志): 需要毅力的活动，数值1-10\n\n' +
      '【重要提醒】\n' +
      '- 回复要简洁友好\n' +
      '- 只在生成日程时才输出JSON，普通对话不要输出JSON\n' +
      '- 生成的日程要完整覆盖用户的一天\n' +
      '- 用户可以要求修改日程，修改时返回完整的新日程\n' +
      '- 绝对不能在傍晚时间(17:00-20:00)安排睡觉！';

    return systemPrompt;
  };

  const parseScheduleFromResponse = (content: string): ScheduleItem[] | null => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      const directJsonMatch = content.match(/\{[\s\S]*"schedule"[\s\S]*\}/);
      if (!directJsonMatch) return null;
      try {
        const parsed = JSON.parse(directJsonMatch[0]);
        return parseSchedule(parsed);
      } catch {
        return null;
      }
    }
    
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return parseSchedule(parsed);
    } catch {
      return null;
    }
  };

  const parseSchedule = (parsed: any): ScheduleItem[] => {
    if (!parsed.schedule || !Array.isArray(parsed.schedule)) return [];
    
    return parsed.schedule.map((item: any, index: number) => {
      // 尝试匹配已有任务（根据标题模糊匹配）
      let linkedTaskId: string | undefined = undefined;
      if (item.type === 'task') {
        const matchedTask = existingTasks.find(t => 
          t.title.includes(item.title) || item.title.includes(t.title) ||
          t.title.replace(/^\[\d{2}:\d{2}\]\s*/, '') === item.title
        );
        if (matchedTask) {
          linkedTaskId = matchedTask.id;
        }
      }
      
      return {
        id: 'schedule-' + Date.now() + '-' + index,
        time: item.time || '09:00',
        title: item.title || '',
        description: item.description || '',
        duration: item.duration || 30,
        type: item.type || 'task',
        rewards: item.rewards || {},
        completed: false,
        linkedTaskId,
      };
    });
  };

  const extractTextFromResponse = (content: string): string => {
    return content
      .replace(/```json\s*[\s\S]*?\s*```/g, '')
      .replace(/\{[\s\S]*"schedule"[\s\S]*\}/g, '')
      .trim();
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

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
        throw new Error('API 请求失败: ' + response.status);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || '抱歉，我遇到了一些问题，请稍后再试。';

      const schedule = parseScheduleFromResponse(aiContent);
      const textContent = extractTextFromResponse(aiContent);

      setConversationHistory([...newHistory, { role: 'assistant', content: aiContent }]);

      if (schedule && schedule.length > 0) {
        setCurrentSchedule(schedule);
        
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: textContent || '好的，我为你规划了今天的日程：',
          type: 'schedule',
          schedule: schedule,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleExampleClick = (example: string) => {
    sendMessage(example);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditTime(item.time);
    setEditTitle(item.title);
  };

  const handleSaveEdit = (itemId: string) => {
    setCurrentSchedule(currentSchedule.map(item => 
      item.id === itemId ? { ...item, time: editTime, title: editTitle } : item
    ));
    setMessages(messages.map(msg => {
      if (msg.schedule) {
        return {
          ...msg,
          schedule: msg.schedule.map(item => 
            item.id === itemId ? { ...item, time: editTime, title: editTitle } : item
          )
        };
      }
      return msg;
    }));
    setEditingId(null);
  };

  const handleDelete = (itemId: string) => {
    setCurrentSchedule(currentSchedule.filter(item => item.id !== itemId));
    setMessages(messages.map(msg => {
      if (msg.schedule) {
        return {
          ...msg,
          schedule: msg.schedule.filter(item => item.id !== itemId)
        };
      }
      return msg;
    }));
  };

  const handleConfirm = () => {
    if (currentSchedule.length === 0) return;

    // 使用目标日期
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    // 直接保存日程数据，不创建新任务
    // 日程中 type='task' 的项目如果关联了已有任务，保留 linkedTaskId
    onSaveSchedule(currentSchedule, targetDateStr);
    
    onClose();
  };

  const getScheduleStats = () => {
    const taskCount = currentSchedule.filter(i => i.type === 'task').length;
    const mealCount = currentSchedule.filter(i => i.type === 'meal').length;
    const breakCount = currentSchedule.filter(i => i.type === 'break').length;
    return { taskCount, mealCount, breakCount, total: currentSchedule.length };
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

  const renderScheduleList = (schedule: ScheduleItem[]) => {
    const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));
    
    return (
      <div className="mt-3 space-y-2">
        {sortedSchedule.map((item) => {
          const typeColor = getTypeColor(item.type);
          return (
            <div 
              key={item.id} 
              className={`${typeColor.bg} ${typeColor.border} border rounded-xl p-3 transition-all`}
            >
              {editingId === item.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-300 text-sm w-24"
                    />
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg border border-gray-300 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1.5 rounded-lg bg-[#2d5f3f] text-white"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${typeColor.bg} ${typeColor.border} border flex items-center justify-center ${typeColor.text}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${typeColor.text}`}>{item.time}</span>
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mb-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400">⏱{item.duration}分钟</span>
                      {item.rewards && Object.entries(item.rewards).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1 rounded-lg hover:bg-white/50">
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 rounded-lg hover:bg-white/50">
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const stats = getScheduleStats();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#fffef9] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-[#e8e3d6] flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-[#e8e3d6] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(to bottom right, #fbbf24, #f97316)' }}
              >
                <Sun className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#1a1a1a]">规划我的一天</h2>
                <p className="text-xs text-[#737373]">AI 帮你安排完美的一天</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-[#faf7f0] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#4a4a4a]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 消息列表区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center`}
                  style={{ 
                    background: msg.role === 'user' ? '#2d5f3f' : 'linear-gradient(to bottom right, #fbbf24, #f97316)'
                  }}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user' 
                    ? 'bg-[#2d5f3f] text-white rounded-tr-sm' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.type === 'schedule' && msg.schedule && msg.schedule.length > 0 && (
                    renderScheduleList(msg.schedule)
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(to bottom right, #fbbf24, #f97316)' }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">正在规划中...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 示例问题 */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/50">
              <p className="text-xs text-amber-800 font-medium mb-2">试试这样说：</p>
              <div className="flex flex-wrap gap-2">
                {[
                  '我想8点起床，晚上11点睡',
                  '今天下午有个会议3点开始',
                  '我想安排2小时学习，1小时运动',
                  '帮我安排一个高效的工作日'
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1.5 bg-white rounded-lg border border-amber-200 text-xs text-amber-900 font-medium active:opacity-70 transition-opacity"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 确认按钮 */}
        {currentSchedule.length > 0 && (
          <div className="px-4 pb-2 space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                共 {stats.total} 项：{stats.taskCount} 个任务 · {stats.mealCount} 餐 · {stats.breakCount} 次休息
              </span>
              <button
                onClick={() => setCurrentSchedule([])}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                清空重新规划
              </button>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full text-white px-4 py-3 rounded-xl font-semibold active:opacity-80 transition-all shadow-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }}
            >
              <Sparkles className="w-5 h-5" />
              <span>确认日程（将创建 {stats.taskCount} 个任务）</span>
            </button>
          </div>
        )}

        {/* 底部输入区域 */}
        <div className="border-t-2 border-[#e8e3d6] p-3 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="告诉我你今天的安排..."
              className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all text-sm"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || loading}
              className="w-10 h-10 rounded-full text-white flex items-center justify-center active:opacity-80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #f59e0b, #f97316)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
