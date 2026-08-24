import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import { auth } from '@src/domains/dashboard/pekoConnect/config/firebaseConfig';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { TAB_ID } from '@src/utils/tabId';

import { signIn } from '../api/index';
import { loginSuccess } from '../slices/loginSlice';
import { LoginRequest, LoginResponse } from '../types/index';

export default function useLoginApi() {
    const dispatch = useAppDispatch();
    const redirectURL = useAppSelector(state => state.reducer.auth.redirectUrl);
    const authChannel = new BroadcastChannel('authChannel');
    const navigate = useNavigate();

    const handleLogin = async (payload: LoginRequest) => {
        const response: LoginResponse | false = await signIn(payload);
        if (response) {
            if (response.maxPasswordAge) {
                navigate('/auth/ChangePassword', {
                    state: {
                        userName: payload.username,
                        password: payload.password,
                    },
                });
            } else {
                const { firebaseToken } = response; // Assuming the backend returns this token

                try {
                    await signInWithCustomToken(auth, firebaseToken);

                    const user = getAuth().currentUser;

                    if (user) {
                        const idTokenResult = await user.getIdTokenResult(); // Fetch custom claims

                        // Access the custom claim `username`
                        const { username } = idTokenResult.claims;

                        if (username) {
                            console.log('Username from custom claim:', username);
                            // Now you can proceed with the frontend logic using the username
                        } else {
                            console.log('Username not found in custom claims');
                        }
                    }
                    dispatch(
                        loginSuccess({
                            ...response,
                            isAuthenticated: true,
                            redirectUrl: redirectURL,
                        })
                    );

                    authChannel.postMessage({ type: 'login', tabId: TAB_ID });
                     if (
                    typeof Moengage?.track_event === 'function' &&
                    typeof Moengage?.identifyUser === 'function' &&
                    typeof Moengage?.add_user_attribute === 'function' && response.email
                ) {
                    const userId = response.email;
                    Moengage.identifyUser(userId);
                    Moengage.add_email(response.email);
                     Moengage.add_user_attribute('branding', response.branding);
                    Moengage.add_user_attribute('packageName', response?.packageName);
                    Moengage?.track_event('user_login', {
                        status: 'success',
                    });
                }
                } catch (firebaseError) {
                    console.error('Firebase authentication error:', firebaseError.message);
                }
            }
        }
    };
    return { handleLogin };
}
