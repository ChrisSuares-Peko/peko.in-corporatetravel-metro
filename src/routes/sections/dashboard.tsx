import { Suspense, lazy } from 'react';

import { Skeleton } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet } from 'react-router-dom';

// layouts
import DashboardLayout from '@layouts/DashboardLayout';
import ServiceNotFound from '@src/domains/dashboard/503/pages/ServiceNotFound';
import ServiceNotAvailable from '@src/domains/failed/pages/ServiceNotAvailable';
import SessionExpired from '@src/domains/failed/pages/SessionExpired';
import AuthGuard from '@src/guard/AuthGuard';
import CorporateAccessGuard from '@src/guard/CorporateAccessGuard';
import CorporateUserGuard from '@src/guard/CorporateUserGuard';

import { accountingRoutes } from './accounting';
import { billPaymentRoutes } from './billPayments';
import { businessRegistrationRoutes } from './businessRegistration';
import { bussinessDocsRoutes } from './bussinessDocs';
import { carbonFootprintRoutes } from './carbonFootprint';
import { companyIncorporationRoutes } from './companyIncorporation';
import { complianceRoutes } from './compliance';
import { connectRoutes } from './connect';
import { corporateTravelRoutes } from './corporateTravel';
import { domainHostingRoutes } from './domainHosting';
import { emailDomainRoutes } from './emailDomain';
import { eSignRoutes } from './eSign';
import { giftCardsRoutes } from './giftCards';
import { GlobalBusinessSetupRoutes } from './globalBusinessSetup';
import { governmentServicesRoutes } from './governmentServices';
import { HikeRoutes } from './Hike';
import { homeRoutes } from './home';
import { insuranceRoutes } from './insurance';
import { invoiceRoutes } from './invoice';
import { legalServiceRoutes } from './legalService';
import { logisticsRoutes } from './logistics';
import { needHelpRoutes } from './needHelp';
import { officeAddressRoutes } from './officeAddress';
import { officeSuppliesRoutes } from './officeSupplies';
import { paymentLinkRoutes } from './paymentLinks';
import { paymentRoutes } from './paymentRoutes';
import { payoutRoutes } from './payouts';
import { payrollRoutes } from './payroll';
import { paytmBposRoutes } from './paytmBpos';
import { pekoCloudRoutes } from './pekoCloud';
import { pekoConnectRoutes } from './pekoConnect';
import { pekoCreditRoutes } from './pekoCredit';
// import { PekoWalletRoutes } from './pekoWallet'; // WALLET TEMPORARILY HIDDEN
import { planRoutes } from './plans';
import { procureRoutes } from './procure';
import { profileRoutes } from './profile';
import { reportsRoutes } from './reports';
import { salesRoutes } from './sales';
import { settingsRoutes } from './settings';
import { soundBoxRoutes } from './soundbox';
import { subscriptionRoutes } from './subscriptions';
import { taxMoreRoutes } from './taxMore';
import { telecomPaymentsRoutes } from './telecomPayments';
import { TurboRoutes } from './turbo';
import { verificationSuiteRoutes } from './verificationSuite';
import { WhatsappForBusinessRoutes } from './whatsappForBusiness';
import { workRoutes } from './works';
import { paths } from '../paths';
// ----------------------------------------------------------------------
const HomePage = lazy(() => import('@domains/dashboard/Home/pages/Home'));
const CorporateCardsPage = lazy(
    () => import('@domains/dashboard/corporateCards/pages/CorporateCardsPage')
);
const MoreServices = lazy(() => import('@domains/dashboard/MoreServices/pages/MoreServices'));
const Reports = lazy(() => import('@domains/dashboard/Reports/pages/Reports'));
const NotificationsPage = lazy(
    () => import('@src/domains/dashboard/notifications/pages/NotificationsList')
);
// ----------------------------------------------------------------------

