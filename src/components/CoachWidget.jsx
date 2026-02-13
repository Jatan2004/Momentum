/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldAlert, Heart, Zap, Wind } from 'lucide-react';

const CoachWidget = ({ streaks }) => {
    const [personality, setPersonality] = useState('zen'); // 'zen' or 'drill'
    const [message, setMessage] = useState('');

    const drillMessages = [
        "DO NOT LET THAT CRACKED MIRROR CATCH YOU TODAY!",
        "SWEAT NOW, SHINE LATER. NO EXCUSES!",
        "DON'T YOU DARE RESET THAT COUNTER.",
        "MOMENTUM IS A WEAPON. KEEP IT SHARP.",
        "PAIN IS TEMPORARY. BROKEN STREAKS ARE FOREVER."
    ];

    const zenMessages = [
        "Breathe. One small step today is a giant leap for your habit.",
        "Your consistency is your superpower. Stay present.",
        "The mirror is clear today. Keep it that way.",
        "Peace begins with a single completed task.",
        "Flow with the momentum, don't fight it."
    ];

    useEffect(() => {
        const updateMessage = () => {
            const pool = personality === 'drill' ? drillMessages : zenMessages;
            const randomMsg = pool[Math.floor(Math.random() * pool.length)];
            setMessage(randomMsg);
        };

        updateMessage();

        // Auto-update message every 30 seconds
        const interval = setInterval(updateMessage, 30000);
        return () => clearInterval(interval);
    }, [personality]);

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-8 md:p-12 rounded-[3rem] premium-shadow border-2 border-accent/20 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[60px] rounded-full" />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${personality === 'drill' ? 'bg-error/20 text-error' : 'bg-success/20 text-success'}`}>
                                {personality === 'drill' ? <Zap size={24} strokeWidth={3} /> : <Wind size={24} strokeWidth={3} />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-secondary">
                                    Coach {personality === 'drill' ? 'Sergeant' : 'Momentum'}
                                </p>
                                <p className="text-2xl font-black text-white mt-1">
                                    {personality === 'drill' ? 'DRILL MODE' : 'ZEN MODE'}
                                </p>
                            </div>
                        </div>

                        {/* Personality Toggle */}
                        <div className="flex bg-white/5 p-2 rounded-xl gap-2">
                            <m.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPersonality('zen')}
                                className={`p-3 rounded-lg transition-all ${personality === 'zen' ? 'bg-white text-black' : 'text-secondary hover:text-white'}`}
                            >
                                <Heart size={20} strokeWidth={3} />
                            </m.button>
                            <m.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPersonality('drill')}
                                className={`p-3 rounded-lg transition-all ${personality === 'drill' ? 'bg-white text-black' : 'text-secondary hover:text-white'}`}
                            >
                                <ShieldAlert size={20} strokeWidth={3} />
                            </m.button>
                        </div>
                    </div>

                    {/* Message */}
                    <AnimatePresence mode="wait">
                        <m.div
                            key={message}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8"
                        >
                            <p className={`text-lg md:text-2xl font-bold leading-relaxed ${personality === 'drill' ? 'text-white italic uppercase' : 'text-secondary'}`}>
                                "{message}"
                            </p>
                        </m.div>
                    </AnimatePresence>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-8">
                        <span className="flex-1 h-[2px] bg-white/5 rounded-full" />
                        <m.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-2 h-2 rounded-full bg-accent"
                        />
                        <span className="flex-1 h-[2px] bg-white/5 rounded-full" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-black text-accent mb-1">
                                {streaks?.filter(s => s.count > 0).length || 0}
                            </p>
                            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                                Active
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-white mb-1">
                                {streaks?.reduce((acc, s) => acc + (s.count || 0), 0) || 0}
                            </p>
                            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                                Total Days
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-purple-400 mb-1">
                                {Math.max(0, ...streaks?.map(s => s.longestStreak || 0) || [0])}
                            </p>
                            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                                Peak
                            </p>
                        </div>
                    </div>
                </div>
            </m.div>
        </div>
    );
};

export default CoachWidget;
