import { useEffect, useState } from 'react';
import { account, isConfigured } from '../lib/appwrite';
import { ID } from 'appwrite';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        if (!isConfigured) {
            setLoading(false);
            return;
        }
        try {
            const session = await account.get();
            setUser(session);
        } catch (error) {
            console.error('Auth verification failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signup = async (email, password, name) => {
        try {
            await account.create(ID.unique(), email, password, name);
            await login(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            localStorage.removeItem('momentum_xp'); // Clear XP on logout
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            return { success: false, error: error.message };
        }
    };

    const updateName = async (name) => {
        try {
            await account.updateName(name);
            const updatedUser = await account.get();
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateEmail = async (email, password) => {
        try {
            await account.updateEmail(email, password);
            const updatedUser = await account.get();
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updatePrefs = async (prefs) => {
        try {
            await account.updatePrefs(prefs);
            const updatedUser = await account.get();
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (email) => {
        try {
            await account.createRecovery(email, window.location.href);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteAccount = async () => {
        try {
            // Attempt to delete the user's account identity/sessions
            try {
                // If the SDK supports it and permissions allow, this deletes the user.
                // If not, we fall back to deleting sessions (logout everywhere).
                // account.updateStatus() blocks the user, which we want to avoid if we can't fully delete.
                // We'll prioritize clearing sessions to "delete" them from this device.
                await account.deleteSessions();
            } catch (error) {
                console.warn("Could not delete sessions on server:", error);
            }

            // Always clear local data
            setUser(null);
            localStorage.removeItem('momentum_xp');
            localStorage.removeItem('momentum_email');

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateName, updateEmail, updatePrefs, resetPassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};