export const dashboardRoutes = [
    {
        path: '',
        element: (
            <AuthGuard>
                <CorporateUserGuard>
                    <DashboardLayout>
                        <CorporateAccessGuard>
                            <ErrorBoundary fallback={<ServiceNotAvailable />}>
                                <Suspense fallback={<Skeleton />}>
                                    <Outlet />
                                </Suspense>
                            </ErrorBoundary>
                        </CorporateAccessGuard>
                    </DashboardLayout>
                </CorporateUserGuard>
            </AuthGuard>
        ),
        children: [
            { path: paths.dashboard.home, children: homeRoutes },
            { element: <HomePage />, path: paths.dashboard.logistics },
            { element: <HomePage />, path: paths.dashboard.tax },
            { path: paths.dashboard.accounting, children: accountingRoutes },
            { path: paths.dashboard.taxMore, children: taxMoreRoutes },
            { element: <Reports />, path: paths.dashboard.reports },
            { element: <MoreServices />, path: paths.dashboard.moreServices },
            { element: <HomePage />, path: paths.dashboard.vendorPayouts },
            { element: <CorporateCardsPage />, path: paths.dashboard.corporateCard },
            { element: <NotificationsPage />, path: paths.dashboard.notifications },
            { element: <ServiceNotFound />, path: '503' },
            { element: <ServiceNotAvailable />, path: paths.dashboard.serviceNotAvailable },
            { element: <SessionExpired />, path: paths.auth.sessionExpired },
            {
                path: paths.dashboard.profile,
                children: profileRoutes,
            },
            {
                path: paths.dashboard.subscriptions,
                children: subscriptionRoutes,
            },
            {
                path: paths.dashboard.sales,
                children: salesRoutes,
            },
            {
                path: paths.dashboard.officeSupplies,
                children: officeSuppliesRoutes,
            },
            { path: paths.dashboard.plans, children: planRoutes },
            {
                path: paths.dashboard.mobileRecharge,
                children: telecomPaymentsRoutes,
            },
            {
                path: paths.dashboard.billPayments,
                children: billPaymentRoutes,
            },
            {
                path: paths.dashboard.corporateTravel,
                children: corporateTravelRoutes,
            },
            {
                path: paths.dashboard.connect,
                children: connectRoutes,
            },
            {
                path: paths.dashboard.turbo,
                children: TurboRoutes,
            },
            {
                path: paths.dashboard.works,
                children: workRoutes,
            },
            {
                path: paths.dashboard.giftCards,
                children: giftCardsRoutes,
            },
            {
                path: paths.dashboard.businessDocs,
                children: bussinessDocsRoutes,
            },
            {
                path: paths.dashboard.officeAddress,
                children: officeAddressRoutes,
            },
            {
                path: paths.dashboard.zeroCarbon,
                children: carbonFootprintRoutes,
            },
            {
                path: paths.dashboard.needHelp,
                children: needHelpRoutes,
            },
            {
                path: paths.dashboard.hike,
                children: HikeRoutes,
            },
            {
                path: paths.dashboard.reports,
                children: reportsRoutes,
            },
            {
                path: paths.dashboard.insurance,
                children: insuranceRoutes,
            },
            {
                path: paths.dashboard.whatsappForBusiness,
                children: WhatsappForBusinessRoutes,
            },
            {
                path: paths.paymentLinks.index,
                children: paymentLinkRoutes,
            },
            {
                path: paths.dashboard.soundBox,
                children: soundBoxRoutes,
            },
            {
                path: paths.dashboard.invoicing,
                children: invoiceRoutes,
            },
            {
                path: paths.dashboard.payments,
                children: paymentRoutes,
            },
            {
                path: paths.dashboard.payout,
                children: payoutRoutes,
            },
            {
                path: paths.dashboard.logistics,
                children: logisticsRoutes,
            },
            {
                path: paths.dashboard.payroll,
                children: payrollRoutes,
            },
            {
                path: paths.dashboard.paytmBpos,
                children: paytmBposRoutes,
            },
            {
                path: paths.dashboard.eSign,
                children: eSignRoutes,
            },
            {
                path: paths.dashboard.pekoCloud,
                children: pekoCloudRoutes,
            },
            {
                path: paths.dashboard.pekoCredit,
                children: pekoCreditRoutes,
            },
            {
                path: paths.dashboard.settings,
                children: settingsRoutes,
            },
            {
                path: paths.dashboard.emailDomain,
                children: emailDomainRoutes,
            },
            {
                path: paths.dashboard.pekoConnect,
                children: pekoConnectRoutes,
            },
            // WALLET TEMPORARILY HIDDEN
            // {
            //     path: paths.dashboard.pekoWallet,
            //     children: PekoWalletRoutes,
            // },
            {
                path: paths.dashboard.verificationSuite,
                children: verificationSuiteRoutes,
            },
            {
                path: paths.dashboard.domainHosting,
                children: domainHostingRoutes,
            },
            {
                path: paths.dashboard.companyIncorporation,
                children: companyIncorporationRoutes,
            },
            {
                path: paths.dashboard.globalBusinessSetup,
                children: GlobalBusinessSetupRoutes,
            },
            {
                path: paths.dashboard.businessRegistration,
                children: businessRegistrationRoutes,
            },
            {
                path: paths.dashboard.procure,
                children: procureRoutes,
            },
            {
                path: paths.dashboard.governmentServices,
                children: governmentServicesRoutes,
            },
            {
                path: paths.dashboard.compliance,
                children: complianceRoutes,
            },
            {
                path: paths.dashboard.legalService,
                children: legalServiceRoutes,
            },
            {
                path: paths.dashboard.compliance,
                children: complianceRoutes,
            },
        ],
    },
];
