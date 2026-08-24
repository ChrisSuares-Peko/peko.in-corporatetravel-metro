import { Suspense, lazy } from 'react';

import { Navigate, Outlet } from 'react-router-dom';

// layouts
import DashboardLayout from '@layouts/DashboardLayout';
import { paths } from '@routes/paths';
import CreateTransactions from '@src/domains/admin/accounts/components/CreateTransactions';
import RefundTransactions from '@src/domains/admin/accounts/components/RefundTransactions';
import SelfTransfer from '@src/domains/admin/accounts/components/SelfTransfer';
import TransferFunds from '@src/domains/admin/accounts/components/TransferFunds';
import WalletReport from '@src/domains/admin/accounts/components/WalletReport';
import BillerManagement from '@src/domains/admin/billPayments/pages/BillerManagement';
import QuoteRequests from '@src/domains/admin/insuranceQuotes/pages/QuoteRequests';
import AirlineAirports from '@src/domains/admin/manage/component/airlineAirports/AirlineAirports';
import AttestationCategory from '@src/domains/admin/manage/component/attestationCategory/AttestationCategory';
import BusinessRegistrationManage from '@src/domains/admin/manage/component/businessRegistration/BusinessRegistration';
import CollectorKyb from '@src/domains/admin/manage/component/collectorKyb/CollectorKyb';
import CompanyIncorporation from '@src/domains/admin/manage/component/companyIncorporation/CompanyIncorporation';
import AdminCompliance from '@src/domains/admin/manage/component/compliance/AdminCompliance';
import ConnectPage from '@src/domains/admin/manage/component/connect/Table';
import CorporateCardApplications from '@src/domains/admin/manage/component/corporateCardApplications/CorporateCardApplications';
import CorporateDocumentsPage from '@src/domains/admin/manage/component/corporateCardApplications/CorporateDocumentsPage';
import CorporateCardTerminations from '@src/domains/admin/manage/component/corporateCardTerminations/CorporateCardTerminations';
import DenominationWallet from '@src/domains/admin/manage/component/DenominationWallet';
import DomainHostingCancellations from '@src/domains/admin/manage/component/domainHostingCancellations/DomainHostingCancellations';
import DomainHostingPlans from '@src/domains/admin/manage/component/domainHostingPlans/DomainHostingPlans';
import Edoc from '@src/domains/admin/manage/component/edoc/Edoc';
import EmailDomain from '@src/domains/admin/manage/component/emailDomain/EmailDomain';
import EmailDomainPlans from '@src/domains/admin/manage/component/emailDomainPlans/EmailDomainPlans';
import Plans from '@src/domains/admin/manage/component/eSIM/Table';
import GiftCardsPage from '@src/domains/admin/manage/component/giftCards/Table';
import GovtServices from '@src/domains/admin/manage/component/govtServices/GovtServices';
import Hike from '@src/domains/admin/manage/component/hike/Hike';
import InvoiceKyb from '@src/domains/admin/manage/component/invoiceKyb/InvoiceKyb';
import KybVerification from '@src/domains/admin/manage/component/kybVerification/KybVerification';
import LegalTemplatesPage from '@src/domains/admin/manage/component/legalTemplates/Table';
import LogisticsCorporate from '@src/domains/admin/manage/component/logistics/LogisticsCorporate';
import OfficeAddressPlans from '@src/domains/admin/manage/component/officeAddress/Plan';
import PaymentMethods from '@src/domains/admin/manage/component/paymentMethods/PaymentMethods';
import PayoutOnboardingPage from '@src/domains/admin/manage/component/payoutOnboarding/PayoutOnboarding';
import CompanyDocuments from '@src/domains/admin/manage/component/payroll/CompanyDocuments';
import Works from '@src/domains/admin/manage/component/pekoWorks/Works';
import SubscriptionPlansPage from '@src/domains/admin/manage/component/subscriptionPlans/Table';
import SubscriptionPage from '@src/domains/admin/manage/component/subscriptions/Table';
import CorporateTax from '@src/domains/admin/manage/component/taxRegistration/CorporateTax';
import VendorPayout from '@src/domains/admin/manage/component/vendorPayout/vendorPayout';
import WorkPlan from '@src/domains/admin/manage/component/workPlan/WorkPlan';
import WorkspacePage from '@src/domains/admin/manage/component/workspace/Table';
import IssueDetails from '@src/domains/admin/officeSupplies/components/IssueDetails';
import OndcOrderDetails from '@src/domains/admin/officeSupplies/components/OndcOrderDetails';
import OrdersHub from '@src/domains/admin/officeSupplies/components/OrdersHub';
import OndcProductDetails from '@src/domains/admin/officeSupplies/components/product/catalog/OndcProductDetails';
import ProductsCatalog from '@src/domains/admin/officeSupplies/components/product/catalog/ProductsCatalog';
import Airline from '@src/domains/admin/reports/components/Airline';
import AirlineBookings from '@src/domains/admin/reports/components/AirlineBookings/Index';
import AirlineModification from '@src/domains/admin/reports/components/AirlineModification/Index';
import Attestation from '@src/domains/admin/reports/components/Attestation/Attestation';
import BusinessEmails from '@src/domains/admin/reports/components/businessEmails/BusinessEmails';
import ConnectionRequests from '@src/domains/admin/reports/components/connectionRequest/ConnectionRequests';
import Corporate from '@src/domains/admin/reports/components/corporate/Corporate';
import DomainHostingRefunds from '@src/domains/admin/reports/components/domainHostingRefunds/DomainHostingRefunds';
import Esim from '@src/domains/admin/reports/components/esim/Orders';
import GovtServicesApplications from '@src/domains/admin/reports/components/govtServices/GovtServicesApplications';
import HotelBookings from '@src/domains/admin/reports/components/HotelBookings/Index';
import HotelCancellation from '@src/domains/admin/reports/components/HotelCancellation/Index';
import Invoices from '@src/domains/admin/reports/components/invoices/Invoices';
import ReportOrder from '@src/domains/admin/reports/components/orders/Orders';
import PaymentLinksReport from '@src/domains/admin/reports/components/paymentLinks/PaymentLinks';
import ReportScheduling from '@src/domains/admin/reports/components/SchedulingReport/ReportScheduling';
import SoftwareOrders from '@src/domains/admin/reports/components/softwareOrders/SoftwareOrders';
import SubscriptionsTable from '@src/domains/admin/reports/components/subscriptions/SubscriptionsTable';
import TransactionsReport from '@src/domains/admin/reports/components/Transaction/TransactionsReport';
import Vendors from '@src/domains/admin/reports/components/vendors/Vendors';
import Verification from '@src/domains/admin/reports/components/VerificationSuite/Verification';
import WhatsAppAddOn from '@src/domains/admin/reports/components/WhatsAppForBusiness/WhatsAppAddOn';
import WorksOrders from '@src/domains/admin/reports/components/Works/Orders';
import Workspace from '@src/domains/admin/reports/components/workspace/Workspace';
import Banners from '@src/domains/admin/settings/component/banners/Banners';
import Branding from '@src/domains/admin/settings/component/branding/Branding';
import BusinessRegistrationCatalog from '@src/domains/admin/settings/component/businessRegistrationCatalog/BusinessRegistrationCatalog';
import Cashback from '@src/domains/admin/settings/component/cashback/Cashback';
import Categories from '@src/domains/admin/settings/component/categories/Categories';
import CouponCode from '@src/domains/admin/settings/component/couponCode/CouponCode';
import DisabledService from '@src/domains/admin/settings/component/disableService/DisabledService';
import Templates from '@src/domains/admin/settings/component/emailTemplates/Templates';
import IpWhitelist from '@src/domains/admin/settings/component/ipWhitelist/IpWhitelist';
import PackagePage from '@src/domains/admin/settings/component/package/Package';
import PartnerRoles from '@src/domains/admin/settings/component/partnerPermission/Roles';
import PekoCredits from '@src/domains/admin/settings/component/peko-credits/PekoCredits';
import RefferalCode from '@src/domains/admin/settings/component/refferalCode/RefferalCode';
import ServiceRules from '@src/domains/admin/settings/component/service_rules/ServiceRules';
import ServiceOperatorPage from '@src/domains/admin/settings/component/serviceOperator/ServiceOperators';
import ServicePackage from '@src/domains/admin/settings/component/servicePackage/ServicePackage';
import SubscriptionCodes from '@src/domains/admin/settings/component/subscriptionCodes/SubscriptionCodes';
import VendorPage from '@src/domains/admin/settings/component/vendor/Vendors';
import WhatsAppNumbers from '@src/domains/admin/settings/component/whatsappNumber/WhatsAppNumbers';
import Tickets from '@src/domains/admin/support/components/Tickets';
import PasswordPolicy from '@src/domains/admin/systemConfigration/components/passwordPolicy/PasswordPolicy';
import PasswordProtection from '@src/domains/admin/systemConfigration/components/passwordProtection/PasswordProtection';
import CorporateUser from '@src/domains/admin/users/components/CorporateUser';
import PartnerUser from '@src/domains/admin/users/components/PartnerUser';
import PendingSignUps from '@src/domains/admin/users/components/PendingSignUps';
import Roles from '@src/domains/admin/users/components/Roles';
import SystemUser from '@src/domains/admin/users/components/SystemUser';
import AuthGuard from '@src/guard/AuthGuard';
import RoleGuard from '@src/guard/RoleGuard';
import SystemUserGuard from '@src/guard/SystemUserGuard';
import { useAppSelector } from '@src/hooks/store';

