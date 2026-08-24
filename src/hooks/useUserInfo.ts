import { useCallback, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import {
    PurchasedListResponse,
    ServicesListResponse,
    UserInfoResponse,
    UserRole,
} from '@customtypes/general';
import { loginSuccess } from '@src/domains/auth/slices/loginSlice';
import { getUserInfo, getUserServices } from '@src/services/userInfo';
import { setServices } from '@src/slices/servicesSlice';
import { setSubscriptions } from '@src/slices/subscriptionSlice';
import { setUserInfo } from '@src/slices/userSlice';

import { useAppDispatch, useAppSelector } from './store';

export default function useUserInfo() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { user } = useAppSelector(state => state.reducer.user);
    const { services } = useAppSelector(state => state.reducer.services);
    const [isLoading, setIsLoading] = useState(true);
    const [hasNavigated, setHasNavigated] = useState(false);

    const getUserData = useCallback(async () => {
        const data: UserInfoResponse | false = await getUserInfo({
            userId: id,
            userType: role,
        });
        if (data) {
            dispatch(setUserInfo({ user: { ...data } }));
        }
    }, [id, role, dispatch]);

    const getUserServicesData = useCallback(async () => {
        const pathnames = pathname.split('/').filter(item => item);
        const data: (ServicesListResponse & PurchasedListResponse) | false =
            await getUserServices();
        if (data) {
            dispatch(setServices({ services: { data: data.data } }));
            dispatch(
                setSubscriptions({
                    services: { userAccessibleServices: data.userAccessibleServices },
                })
            );
            dispatch(loginSuccess({ packageName: data.packageName }));

            const isSystemUser = role === UserRole.SYSTEM || pathnames[0] === 'system-user';

            if (!hasNavigated && isSystemUser && pathnames[1] === 'dashboard') {
                const dashboardAccess = data.data.find(
                    category => (category.serviceCategory || category.label)?.toLowerCase() === 'dashboard'
                );

                if (!dashboardAccess?.hasAccess) {
                    const firstAccessibleService = data.data.find(
                        category => category.hasAccess === true && (category.serviceCategory || category.label)?.toLowerCase() !== 'dashboard'
                    );

                    if (firstAccessibleService) {
                        const accessibleService = (firstAccessibleService.serviceCategory || firstAccessibleService.label)
                            ?.toLowerCase()
                            .replace(/\s+/g, '-');

                        if (accessibleService) {
                            navigate(`/system-user/${accessibleService}`);
                            setHasNavigated(true);
                        }
                    }
                }
            }

            setIsLoading(false);
            return data;
        }
        setIsLoading(false);
        return null;
    }, [dispatch, navigate, hasNavigated, pathname, role]);

    useEffect(() => {
        const hasNavigatedLocal = localStorage.getItem('hasNavigated') === 'true';
        setHasNavigated(hasNavigatedLocal);
    }, []);

    useEffect(() => {
        if (hasNavigated) {
            localStorage.setItem('hasNavigated', 'true');
        }
    }, [hasNavigated]);

    useEffect(() => {
        if (user === null) {
            getUserData();
        }
    }, [getUserData, user]);

    useEffect(() => {
        if (services === null) {
            getUserServicesData();
        } else {
            setIsLoading(false);
        }
    }, [getUserServicesData, services]);

    return { isLoading, getUserServicesData, getUserData };
}
