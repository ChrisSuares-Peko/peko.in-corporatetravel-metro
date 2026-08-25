import { lazy } from 'react';

import { paths } from '../paths';

const MetroHome = lazy(() => import('@src/domains/dashboard/Metro/pages/MetroHome'));
const MetroTicketSummary = lazy(() => import('@src/domains/dashboard/Metro/pages/MetroTicketSummary'));
const MetroTicketConfirmation = lazy(() => import('@src/domains/dashboard/Metro/pages/MetroTicketConfirmation'));
const AddSmartCard = lazy(() => import('@src/domains/dashboard/Metro/pages/AddSmartCard'));
const SmartCardRecharge = lazy(() => import('@src/domains/dashboard/Metro/pages/SmartCardRecharge'));
const SmartCardConfirmation = lazy(() => import('@src/domains/dashboard/Metro/pages/SmartCardConfirmation'));

export const metroRoutes = [
    { element: <MetroHome />, index: true },
    { element: <MetroTicketSummary />, path: paths.metro.results },
    { element: <MetroTicketConfirmation />, path: paths.metro.confirmation },
    { element: <AddSmartCard />, path: paths.metro.smartCard },
    {
        element: <SmartCardRecharge />,
        path: `${paths.metro.smartCard}/${paths.metro.smartCardRecharge}`,
    },
    {
        element: <SmartCardConfirmation />,
        path: `${paths.metro.smartCard}/${paths.metro.smartCardConfirmation}`,
    },
];
