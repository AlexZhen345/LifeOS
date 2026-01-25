import { useState, useEffect } from 'react';
import { User, Clock, Briefcase, BookOpen, Target, Zap, X, Save, Plus } from 'lucide-react';
import { 
  getUserData, 
  updateUserProfile, 
  updateUserSkills, 
  UserProfile, 
  UserSkills 
} from '../services/userDatabase';

interface UserProfileEditorProps {
  onClose: () => void;
  onSave?: () => void;
}

export function UserProfileEditor({ onClose, onSave }: UserProfileEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'skills'>('basic');
  const [profile, setProfile] = useState<UserProfile>({ name: '' });
  const [skills, setSkills] = useState<UserSkills>({
    skills: [],
    learningGoals: [],
    strengths: [],
    weaknesses: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setProfile(userData.profile);
      setSkills(userData.skills);
    }
  }, []);

  const handleSaveProfile = () => {
    updateUserProfile(profile);
    updateUserSkills(skills);
    onSave?.();
    onClose();
  };

  const addToList = (
    list: string[],
    setList: (val: string[]) => void,
    value: string,
    setValue: (val: string) => void
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue('');
    }
  };

  const removeFromList = (list: string[], setList: (val: string[]) => void, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const workPeriodLabels: Record<string, string> = {
    morning: '上午 (6-12点)',
    afternoon: '下午 (12-18点)',
    evening: '傍晚 (18-21点)',
    night: '晚上 (21-24点)',
  };

  const toggleWorkPeriod = (period: 'morning' | 'afternoon' | 'evening' | 'night') => {
    const current = profile.preferredWorkPeriods || [];
    if (current.includes(period)) {
      setProfile({
        ...profile,
        preferredWorkPeriods: current.filter(p => p !== period),
      });
    } else {
      setProfile({
        ...profile,
        preferredWorkPeriods: [...current, period],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="ios-text text-lg font-semibold text-gray-900">个人设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 ios-text text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-[#2d5f3f] border-b-2 border-[#2d5f3f]'
                : 'text-gray-500'
            }`}
          >
            <User className="w-4 h-4 inline mr-1.5" />
            基础信息
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3 ios-text text-sm font-medium transition-colors ${
              activeTab === 'skills'
                ? 'text-[#2d5f3f] border-b-2 border-[#2d5f3f]'
                : 'text-gray-500'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-1.5" />
            技能偏好
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
          {activeTab === 'basic' && (
            <>
              {/* 职业 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  职业
                </label>
                <input
                  type="text"
                  value={profile.occupation || ''}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  placeholder="例如：学生、程序员、设计师..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/10"
                />
              </div>

              {/* 年龄 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">年龄</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                  placeholder="你的年龄"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/10"
                />
              </div>

              {/* 作息时间 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  作息时间
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={profile.wakeUpTime || '07:00'}
                    onChange={(e) => setProfile({ ...profile, wakeUpTime: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <span className="ios-text text-sm text-gray-400">至</span>
                  <input
                    type="time"
                    value={profile.sleepTime || '23:00'}
                    onChange={(e) => setProfile({ ...profile, sleepTime: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                </div>
              </div>

              {/* 每日可用时间 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">
                  每日可用学习/工作时间（小时）
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={profile.dailyAvailableHours || 4}
                  onChange={(e) => setProfile({ ...profile, dailyAvailableHours: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/10"
                />
              </div>

              {/* 偏好工作时段 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">偏好工作时段</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(workPeriodLabels) as [string, string][]).map(([key, label]) => {
                    const isSelected = profile.preferredWorkPeriods?.includes(key as any);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleWorkPeriod(key as any)}
                        className={`px-3 py-2 rounded-xl ios-text text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-[#2d5f3f] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'skills' && (
            <>
              {/* 偏好任务时长 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  偏好的单个任务时长（分钟）
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={skills.preferredTaskDuration || 60}
                  onChange={(e) => setSkills({ ...skills, preferredTaskDuration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none focus:ring-2 focus:ring-[#2d5f3f]/10"
                />
              </div>

              {/* 已掌握技能 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">已掌握技能</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToList(skills.skills, (val) => setSkills({ ...skills, skills: val }), newSkill, setNewSkill)}
                    placeholder="输入技能，回车添加"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <button
                    onClick={() => addToList(skills.skills, (val) => setSkills({ ...skills, skills: val }), newSkill, setNewSkill)}
                    className="p-2 bg-[#2d5f3f] text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg ios-text text-xs"
                    >
                      {skill}
                      <button onClick={() => removeFromList(skills.skills, (val) => setSkills({ ...skills, skills: val }), index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 学习目标 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  学习目标
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToList(skills.learningGoals, (val) => setSkills({ ...skills, learningGoals: val }), newGoal, setNewGoal)}
                    placeholder="你想学什么？"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <button
                    onClick={() => addToList(skills.learningGoals, (val) => setSkills({ ...skills, learningGoals: val }), newGoal, setNewGoal)}
                    className="p-2 bg-[#2d5f3f] text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.learningGoals.map((goal, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg ios-text text-xs"
                    >
                      {goal}
                      <button onClick={() => removeFromList(skills.learningGoals, (val) => setSkills({ ...skills, learningGoals: val }), index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 擅长领域 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">擅长领域</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToList(skills.strengths, (val) => setSkills({ ...skills, strengths: val }), newStrength, setNewStrength)}
                    placeholder="你擅长什么？"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <button
                    onClick={() => addToList(skills.strengths, (val) => setSkills({ ...skills, strengths: val }), newStrength, setNewStrength)}
                    className="p-2 bg-[#2d5f3f] text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.strengths.map((strength, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg ios-text text-xs"
                    >
                      {strength}
                      <button onClick={() => removeFromList(skills.strengths, (val) => setSkills({ ...skills, strengths: val }), index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 薄弱领域 */}
              <div className="space-y-1.5">
                <label className="ios-text text-sm text-gray-600 font-medium">薄弱领域（需要加强的）</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWeakness}
                    onChange={(e) => setNewWeakness(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addToList(skills.weaknesses, (val) => setSkills({ ...skills, weaknesses: val }), newWeakness, setNewWeakness)}
                    placeholder="哪些方面需要提高？"
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 ios-text text-sm focus:border-[#2d5f3f] focus:outline-none"
                  />
                  <button
                    onClick={() => addToList(skills.weaknesses, (val) => setSkills({ ...skills, weaknesses: val }), newWeakness, setNewWeakness)}
                    className="p-2 bg-[#2d5f3f] text-white rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.weaknesses.map((weakness, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg ios-text text-xs"
                    >
                      {weakness}
                      <button onClick={() => removeFromList(skills.weaknesses, (val) => setSkills({ ...skills, weaknesses: val }), index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 保存按钮 - 移到内容区域内 */}
          <div className="pt-4 mt-2">
            <button
              onClick={handleSaveProfile}
              className="w-full bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl ios-text font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              保存设置
            </button>
          </div>
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
