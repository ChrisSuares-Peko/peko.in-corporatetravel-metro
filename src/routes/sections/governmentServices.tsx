import { lazy } from 'react';

const GovernmentServicesHome = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/GovernmentServicesHome')
);

const ExploreServices = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/ExploreServices')
);

const ServiceDetail = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/ServiceDetail')
);

const ApplicationForm = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/ApplicationForm')
);

const SuccessPage = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/SuccessPage')
);

const ApplicationTracking = lazy(
    () => import('@domains/dashboard/GovernmentServices/pages/ApplicationTracking')
);

export const governmentServicesRoutes = [
    { element: <GovernmentServicesHome />, index: true },
    { path: 'explore', element: <ExploreServices /> },
    { path: 'service/:serviceId', element: <ServiceDetail /> },
    { path: 'service/:serviceId/apply', element: <ApplicationForm /> },
    { path: 'service/:serviceId/success', element: <SuccessPage /> },
    { path: 'application/:applicationId', element: <ApplicationTracking /> },
];
