import { useState } from 'react';
import { ArrowRight, Brain, Flame, Calendar } from 'lucide-react';
import { Task } from './TaskCreationModal';

interface ManualTaskCreationProps {
  onCreateTasks: (tasks: Task[]) => void;
  onClose: () => void;
}

// 格式化日期为 YYYY-MM-DD（使用本地时间）
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DURATION_OPTIONS = [
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 },
  { label: '2 小时', value: 120 },
  { label: '自定义', value: 0 },
];

export function ManualTaskCreation({ onCreateTasks, onClose }: ManualTaskCreationProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState('');
  const [scheduledDate, setScheduledDate] = useState(formatDateToString(new Date()));

  const handleCreate = () => {
    if (!title.trim()) return;

    const finalDuration = selectedDuration === 0 ? parseInt(customDuration) || 60 : selectedDuration;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      duration: finalDuration,
      scheduledDate: scheduledDate,
      rewards: { INT: 5, WIL: 2 },
      completed: false,
    };

    onCreateTasks([task]);
    onClose();
  };

  // 格式化日期显示
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) return '今天';
    if (dateOnly.getTime() === tomorrow.getTime()) return '明天';
    
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
            任务名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：完成 React 组件开发"
            className="w-full px-4 py-3 bg-white border-2 border-[#e8e3d6] rounded-2xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f] focus:border-transparent transition-all"
            maxLength={50}
          />
          <p className="text-xs text-[#737373] text-right mt-1.5">{title.length}/50</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a4a4a] mb-2">任务描述（可选）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加任务的详细说明..."
            className="w-full px-4 py-3 bg-white border-2 border-[#e8e3d6] rounded-2xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f] focus:border-transparent transition-all resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-[#737373] text-right mt-1.5">{description.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a4a4a] mb-2">预计时长</label>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedDuration(option.value);
                  if (option.value !== 0) setCustomDuration('');
                }}
                className={`px-4 py-3 rounded-2xl transition-all border-2 text-sm font-medium ${
                  selectedDuration === option.value
                    ? 'bg-[#2d5f3f] text-white border-[#2d5f3f] shadow-md'
                    : 'bg-white text-[#4a4a4a] border-[#e8e3d6] hover:border-[#2d5f3f]/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {selectedDuration === 0 && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="分钟数"
                min="1"
                max="999"
                className="flex-1 px-4 py-3 bg-white border-2 border-[#e8e3d6] rounded-2xl text-[#1a1a1a] placeholder:text-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f] focus:border-transparent transition-all"
              />
              <span className="text-sm text-[#4a4a4a]">分钟</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              计划日期
            </div>
          </label>
          <div className="relative">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={formatDateToString(new Date())}
              className="w-full px-4 py-3 bg-white border-2 border-[#e8e3d6] rounded-2xl text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f] focus:border-transparent transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#737373] pointer-events-none">
              {formatDateLabel(scheduledDate)}
            </div>
          </div>
        </div>

        <div className="bg-[#faf7f0] border-2 border-[#e8e3d6] rounded-2xl p-4">
          <h4 className="text-xs font-medium text-[#4a4a4a] mb-3">默认奖励</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#5a7d8c]/10 border border-[#5a7d8c]/20 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#5a7d8c]" strokeWidth={1.5} />
              </div>
              <span className="text-sm text-[#4a4a4a]">+5 智力</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#8b6f9f]/10 border border-[#8b6f9f]/20 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#8b6f9f]" strokeWidth={1.5} />
              </div>
              <span className="text-sm text-[#4a4a4a]">+2 意志</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={!title.trim()}
        className="w-full inline-flex items-center justify-center gap-3 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#2d5f3f] disabled:hover:shadow-lg group"
      >
        <span className="font-medium">创建任务</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
