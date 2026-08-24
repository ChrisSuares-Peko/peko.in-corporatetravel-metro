import { lazy } from 'react';

import { Outlet } from 'react-router-dom';

import GuestGuard from '@src/guard/GuestGuard';

import { paths } from '../paths';

const ForgotPassword = lazy(() => import('@domains/auth/components/views/ForgotPasswordView'));

const LoginPage = lazy(() => import('@domains/auth/pages/Login'));
const SignupPage = lazy(() => import('@domains/auth/pages/Register'));

const ResetPasswordPage = lazy(() => import('@domains/auth/components/views/ResetPasswordView'));
const EmailVerification = lazy(() => import('@domains/auth/pages/EmailIdStatus'));
const PasswordUpdateSuccessPage = lazy(
    () => import('@domains/auth/components/views/PasswordUpdateSuccess')
);

const auth = {
    path: '',
    element: (
        <GuestGuard>
            <Outlet />
        </GuestGuard>
    ),
    children: [
        {
            path: 'login',
            element: <LoginPage />,
        },
        {
            path: 'register',
            element: <SignupPage />,
        },
        {
            path: 'forgotpassword',
            element: <ForgotPassword />,
        },
    ],
};

export const authRoutes = [
    {
        path: 'auth',
        children: [auth],
    },
    {
        path: paths.auth.resetPassword,
        element: <ResetPasswordPage />,
    },
     {
        path: paths.auth.setPassword,
        element: <ResetPasswordPage />,
    },
    {
        path: paths.auth.passwordSuccess,
        element: <PasswordUpdateSuccessPage />,
    },
    {
        path: paths.auth.verifyEmail,
        element: <EmailVerification />,
    },
];
