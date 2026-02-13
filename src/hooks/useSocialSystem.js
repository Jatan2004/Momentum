import { useState, useEffect, useCallback } from 'react';
import { databases, DATABASE_ID, GROUPS_COLLECTION_ID, MEMBERS_COLLECTION_ID, COLLECTION_ID } from '../lib/appwrite';
import { Query, ID } from 'appwrite';
import { useAuth } from './useAuth';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export const useSocialSystem = () => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchGroups = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // 1. Get all memberships for the user
            const memberResponse = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.equal('userId', user.$id)]
            );

            if (memberResponse.documents.length === 0) {
                setGroups([]);
                return;
            }

            // 2. Get the actual group details
            const groupIds = memberResponse.documents.map(m => m.groupId);
            const groupResponse = await databases.listDocuments(
                DATABASE_ID,
                GROUPS_COLLECTION_ID,
                [Query.equal('$id', groupIds)]
            );

            setGroups(groupResponse.documents);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = async (name, activity = '') => {
        if (!user) return;
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            // 1. Create the group
            const group = await databases.createDocument(
                DATABASE_ID,
                GROUPS_COLLECTION_ID,
                ID.unique(),
                {
                    name,
                    inviteCode,
                    creatorId: user.$id,
                    activity: activity.trim()
                }
            );

            // 2. Add the creator as a member
            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                ID.unique(),
                {
                    groupId: group.$id,
                    userId: user.$id,
                    userName: user.name
                }
            );

            setGroups(prev => [...prev, group]);
            await fetchGroups();
            return { success: true, group };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const joinGroup = async (inviteCode) => {
        if (!user) return;
        try {
            // 1. Find group by code
            const groupResponse = await databases.listDocuments(
                DATABASE_ID,
                GROUPS_COLLECTION_ID,
                [Query.equal('inviteCode', inviteCode.toUpperCase())]
            );

            if (groupResponse.documents.length === 0) {
                throw new Error('Invalid invite code');
            }

            const group = groupResponse.documents[0];

            // 2. Check if already a member
            const memberCheck = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [
                    Query.equal('groupId', group.$id),
                    Query.equal('userId', user.$id)
                ]
            );

            if (memberCheck.documents.length > 0) {
                throw new Error('You are already a member of this group');
            }

            // 3. Join the group
            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                ID.unique(),
                {
                    groupId: group.$id,
                    userId: user.$id,
                    userName: user.name
                }
            );

            setGroups(prev => [...prev, group]);
            await fetchGroups();
            return { success: true, group };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getGroupLeaderboard = async (groupId, groupActivity) => {
        try {
            let activityFilter = groupActivity;

            // 1. Get group details ONLY if activity filter is undefined (not passed)
            if (activityFilter === undefined) {
                const group = await databases.getDocument(
                    DATABASE_ID,
                    GROUPS_COLLECTION_ID,
                    groupId
                );
                activityFilter = group.activity;
            }

            // 2. Get all members
            const memberResponse = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.equal('groupId', groupId)]
            );

            const userIds = memberResponse.documents.map(m => m.userId);
            const userMap = {};
            memberResponse.documents.forEach(m => userMap[m.userId] = m.userName);

            // 2. Get all streaks for these users
            // Note: Appwrite has a limit on Query.equal array size, but for friends it should be fine.
            const streakResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [Query.equal('userId', userIds)]
            );

            // 3. Calculate total momentum for each user
            const today = new Date().toLocaleDateString('en-CA');
            const leaderStats = {};

            userIds.forEach(uid => {
                leaderStats[uid] = {
                    userId: uid,
                    name: userMap[uid],
                    totalStreaks: 0,
                    totalMomentum: 0,
                    peakStreak: 0
                };
            });

            streakResponse.documents.forEach(streak => {
                // Apply activity filter if defined (case-insensitive)
                if (activityFilter && streak.name.toLowerCase() !== activityFilter.toLowerCase()) {
                    return;
                }

                const lastReset = streak.lastResetDate || streak.createdAt;
                const days = Math.max(0, differenceInCalendarDays(parseISO(today), parseISO(lastReset)));

                if (!leaderStats[streak.userId].streaks) {
                    leaderStats[streak.userId].streaks = [];
                }

                leaderStats[streak.userId].streaks.push({
                    ...streak,
                    count: days,
                    brokenHistory: JSON.parse(streak.brokenHistory || '[]')
                });

                leaderStats[streak.userId].totalStreaks += 1;
                leaderStats[streak.userId].totalMomentum += days;
                leaderStats[streak.userId].peakStreak = Math.max(leaderStats[streak.userId].peakStreak, days);
            });

            return Object.values(leaderStats).sort((a, b) => b.totalMomentum - a.totalMomentum);
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return [];
        }
    };

    const leaveGroup = async (groupId) => {
        if (!user) return;
        try {
            // 1. Find membership
            const memberResponse = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [
                    Query.equal('groupId', groupId),
                    Query.equal('userId', user.$id)
                ]
            );

            if (memberResponse.documents.length === 0) {
                throw new Error('Membership not found');
            }

            // 2. Delete membership
            await databases.deleteDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, memberResponse.documents[0].$id);

            setGroups(prev => prev.filter(g => g.$id !== groupId));
            fetchGroups(); // Background sync
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteGroup = async (groupId) => {
        if (!user) return;
        try {
            // 1. Get group to verify creator
            const group = await databases.getDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);
            if (group.creatorId !== user.$id) {
                throw new Error('Only the creator can delete this arena');
            }

            // OPTIMISTIC UPDATE: Clear it immediately
            setGroups(prev => prev.filter(g => g.$id !== groupId));

            // 2. Delete all memberships
            const memberResponse = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                [Query.equal('groupId', groupId)]
            );

            for (const member of memberResponse.documents) {
                await databases.deleteDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, member.$id);
            }

            // 3. Delete group
            await databases.deleteDocument(DATABASE_ID, GROUPS_COLLECTION_ID, groupId);

            // Fetch groups again but don't block the UI
            fetchGroups().catch(err => console.error('Background sync failed:', err));

            return { success: true };
        } catch (error) {
            // Revert local state on failure
            await fetchGroups();
            return { success: false, error: error.message };
        }
    };

    return {
        groups,
        isLoading,
        createGroup,
        joinGroup,
        leaveGroup,
        deleteGroup,
        getGroupLeaderboard,
        refreshGroups: fetchGroups
    };
};
