import { CategorySpend, TabItem, TransactionApproval, TransactionItem } from './types';
import adsIcon from '../assets/icons/ads.svg';
import indigoIcon from '../assets/icons/indigo.svg';
import olaIcon from '../assets/icons/ola.svg';
import razorpayIcon from '../assets/icons/razorpay.svg';

/**
 * Demo data for the Corporate Cards dashboards that has no backend yet. The KPI tiles, spend charts, card
 * utilisation, wallet figures, card lists and statement are all API-backed now; what remains here is the tab
 * config, the Recent Transactions panel (kept as demo by product decision), the not-yet-wired Approval
 * Requests tables, and the daily-spend chart colour.
 */

/** Bar/series colours — hex mirrors Tailwind tokens (red → textLightRed, green → savingsTagLightText). */
const BAR = { red: '#FF4F4F', green: '#43B75D', chart: '#F4B6B6' } as const;

/* ------------------------------------------------------------------ *
 * In-page tab bars
 * ------------------------------------------------------------------ */
export const CORPORATE_TABS: TabItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'cards', label: 'Cards' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'my-requests', label: 'My Requests' },
    // Phase 2: More tab (Reimbursements, Vendor Invoices)
    // {
    //     key: 'more',
    //     label: 'More',
    //     children: [
    //         { key: 'reimbursements', label: 'Reimbursements' },
    //         { key: 'vendor-invoices', label: 'Vendor Invoices' },
    //     ],
    // },
];

export const ADMIN_TABS: TabItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'wallet', label: 'Pre Funding Wallet' },
    { key: 'cards', label: 'Cards' },
    { key: 'people', label: 'People' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'account-statement', label: 'Account Statement' },
    { key: 'approval-requests', label: 'Approval Requests' },
    { key: 'settings', label: 'Settings' },
];

/* ------------------------------------------------------------------ *
 * Recent Transactions panel (kept as demo on both dashboards by product decision)
 * ------------------------------------------------------------------ */
export const RECENT_TRANSACTIONS: TransactionItem[] = [
    {
        key: 'indigo',
        merchant: 'IndiGo Airlines',
        avatarText: 'IG',
        avatarColor: '#1B2A6B',
        icon: indigoIcon,
        status: 'Active',
        person: 'Aarav Sharma',
        date: '22 Oct 2024',
        amount: '₹ 82,550',
    },
    {
        key: 'razorpay',
        merchant: 'Razorpay',
        avatarText: 'Rz',
        avatarColor: '#3395FF',
        icon: razorpayIcon,
        status: 'Active',
        person: 'Priya Patel',
        date: '21 Oct 2024',
        amount: '₹ 24,300',
    },
    {
        key: 'google-ads',
        merchant: 'Google Ads',
        avatarText: 'G',
        avatarColor: '#4285F4',
        icon: adsIcon,
        status: 'Pending',
        person: 'Vikram Singh',
        date: '20 Oct 2024',
        amount: '₹ 12,100',
    },
    {
        key: 'ola',
        merchant: 'Ola Cabs',
        avatarText: 'OLA',
        avatarColor: '#1F2937',
        icon: olaIcon,
        status: 'Blocked',
        person: 'Neha Verma',
        date: '19 Oct 2024',
        amount: '₹ 1,450',
    },
    {
        key: 'swiggy',
        merchant: 'Swiggy',
        avatarText: 'Sw',
        avatarColor: '#FC8019',
        icon: indigoIcon,
        status: 'Active',
        person: 'Aarav Sharma',
        date: '18 Oct 2024',
        amount: '₹ 860',
    },
];

export const ADMIN_RECENT_TRANSACTIONS: TransactionItem[] = RECENT_TRANSACTIONS.slice(0, 4);

/** Daily-spend chart bar colour, consumed by DailySpendChart. */
export const DAILY_SPEND_CHART_COLOR = BAR.chart;


export const formatAmountAsK = (value: number): string => {
  if (value === 0) return '₹0';
  if (value < 1000) return `₹${Math.round(value).toLocaleString('en-IN')}`;
  const kValue = Math.round(value / 1000);
  return `₹${kValue}K`;
};

/**
 * Demo "Spend by Category" for the cardholder dashboard — used as a fallback while there is no transaction
 * data yet. The panel switches to the live /dashboard/summary breakdown automatically once data exists.
 */
export const SPEND_BY_CATEGORY: CategorySpend[] = [
    { key: 'travel', label: 'Travel', amount: '₹10,835.20', percent: 56, color: BAR.red },
    { key: 'software', label: 'Software', amount: '₹4,140.00', percent: 22, color: BAR.green },
    { key: 'marketing', label: 'Marketing', amount: '₹3,160.00', percent: 16, color: BAR.green },
    { key: 'office', label: 'Office', amount: '₹1,046.30', percent: 5, color: BAR.green },
    { key: 'meals', label: 'Meals', amount: '₹64.80', percent: 0, color: BAR.green },
];

/* ------------------------------------------------------------------ *
 * Approval Requests — Transactions + Physical-cards tabs (no backend yet)
 * ------------------------------------------------------------------ */
export const APPROVAL_TRANSACTIONS: TransactionApproval[] = [
    {
        key: 'ta-1',
        last4: '1294',
        date: '2024-01-12',
        member: 'Tony Stark',
        merchant: 'Stark Industries',
        policyReason: 'Exceeds ₹2,000 single-txn policy',
        amount: '₹2,400.00',
        status: 'Approved',
    },
    {
        key: 'ta-2',
        last4: '1294',
        date: '2024-02-03',
        member: 'Bruce Wayne',
        merchant: 'Wayne Enterprises',
        policyReason: 'Cardholder requires manager review',
        amount: '₹790.50',
        status: 'Rejected',
    },
    {
        key: 'ta-3',
        last4: '1294',
        date: '2024-03-15',
        member: 'Reed Richards',
        merchant: 'Oscorp Technologies',
        policyReason: 'Travel category > ₹1,000',
        amount: '₹7,240.50',
        status: 'Approved',
    },
    {
        key: 'ta-4',
        last4: '1294',
        date: '2024-04-27',
        member: 'Lex Luthor',
        merchant: 'LexCorp',
        policyReason: 'Lodging requires tag review',
        amount: '₹5,240.50',
        status: 'Pending',
    },
    {
        key: 'ta-5',
        last4: '1294',
        date: '2024-05-09',
        member: 'Tony Stark',
        merchant: 'Pied Piper Innovations',
        policyReason: 'Exceeds ₹2,000 single-txn policy',
        amount: '₹3,150.75',
        status: 'Pending',
    },
];
