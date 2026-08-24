/* eslint-disable @typescript-eslint/dot-notation */
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { ErrorGenericResponse } from '@customtypes/general';
import { AUTH_DISABLED } from '@src/config/authBypass';
import { SERVER_URL } from '@src/config-global';
import { loginSuccess, setPrivacyModalVisible } from '@src/domains/auth/slices/loginSlice';
import { showToast } from '@src/slices/apiSlice';
// eslint-disable-next-line import/no-cycle
import { RootState, store } from '@store/store';

import { triggerSessionExpired } from './handleLogout';
import { updateRefreshToken } from './refreshToken';

export const ApiClient = axios.create({
    baseURL: SERVER_URL,
    // timeout: 15000,
    signal: new AbortController().signal,
});

ApiClient.interceptors.request.use(
    async config => {
        const originalRequest = config.url;
        const currentDateAndTime = new Date().getTime() / 1000;

        const { refreshToken, token, sessionId, id, username, role, isAuthenticated } = (
            store.getState() as RootState
        ).reducer.auth;

        let decodedToken: { exp?: number } | undefined;
        let decodedRefreshToken: { exp?: number } | undefined;
        try {
            decodedToken = token ? jwtDecode<{ exp?: number }>(token) : undefined;
            decodedRefreshToken = refreshToken
                ? jwtDecode<{ exp?: number }>(refreshToken)
                : undefined;
        } catch {
            decodedToken = undefined;
            decodedRefreshToken = undefined;
        }

        if (
            token &&
            originalRequest !== '/user/refresh-token' &&
            (decodedToken?.exp ?? 0) > currentDateAndTime &&
            sessionId
        ) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['sessionid'] = sessionId;
        } else if (
            refreshToken &&
            (decodedToken?.exp ?? 0) < currentDateAndTime &&
            (decodedRefreshToken?.exp ?? 0) > currentDateAndTime
        ) {
            try {
                const response = await updateRefreshToken();
                const { data, status } = response;

                if (status === 200) {
                    store.dispatch(
                        loginSuccess({
                            username,
                            id,
                            role,
                            isAuthenticated,
                            token: data?.data?.token,
                            refreshToken: data?.data?.refreshToken,
                            sessionId: data?.data?.sessionId,
                        })
                    );
                    config.headers['Authorization'] = `Bearer ${data?.data?.token}`;
                    config.headers['sessionid'] = data?.data?.sessionId;
                }
            } catch (error) {
                triggerSessionExpired();
            }
        } else if (!AUTH_DISABLED) {
            // LOGIN DISABLED: this whole branch (no token, no valid refresh token) is
            // skipped — there's no real session to expire. Flip `AUTH_DISABLED` in
            // `@src/config/authBypass` to `false` to restore it.
            triggerSessionExpired();
        }
        // No proactive logout on the request side. If neither branch matched (no token,
        // an expired token with no valid refresh token, or a malformed token), let the
        // request proceed and let the response interceptor act on a real server-side
        // `002 / invalid token`. Logging out here would bounce a freshly-logged-in user
        // whose in-memory auth hasn't fully settled.

        return config;
    },
    error => Promise.reject(error)
);

ApiClient.interceptors.response.use(
    response => {
        const { data } = response;
        return data;
    },
    error => {
        const data: ErrorGenericResponse = error?.response?.data;
        if (data.message === 'invalid token' || data.responseCode === '002') {
            // LOGIN DISABLED: skip the hard redirect to /session-expired — there's no
            // real session to expire, and every request is expected to come back
            // unauthenticated. Flip `AUTH_DISABLED` in `@src/config/authBypass` to
            // `false` to restore it.
            if (!AUTH_DISABLED) {
                triggerSessionExpired();
            }
        } else if (data.responseCode === '004') {
            window.location.href = '/404';
        } else if (data.responseCode === '006') {
            store.dispatch(setPrivacyModalVisible(true));
        } else if (data.responseCode !== '003') {
            const suppressToast = error?.config?.headers?.['x-suppress-error-toast'] === 'true';
            if (!suppressToast) {
                store.dispatch(showToast({ description: data?.message || 'Something went wrong. Please try again.', variant: 'error' }));
            }
        }
        return Promise.reject(error);
    }
);
