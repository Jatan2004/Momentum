import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, LayoutGrid, TrendingUp, Menu, X, MessageSquare, Rocket, Activity, Flame } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';
import getAvatarUrl from '../utils/avatar';

const Layout = ({ children, activeTab, onTabChange, user, onLogout, level, xpProgress }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const profileRef = useRef(null);

    // Scroll to top when tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activeTab]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsProfileOpen(false);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        onLogout();
    };

    return (
        <div className="min-h-screen">
            {/* Background Glow - Hidden on mobile for performance */}
            <div className="hidden md:block fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/10 blur-[120px] pointer-events-none -z-10" />

            <header className="fixed top-0 left-0 right-0 h-20 glass z-40 px-6 md:px-12 flex items-center justify-between border-b border-white/5 gpu-accelerated">
                <div className="flex items-center gap-3">
                    <m.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onTabChange('my-streaks')}
                        className="w-10 h-10 bg-gradient-to-br from-accent to-purple-500 rounded-xl flex items-center justify-center premium-shadow group/logo"
                        title="Dashboard"
                    >
                        <Flame size={20} className="text-white group-hover/logo:scale-110 transition-transform" strokeWidth={3} />
                    </m.button>
                    <m.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTabChange('settings')}
                        className="flex flex-col items-start text-left"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-black tracking-tight leading-none uppercase italic">Momentum</h1>
                            <div className="px-2 py-0.5 bg-accent text-white rounded-md text-[8px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">
                                LVL {level || 1}
                            </div>
                        </div>
                        <div className="w-24 md:w-32 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                            <m.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: xpProgress / 100 || 0 }}
                                className="absolute inset-0 h-full bg-gradient-to-r from-accent to-purple-500 shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)] origin-left"
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </m.button>
                </div>

                <nav className="hidden md:flex items-center">
                    <div className="flex bg-gradient-to-r from-white/10 to-white/5 p-1.5 rounded-2xl border border-white/10">
                        <button
                            onClick={() => {
                                onTabChange('my-streaks');
                                window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all outline-none focus:outline-none ${activeTab === 'my-streaks' || activeTab === 'social'
                                ? 'bg-white text-black'
                                : 'text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LayoutGrid size={14} />
                            Dashboard
                        </button>
                        <button
                            onClick={() => {
                                onTabChange('analytics');
                                window.scrollTo({ top: 0, behavior: 'instant' });
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all outline-none focus:outline-none ${activeTab === 'analytics'
                                ? 'bg-white text-black'
                                : 'text-secondary hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <TrendingUp size={14} />
                            Analytics
                        </button>
                    </div>
                </nav>

                {/* Mobile Logout Button */}
                <m.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogoutClick}
                    className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} className="text-white" strokeWidth={2.5} />
                </m.button>


                {/* Profile Dropdown */}
                <div className="relative hidden md:block" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none focus:outline-none"
                    >
                        <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white/5">
                                <img
                                    src={getAvatarUrl(user?.name)}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-secondary transition-transform hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <m.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-14 w-64 glass rounded-2xl border border-white/10 premium-shadow overflow-hidden"
                            >
                                {/* User Info */}
                                <div className="p-4 border-b border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5">
                                            <img
                                                src={getAvatarUrl(user?.name)}
                                                alt={user?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate">{user?.name || 'User'}</p>
                                            <p className="text-xs text-secondary truncate">{user?.email || 'user@example.com'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onTabChange('settings');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left outline-none focus:outline-none"
                                    >
                                        <Settings size={18} className="text-secondary" />
                                        <span className="text-sm font-medium">Settings</span>
                                    </button>

                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/10 text-error transition-colors text-left outline-none focus:outline-none"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Bottom Navigation Bar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50 md:hidden safe-area-bottom">
                <div className="grid grid-cols-4 h-18 px-2">
                    <m.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onTabChange('my-streaks');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                    >
                        <LayoutGrid
                            size={24}
                            className={`transition-all ${activeTab === 'my-streaks' || activeTab === 'social' ? 'text-accent scale-110' : 'text-secondary'}`}
                            strokeWidth={activeTab === 'my-streaks' || activeTab === 'social' ? 2.5 : 2}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'my-streaks' || activeTab === 'social' ? 'text-accent' : 'text-secondary'}`}>
                            Home
                        </span>
                    </m.button>

                    <m.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onTabChange('analytics');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                    >
                        <TrendingUp
                            size={24}
                            className={`transition-all ${activeTab === 'analytics' ? 'text-accent scale-110' : 'text-secondary'}`}
                            strokeWidth={activeTab === 'analytics' ? 2.5 : 2}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'analytics' ? 'text-accent' : 'text-secondary'}`}>
                            Stats
                        </span>
                    </m.button>

                    <m.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onTabChange('settings');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                    >
                        <Settings
                            size={24}
                            className={`transition-all ${activeTab === 'settings' ? 'text-accent scale-110' : 'text-secondary'}`}
                            strokeWidth={activeTab === 'settings' ? 2.5 : 2}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'settings' ? 'text-accent' : 'text-secondary'}`}>
                            Profile
                        </span>
                    </m.button>

                    <m.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            onTabChange('coach');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="flex flex-col items-center justify-center gap-1 py-3 transition-colors"
                    >
                        <MessageSquare
                            size={24}
                            className={`transition-all ${activeTab === 'coach' ? 'text-accent scale-110' : 'text-secondary'}`}
                            strokeWidth={activeTab === 'coach' ? 2.5 : 2}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'coach' ? 'text-accent' : 'text-secondary'}`}>
                            Coach
                        </span>
                    </m.button>
                </div>
            </nav>

            <main className="pt-24 pb-24 md:pb-20 px-6 md:px-12 container mx-auto max-w-6xl">
                {children}
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <>
                        {/* Backdrop */}
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirm(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                        />

                        {/* Modal */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center p-4 z-[201] pointer-events-none"
                        >
                            <div className="w-full max-w-md glass p-8 rounded-[2rem] border-2 border-white/10 premium-shadow pointer-events-auto">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/20 flex items-center justify-center">
                                        <LogOut size={32} className="text-error" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Logout?</h3>
                                    <p className="text-secondary text-sm">
                                        Are you sure you want to logout? Your streaks will be waiting for you!
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <m.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                                    >
                                        Cancel
                                    </m.button>
                                    <m.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={confirmLogout}
                                        className="flex-1 px-6 py-3 rounded-xl bg-error hover:bg-error/90 text-white font-bold transition-colors"
                                    >
                                        Logout
                                    </m.button>
                                </div>
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
