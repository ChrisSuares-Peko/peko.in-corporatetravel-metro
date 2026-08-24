import axios from 'axios';

import { SERVER_URL } from '@src/config-global';
// eslint-disable-next-line import/no-cycle
import { persistor } from '@store/store';

export const clearData = () => {
    try {
        persistor.pause();
        persistor.flush();
        persistor.purge();
    } catch (error) {
        console.error('Error clearing persisted store:', error);
    }

    // Clear all localStorage items related to auth
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('persist:') || key.includes('auth') || key.includes('token'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error(`Error removing ${key}:`, e);
            }
        });
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        // If localStorage is corrupted, try to clear everything
        try {
            localStorage.clear();
        } catch (clearError) {
            console.error('Error clearing all localStorage:', clearError);
        }
    }

    // Clear sessionStorage
    try {
        sessionStorage.clear();
    } catch (error) {
        console.error('Error clearing sessionStorage:', error);
    }

    window.location.href = '/'; // avoid auto redirecting to prev page after login in again
};

export const handleLogout = async () => {
    const authChannel = new BroadcastChannel('authChannel');

    if ((window as any).fcWidget) {
        try {
            (window as any).fcWidget.destroy();
        } catch (error) {
            console.error('Error destroying fcWidget:', error);
        }
    }
     if (typeof Moengage?.destroy_session === 'function') {
        Moengage.destroy_session();
    }

    let authData: { token?: string; sessionId?: string } = {};
    try {
        const reduxStorageString = localStorage.getItem('persist:root');
        if (reduxStorageString) {
            const reduxStorage = JSON.parse(reduxStorageString);
            if (reduxStorage?.auth) {
                authData = JSON.parse(reduxStorage.auth);
            }
        }
    } catch (error) {
        console.error('Error parsing localStorage auth data:', error);
        // If localStorage is corrupted, proceed with logout anyway
    }

    // Only attempt logout API call if we have valid tokens
    if (authData?.token && authData?.sessionId) {
        try {
            await axios.post(
                `${SERVER_URL}/user/logout`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${authData.token}`,
                        sessionid: authData.sessionId,
                    },
                }
            );
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with cleanup even if API call fails
        }
    }

    // Always send logout message and clear data
    authChannel.postMessage('logout');
    clearData();
};

export const triggerSessionExpired = () => {
    if (window.location.pathname === '/session-expired') return;
    window.location.href = '/session-expired';
};
