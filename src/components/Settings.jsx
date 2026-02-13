import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { User, Save, AlertTriangle, Trash2, Bell, Shield, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import getAvatarUrl from '../utils/avatar';

const Settings = ({ xp = 0, level = 1, xpProgress = 0 }) => {
    const { user, logout, updateName, updateEmail, deleteAccount } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    });

    const handleSaveName = async () => {
        if (!formData.name || formData.name === user?.name) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        const result = await updateName(formData.name);
        setLoading(false);
        if (result.success) {
            setIsEditing(false);
            alert('Name updated successfully!');
        } else {
            alert(result.error);
        }
    };

    const handleSaveEmail = async () => {
        if (!formData.email || !formData.password) {
            alert('Please enter your new email and current password.');
            return;
        }
        setLoading(true);
        const result = await updateEmail(formData.email, formData.password);
        setLoading(false);
        if (result.success) {
            setIsEditingEmail(false);
            setFormData(prev => ({ ...prev, password: '' }));
            alert('Email updated successfully!');
        } else {
            alert(result.error);
        }
    };

    const handleExportData = () => {
        // Create export data object
        const exportData = {
            profile: {
                name: user?.name || '',
                email: user?.email || '',
                exportedAt: new Date().toISOString()
            },
            settings: {
                // Add any settings here when implemented
            }
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `streaks-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;

        const secondConfirm = confirm('Please confirm again: This will permanently delete your data.');
        if (!secondConfirm) return;

        setLoading(true);
        const result = await deleteAccount();
        setLoading(false);

        if (!result.success) {
            alert(result.error || 'Failed to delete account. Please try again.');
        }
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Settings</h2>
                        <p className="text-secondary font-medium text-sm md:text-base">Manage your profile, preferences, and data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Profile Settings */}
                    <div className="lg:col-span-8 glass rounded-[2.5rem] p-6 md:p-10 border-white/5 premium-shadow">
                        <h3 className="text-xl font-bold mb-8">Profile Information</h3>
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5">
                                <div className="relative group">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-2 border-white/10 p-1 group-hover:border-accent transition-colors">
                                        <img
                                            src={getAvatarUrl(user?.name)}
                                            alt={user?.name}
                                            className="w-full h-full object-cover rounded-2xl bg-white/5"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-accent text-white rounded-xl flex items-center justify-center premium-shadow">
                                        <User size={18} className="md:w-5 md:h-5" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-2xl font-black mb-1">{user?.name}</h4>
                                    <p className="text-secondary font-medium mb-4">{user?.email}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    </div>
                                </div>
                            </div>

                            {/* Level & XP Progress Section */}
                            <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-accent/20 transition-all duration-500" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white premium-shadow">
                                                <Sparkles size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em] mb-1">Momentum Status</p>
                                                <h4 className="text-2xl font-black text-white">Level {level}</h4>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black tabular-nums">{xp % 500} <span className="text-xs text-secondary">/ 500 XP</span></p>
                                            <p className="text-[9px] text-secondary font-bold uppercase tracking-widest mt-1">Next Level: {500 - (xp % 500)} XP</p>
                                        </div>
                                    </div>

                                    <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden border border-white/5 p-1">
                                        <m.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${xpProgress}%` }}
                                            className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent bg-[length:200%_100%] animate-gradient shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)] rounded-full"
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-secondary/60 italic px-2">
                                        <span>Current Tier: Elite</span>
                                        <span>Mastered streak: {Math.max(0, level - 1)} Stages</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center ml-4">
                                            <label className="text-[11px] text-secondary font-bold uppercase tracking-[0.2em]">Display Name</label>
                                            <button
                                                onClick={() => setIsEditing(!isEditing)}
                                                className="text-[10px] text-accent font-black uppercase tracking-widest hover:underline"
                                            >
                                                {isEditing ? 'Cancel' : 'Edit'}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={!isEditing}
                                                className={`w-full bg-white/5 rounded-2xl py-4 px-6 text-white border transition-all ${isEditing ? 'border-accent/50 bg-white/10 ring-4 ring-accent/5' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
                                            />
                                            {isEditing && (
                                                <button
                                                    onClick={handleSaveName}
                                                    disabled={loading}
                                                    className="absolute right-2 top-2 bottom-2 px-4 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/80 transition-all flex items-center justify-center"
                                                >
                                                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center ml-4">
                                            <label className="text-[11px] text-secondary font-bold uppercase tracking-[0.2em]">Email Address</label>
                                            <button
                                                onClick={() => setIsEditingEmail(!isEditingEmail)}
                                                className="text-[10px] text-accent font-black uppercase tracking-widest hover:underline"
                                            >
                                                {isEditingEmail ? 'Cancel' : 'Edit'}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={!isEditingEmail}
                                                className={`w-full bg-white/5 rounded-2xl py-4 px-6 text-white border transition-all ${isEditingEmail ? 'border-accent/50 bg-white/10 ring-4 ring-accent/5' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
                                            />
                                        </div>
                                        {isEditingEmail && (
                                            <m.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                className="space-y-3 pt-2"
                                            >
                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-secondary font-bold uppercase tracking-[0.2em] ml-4">Confirm Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            placeholder="Current password required"
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            className="w-full bg-white/10 rounded-2xl py-3 px-6 text-white border border-accent/30 focus:border-accent outline-none"
                                                        />
                                                        <button
                                                            onClick={handleSaveEmail}
                                                            disabled={loading}
                                                            className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/80 transition-all flex items-center justify-center"
                                                        >
                                                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Save Email'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </m.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Status */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Danger Zone */}
                        <div className="bg-error/5 rounded-[2.5rem] p-6 md:p-10 border border-error/10 premium-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-error/10 text-error rounded-xl flex items-center justify-center">
                                    <Trash2 size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-error">Danger Zone</h3>
                            </div>
                            <p className="text-secondary text-xs mb-8 leading-relaxed">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full py-4 bg-error/10 text-error border border-error/20 rounded-2xl font-bold hover:bg-error hover:text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Settings;
