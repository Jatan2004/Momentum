/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, PieChart, Calendar, ChevronUp, ChevronDown, Activity, Zap, Download } from 'lucide-react';
import { format, subDays, startOfDay, differenceInDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Users, Plus, UserPlus, Trophy, Flame, ChevronRight, Copy, Check, Hash, Loader2, RefreshCw, X, History, LogOut, Trash2, AlertTriangle, ChevronLeft } from 'lucide-react';

const Analytics = ({ streaks }) => {
    const [timeRange, setTimeRange] = useState(30);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredPoint, setHoveredPoint] = useState(null); // { x: 0, y: 0, data: {} }

    const breakDates = useMemo(() => {
        const dates = new Map();
        streaks.forEach(s => {
            s.brokenHistory?.forEach(b => {
                const dateKey = format(parseISO(b.date), 'yyyy-MM-dd');
                if (!dates.has(dateKey)) dates.set(dateKey, []);
                dates.get(dateKey).push(s.name);
            });
        });
        return dates;
    }, [streaks]);

    const totalStreaks = streaks.length;
    const activeStreaks = streaks.filter(s => s.count > 0).length;
    const totalMomentum = streaks.reduce((acc, s) => acc + (s.count || 0), 0);
    const peakMomentum = Math.max(0, ...streaks.map(s => s.longestStreak || 0));

    // Sort streaks by momentum for chart
    const sortedStreaks = useMemo(() =>
        [...streaks].sort((a, b) => (b.count || 0) - (a.count || 0)),
        [streaks]);

    // Generate real activity grid data (last 365 days to ensure charts are full)
    const gridData = useMemo(() => {
        const days = 365;
        const today = startOfDay(new Date());
        const activityMap = new Map();

        // Process all streak histories to build activity map
        streaks.forEach(streak => {
            // Count current active days and add cumulative momentum
            if (streak.count > 0) {
                for (let i = 0; i < streak.count; i++) {
                    const date = format(subDays(today, i), 'yyyy-MM-dd');
                    const existing = activityMap.get(date) || { count: 0, momentum: 0 };
                    activityMap.set(date, {
                        count: existing.count + 1,
                        momentum: existing.momentum + (streak.count - i)
                    });
                }
            }

            // Process broken history
            if (streak.brokenHistory && streak.brokenHistory.length > 0) {
                streak.brokenHistory.forEach(broken => {
                    const breakDate = startOfDay(parseISO(broken.date));
                    const streakLength = broken.streakAtBreak || 0;

                    for (let i = 1; i <= streakLength; i++) {
                        const date = format(subDays(breakDate, i), 'yyyy-MM-dd');
                        const existing = activityMap.get(date) || { count: 0, momentum: 0 };
                        activityMap.set(date, {
                            count: existing.count + 1,
                            momentum: existing.momentum + (streakLength - (i - 1))
                        });
                    }
                });
            }
        });

        // Generate grid for last 365 days
        return Array.from({ length: days }).map((_, i) => {
            const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
            const data = activityMap.get(date) || { count: 0, momentum: 0 };
            return {
                date,
                active: data.count > 0,
                momentum: data.momentum,
                activeCount: data.count,
                level: data.count === 0 ? 'none' : data.count === 1 ? 'low' : data.count === 2 ? 'medium' : data.count >= 3 ? 'high' : 'very-high'
            };
        });
    }, [streaks]);

    // Dynamic scaling for chart based on visible data
    const chartMax = useMemo(() => {
        const visibleData = gridData.slice(-timeRange);
        const max = Math.max(...visibleData.map(d => d.momentum));
        return Math.max(10, Math.ceil(max * 1.1)); // Buffer
    }, [gridData, timeRange]);

    // Calculate real weekly average momentum
    const weeklyStats = useMemo(() => {
        const last7Days = gridData.slice(-7);
        const previous7Days = gridData.slice(-14, -7);

        const currentWeekMomentum = last7Days.reduce((acc, d) => acc + d.momentum, 0);
        const previousWeekMomentum = previous7Days.reduce((acc, d) => acc + d.momentum, 0);

        const average = Math.round(currentWeekMomentum / 7);
        const change = previousWeekMomentum > 0
            ? Math.round(((currentWeekMomentum - previousWeekMomentum) / previousWeekMomentum) * 100)
            : currentWeekMomentum > 0 ? 100 : 0;

        return { average, change };
    }, [gridData]);

    // Download report functionality
    const handleDownloadReport = () => {
        const csvContent = [
            ['Activity Name', 'Current Streak', 'Longest Streak', 'Total Breaks', 'Last Break Date'],
            ...streaks.map(streak => [
                streak.name,
                streak.count || 0,
                streak.longestStreak || 0,
                streak.brokenHistory?.length || 0,
                streak.brokenHistory?.[0]?.date ? format(parseISO(streak.brokenHistory[0].date), 'MMM dd, yyyy') : 'Never'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `streaks-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Insights</h2>
                    <p className="text-secondary font-medium text-sm md:text-base">Quantifying your consistency and growth patterns.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                    <button
                        onClick={() => setTimeRange(30)}
                        className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${timeRange === 30 ? 'bg-white text-black premium-shadow' : 'text-secondary hover:text-white'
                            }`}
                    >
                        <span className="hidden sm:inline">Last 30 Days</span>
                        <span className="sm:hidden">30D</span>
                    </button>
                    <button
                        onClick={() => setTimeRange(365)}
                        className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${timeRange === 365 ? 'bg-white text-black premium-shadow' : 'text-secondary hover:text-white'
                            }`}
                    >
                        <span className="hidden sm:inline">All Time</span>
                        <span className="sm:hidden">All</span>
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: 'Consistency', value: activeStreaks > 0 ? 'High' : 'None', sub: `${activeStreaks}/${totalStreaks} Active`, icon: <Activity className="text-accent" />, color: 'accent' },
                    { label: 'Total Volume', value: totalMomentum, sub: 'Combined Days', icon: <TrendingUp className="text-success" />, color: 'success' },
                    { label: 'Peak Velocity', value: peakMomentum, sub: 'Days Record', icon: <Zap className="text-yellow-400" />, color: 'yellow-400' },
                    { label: 'Diversity', value: totalStreaks, sub: 'Goal Categories', icon: <PieChart className="text-purple-500" />, color: 'purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-[2rem] border-white/5 premium-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <ChevronUp size={16} className="text-success" />
                        </div>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-3xl font-black">{stat.value}</h4>
                            <p className="text-[10px] text-secondary/50 font-medium uppercase tracking-tighter">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Momentum Leaderboard Breakdown */}
                <div className="lg:col-span-12 glass rounded-[2.5rem] p-10 border-white/5 premium-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Streak Distribution</h3>
                            <p className="text-xs text-secondary font-medium">Distribution of momentum across your active pursuits.</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        {sortedStreaks.length > 0 ? sortedStreaks.map((streak, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-end mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-black italic px-0.5 ${i === 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500' :
                                            i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400' :
                                                i === 2 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-600 to-orange-500' :
                                                    'text-white'
                                            }`}>#{i + 1}</span>
                                        <h5 className="font-bold text-lg">{streak.name}</h5>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-black">{streak.count || 0}</span>
                                        <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Days</span>
                                    </div>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <m.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (streak.count / (peakMomentum || 1)) * 100)}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-accent to-purple-500 relative"
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-white/20" />
                                    </m.div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <BarChart2 className="mx-auto mb-4" size={48} />
                                <p className="font-bold uppercase tracking-widest text-sm">No streak data recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Timeline or Calendar Switcher? Let's just stack them. */}
                <div className="lg:col-span-12 glass rounded-[2.5rem] p-6 md:p-10 border-white/5 premium-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-error/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Activity Calendar</h3>
                                <p className="text-xs text-secondary font-medium">Monthly consistency overview and break highlights.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/10">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-2 hover:bg-white/5 rounded-lg text-secondary hover:text-white transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold min-w-[120px] text-center uppercase tracking-widest px-2">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <button
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-2 hover:bg-white/5 rounded-lg text-secondary hover:text-white transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-4 relative z-10">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] md:text-xs font-black text-secondary uppercase tracking-[0.2em] pb-2">
                                {day}
                            </div>
                        ))}

                        {useMemo(() => {
                            const monthStart = startOfMonth(currentMonth);
                            const monthEnd = endOfMonth(monthStart);
                            const startDate = startOfWeek(monthStart);
                            const endDate = endOfWeek(monthEnd);
                            const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

                            return calendarDays.map((day, idx) => {
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const isBreak = breakDates.has(dateKey);
                                const dayData = gridData.find(d => d.date === dateKey);
                                const isActive = dayData?.active;
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);

                                return (
                                    <m.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.01 }}
                                        className={`aspect-square rounded-lg md:rounded-2xl flex flex-col items-center justify-center relative transition-all group overflow-hidden ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : ''
                                            } ${isBreak ? 'bg-error/20 border border-error/40 text-error shadow-[0_0_15px_rgba(255,69,58,0.2)]' :
                                                isActive ? 'bg-success/20 border border-success/40 text-success' :
                                                    'bg-white/5 border border-white/5 text-secondary hover:bg-white/10'
                                            } ${isTodayDate ? 'ring-2 ring-white/20' : ''}`}
                                    >
                                        <span className={`text-[10px] md:text-sm font-black ${isBreak || isActive ? '' : 'text-secondary'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {isBreak && (
                                            <div className="absolute top-1 right-1 w-1 h-1 md:w-2 md:h-2 bg-error rounded-full animate-pulse" />
                                        )}
                                        {/* Status Dot */}
                                        <div className={`mt-1 w-1 h-1 rounded-full ${isBreak ? 'bg-error' : isActive ? 'bg-success' : 'bg-transparent'}`} />

                                        {/* Tooltip-like info on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all pointer-events-none">
                                            <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-white text-center px-1">
                                                {isBreak ? `${breakDates.get(dateKey).length} Breaks` : isActive ? 'Active' : 'Empty'}
                                            </p>
                                        </div>
                                    </m.div>
                                );
                            });
                        }, [currentMonth, breakDates, gridData])}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-6 relative z-10 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-success/20 border border-success/40" />
                            <span className="text-success">Streak Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-error/20 border border-error/40" />
                            <span className="text-error">Streak Broken</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-white/5 border border-white/5" />
                            <span className="text-secondary/50">Inactive</span>
                        </div>
                    </div>
                </div>

                {/* Progress Timeline */}
                <div className="lg:col-span-12 glass rounded-[2.5rem] p-6 md:p-10 border-white/5 premium-shadow">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Progress Timeline</h3>
                                <p className="text-xs text-secondary font-medium">Streak growth over time.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Time Range Filter */}
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                {[
                                    { label: '7D', value: 7 },
                                    { label: '30D', value: 30 },
                                    { label: '90D', value: 90 },
                                    { label: 'All', value: 365 }
                                ].map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTimeRange(value)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${timeRange === value
                                            ? 'bg-white text-black'
                                            : 'text-secondary hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleDownloadReport}
                                className="w-10 h-10 glass rounded-xl flex items-center justify-center text-accent hover:bg-accent/10 transition-all premium-shadow"
                                title="Download Report"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Timeline Chart */}
                    <div className="relative h-64 mb-4 overflow-hidden touch-none select-none">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-right pr-4">
                            {[...Array(5)].map((_, i) => {
                                const value = Math.ceil((chartMax / 4) * (4 - i));
                                return (
                                    <span key={i} className="text-xs text-secondary font-bold">
                                        {value}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Chart area */}
                        <div className="absolute left-12 right-0 top-0 bottom-0 pl-4">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-white/5" />
                                ))}
                            </div>

                            {/* Line chart */}
                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                style={{ touchAction: 'none' }}
                            >
                                <defs>
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#5E5CE6" stopOpacity="0.3" />
                                        <stop offset="50%" stopColor="#5E5CE6" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#A855F7" stopOpacity="1" />
                                    </linearGradient>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#5E5CE6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#5E5CE6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area fill */}
                                <m.path
                                    key={`area-${timeRange}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1 }}
                                    d={`M 0,100 ${gridData.slice(-timeRange).map((day, i) => {
                                        const x = (i / (timeRange - 1)) * 100;
                                        const y = chartMax > 0 ? ((1 - (day.momentum / chartMax)) * 100) : 100;
                                        return `L ${x},${y}`;
                                    }).join(' ')} L 100,100 Z`}
                                    fill="url(#areaGradient)"
                                />

                                {/* Line */}
                                <m.path
                                    key={`line-${timeRange}`}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    d={`M 0,${chartMax > 0 ? ((1 - (gridData.slice(-timeRange)[0]?.momentum / chartMax)) * 100) : 100} ${gridData.slice(-timeRange).map((day, i) => {
                                        const x = (i / (timeRange - 1)) * 100;
                                        const y = chartMax > 0 ? ((1 - (day.momentum / chartMax)) * 100) : 100;
                                        return `L ${x},${y}`;
                                    }).join(' ')}`}
                                    stroke="url(#lineGradient)"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Interactive Overlay */}
                                {gridData.slice(-timeRange).map((day, i) => {
                                    const x = (i / (timeRange - 1)) * 100;
                                    const width = 100 / (timeRange - 1);
                                    return (
                                        <rect
                                            key={i}
                                            x={x - width / 2}
                                            y="0"
                                            width={width}
                                            height="100"
                                            fill="transparent"
                                            onMouseEnter={() => {
                                                const y = chartMax > 0 ? ((1 - (day.momentum / chartMax)) * 100) : 100;
                                                setHoveredPoint({ x, y, data: day });
                                            }}
                                            onTouchStart={(e) => {
                                                e.stopPropagation();
                                                const y = chartMax > 0 ? ((1 - (day.momentum / chartMax)) * 100) : 100;
                                                setHoveredPoint({ x, y, data: day });
                                            }}
                                            onTouchMove={(e) => {
                                                e.stopPropagation();
                                                const y = chartMax > 0 ? ((1 - (day.momentum / chartMax)) * 100) : 100;
                                                setHoveredPoint({ x, y, data: day });
                                            }}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                            className="cursor-crosshair"
                                        />
                                    );
                                })}

                                {/* Hover Indicator */}
                                {hoveredPoint && (
                                    <m.g
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <line
                                            x1={hoveredPoint.x}
                                            y1="0"
                                            x2={hoveredPoint.x}
                                            y2="100"
                                            stroke="white"
                                            strokeWidth="0.5"
                                            strokeDasharray="2,2"
                                            className="opacity-20"
                                        />
                                        <circle
                                            cx={hoveredPoint.x}
                                            cy={hoveredPoint.y}
                                            r="4"
                                            fill="#A855F7"
                                            className="shadow-[0_0_10px_#A855F7]"
                                        />
                                    </m.g>
                                )}
                            </svg>

                            {/* Tooltip */}
                            <AnimatePresence>
                                {hoveredPoint && (
                                    <m.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        style={{
                                            left: `${Math.max(25, Math.min(75, hoveredPoint.x))}%`,
                                            top: `0`,
                                            transform: `translate(-50%, -120%)`,
                                        }}
                                        className="absolute z-30 pointer-events-none sm:top-auto sm:style-placeholder"
                                    /* On desktop, we can use the dynamic Y, but on mobile let's keep it pinned to top of chart to avoid finger occlusion */
                                    >
                                        <div className="glass px-4 py-2 rounded-xl premium-shadow border border-white/10 whitespace-nowrap">
                                            <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1">
                                                {format(parseISO(hoveredPoint.data.date), 'MMM dd, yyyy')}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                <p className="text-sm font-black text-white">
                                                    {hoveredPoint.data.momentum} <span className="text-[10px] text-secondary">Streak Days</span>
                                                </p>
                                            </div>
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                        <div className="grid grid-cols-2 md:flex md:items-center gap-6">
                            <div>
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Current Momentum</p>
                                <div className="flex items-center gap-2">
                                    <h6 className="text-xl md:text-2xl font-black">{weeklyStats.average}</h6>
                                    <p className={`text-[10px] font-bold uppercase ${weeklyStats.change >= 0 ? 'text-success' : 'text-error'}`}>
                                        {weeklyStats.change >= 0 ? '+' : ''}{weeklyStats.change}%
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Total Days</p>
                                <h6 className="text-xl md:text-2xl font-black">{totalMomentum}</h6>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-white/10" />
                            <div>
                                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">Peak Streak</p>
                                <h6 className="text-xl md:text-2xl font-black text-accent">{peakMomentum}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