const ReminderForm = lazy(
    () => import('@src/domains/admin/settings/component/preReminder/preReminder')
);
const LinkCreated = lazy(() => import('@src/domains/admin/paymentLinks/pages/LinkCreated'));
const CreateLink = lazy(() => import('@src/domains/admin/paymentLinks/pages/CreateLinkPage'));
const PaymentLinks = lazy(() => import('@src/domains/admin/paymentLinks/pages/PaymentLinks'));
const Profile = lazy(() => import('@src/domains/systemUser/profile/pages/Profile'));
const Accounts = lazy(() => import('@src/domains/admin/accounts/pages/Accounts'));
const Settings = lazy(() => import('@src/domains/admin/settings/page/Settings'));
const Manage = lazy(() => import('@src/domains/admin/manage/pages/Manage'));
const PayrollConfig = lazy(() => import('@src/domains/admin/payroll/pages/PayrollConfig'));
const Reports = lazy(() => import('@src/domains/admin/reports/pages/Reports'));
const Users = lazy(() => import('@src/domains/admin/users/pages/Users'));
const CorporateLookup = lazy(
    () => import('@src/domains/admin/corporateLookup/pages/CorporateLookup')
);
const Orders = lazy(() => import('@src/domains/admin/officeSupplies/pages/Home'));
const Notifications = lazy(
    () => import('@src/domains/admin/notifications/pages/NotificationsList')
);
const SystemConfigration = lazy(
    () => import('@src/domains/admin/systemConfigration/pages/SystemConfigration')
);
const NeedHelpAdmin = lazy(() => import('@src/domains/admin/support/pages/NeedHelp'));
const ProductsBulkUpload = lazy(() => import('@src/domains/admin/manage/pages/ProductsBulkUpload'));
const CommonBulkUpload = lazy(() => import('@src/domains/admin/manage/pages/BulkUploadPage'));
const AirlineView = lazy(() => import('@src/domains/admin/reports/components/AirlineDetails'));
const roleToDashboardComponent = {
    admin: lazy(() => import('@src/domains/admin/dashboard/pages/Dashboard')),
    ecom_manager: lazy(() => import('@src/domains/systemUser/ecom_manager/home/pages/Dashboard')),
    partner: lazy(() => import('@src/domains/systemUser/partner/home/pages/Dashboard')),
};

