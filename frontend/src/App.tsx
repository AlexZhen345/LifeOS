import { useState, useEffect, useRef } from 'react';
import { Home, User, Users } from 'lucide-react';
import { WelcomePage } from './components/WelcomePage';
import { CharacterCreation } from './components/CharacterCreation';
import { AccountSelectPage } from './components/AccountSelectPage';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { CommunityPage } from './components/CommunityPage';
import { ACHIEVEMENTS, Achievement, AchievementStats } from './components/achievements';
import { 
  initUserData, 
  getUserData, 
  updateUserAttributes,
  getAccounts,
  getCurrentAccountId,
  createAccount,
  migrateOldData,
  AccountInfo
} from './services/userDatabase';
import { getCommunityTotalUnread } from './services/communityService';

type Page = 'welcome' | 'account-select' | 'character-creation' | 'home' | 'profile' | 'community';

export interface Character {
  name: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  attributes: {
    INT: number;
    VIT: number;
    CHA: number;
    GOLD: number;
    WIL: number;
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [character, setCharacter] = useState<Character | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [todayTasksCompleted, setTodayTasksCompleted] = useState(0);
  const [goalsCompleted, setGoalsCompleted] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState<Page>('welcome');
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [communityUnread, setCommunityUnread] = useState(0);
  const previousPage = useRef<Page>('welcome');

  // 加载社区未读数
  const loadCommunityUnread = () => {
    const userId = getCurrentAccountId();
    if (userId) {
      setCommunityUnread(getCommunityTotalUnread(userId));
    }
  };

  // 定期刷新社区未读数
  useEffect(() => {
    loadCommunityUnread();
    const interval = setInterval(loadCommunityUnread, 5000);
    return () => clearInterval(interval);
  }, [character]);

  // 初始化账户系统
  useEffect(() => {
    // 尝试迁移旧数据
    const migratedAccount = migrateOldData();
    if (migratedAccount) {
      console.log('已迁移旧数据到新账户系统');
    }
    
    // 加载账户列表
    const accountList = getAccounts();
    setAccounts(accountList);
    
    // 每次启动都显示欢迎页，让用户选择账户登录
    // 不再自动登录
  }, []);

  // 页面切换处理
  const navigateTo = (page: Page) => {
    if (page === currentPage || isTransitioning) return;
    
    previousPage.current = currentPage;
    setIsTransitioning(true);
    
    // 先淡出（250ms）
    setTimeout(() => {
      setDisplayPage(page);
      setCurrentPage(page);
      // 淡入完成后重置状态（500ms）
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 250);
  };

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }, []);

  const handleStartAdventure = () => {
    navigateTo('character-creation');
  };

  // 打开登录页面
  const handleLogin = () => {
    setAccounts(getAccounts()); // 刷新账户列表
    navigateTo('account-select');
  };

  // 切换账户（从主页触发）
  const handleSwitchAccount = () => {
    setAccounts(getAccounts()); // 刷新账户列表
    navigateTo('account-select');
  };

  // 返回欢迎页
  const handleBackToWelcome = () => {
    navigateTo('welcome');
  };

  const handleCreateCharacter = (name: string) => {
    const newCharacter: Character = {
      name,
      level: 1,
      xp: 0,
      xpForNextLevel: 100,
      attributes: {
        INT: 0,
        VIT: 0,
        CHA: 0,
        GOLD: 0,
        WIL: 0,
      },
    };
    setCharacter(newCharacter);
    // 创建新账户（会自动初始化用户数据）
    const newAccount = createAccount(name);
    setAccounts(getAccounts());
    navigateTo('home');
  };

  // 选择已有账户登录
  const handleSelectAccount = (accountId: string) => {
    const userData = getUserData();
    if (userData) {
      const restoredCharacter: Character = {
        name: userData.profile.name,
        level: userData.attributes?.level || 1,
        xp: userData.attributes?.xp || 0,
        xpForNextLevel: 100,
        attributes: {
          INT: userData.attributes?.INT || 0,
          VIT: userData.attributes?.VIT || 0,
          CHA: userData.attributes?.CHA || 0,
          GOLD: userData.attributes?.GOLD || 0,
          WIL: userData.attributes?.WIL || 0,
        },
      };
      setCharacter(restoredCharacter);
      setTotalTasksCompleted(userData.stats.totalTasksCompleted);
      setConsecutiveDays(userData.stats.streakDays);
      navigateTo('home');
    }
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
    // 同步属性到用户数据库（用于天梯榜）
    updateUserAttributes({
      ...updatedCharacter.attributes,
      level: updatedCharacter.level,
      xp: updatedCharacter.xp,
    });
  };

  const handleTaskCompleted = () => {
    setTotalTasksCompleted((prev) => prev + 1);
    setTodayTasksCompleted((prev) => prev + 1);
  };

  const handleGoalCompleted = () => {
    setGoalsCompleted((prev) => prev + 1);
  };

