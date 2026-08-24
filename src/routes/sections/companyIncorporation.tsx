import { lazy, Suspense } from 'react';


import { Spin } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';

import { paths } from '@routes/paths';
import ServiceNotAvailable from '@src/domains/failed/pages/ServiceNotAvailable';

const LandingPage = lazy(
    () =>
        import('@domains/dashboard/CompanyIncorporation/pages/LandingPage')
);
const ApplicationForm = lazy(
    () =>
        import('@domains/dashboard/CompanyIncorporation/pages/ApplicationForm')
);
const PaymentSummary = lazy(
    () =>
        import('@domains/dashboard/CompanyIncorporation/pages/PaymentSummary')
);
const TrackingPage = lazy(
    () =>
        import('@domains/dashboard/CompanyIncorporation/pages/TrackingPage')
);

// -----------------------------------------------------------------------

export const companyIncorporationRoutes = [
    {
        index: true,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={<Spin />}>
                    <LandingPage />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.companyIncorporation.form,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={<Spin />}>
                    <ApplicationForm />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.companyIncorporation.payment,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={<Spin />}>
                    <PaymentSummary />
                </Suspense>
            </ErrorBoundary>
        ),
    },
    {
        path: paths.companyIncorporation.tracking,
        element: (
            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                <Suspense fallback={<Spin />}>
                    <TrackingPage />
                </Suspense>
            </ErrorBoundary>
        ),
    },
];
