import { useState } from 'react';
import { X, Sparkles, Edit3 } from 'lucide-react';
import { AITaskCreation } from './AITaskCreation';
import { ManualTaskCreation } from './ManualTaskCreation';

interface TaskCreationModalProps {
  onClose: () => void;
  onCreateTasks: (tasks: Task[]) => void;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  duration: number;
  scheduledDate: string; // YYYY-MM-DD format
  rewards: {
    INT?: number;
    VIT?: number;
    CHA?: number;
    GOLD?: number;
    WIL?: number;
  };
  completed: boolean;
}

export function TaskCreationModal({ onClose, onCreateTasks }: TaskCreationModalProps) {
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#fffef9] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-[#e8e3d6]">
        {/* Header */}
        <div className="border-b-2 border-[#e8e3d6] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showManual ? (
                <>
                  <div className="w-10 h-10 bg-[#faf7f0] rounded-xl flex items-center justify-center border border-[#e8e3d6]">
                    <Edit3 className="w-5 h-5 text-[#4a4a4a]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-light text-[#1a1a1a]">手动创建任务</h2>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2d5f3f] to-[#1e4029] rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-[#f5c344]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-light text-[#1a1a1a]">AI 智能规划</h2>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-[#faf7f0] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#4a4a4a]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {showManual ? (
            <ManualTaskCreation onCreateTasks={onCreateTasks} onClose={onClose} />
          ) : (
            <AITaskCreation onCreateTasks={onCreateTasks} onClose={onClose} />
          )}
        </div>

        {/* Footer - Toggle */}
        {!showManual && (
          <div className="border-t-2 border-[#e8e3d6] px-6 py-4 bg-[#faf7f0]">
            <button
              onClick={() => setShowManual(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#4a4a4a] hover:text-[#1a1a1a] py-2 transition-colors group"
            >
              <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span>手动创建任务</span>
            </button>
          </div>
        )}

        {showManual && (
          <div className="border-t-2 border-[#e8e3d6] px-6 py-4 bg-[#faf7f0]">
            <button
              onClick={() => setShowManual(false)}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#4a4a4a] hover:text-[#1a1a1a] py-2 transition-colors group"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span>使用 AI 智能规划</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
