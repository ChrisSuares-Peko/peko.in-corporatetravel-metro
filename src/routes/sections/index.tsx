import { Navigate, useRoutes } from 'react-router-dom';

import ENachMandatePublicSuccess from '@src/domains/dashboard/paymentLinks/pages/ENachMandatePublicSuccess';
import PaymentLinkPublicSuccess from '@src/domains/dashboard/paymentLinks/pages/PaymentLinkPublicSuccess';
import OnlineProposalPage from '@src/domains/dashboard/Procure/components/Proposals/OnlineProposalPage';
import OnlinePOAcknowledgePage from '@src/domains/dashboard/Procure/components/PurchaseOrderDetails/OnlinePOAcknowledgePage';
import { AUTH_DISABLED } from '@src/config/authBypass';
import PageNotFound from '@src/domains/pages/PageNotFound';
import { useRootPath } from '@src/hooks/useRootPath';
import { paths } from '@src/routes/paths';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { employeeRoutes } from './employee';
// import { planRoutes } from './plans';
import { systemUserRoutes } from './systemUser';

export default function Router() {
    const rootPath = useRootPath();
    return useRoutes([
        {
            path: '/',
            // LOGIN DISABLED: land directly on the CorporateTravel dashboard instead of
            // the role-based `rootPath` (which requires an authenticated session and
            // otherwise falls back to `/auth/login`). Flip `AUTH_DISABLED` in
            // `@src/config/authBypass` to `false` to restore role-based routing below.
            // element: <Navigate to={rootPath} replace />,
            element: (
                <Navigate to={AUTH_DISABLED ? paths.dashboard.corporateTravel : rootPath} replace />
            ),
        },

        // Public routes — must be before dashboardRoutes so they are not caught by the AuthGuard layout
        { path: paths.paymentLinkPublicSuccess, element: <PaymentLinkPublicSuccess /> },
        { path: paths.eNachMandatePublicSuccess, element: <ENachMandatePublicSuccess /> },
        { path: paths.rfqPublicSubmit, element: <OnlineProposalPage /> },
        { path: paths.poPublicAcknowledge, element: <OnlinePOAcknowledgePage /> },

        // Auth routes
        ...authRoutes,

        // Dashboard routes
        ...dashboardRoutes,

        // Subscription routes
        // ...planRoutes,

        // System User routes
        ...systemUserRoutes,

        // Employee (ESS) routes
        ...employeeRoutes,

        // No match 404
        { path: '/404', element: <PageNotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}
