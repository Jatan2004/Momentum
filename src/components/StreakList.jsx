import React from 'react';
import StreakCard from './StreakCard';
import { LayoutGrid } from 'lucide-react';

const StreakList = ({ streaks, onBreak, onDelete }) => {
    if (!streaks || streaks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 glass rounded-[4rem] border-dashed border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-secondary mb-8">
                    <LayoutGrid size={40} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3 tracking-tight text-center">No Streaks Initialized</h4>
                <p className="text-secondary text-base font-medium max-w-xs text-center leading-relaxed">The system is currently dormant. Create your first activity to begin tracking automatically.</p>
            </div>
        );
    }

    const sortedStreaks = [...streaks].sort((a, b) => {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
    });

    return (
        <div className={`${sortedStreaks.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 grid-auto-rows-fr items-stretch'}`}>
            {sortedStreaks.map((streak) => (
                <StreakCard
                    key={streak.id}
                    {...streak}
                    onBreak={onBreak}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default StreakList;
