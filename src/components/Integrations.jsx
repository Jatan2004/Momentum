/* eslint-disable no-unused-vars */
import React from 'react';
import { motion as m } from 'framer-motion';
import { Github, MessageSquare, Heart, Smartphone, Globe, Lock, ExternalLink, Cog } from 'lucide-react';

const Integrations = () => {
    const integrationList = [
        {
            name: 'GitHub',
            description: 'Sync your coding streaks automatically with every push.',
            category: 'Development',
            icon: <Github size={28} />,
            status: 'Coming Soon',
            color: 'bg-zinc-800'
        },
        {
            name: 'Discord',
            description: 'Broadcast your milestones to your favorite servers.',
            category: 'Social',
            icon: <MessageSquare size={28} />,
            status: 'In Alpha',
            color: 'bg-[#5865F2]'
        },
        {
            name: 'Apple Health / Google Fit',
            description: 'Track your gym and steps without manual logging.',
            category: 'Wellness',
            icon: <Heart size={28} />,
            status: 'Roadmap',
            color: 'bg-rose-500'
        },
        {
            name: 'Webhooks',
            description: 'Connect to any external service via custom API calls.',
            category: 'Advanced',
            icon: <Globe size={28} />,
            status: 'Developer Only',
            color: 'bg-accent'
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Connect</h2>
                    <p className="text-sm md:text-base text-secondary font-medium">Automate your streaks by linking external data sources.</p>
                </div>

                <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider">
                    <Smartphone size={18} />
                    Download Mobile App
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {integrationList.map((item, i) => (
                    <m.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5 premium-shadow flex flex-col justify-between group h-full"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white premium-shadow`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${item.status === 'Coming Soon' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-secondary'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            <p className="text-[10px] text-secondary font-bold uppercase tracking-[0.2em] mb-2">{item.category}</p>
                            <h3 className="text-xl md:text-2xl font-black mb-4">{item.name}</h3>
                            <p className="text-secondary font-medium leading-relaxed mb-8">{item.description}</p>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-secondary/40">
                                <Lock size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-end encrypted</span>
                            </div>
                            <button
                                disabled
                                className="flex items-center gap-2 text-white/20 text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors"
                            >
                                Configure
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </m.div>
                ))}
            </div>

            {/* API Key Section */}
            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-white/5 premium-shadow border-dashed border-2 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-not-allowed">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-secondary">
                        <Cog size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div>
                        <h4 className="text-lg md:text-xl font-bold">Developer API Keys</h4>
                        <p className="text-xs md:text-sm text-secondary font-medium">Generate keys to build your own custom integrations.</p>
                    </div>
                </div>
                <button disabled className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-center">Generate Key</button>
            </div>
        </div>
    );
};

export default Integrations;
