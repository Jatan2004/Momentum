/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { X, Sparkle, Target } from 'lucide-react';

const AddActivityModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name);
            setName('');
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] px-4"
                    />

                    <m.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-lg glass rounded-[2rem] md:rounded-[2.5rem] premium-shadow pointer-events-auto overflow-hidden">
                            <div className="relative p-7 md:p-12 overflow-hidden">
                                {/* Decorative blobs */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 blur-[60px] rounded-full pointer-events-none -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none -ml-16 -mb-16" />

                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center">
                                            <Target className="text-accent" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">New Activity</h2>
                                            <p className="text-xs md:text-sm text-secondary font-medium">Define your activity details</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-secondary hover:text-white transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                                    <div>
                                        <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mb-4">Activity Name</p>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Morning Meditation"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[1.5rem] px-5 md:px-6 py-4 md:py-5 text-lg md:text-xl text-white placeholder:text-white/20 focus:outline-none focus:border-accent focus:bg-white/10 transition-all font-medium"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-5 rounded-[1.5rem] text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!name.trim()}
                                            className="flex-[2] py-5 bg-accent text-white rounded-[1.5rem] text-sm font-bold premium-shadow hover:bg-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                                        >
                                            <Sparkle size={18} />
                                            Initialize Activity
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddActivityModal;