  const checkAchievements = (newAchievements: Achievement[]) => {
    if (!character) return newAchievements;

    const stats: AchievementStats = {
      totalTasksCompleted,
      consecutiveDays,
      attributes: character.attributes,
      goalsCompleted,
      level: character.level,
    };

    return newAchievements.map((achievement) => ({
      ...achievement,
      unlocked: achievement.unlocked || achievement.condition(stats),
    }));
  };

  useEffect(() => {
    if (character) {
      const updatedAchievements = checkAchievements(achievements);
      setAchievements(updatedAchievements);
    }
  }, [character, totalTasksCompleted, consecutiveDays, goalsCompleted]);

  const showNavigation = currentPage === 'home' || currentPage === 'profile' || currentPage === 'community';

  // 获取页面切换方向
  const getTransitionDirection = (): 'left' | 'right' | 'up' | 'down' => {
    const pageOrder = ['home', 'community', 'profile'];
    const prevIndex = pageOrder.indexOf(previousPage.current);
    const currIndex = pageOrder.indexOf(displayPage);
    
    if (previousPage.current === 'welcome' || previousPage.current === 'character-creation' || previousPage.current === 'account-select') {
      return 'up';
    }
    if (displayPage === 'welcome' || displayPage === 'account-select') {
      return 'down';
    }
    if (prevIndex < currIndex) return 'left';
    if (prevIndex > currIndex) return 'right';
    return 'up';
  };

  const transitionDirection = getTransitionDirection();

  return (
    <div className="min-h-screen ios-app overflow-hidden">
      {/* 页面内容 - 带平滑过渡动画 */}
      <div 
        className={`page-content ${isTransitioning ? 'page-exit' : 'page-enter'}`}
        data-direction={transitionDirection}
      >
        {displayPage === 'welcome' && (
          <WelcomePage 
            onStartAdventure={handleStartAdventure}
            onLogin={handleLogin}
            hasExistingAccounts={accounts.length > 0}
          />
        )}
        {displayPage === 'account-select' && (
          <AccountSelectPage
            accounts={accounts}
            onSelectAccount={handleSelectAccount}
            onCreateNew={handleStartAdventure}
            onBack={handleBackToWelcome}
          />
        )}
        {displayPage === 'character-creation' && (
          <CharacterCreation 
            onCreateCharacter={handleCreateCharacter}
            onBack={handleBackToWelcome}
          />
        )}
        {displayPage === 'home' && character && (
          <HomePage
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
            onTaskCompleted={handleTaskCompleted}
            onGoalCompleted={handleGoalCompleted}
            achievements={achievements}
            onAchievementsUpdate={setAchievements}
            onSwitchAccount={handleSwitchAccount}
          />
        )}
        {displayPage === 'profile' && character && (
          <ProfilePage
            character={character}
            achievements={achievements}
            todayTasksCompleted={todayTasksCompleted}
            totalTasksCompleted={totalTasksCompleted}
          />
        )}
        {displayPage === 'community' && character && (
          <CommunityPage character={character} />
        )}
      </div>

      {/* Bottom Navigation - iOS Style Tab Bar */}
      {showNavigation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t-2 border-[#e8e3d6] z-40 safe-area-bottom">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => navigateTo('home')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === 'home' 
                    ? 'text-[#2d5f3f] bg-[#2d5f3f]/10' 
                    : 'text-[#a0a0a0] hover:text-[#2d5f3f]'
                }`}
              >
                <Home className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">任务</span>
              </button>
              <button
                onClick={() => navigateTo('community')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  currentPage === 'community' 
                    ? 'text-[#2d5f3f] bg-[#2d5f3f]/10' 
                    : 'text-[#a0a0a0] hover:text-[#2d5f3f]'
                }`}
              >
                <Users className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">社区</span>
                {/* 红点 */}
                {communityUnread > 0 && (
                  <span 
                    className="absolute w-3 h-3 rounded-full"
                    style={{ 
                      top: '2px', 
                      right: '2px', 
                      zIndex: 50,
                      backgroundColor: '#ef4444',
                      border: '2px solid white'
                    }}
                  />
                )}
              </button>
              <button
                onClick={() => navigateTo('profile')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === 'profile' 
                    ? 'text-[#2d5f3f] bg-[#2d5f3f]/10' 
                    : 'text-[#a0a0a0] hover:text-[#2d5f3f]'
                }`}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">档案</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ios-app {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        body {
          overscroll-behavior-y: contain;
        }

        button, a {
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        * {
          -webkit-overflow-scrolling: touch;
        }

        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
        }

        /* 页面内容容器 */
        .page-content {
          will-change: opacity, transform;
          transition: opacity 0.45s cubic-bezier(0.25, 0.1, 0.25, 1), 
                      transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        /* 页面进入动画 */
        .page-enter {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }

        /* 页面退出动画 */
        .page-exit {
          opacity: 0;
        }

        .page-exit[data-direction="left"] {
          transform: translateX(-12px);
        }

        .page-exit[data-direction="right"] {
          transform: translateX(12px);
        }

        .page-exit[data-direction="up"] {
          transform: translateY(-8px);
        }

        .page-exit[data-direction="down"] {
          transform: translateY(8px);
        }

        /* 底部安全区域 */
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
}