/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Check, Flame, AlertCircle, History, MoreVertical, X, Calendar, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const StreakCard = ({ id, name, count, longestStreak = 0, brokenHistory = [], onBreak, onDelete }) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isBreaking, setIsBreaking] = useState(false);

    const handleBreakAction = async (e) => {
        e.stopPropagation();
        setIsBreaking(true);

        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate([150, 50, 150]);
        }

        // Wait for impact animation (Faster)
        await new Promise(resolve => setTimeout(resolve, 400));
        onBreak(id);
        setTimeout(() => setIsBreaking(false), 300);
    };

    const lastBroken = brokenHistory?.length > 0 ? brokenHistory[0] : null;

    return (
        <>
            {/* Full Screen Cracked Mirror Overlay */}
            <AnimatePresence>
                {isBreaking && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden bg-black/20"
                    >
                        {/* The Impact Crack (Single SVG Layer for Performance) */}
                        <m.svg
                            viewBox="0 0 100 100"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 w-full h-full text-white/40 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <path
                                d="M50 50 L10 10 M50 50 L90 10 M50 50 L90 90 M50 50 L10 90 M50 50 L0 50 M50 50 L100 50 M50 50 L50 0 M50 50 L50 100 M50 50 L30 10 M50 50 L70 10 M50 50 L90 30 M50 50 L90 70 M50 50 L70 90 M50 50 L30 90 M50 50 L10 70 M50 50 L10 30"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* Inner cracks */}
                            <path
                                d="M50 50 L45 42 L55 35 L50 50 M50 50 L58 55 L52 65 L50 50 M50 50 L42 58 L35 52 L50 50"
                                stroke="currentColor"
                                strokeWidth="0.3"
                                fill="none"
                            />
                        </m.svg>

                        {/* Violent Screen Shake (Simplified for zero lag) */}
                        <m.div
                            animate={{
                                x: [0, -30, 30, -30, 30, 0],
                                y: [0, -20, 20, -20, 20, 0]
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        />

                        {/* Impact Text */}
                        <m.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.35 }}
                            className="text-white text-9xl font-black italic tracking-tight relative z-10"
                        >
                            LOST
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    scale: isBreaking ? [1, 1.02, 0.98, 1] : 1
                }}
                className={`glass rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden group hover:border-accent/40 transition-all duration-500 premium-shadow cursor-pointer flex flex-col md:flex-col h-full min-h-[160px] md:min-h-[320px] gpu-accelerated ${isBreaking ? 'opacity-50' : ''}`}
                onClick={() => setIsHistoryOpen(true)}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[40px] rounded-full pointer-events-none" />

                {/* Mobile Horizontal Layout */}
                <div className="md:hidden flex flex-col h-full">
                    <div className="flex items-center gap-5 flex-1">
                        {/* Left: Huge Count */}
                        <div className="flex flex-col items-center justify-center min-w-[80px]">
                            <span className="text-5xl font-black tabular-nums tracking-tighter leading-none">{count}</span>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mt-1">Days</span>
                        </div>

                        {/* Right: Info Area */}
                        <div className="flex-1 min-w-0 border-l border-white/5 pl-5 py-1">
                            <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-bold text-white mb-0.5 truncate leading-tight">{name}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(50,215,75,0.5)]" />
                                        <p className="text-[8px] text-secondary font-bold uppercase tracking-widest whitespace-nowrap">Live</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-secondary hover:text-error transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-accent">
                                        <Flame size={14} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[8px] text-secondary font-bold uppercase tracking-widest leading-none mb-1">Peak</p>
                                    <p className="text-sm font-black text-accent leading-none">{longestStreak}d</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBreakAction}
                        className="w-full mt-4 py-3 rounded-xl font-bold transition-all bg-error/10 text-error border border-error/20 active:scale-[0.95] text-[10px] uppercase tracking-widest"
                    >
                        Break
                    </button>
                </div>

                {/* Desktop Layout (Kept Original) */}
                <div className="hidden md:block h-full flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-3xl font-bold text-white mb-1 truncate">{name}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(50,215,75,0.5)]" />
                                <p className="text-[11px] text-secondary font-bold uppercase tracking-widest whitespace-nowrap">Live</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true);
                                }}
                                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-secondary hover:text-error hover:bg-error/10 transition-all"
                                title="Delete Streak"
                            >
                                <Trash2 size={18} />
                            </button>
                            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                <Flame size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-baseline gap-3">
                                <span className="text-7xl font-black tabular-nums tracking-tighter">{count}</span>
                                <span className="text-2xl font-bold text-secondary">Days</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Peak</p>
                                <p className="text-xl font-black text-accent">{longestStreak}<span className="text-[8px] ml-0.5">d</span></p>
                            </div>
                        </div>

                        {lastBroken ? (
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
                                    <AlertCircle size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest mb-0.5">Last Reset</p>
                                    <p className="text-xs font-bold text-white">{format(new Date(lastBroken.date), 'MMM do, yyyy')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-accent/5 border border-accent/10 p-4 rounded-2xl backdrop-blur-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-accent uppercase tracking-widest mb-0.5">Fresh Start</p>
                                    <p className="text-xs font-bold text-white/90">Your journey begins today.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={handleBreakAction}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white premium-shadow active:scale-[0.98]"
                        >
                            <History size={18} />
                            <span className="text-[11px] uppercase tracking-widest whitespace-nowrap">Break Streak</span>
                        </button>
                    </div>
                </div>
            </m.div>

            {/* History Modal */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHistoryOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md md:backdrop-blur-xl"
                        />
                        <m.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-xl glass rounded-[3rem] premium-shadow relative z-10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                            <History size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white tracking-tight">{name}</h2>
                                            <p className="text-sm text-secondary font-medium uppercase tracking-[0.1em]">Streak History</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsHistoryOpen(false)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/5 text-secondary hover:text-white transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {brokenHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-secondary">
                                            <Calendar size={48} className="mb-4 opacity-10" />
                                            <p className="font-medium">No resets recorded for this activity.</p>
                                        </div>
                                    ) : (
                                        brokenHistory.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-error" />
                                                    <div>
                                                        <p className="text-white font-bold">{format(new Date(item.date), 'MMMM do, yyyy')}</p>
                                                        <p className="text-xs text-secondary font-medium">Streak ended at {item.streakAtBreak} days</p>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                                                    Reset
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Delete Confirmation Overlay */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass p-10 rounded-[2.5rem] w-full max-w-sm relative z-10 border-white/10 premium-shadow text-center"
                        >
                            <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-white">Delete activity?</h3>
                            <p className="text-secondary text-sm mb-8">This will permanently erase all history for "{name}". This action cannot be undone.</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(id);
                                        setShowDeleteConfirm(false);
                                        setIsHistoryOpen(false);
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-error text-white font-bold hover:bg-error/80 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </m.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StreakCard;
