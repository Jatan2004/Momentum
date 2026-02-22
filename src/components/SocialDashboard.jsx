/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { useSocialSystem } from '../hooks/useSocialSystem';
import { useAuth } from '../hooks/useAuth';
import { useStreakSystem } from '../hooks/useStreakSystem';
import { Users, Plus, UserPlus, Trophy, Flame, ChevronRight, ChevronLeft, Copy, Check, Hash, Loader2, X, Calendar, LogOut, Trash2, AlertTriangle, Zap, ArrowLeft } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, isValid, isAfter, startOfDay } from 'date-fns';
import { motion as m, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '../utils/avatar';

const SocialDashboard = ({ onBack }) => {
    const { groups, isLoading, createGroup, joinGroup, getGroupLeaderboard, leaveGroup, deleteGroup } = useSocialSystem();
    const { streaks } = useStreakSystem();
    const { user } = useAuth();
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupActivity, setNewGroupActivity] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [error, setError] = useState('');

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const activeGroup = groups.find(g => g.$id === activeGroupId);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const groupBreakMap = useMemo(() => {
        const breaks = new Map();
        leaderboard.forEach(player => {
            player.streaks?.forEach(streak => {
                // If group has an activity filter, only count breaks for that activity
                if (activeGroup?.activity && streak.name.trim().toLowerCase() !== activeGroup.activity.trim().toLowerCase()) {
                    return;
                }

                streak.brokenHistory?.forEach(history => {
                    const dateKey = format(new Date(history.date), 'yyyy-MM-dd');
                    if (!breaks.has(dateKey)) breaks.set(dateKey, new Set());
                    breaks.get(dateKey).add(player.name);
                });
            });
        });
        return breaks;
    }, [leaderboard, activeGroup]);

    useEffect(() => {
        const loadLeaderboard = async (id, activity) => {
            const data = await getGroupLeaderboard(id, activity);
            setLeaderboard(data);
        };

        if (activeGroupId && activeGroup) {
            loadLeaderboard(activeGroupId, activeGroup.activity);
        }
    }, [activeGroupId, activeGroup, getGroupLeaderboard]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const result = await createGroup(newGroupName, newGroupActivity);
        if (result.success) {
            setIsCreating(false);
            setNewGroupName('');
            setNewGroupActivity('');
            setActiveGroupId(result.group.$id);
        } else {
            setError(result.error);
        }
        setActionLoading(false);
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const result = await joinGroup(inviteCode);
        if (result.success) {
            setIsJoining(false);
            setInviteCode('');
            setActiveGroupId(result.group.$id);
        } else {
            setError(result.error);
        }
        setActionLoading(false);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeaveGroup = async () => {
        setActionLoading(true);
        const result = await leaveGroup(activeGroupId);
        if (result.success) {
            setActiveGroupId(null);
            setShowLeaveConfirm(false);
            // No need for setActionLoading(false) here if we return early or just let it finish
        } else {
            setError(result.error);
        }
        setActionLoading(false);
    };

    const handleDeleteGroup = async () => {
        // Optimistically clear the UI
        const groupIdToDelete = activeGroupId;
        setActiveGroupId(null);
        setShowDeleteConfirm(false);

        setActionLoading(true);
        const result = await deleteGroup(groupIdToDelete);
        if (!result.success) {
            setError(result.error);
            // Re-enable if it failed? Probably better to just show error.
            setActiveGroupId(groupIdToDelete);
        }
        setActionLoading(false);
    };

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">Arena</h2>
                        <p className="text-secondary font-medium">Compete with friends and maintain shared momentum.</p>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setIsJoining(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs md:text-sm font-bold uppercase tracking-wider"
                        >
                            <UserPlus size={16} className="md:w-[18px] md:h-[18px]" />
                            Join
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 bg-accent text-white rounded-2xl premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all text-xs md:text-sm font-bold uppercase tracking-wider"
                        >
                            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                            Create
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Sidebar: Group List */}
                    <div className={`lg:col-span-4 space-y-4 ${activeGroupId ? 'hidden lg:block' : 'block'}`}>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-secondary uppercase tracking-[0.2em] mb-4 ml-4">
                            <Users size={14} />
                            Your Arenas
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4 glass rounded-[2rem] border-white/5">
                                <Loader2 className="animate-spin text-accent" size={24} />
                                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Loading Arenas...</p>
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="p-8 text-center glass rounded-[2rem] border-white/5">
                                <p className="text-secondary text-sm font-medium mb-4">No active competitions yet.</p>
                                <button
                                    onClick={() => setIsJoining(true)}
                                    className="text-accent text-xs font-bold uppercase tracking-widest hover:underline"
                                >
                                    Join one today
                                </button>
                            </div>
                        ) : (
                            groups.map(group => (
                                <button
                                    key={group.$id}
                                    onClick={() => setActiveGroupId(group.$id)}
                                    className={`w-full p-6 rounded-[2rem] flex items-center justify-between transition-all border ${activeGroupId === group.$id
                                        ? 'bg-white/10 border-white/20 premium-shadow'
                                        : 'bg-white/5 border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeGroupId === group.$id ? 'bg-accent text-white' : 'bg-white/5 text-secondary'}`}>
                                            <Hash size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{group.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-secondary font-medium uppercase tracking-wider">Code: {group.inviteCode}</p>
                                                {group.activity && (
                                                    <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-md font-bold uppercase">{group.activity}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className={activeGroupId === group.$id ? 'text-white' : 'text-secondary/20'} />
                                </button>
                            ))
                        )}
                    </div>

                    {/* Main: Leaderboard */}
                    <div className={`lg:col-span-8 space-y-8 ${!activeGroupId ? 'hidden lg:block' : 'block'}`}>
                        {activeGroupId ? (
                            <m.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-white/5 premium-shadow relative overflow-hidden"
                            >
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32" />

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 md:mb-10 relative z-10">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <m.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setActiveGroupId(null)}
                                                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                                                title="Back to Arena"
                                            >
                                                <ArrowLeft size={20} className="text-white" strokeWidth={2.5} />
                                            </m.button>
                                            <h3 className="text-xl md:text-2xl font-black">{activeGroup?.name}</h3>
                                            {activeGroup?.activity && (
                                                <span className="text-[9px] md:text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest leading-none">
                                                    {activeGroup.activity}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-secondary text-[10px] md:text-xs">
                                            <span className="font-bold uppercase tracking-wider">Code:</span>
                                            <button
                                                onClick={() => copyCode(activeGroup?.inviteCode)}
                                                className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-white font-mono font-bold">{activeGroup?.inviteCode}</span>
                                                {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                                            <Trophy size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        {activeGroup?.creatorId === user?.$id ? (
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-10 h-10 md:w-12 md:h-12 bg-error/10 rounded-2xl flex items-center justify-center text-error hover:bg-error hover:text-white transition-all group/delete"
                                                title="Delete Arena"
                                            >
                                                <Trash2 size={18} className="md:w-5 md:h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowLeaveConfirm(true)}
                                                className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-secondary hover:text-error hover:bg-error/10 transition-all"
                                                title="Leave Arena"
                                            >
                                                <LogOut size={18} className="md:w-5 md:h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {leaderboard.map((player, index) => {
                                        const isCurrentUser = player.userId === user?.$id;
                                        return (
                                            <m.div
                                                key={index}
                                                onClick={() => setSelectedPlayer(player)}
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 transition-all cursor-pointer group/item gap-4 md:gap-6 relative overflow-hidden`}
                                            >
                                                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className={`text-xl md:text-2xl font-black italic leading-none ${index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]' : index === 1 ? 'text-zinc-400' : index === 2 ? 'text-amber-600' : 'text-secondary/30'}`}>
                                                            #{index + 1}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-base md:text-xl flex items-center gap-2 mb-0.5">
                                                            {player.name}
                                                            {index === 0 && <span className="text-[8px] md:text-[9px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Top Gun</span>}
                                                        </h5>
                                                        <p className="text-[9px] md:text-[10px] text-secondary font-bold uppercase tracking-[0.15em]">
                                                            {player.totalStreaks} {player.totalStreaks === 1 ? 'active streak' : 'active streaks'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 md:gap-4 ml-auto sm:ml-0 relative z-10">
                                                    {!isCurrentUser && (
                                                        <div className="flex items-center gap-2 mr-4 md:mr-8 border-r border-white/5 pr-4 md:pr-8">
                                                            <m.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if ('vibrate' in navigator) navigator.vibrate(100);
                                                                }}
                                                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-secondary hover:text-accent hover:bg-accent/10 transition-all border border-white/5"
                                                                title="Nudge"
                                                            >
                                                                <Zap size={14} strokeWidth={3} className="md:w-4 md:h-4" />
                                                            </m.button>
                                                            <m.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-secondary hover:text-success hover:bg-success/10 transition-all border border-white/5"
                                                                title="Flame"
                                                            >
                                                                <Flame size={14} strokeWidth={3} className="md:w-4 md:h-4" />
                                                            </m.button>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-[8px] md:text-[9px] text-secondary font-bold uppercase tracking-widest mb-1 leading-none text-center">Peak</p>
                                                        <p className="font-black text-sm md:text-lg text-white text-center">{player.peakStreak}<span className="text-[9px] ml-0.5">d</span></p>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <p className="text-[8px] md:text-[9px] text-accent font-bold uppercase tracking-widest mb-1 leading-none">Momentum</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <Flame size={14} className="text-success" />
                                                            <p className="text-xl md:text-3xl font-black text-white leading-none tabular-nums">{player.totalMomentum}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </m.div>
                                        );
                                    })}
                                </div>

                                {/* Arena Activity Calendar */}
                                <div className="mt-12 pt-12 border-t border-white/5 relative z-10">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Arena Consistency</h3>
                                                <p className="text-xs text-secondary font-medium">Collective tracking of all members for {activeGroup?.activity || 'this arena'}.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-secondary hover:text-white transition-all"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="text-[10px] md:text-sm font-black min-w-[120px] text-center uppercase tracking-widest px-2 text-white">
                                                {format(currentMonth, 'MMMM yyyy')}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-secondary hover:text-white transition-all"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 md:gap-3">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center text-[10px] font-black text-secondary uppercase tracking-[0.2em] pb-2">
                                                {day}
                                            </div>
                                        ))}

                                        {(() => {
                                            const monthStart = startOfMonth(currentMonth);
                                            const monthEnd = endOfMonth(monthStart);
                                            const startDate = startOfWeek(monthStart);
                                            const endDate = endOfWeek(monthEnd);
                                            const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                                            return calendarDays.map((day, idx) => {
                                                const dateKey = format(day, 'yyyy-MM-dd');
                                                const breakers = groupBreakMap.get(dateKey);
                                                const isCurrentMonth = isSameMonth(day, monthStart);
                                                const isTodayDate = isToday(day);
                                                const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`aspect-square rounded-xl md:rounded-[1.25rem] flex flex-col items-center justify-center relative transition-all group overflow-hidden border ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : ''
                                                            } ${breakers ? 'bg-error/10 border-error/20 text-error shadow-[0_0_15px_rgba(255,69,58,0.1)]' :
                                                                isFuture ? 'bg-white/5 border-white/5 hover:border-white/10' :
                                                                    'bg-success/10 border-success/20 text-success'
                                                            } ${isTodayDate ? 'ring-2 ring-white/20' : ''}`}
                                                    >
                                                        <span className={`text-[10px] md:text-xs font-black mb-0.5 ${breakers ? 'text-error' : isFuture ? 'text-secondary/40' : 'text-success'}`}>
                                                            {format(day, 'd')}
                                                        </span>

                                                        {breakers && (
                                                            <div className={`flex flex-row items-center justify-center ${Array.from(breakers).length > 2 ? 'gap-0' : 'gap-0.5'} px-0.5 max-w-full overflow-hidden`}>
                                                                {Array.from(breakers).map((name, bIdx) => (
                                                                    <span
                                                                        key={bIdx}
                                                                        className={`shrink-0 font-black leading-none bg-error/20 rounded shadow-sm animate-in fade-in zoom-in duration-300 ${Array.from(breakers).length > 2
                                                                                ? 'text-[6px] md:text-[7px] px-0.5 py-0.5 -ml-0.5 first:ml-0'
                                                                                : 'text-[7px] md:text-[8px] px-1 py-0.5'
                                                                            }`}
                                                                    >
                                                                        {getInitials(name)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all pointer-events-none">
                                                            <p className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-white text-center px-1">
                                                                {breakers ? `${breakers.size} Breaks` : 'Healthy'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-6 text-[9px] font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-error/20 border border-error/40" />
                                            <span className="text-secondary/60">Streak Broken (User Initials Shown)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-success/10 border border-success/20" />
                                            <span className="text-success/60">All Clear</span>
                                        </div>
                                    </div>
                                </div>
                            </m.div>
                        ) : (
                            <div className="h-full min-h-[400px] glass rounded-[2.5rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center text-center p-12">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-secondary/20 mb-6">
                                    <Trophy size={40} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white/50">Select an Arena</h3>
                                <p className="text-secondary/40 max-w-xs text-sm">Pick a group from the left to view the leaderboard and invite your friends.</p>

                                {/* Mobile Back Button (only visible if activeGroupId is null but somehow we are in this view) */}
                                {activeGroupId === null && (
                                    <button
                                        onClick={() => setActiveGroupId(undefined)} // Just a dummy state flip if needed, but not really necessary with the hidden classes
                                        className="mt-6 text-accent text-xs font-bold uppercase tracking-widest lg:hidden"
                                    >
                                        Browse Arenas
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreating(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass px-10 pb-10 pt-8 rounded-[2.5rem] w-full max-w-md relative z-10 border-white/10 premium-shadow"
                        >
                            <h3 className="text-2xl font-black mb-6">New Competition</h3>
                            <form onSubmit={handleCreateGroup} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] text-secondary font-bold uppercase tracking-[0.2em] ml-4">Group Name</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g., Morning Warriors"
                                            className="w-full bg-surface-lighter rounded-2xl py-4 px-6 text-white border border-white/5 focus:border-accent outline-none"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-4">
                                            <label className="text-[11px] text-secondary font-bold uppercase tracking-[0.2em]">Focus Activity</label>
                                            <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Required</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g., Coding, Workout, Reading"
                                            className="w-full bg-surface-lighter rounded-2xl py-4 px-6 text-white border border-white/5 focus:border-accent outline-none"
                                            value={newGroupActivity}
                                            onChange={(e) => setNewGroupActivity(e.target.value)}
                                            required
                                        />
                                        <p className="text-[9px] text-secondary/50 ml-4 italic">The Arena will specifically track and filter for this activity only.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all font-outfit"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-[2] bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Initialize Arena"}
                                    </button>
                                </div>
                            </form>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Join Modal */}
            <AnimatePresence>
                {isJoining && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsJoining(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass px-10 pb-10 pt-8 rounded-[2.5rem] w-full max-w-md relative z-10 border-white/10 premium-shadow"
                        >
                            <h3 className="text-2xl font-black mb-6">Enter Arena</h3>
                            <form onSubmit={handleJoinGroup} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] text-secondary font-bold uppercase tracking-[0.2em] ml-4">6-Digit Invite Code</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g., AB12CD"
                                        maxLength={6}
                                        className="w-full bg-surface-lighter rounded-2xl py-4 px-6 text-white border border-white/5 focus:border-accent outline-none text-center font-mono text-2xl tracking-[0.3em] uppercase"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && <p className="text-error text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsJoining(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all font-outfit"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-[2] bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Join Competition"}
                                    </button>
                                </div>
                            </form>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User History Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-4">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPlayer(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass w-full max-w-2xl rounded-[2.5rem] relative z-10 border-white/10 premium-shadow overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-full border-2 border-accent/20 p-1">
                                        <img src={getAvatarUrl(selectedPlayer.name)} alt="" className="w-full h-full rounded-full bg-white/5" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black">{selectedPlayer.name}</h3>
                                        <div className="flex items-center gap-2 text-secondary">
                                            <Flame size={14} className="text-success" />
                                            <p className="text-xs font-bold uppercase tracking-widest">{selectedPlayer.totalMomentum} Total Momentum</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPlayer(null)} className="w-12 h-12 glass rounded-full flex items-center justify-center text-secondary hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
                                {selectedPlayer.streaks && selectedPlayer.streaks.length > 0 ? (
                                    selectedPlayer.streaks
                                        .filter(s => !activeGroup?.activity || s.name.trim().toLowerCase() === activeGroup.activity.trim().toLowerCase())
                                        .map((streak, idx) => (
                                            <div key={idx} className="space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <h4 className="text-xl font-bold mb-1">{streak.name}</h4>
                                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Performance History</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-baseline gap-2 justify-end">
                                                            <span className="text-3xl font-black text-white">{streak.count}</span>
                                                            <span className="text-sm font-bold text-secondary">Days</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {streak.brokenHistory && streak.brokenHistory.length > 0 ? (
                                                        streak.brokenHistory.map((history, hIdx) => {
                                                            const date = history.date ? new Date(history.date) : null;
                                                            return (
                                                                <div key={hIdx} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                                                    <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
                                                                        <Calendar size={18} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold">
                                                                            {date && isValid(date) ? format(date, 'MMM do, yyyy') : 'Unknown Date'}
                                                                        </p>
                                                                        <p className="text-[10px] text-secondary font-bold uppercase truncate">Broke at {history.streakAtBreak} days</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="col-span-full py-4 text-center border border-dashed border-white/10 rounded-2xl">
                                                            <p className="text-secondary text-xs font-medium">No resets yet • Perfect record</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <p className="text-secondary text-sm font-medium">
                                            {activeGroup?.activity
                                                ? `This user hasn't started the "${activeGroup.activity}" streak yet.`
                                                : "This user hasn't started any streaks yet."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Leave Confirmation */}
            <AnimatePresence>
                {showLeaveConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLeaveConfirm(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass px-10 pb-10 pt-8 rounded-[2.5rem] w-full max-w-md relative z-10 border-white/10 premium-shadow text-center"
                        >
                            <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <LogOut size={40} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Leave Arena?</h3>
                            <p className="text-secondary text-sm mb-8">You'll lose your spot on the leaderboard for "{activeGroup?.name}". You can always rejoin with the invite code.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLeaveConfirm(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLeaveGroup}
                                    disabled={actionLoading}
                                    className="flex-1 py-4 rounded-2xl bg-error text-white font-bold hover:bg-error/80 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Leave"}
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass px-10 pb-10 pt-8 rounded-[2.5rem] w-full max-w-md relative z-10 border-white/10 premium-shadow text-center"
                        >
                            <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Initialize Self-Destruct?</h3>
                            <p className="text-secondary text-sm mb-8">This will permanently delete "{activeGroup?.name}" and remove all members. This action cannot be undone.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleDeleteGroup}
                                    disabled={actionLoading}
                                    className="flex-1 py-4 rounded-2xl bg-error text-white font-bold hover:bg-error/80 transition-all flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : "Delete Arena"}
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SocialDashboard;
