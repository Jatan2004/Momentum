/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

const MilestoneCelebration = ({ milestone, onClose }) => {
    const [showBadge, setShowBadge] = useState(false);

    useEffect(() => {
        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Show badge after a slight delay
        const timer = setTimeout(() => setShowBadge(true), 500);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 200, 50, 300]);
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    const getBadgeContent = () => {
        if (milestone >= 100) return { icon: <Crown className="text-yellow-400" size={48} />, title: "Century Club!", label: "100 Days" };
        if (milestone >= 30) return { icon: <Star className="text-blue-400" size={48} />, title: "Monthly Master!", label: "30 Days" };
        return { icon: <Trophy className="text-accent" size={48} />, title: "Weekly Warrior!", label: "7 Days" };
    };

    const content = getBadgeContent();

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <AnimatePresence>
                {showBadge && (
                    <m.div
                        initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                            type: "spring",
                            damping: 12,
                            stiffness: 100,
                            rotateY: { duration: 1, ease: "easeOut" }
                        }}
                        className="glass relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-center max-w-sm w-full premium-shadow border-2 border-white/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 bg-accent/10 blur-[60px] rounded-full" />

                        <div className="relative">
                            <m.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-24 h-24 md:w-32 md:h-32 glass rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border-2 border-accent/30 shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]"
                            >
                                {content.icon}
                            </m.div>

                            <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">{content.title}</h2>
                            <p className="text-secondary font-bold uppercase tracking-[0.2em] text-sm md:text-base mb-8">
                                Unlocked {content.label} Milestone
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Continue Momentum
                            </button>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </m.div>
    );
};

export default MilestoneCelebration;
