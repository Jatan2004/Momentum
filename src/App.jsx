import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import StreakList from './components/StreakList';
import AddActivityModal from './components/AddActivityModal';
import { Users, Plus, UserPlus, Trophy, Flame, ChevronRight, ChevronLeft, Copy, Check, Hash, Loader2, RefreshCw, X, Calendar, History, LogOut, Trash2, AlertTriangle, Zap, ArrowLeft, User as UserIcon, BarChart2 } from 'lucide-react';
import { useStreakSystem } from './hooks/useStreakSystem';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import SocialDashboard from './components/SocialDashboard';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

import MilestoneCelebration from './components/MilestoneCelebration';
import CoachWidget from './components/CoachWidget';

function App() {
  const { streaks, isLoading, addStreak, breakStreak, deleteStreak } = useStreakSystem();

  const { user, loading: authLoading, logout, updatePrefs } = useAuth();

  // Gamification State (Hybrid: Local Storage + Appwrite Sync)
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('momentum_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Reset XP on Logout
  useEffect(() => {
    if (!user) {
      setXp(0);
      localStorage.removeItem('momentum_xp');
    }
  }, [user]);
  const [activeMilestone, setActiveMilestone] = useState(null);

  // Sync: Appwrite Prefs -> Local State (Conflict Resolution: Max Wins)
  useEffect(() => {
    if (user?.prefs?.xp) {
      const cloudXp = parseInt(user.prefs.xp, 10);
      if (cloudXp > xp) {
        setXp(cloudXp);
        localStorage.setItem('momentum_xp', cloudXp.toString());
      }
    }
  }, [user]);

  // Sync: Local State -> Local Storage
  useEffect(() => {
    localStorage.setItem('momentum_xp', xp.toString());
  }, [xp]);

  const currentLevel = Math.floor(xp / 500) + 1;
  const xpInCurrentLevel = xp % 500;
  const xpProgress = (xpInCurrentLevel / 500) * 100;

  // Milestone Detection & Sync
  useEffect(() => {
    if (!isLoading && streaks.length > 0 && user) {
      const milestones = [7, 30, 100];
      const reachedMilestone = streaks.find(s => milestones.includes(s.count));

      if (reachedMilestone) {
        const milestoneKey = `milestone_${reachedMilestone.id}_${reachedMilestone.count}`;
        const unlockedMilestones = user.prefs?.milestones ? JSON.parse(user.prefs.milestones) : [];

        if (!unlockedMilestones.includes(milestoneKey)) {
          // Trigger Celebration
          setActiveMilestone(reachedMilestone.count);

          // Update XP and Milestones in Appwrite
          const newXp = xp + 100;
          const newMilestones = [...unlockedMilestones, milestoneKey];

          setXp(newXp);
          updatePrefs({
            ...user.prefs,
            xp: newXp.toString(),
            milestones: JSON.stringify(newMilestones)
          });
        }
      }
    }
  }, [streaks, isLoading, user]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-streaks'); // 'my-streaks' or 'social'

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-full animate-spin" />
        <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em]">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const totalActiveStreaks = streaks.filter(s => s.count > 0).length;
  const totalDays = streaks.reduce((acc, s) => acc + (s.count || 0), 0);
  const peakMomentum = Math.max(0, ...streaks.map(s => s.longestStreak || 0));

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics streaks={streaks} />;

      case 'settings':
        return (
          <Settings
            xp={xp}
            level={currentLevel}
            xpProgress={xpProgress}
          />
        );
      case 'coach':
        return <CoachWidget streaks={streaks} />;
      case 'social':
        return <SocialDashboard onBack={() => setActiveTab('my-streaks')} />;
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-8 md:mb-12 pb-6 md:pb-8 border-b border-white/5 gap-4">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-accent shadow-[0_0_12px_#5E5CE6] flex-shrink-0" />
                <h3 className="text-lg md:text-2xl font-bold tracking-tight truncate">Active Streaks</h3>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-4 bg-white text-black rounded-xl md:rounded-[1.75rem] transition-all hover:scale-[1.02] active:scale-[0.98] premium-shadow flex-shrink-0"
              >
                <Plus size={18} strokeWidth={3} className="md:w-[20px] md:h-[20px]" />
                <span className="text-[10px] md:text-sm font-bold tracking-tight uppercase whitespace-nowrap">
                  <span className="hidden xs:inline">New Activity</span>
                  <span className="xs:hidden">New</span>
                </span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-full animate-spin" />
                <p className="text-secondary text-xs font-bold uppercase tracking-[0.3em]">Synchronizing Data...</p>
              </div>
            ) : (
              <StreakList
                streaks={streaks}
                onBreak={breakStreak}
                onDelete={deleteStreak}
              />
            )}
          </>
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={logout}
      level={currentLevel}
      xpProgress={xpProgress}
    >
      {/* Hero / Stats Section - Only show on dashboard tabs */}
      {(activeTab === 'my-streaks' || activeTab === 'social') && (
        <div className="mb-12">
          {/* Dashboard/Arena Tab Switcher */}
          <div className="flex bg-gradient-to-r from-white/10 to-white/5 p-1.5 md:p-2 rounded-2xl md:rounded-3xl w-full md:w-fit mb-8 border border-white/10 premium-shadow">
            <button
              onClick={() => setActiveTab('my-streaks')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'my-streaks' ? 'bg-white text-black premium-shadow' : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              <UserIcon size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Personal</span>
              <span className="sm:hidden">Personal</span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'social' ? 'bg-white text-black premium-shadow' : 'text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              <Users size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Arena</span>
              <span className="sm:hidden">Arena</span>
            </button>
          </div>

          {/* Stats Summary - Only show on Personal tab */}
          {activeTab === 'my-streaks' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="col-span-2 md:col-span-1 flex flex-col justify-center mb-2 md:mb-0">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-secondary text-lg md:text-2xl font-medium max-w-lg leading-relaxed">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 font-black text-2xl md:text-3xl">{totalActiveStreaks}</span>
                    <span className="text-white font-bold"> active streaks</span>
                  </p>
                  <p className="text-secondary text-xs md:text-lg font-medium max-w-lg">
                    Building consistency. <span className="text-accent font-bold">One day at a time.</span> 🔥
                  </p>
                </div>
              </div>

              <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 flex flex-col justify-between premium-shadow border-accent/20 h-full min-h-[120px] md:min-h-[140px]">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-xl flex items-center justify-center text-white premium-shadow mb-3">
                  <BarChart2 size={18} className="md:w-[20px] md:h-[20px]" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-1">Impact</p>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <p className="text-2xl md:text-4xl font-black tracking-tighter">{totalDays}</p>
                    <p className="text-[8px] md:text-xs font-bold text-secondary uppercase tracking-widest text-nowrap">Days</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 flex flex-col justify-between premium-shadow border-success/20 h-full min-h-[120px] md:min-h-[140px]">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-success rounded-xl flex items-center justify-center text-white premium-shadow mb-3">
                  <Flame size={18} className="md:w-[20px] md:h-[20px]" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[10px] text-success font-bold uppercase tracking-[0.2em] mb-1">Momentum</p>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <p className="text-2xl md:text-4xl font-black tracking-tighter text-success shadow-[0_0_20px_rgba(50,215,75,0.1)]">{peakMomentum}</p>
                    <p className="text-[8px] md:text-xs font-bold text-secondary uppercase tracking-widest text-nowrap">Days</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {renderContent()}

      <AddActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addStreak}
      />

      <AnimatePresence>
        {activeMilestone && (
          <MilestoneCelebration
            milestone={activeMilestone}
            onClose={() => setActiveMilestone(null)}
          />
        )}
      </AnimatePresence>

    </Layout>
  );
}

export default App;
