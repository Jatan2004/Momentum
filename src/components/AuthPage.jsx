/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, ArrowRight, Loader2, TrendingUp, Check, Flame } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();

    useEffect(() => {
        const savedEmail = localStorage.getItem('momentum_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                if (rememberMe) {
                    localStorage.setItem('momentum_email', email);
                } else {
                    localStorage.removeItem('momentum_email');
                }
                result = await login(email, password);
            } else {
                result = await signup(email, password, name);
            }

            if (!result.success) {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Orbs - Hidden on mobile for performance */}
            <div className="hidden md:block absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse duration-[4000ms]" />
            <div className="hidden md:block absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[5000ms]" />

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md gpu-accelerated"
            >
                <div className="glass rounded-[2.5rem] p-8 md:p-12 premium-shadow border-white/5 relative z-10 overflow-hidden">
                    {/* Decorative glow inside card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-accent/20 blur-[60px] pointer-events-none" />

                    <div className="flex flex-col items-center mb-8 relative z-10">
                        <m.div
                            whileHover={{ rotate: 10, scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white premium-shadow mb-6 rotate-3 shadow-[0_0_30px_rgba(var(--accent-rgb),0.4)]"
                        >
                            <Flame size={32} strokeWidth={3} className="md:w-10 md:h-10 drop-shadow-md" />
                        </m.div>

                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 italic uppercase bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 drop-shadow-sm py-4 px-2 leading-normal">
                            Momentum
                        </h1>
                        <p className="text-secondary text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                            {isLogin ? 'Welcome Back' : 'Join the Movement'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <m.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] text-secondary font-black uppercase tracking-widest ml-4">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 rounded-2xl py-4 pl-14 pr-6 text-white border border-white/10 focus:border-accent/50 outline-none transition-all placeholder:text-secondary/30 relative z-10"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required={!isLogin}
                                            autoComplete="name"
                                        />
                                    </div>
                                </m.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] text-secondary font-black uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-white/5 rounded-2xl py-4 pl-14 pr-6 text-white border border-white/10 focus:border-accent/50 outline-none transition-all placeholder:text-secondary/30 relative z-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-secondary font-black uppercase tracking-widest ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-white transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 rounded-2xl py-4 pl-14 pr-6 text-white border border-white/10 focus:border-accent/50 outline-none transition-all placeholder:text-secondary/30 relative z-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                            </div>
                        </div>

                        {/* Remember Me Option */}
                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-accent border-accent text-white' : 'border-white/20 bg-white/5 group-hover:border-accent/50'}`}>
                                    {rememberMe && <Check size={12} strokeWidth={3} />}
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="hidden"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-secondary group-hover:text-white transition-colors uppercase tracking-widest">Remember Me</span>
                            </label>

                            {isLogin && (
                                <button type="button" className="text-[10px] font-bold text-secondary hover:text-white transition-colors uppercase tracking-widest">
                                    Forgot?
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {error && (
                                <m.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="text-error text-xs font-bold text-center bg-error/10 py-3 rounded-xl border border-error/20 flex items-center justify-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                                    {error}
                                </m.div>
                            )}
                        </AnimatePresence>

                        <m.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 premium-shadow mt-6 hover:bg-white/90"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin text-black" size={20} />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Start Journey'}
                                    <ArrowRight size={20} strokeWidth={3} />
                                </>
                            )}
                        </m.button>
                    </form>

                    <div className="mt-8 text-center text-xs font-bold uppercase tracking-wide">
                        <span className="text-secondary/50">
                            {isLogin ? "New here?" : "Already joined?"}
                        </span>
                        <button
                            onClick={() => {
                                setError('');
                                setIsLogin(!isLogin);
                            }}
                            className="ml-2 text-accent hover:text-white transition-colors relative group"
                        >
                            {isLogin ? 'Create Account' : 'Log In'}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
                        </button>
                    </div>
                </div>
            </m.div>
        </div>
    );
};

export default AuthPage;
