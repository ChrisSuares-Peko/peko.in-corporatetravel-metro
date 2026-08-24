import { lazy } from 'react';

import { paths } from '../paths';

const Payments = lazy(() => import('@src/domains/dashboard/payments/pages/Payment'));
const PaymentFailure = lazy(() => import('@src/domains/dashboard/payments/pages/PaymentFailure'));
const PaymentSuccess = lazy(() => import('@src/domains/dashboard/payments/pages/PaymentSuccess'));
const PaymentPending = lazy(() => import('@src/domains/dashboard/payments/pages/PaymentPending'));
const SubscriptionPendingPage = lazy(
    () => import('@src/domains/dashboard/payments/pages/SubscriptionPendingPage')
);
const CcavenueProcessing = lazy(
    () => import('@src/domains/dashboard/payments/pages/CcavenueProcessing')
);

export const paymentRoutes = [
    { element: <Payments />, index: true },
    { element: <PaymentSuccess />, path: paths.payments.paymentsuccess },
    { element: <PaymentFailure />, path: paths.payments.paymentFailure },
    { element: <PaymentPending />, path: paths.payments.paymentPending },
    { element: <SubscriptionPendingPage />, path: paths.payments.subscriptionPending },
    { element: <CcavenueProcessing />, path: paths.payments.ccavenueProcessing },
];
