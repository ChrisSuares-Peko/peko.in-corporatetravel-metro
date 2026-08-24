import { lazy, Suspense } from 'react';

import { Flex, Spin } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';

import { paths } from '@routes/paths';
import ServiceNotAvailable from '@src/domains/failed/pages/ServiceNotAvailable';

const pageLoader = (
    <Flex justify="center" align="center" style={{ minHeight: '70vh' }}>
        <Spin size="large" />
    </Flex>
);

const LandingPage = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/LandingPage')
);
const ChooseStructure = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/ChooseStructure')
);
const RegistrationForm = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/RegistrationForm')
);
const PaymentSummary = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/PaymentSummary')
);
const TrackingPage = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/TrackingPage')
);
const MyApplications = lazy(
    () => import('@domains/dashboard/BusinessRegistration/pages/MyApplications')
);

// -----------------------------------------------------------------------

export const businessRegistrationRoutes = [
    {
        index: true,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <LandingPage />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.businessRegistration.form,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <ChooseStructure />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        // entityType is a path param (source of truth for which form); the bare
        // path is kept so any stale link falls through to the form's redirect
        // guard instead of 404-ing.
        path: paths.businessRegistration.register,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <RegistrationForm />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: `${paths.businessRegistration.register}/:entityType`,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <RegistrationForm />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.businessRegistration.payment,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <PaymentSummary />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.businessRegistration.tracking,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <TrackingPage />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.businessRegistration.applications,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={pageLoader}>
                    <MyApplications />
                </Suspense>
            </ErrorBoundary>
        ),
    },
];
