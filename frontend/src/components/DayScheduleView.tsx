import { useState } from 'react';
import React from 'react';
import { Check, Clock, Coffee, Utensils, Moon, Sun, ChevronDown, Trash2 } from 'lucide-react';

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

interface DayScheduleViewProps {
  schedule: ScheduleItem[];
  onToggleComplete: (itemId: string, linkedTaskId?: string) => void;
  onDeleteItem: (itemId: string) => void;
  onClearSchedule: () => void;
}

// 类型样式配置
const TYPE_STYLES = {
  task: {
    bg: '#dcfce7',
    border: '#86efac',
    text: '#16a34a',
    iconBg: '#bbf7d0',
  },
  meal: {
    bg: '#ffedd5',
    border: '#fdba74',
    text: '#ea580c',
    iconBg: '#fed7aa',
  },
  break: {
    bg: '#dbeafe',
    border: '#93c5fd',
    text: '#2563eb',
    iconBg: '#bfdbfe',
  },
  routine: {
    bg: '#f3e8ff',
    border: '#d8b4fe',
    text: '#9333ea',
    iconBg: '#e9d5ff',
  },
};

const COMPLETED_STYLE = {
  bg: '#f9fafb',
  border: '#e5e7eb',
  text: '#9ca3af',
  iconBg: '#f3f4f6',
};

const REWARD_COLORS: Record<string, string> = {
  INT: '#5a7d8c',
  VIT: '#3d7a54',
  CHA: '#d88e99',
  GOLD: '#d4a832',
  WIL: '#8b6f9f',
};

// 中文字体
const fontStyle: React.CSSProperties = {
  fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', system-ui, sans-serif",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meal': return <Utensils className="w-4 h-4" />;
    case 'break': return <Coffee className="w-4 h-4" />;
    case 'routine': return <Moon className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'meal': return '用餐';
    case 'break': return '休息';
    case 'routine': return '日常';
    default: return '任务';
  }
};

export function DayScheduleView({ schedule, onToggleComplete, onDeleteItem, onClearSchedule }: DayScheduleViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const sortedSchedule = [...schedule].sort((a, b) => a.time.localeCompare(b.time));
  
  const completedCount = schedule.filter(item => item.completed).length;
  const taskCount = schedule.filter(item => item.type === 'task').length;
  const completedTaskCount = schedule.filter(item => item.type === 'task' && item.completed).length;
  
  const progress = schedule.length > 0 ? (completedCount / schedule.length) * 100 : 0;
  
  const getCurrentTime = () => {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  };
  
  const currentTime = getCurrentTime();
  
  const findCurrentItem = () => {
    for (let i = 0; i < sortedSchedule.length; i++) {
      const item = sortedSchedule[i];
      const nextItem = sortedSchedule[i + 1];
      if (currentTime >= item.time && (!nextItem || currentTime < nextItem.time)) {
        return item.id;
      }
    }
    return null;
  };
  
  const currentItemId = findCurrentItem();

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div 
      style={{
        ...fontStyle,
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        border: '2px solid #e8e3d6',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '16px',
      }}
    >
      {/* Header - 橙色渐变 */}
      <div 
        style={{
          background: 'linear-gradient(to right, #f59e0b, #f97316)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sun className="w-5 h-5" style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ ...fontStyle, color: 'white', fontWeight: 500, fontSize: '16px', margin: 0 }}>
                今日日程
              </h3>
              <p style={{ ...fontStyle, color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: '4px 0 0 0' }}>
                {completedCount}/{schedule.length} 已完成 · {taskCount} 个任务
              </p>
            </div>
          </div>
          <button
            onClick={onClearSchedule}
            style={{
              ...fontStyle,
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            清空日程
          </button>
        </div>
        
        {/* Progress bar */}
        <div 
          style={{
            marginTop: '12px',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: 'white',
              borderRadius: '999px',
              transition: 'width 0.5s',
              width: progress + '%',
            }}
          />
        </div>
      </div>
      
      {/* Schedule List */}
      <div>
        {sortedSchedule.map((item, index) => {
          const typeStyle = item.completed ? COMPLETED_STYLE : TYPE_STYLES[item.type] || TYPE_STYLES.task;
          const isExpanded = expandedId === item.id;
          const isCurrent = currentItemId === item.id && !item.completed;
          
          return (
            <div
              key={item.id}
              style={{
                position: 'relative',
                backgroundColor: isCurrent ? 'rgba(251,191,36,0.1)' : 'transparent',
                borderBottom: index < sortedSchedule.length - 1 ? '1px solid #f5f1e8' : 'none',
              }}
            >
              {/* Current indicator */}
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: '#f59e0b',
                }} />
              )}
              
              <div style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Time & Checkbox */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      ...fontStyle,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: typeStyle.text,
                    }}>
                      {item.time}
                    </span>
                    <button
                      onClick={() => onToggleComplete(item.id, item.linkedTaskId)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: item.completed ? '#2d5f3f' : '#d1d5db',
                        backgroundColor: item.completed ? '#2d5f3f' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {item.completed && <Check className="w-4 h-4" style={{ color: 'white' }} strokeWidth={3} />}
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '8px',
                        backgroundColor: typeStyle.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: typeStyle.text,
                      }}>
                        {getTypeIcon(item.type)}
                      </div>
                      <h4 style={{
                        ...fontStyle,
                        fontSize: '14px',
                        fontWeight: 500,
                        color: item.completed ? '#9ca3af' : '#111827',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        margin: 0,
                      }}>
                        {item.title}
                      </h4>
                      <span style={{
                        ...fontStyle,
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: typeStyle.bg,
                        color: typeStyle.text,
                      }}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    
                    {/* Duration & Rewards */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ ...fontStyle, fontSize: '12px', color: '#9ca3af' }}>
                        {item.duration}分钟
                      </span>
                      {item.rewards && Object.entries(item.rewards).map(([key, value]) => (
                        <span
                          key={key}
                          style={{
                            ...fontStyle,
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '999px',
                            fontWeight: 500,
                            backgroundColor: REWARD_COLORS[key] + '20',
                            color: REWARD_COLORS[key],
                          }}
                        >
                          +{value} {key}
                        </span>
                      ))}
                    </div>
                    
                    {/* Description */}
                    {item.description && isExpanded && (
                      <p style={{
                        ...fontStyle,
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '8px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        padding: '8px',
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {item.description && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronDown 
                          className="w-4 h-4" 
                          style={{ 
                            color: '#9ca3af',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s',
                          }} 
                        />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#d1d5db' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#faf7f0',
        borderTop: '1px solid #e8e3d6',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#6b7280',
        }}>
          <span style={fontStyle}>任务完成: {completedTaskCount}/{taskCount}</span>
          <span style={fontStyle}>整体进度: {Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
