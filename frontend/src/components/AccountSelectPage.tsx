import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, LogIn, UserPlus } from 'lucide-react';
import { AccountInfo, switchAccount, deleteAccount } from '../services/userDatabase';

interface AccountSelectPageProps {
  accounts: AccountInfo[];
  onSelectAccount: (accountId: string) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export function AccountSelectPage({ 
  accounts, 
  onSelectAccount, 
  onCreateNew, 
  onBack 
}: AccountSelectPageProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelectAccount = (accountId: string) => {
    switchAccount(accountId);
    onSelectAccount(accountId);
  };

  const handleDeleteAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === accountId) {
      deleteAccount(accountId);
      setConfirmDeleteId(null);
      // 刷新页面以更新账户列表
      window.location.reload();
    } else {
      setConfirmDeleteId(accountId);
      // 3秒后重置确认状态
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f0] to-[#f5f1e8] px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* 返回按钮 */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#737373] hover:text-[#2d5f3f] mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#1a1a1a] mb-2">选择账户</h1>
          <p className="text-[#737373]">选择一个账户登录或创建新账户</p>
        </div>

        {/* 账户列表 */}
        <div className="space-y-3 mb-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => handleSelectAccount(account.id)}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e8e3d6] hover:border-[#2d5f3f] hover:shadow-md cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f3f] to-[#3d7a54] rounded-xl flex items-center justify-center text-white text-lg font-medium shadow-md">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-[#1a1a1a] text-lg">{account.name}</div>
                  <div className="text-sm text-[#a0a0a0]">
                    上次活跃: {formatDate(account.lastActiveAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDeleteAccount(account.id, e)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    confirmDeleteId === account.id
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-[#a0a0a0] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                  }`}
                  title={confirmDeleteId === account.id ? '再次点击确认删除' : '删除账户'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <LogIn className="w-5 h-5 text-[#2d5f3f] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* 创建新账户按钮 */}
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-3 p-4 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">创建新账户</span>
        </button>

        {/* 提示 */}
        {accounts.length === 0 && (
          <div className="text-center mt-6 text-[#a0a0a0] text-sm">
            还没有账户？点击上方按钮创建第一个账户
          </div>
        )}
      </div>
    </div>
  );
}