const LazyDashboard = () => {
    const { roleName } = useAppSelector(state => state.reducer.auth);
    let DashboardComponent = (roleToDashboardComponent as Record<string, any>)[roleName];
    if (!DashboardComponent) {
        DashboardComponent = roleToDashboardComponent.admin;
    }
    return <DashboardComponent />;
};

export const systemUserRoutes = [
    {
        path: '',
        element: (
            <AuthGuard>
                <SystemUserGuard>
                    <DashboardLayout>
                        <RoleGuard>
                            <Suspense>
                                <Outlet />
                            </Suspense>
                        </RoleGuard>
                    </DashboardLayout>
                </SystemUserGuard>
            </AuthGuard>
        ),
        children: [
            {
                element: <Navigate to={paths.systemUser.dashboard} replace />,
                index: true,
            },
            { element: <Profile />, path: paths.systemUser.profile },
            {
                element: <LazyDashboard />,
                path: paths.systemUser.dashboard,
            },
            {
                path: paths.systemUser.users,
                children: [
                    { element: <Users />, index: true },
                    { element: <CorporateUser />, path: paths.users.corporateUser },
                    { element: <CorporateLookup />, path: paths.users.corporateLookup },
                    { element: <SystemUser />, path: paths.users.systemUser },
                    { element: <Roles />, path: paths.users.roles },
                    // settings -> users
                    { element: <PartnerRoles />, path: paths.users.PartnerRoles },
                    { element: <PartnerUser />, path: paths.users.Partners },
                ],
            },
            { element: <PayrollConfig />, path: paths.systemUser.payrollConfig },
            { element: <Orders />, path: paths.systemUser.officeSupplies },
            {
                path: paths.systemUser.accounts,
                children: [
                    { element: <Accounts />, index: true },
                    { element: <SelfTransfer />, path: paths.accounts.selfTransfer },
                    { element: <TransferFunds />, path: paths.accounts.transferFunds },
                    { element: <CreateTransactions />, path: paths.accounts.createTransactions },
                    { element: <RefundTransactions />, path: paths.accounts.refundTransactions },
                ],
            },
            {
                path: paths.systemUser.reports,
                children: [
                    { element: <Reports />, index: true },
                    {
                        element: <SubscriptionsTable />,
                        path: paths.reportsAdmin.SubscriptionsTable,
                    },
                    { element: <Vendors />, path: paths.reportsAdmin.Vendors },
                    { element: <Corporate />, path: paths.reportsAdmin.Corporate },
                    { element: <ReportOrder />, path: paths.reportsAdmin.Orders },
                    { element: <SoftwareOrders />, path: paths.reportsAdmin.SoftwareOrders },
                    { element: <Esim />, path: paths.reportsAdmin.Esim },
                    { element: <WhatsAppAddOn />, path: paths.reports.addOns },
                    { element: <WorksOrders />, path: paths.reportsAdmin.OrderContent },
                    {
                        element: <ConnectionRequests />,
                        path: paths.reportsAdmin.ConnectionRequests,
                    },
                    { element: <Workspace />, path: paths.reportsAdmin.Workspace },
                    { element: <Invoices />, path: paths.reportsAdmin.Invoices },
                    { element: <Attestation />, path: paths.reportsAdmin.Attestation },
                    { element: <Airline />, path: paths.reportsAdmin.Airline },
                    { element: <Verification />, path: paths.reportsAdmin.VerificationReports },
                    {
                        path: paths.reportsAdmin.AirlineModification.index,
                        children: [
                            { element: <AirlineModification />, index: true },
                            {
                                element: <AirlineView />,
                                path: paths.reportsAdmin.AirlineModification.modificationRequest,
                            },
                        ],
                    },
                    { element: <AirlineBookings />, path: paths.reportsAdmin.AirlineBookings },
                    { element: <HotelCancellation />, path: paths.reportsAdmin.HotelCancellation },
                    { element: <HotelBookings />, path: paths.reportsAdmin.HotelBookings },
                    { element: <ReportScheduling />, path: paths.reportsAdmin.ReportScheduling },
                    { element: <PaymentLinksReport />, path: paths.reportsAdmin.PaymentLinks },
                    { element: <BusinessEmails />, path: paths.reportsAdmin.BusinessEmails },
                    {
                        element: <DomainHostingRefunds />,
                        path: paths.reportsAdmin.DomainHostingRefunds,
                    },
                    {
                        element: <TransactionsReport />,
                        path: paths.reportsAdmin.TransactionsReport,
                    },
                    {
                        element: <GovtServicesApplications />,
                        path: paths.reportsAdmin.GovtServicesApplications,
                    },
                    {
                        element: <QuoteRequests />,
                        path: paths.reportsAdmin.InsuranceQuoteRequests,
                    },
                    // accounts -> reports
                    { element: <WalletReport />, path: paths.reportsAdmin.walletReport },
                    // users -> reports
                    { element: <PendingSignUps />, path: paths.reportsAdmin.pendingSignups },
                ],
            },
            {
                path: paths.systemUser.manage,
                children: [
                    { element: <Manage />, index: true },
                    { element: <CommonBulkUpload />, path: paths.manage.bulk },
                    { element: <SubscriptionPage />, path: paths.manage.softwareProducts },
                    { element: <SubscriptionPlansPage />, path: paths.manage.softwarePlans },
                    { element: <OfficeAddressPlans />, path: paths.manage.officeAddress },
                    { element: <WorkspacePage />, path: paths.manage.workspaces },
                    { element: <CorporateTax />, path: paths.manage.corporateTaxRegistration },
                    { element: <LogisticsCorporate />, path: paths.manage.logisticsCorporate },
                    { element: <KybVerification />, path: paths.manage.kybVerifications },

                    { element: <Works />, path: paths.manage.pekoWorks },
                    { element: <CompanyDocuments />, path: paths.manage.companyDocuments },
                    { element: <WorkPlan />, path: paths.manage.workPlans },
                    { element: <GiftCardsPage />, path: paths.manage.giftCards },
                    { element: <LegalTemplatesPage />, path: paths.manage.legalTemplates },
                    { element: <Plans />, path: paths.manage.esimPlans },
                    { element: <InvoiceKyb />, path: paths.manage.invoiceKyb },
                    { element: <Edoc />, path: paths.manage.eDocs },
                    { element: <GovtServices />, path: paths.manage.govtServices },
                    { element: <AttestationCategory />, path: paths.manage.attestationCategory },
                    { element: <VendorPayout />, path: paths.manage.vendorPayouts },
                    { element: <Hike />, path: paths.manage.hike },
                    { element: <DenominationWallet />, path: paths.manage.walletDenomination },

                    { element: <EmailDomain />, path: paths.manage.bussinessEmails },
                    { element: <EmailDomainPlans />, path: paths.manage.bussinessEmailsplans },
                    { element: <DomainHostingPlans />, path: paths.manage.domainHostingPlans },
                    {
                        element: <DomainHostingCancellations />,
                        path: paths.manage.domainHostingCancellations,
                    },
                    { element: <CollectorKyb />, path: paths.manage.collectorKyb },
                    // office supplies — one hub page, 4 in-page tabs (see OrdersHub)
                    { element: <OrdersHub initialTab="orders" />, path: paths.manage.orders },
                    { element: <OndcOrderDetails />, path: paths.manage.orderDetails },
                    { element: <IssueDetails />, path: paths.manage.issueDetails },
                    {
                        element: <OrdersHub initialTab="cancellations" />,
                        path: paths.manage.cancelAndRefunds,
                    },
                    { element: <OrdersHub initialTab="returns" />, path: paths.manage.returnRequest },
                    { element: <OrdersHub initialTab="issues" />, path: paths.manage.issues },
                    { element: <ProductsCatalog />, path: paths.manage.products },
                    { element: <OndcProductDetails />, path: paths.manage.productDetails },
                    { element: <ProductsBulkUpload />, path: paths.manage.bulkUpload },
                    // announcements
                    { element: <Notifications />, path: paths.manage.notifications },
                    // payment links
                    {
                        element: <PaymentLinks />,
                        path: paths.manage.paymentLinks,
                    },
                    {
                        element: <CreateLink />,
                        path: `${paths.manage.paymentLinks}/create-payment-link`,
                    },
                    {
                        element: <LinkCreated />,
                        path: `${paths.manage.paymentLinks}/create-payment-link/created`,
                    },
                    { element: <ConnectPage />, path: paths.manage.connect },
                    { element: <PaymentMethods />, path: paths.manage.paymentMethods },
                    { element: <BillerManagement />, path: paths.manage.billPayments },
                    { element: <AirlineAirports />, path: paths.manage.airlineAirports },
                    { element: <AdminCompliance />, path: paths.manage.compliance },
                    { element: <CompanyIncorporation />, path: paths.manage.companyIncorporation },
                    {
                        element: <BusinessRegistrationManage />,
                        path: paths.manage.businessRegistrationAdmin,
                    },
                    { element: <AdminCompliance />, path: paths.manage.compliance },
                    { element: <PayoutOnboardingPage />, path: paths.manage.payoutOnboarding },
                    { element: <CorporateCardApplications />, path: paths.manage.corporateCardApplications },
                    {
                        element: <CorporateDocumentsPage />,
                        path: paths.manage.corporateCardApplicationDocuments,
                    },
                    { element: <CorporateCardTerminations />, path: paths.manage.corporateCardTerminations },
                ],
            },
            {
                path: paths.systemUser.settings,
                children: [
                    { element: <Settings />, index: true },
                    { element: <VendorPage />, path: paths.settingsAdmin.vendor },
                    {
                        element: <ServiceOperatorPage />,
                        path: paths.settingsAdmin.serviceOperators,
                    },
                    { element: <PackagePage />, path: paths.settingsAdmin.PackagePage },
                    { element: <Cashback />, path: paths.settingsAdmin.Cashback },
                    { element: <SubscriptionCodes />, path: paths.settingsAdmin.SubscriptionCodes },
                    { element: <DisabledService />, path: paths.settingsAdmin.DisabledService },
                    { element: <Banners />, path: paths.settingsAdmin.Banners },
                    { element: <Categories />, path: paths.settingsAdmin.Categories },
                    { element: <RefferalCode />, path: paths.settingsAdmin.RefferalCode },
                    { element: <Templates />, path: paths.settingsAdmin.Templates },
                    { element: <CouponCode />, path: paths.settingsAdmin.CouponCode },
                    { element: <WhatsAppNumbers />, path: paths.settingsAdmin.WhatsAppNumbers },
                    { element: <Branding />, path: paths.settingsAdmin.Branding },
                    { element: <IpWhitelist />, path: paths.settingsAdmin.IPWhitelist },
                    { element: <ReminderForm />, path: paths.settingsAdmin.subscriptionReminders },
                    { element: <ServicePackage />, path: paths.settingsAdmin.servicePackages },
                    { element: <PekoCredits />, path: paths.settingsAdmin.pekoCredits },
                    { element: <ServiceRules />, path: paths.settingsAdmin.serviceRule },
                    {
                        element: <BusinessRegistrationCatalog />,
                        path: paths.settingsAdmin.businessRegistrationCatalog,
                    },
                ],
            },
            {
                path: paths.systemUser.needHelp,
                children: [
                    { element: <NeedHelpAdmin />, index: true },
                    { element: <Tickets />, path: paths.needHelpAdmin.tickets },
                ],
            },
            { element: <Notifications />, path: paths.systemUser.announcement },
            {
                path: paths.systemUser.systemConfiguration,
                children: [
                    { element: <SystemConfigration />, index: true },
                    { element: <PasswordPolicy />, path: paths.systemConfiguration.passwordPolicy },
                    {
                        element: <PasswordProtection />,
                        path: paths.systemConfiguration.passwordProtection,
                    },
                ],
            },
        ],
    },
];
