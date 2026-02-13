import { useState, useEffect, useCallback } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { databases, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from './useAuth';

export const useStreakSystem = () => {
    const [streaks, setStreaks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const calculateCurrentStreaks = useCallback((list) => {
        const today = new Date().toISOString().split('T')[0];
        return list.map(streak => {
            const lastReset = streak.lastResetDate || streak.createdAt;
            const daysSinceReset = differenceInCalendarDays(parseISO(today), parseISO(lastReset));
            const currentCount = Math.max(0, daysSinceReset);

            return {
                ...streak,
                count: currentCount,
                longestStreak: Math.max(streak.longestStreak || 0, currentCount)
            };
        });
    }, []);

    const loadData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userId', user.$id)]
            );

            const docs = response.documents.map(doc => ({
                ...doc,
                id: doc.$id, // Normalize $id to id for existing components
                brokenHistory: JSON.parse(doc.brokenHistory || '[]')
            }));

            const updated = calculateCurrentStreaks(docs);
            setStreaks(updated);
        } catch (error) {
            console.error('Failed to load streaks:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, calculateCurrentStreaks]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addStreak = async (name) => {
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        const newStreakData = {
            userId: user.$id,
            name,
            createdAt: today,
            lastResetDate: today,
            longestStreak: 0,
            brokenHistory: JSON.stringify([])
        };

        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                newStreakData
            );

            const newStreak = {
                ...response,
                id: response.$id,
                brokenHistory: []
            };

            setStreaks(prev => calculateCurrentStreaks([...prev, newStreak]));
        } catch (error) {
            console.error('Failed to add streak:', error);
        }
    };

    const breakStreak = async (id) => {
        const streak = streaks.find(s => s.id === id);
        if (!streak) return;

        const today = new Date().toISOString().split('T')[0];
        const newHistory = [
            { date: today, streakAtBreak: streak.count },
            ...streak.brokenHistory
        ];

        const updatedData = {
            lastResetDate: today,
            longestStreak: Math.max(streak.longestStreak || 0, streak.count),
            brokenHistory: JSON.stringify(newHistory)
        };

        try {
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, updatedData);

            setStreaks(prev => prev.map(s =>
                s.id === id ? {
                    ...s,
                    ...updatedData,
                    brokenHistory: newHistory,
                    count: 0 // Explicitly set for UI
                } : s
            ));
        } catch (error) {
            console.error('Failed to break streak:', error);
        }
    };

    const deleteStreak = async (id) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
            setStreaks(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete streak:', error);
        }
    };

    return {
        streaks,
        isLoading,
        addStreak,
        breakStreak,
        deleteStreak
    };
};
