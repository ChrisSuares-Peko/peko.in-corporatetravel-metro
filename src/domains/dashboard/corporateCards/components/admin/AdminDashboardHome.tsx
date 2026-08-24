import { Skeleton, Typography } from 'antd';

import { formattedDateOnly } from '@utils/dateFormat';

import CardsAssignedPanel from './CardsAssignedPanel';
import DailySpendChart from './DailySpendChart';
import WalletPanel from './WalletPanel';
import { DashboardRecentTransaction } from '../../api/user/dashboardApi';
import bankImageIcon from '../../assets/icons/bankImage.svg';
import card2Icon from '../../assets/icons/card2.svg';
import graphIcon from '../../assets/icons/graph.svg';
import transactionIcon from '../../assets/icons/transaction.svg';
import userIcon from '../../assets/icons/user.svg';
import { useAdminCardsApi } from '../../hooks/admin/useAdminCardsApi';
import { useWalletApi } from '../../hooks/admin/useWalletApi';
import { useDashboardSummaryApi } from '../../hooks/user/useDashboardSummaryApi';
import { toDailyPoints, utilisationColor } from '../../utils/dashboardMappers';
import { formatRupeesDecimal, utilisationPercent } from '../../utils/helpers';
import { CardData, StatItem, TransactionItem, WalletInfo } from '../../utils/types';
import { useDashboardNav } from '../common/dashboardNav';
import ProgressList, { ProgressRow } from '../common/ProgressList';
import RecentTransactions from '../common/RecentTransactions';
import SectionCard, { ViewAllLink } from '../common/SectionCard';
import StatCard from '../common/StatCard';
import StatCardSkeleton from '../common/StatCardSkeleton';

const { Title, Text } = Typography;

// t.status is feTransactionStatus's own wording (Completed/Processing/Declined) — pass it through as-is
// so this widget always matches the Transactions page's Status column for the same transaction (ADO 29086).
const mapTxnStatus = (s: string): TransactionItem['status'] => {
    if (s === 'Completed') return 'Completed';
    if (s === 'Declined') return 'Declined';
    if (s === 'Processing') return 'Processing';
    return 'Pending';
};

const toRecentItem = (t: DashboardRecentTransaction): TransactionItem => ({
    key: String(t.id),
    merchant: t.merchant,
    avatarText: t.merchant.charAt(0).toUpperCase(),
    person: t.member ?? '—',
    date: t.date ? formattedDateOnly(new Date(t.date)) : '—',
    amount: formatRupeesDecimal(t.amount),
    status: mapTxnStatus(t.status),
});

/** "Dashboard" tab content for the admin view. */
const AdminDashboardHome = () => {
    const navigate = useDashboardNav();
    const { summary, isLoading: summaryLoading } = useDashboardSummaryApi();
    const { wallet, isLoading: walletLoading } = useWalletApi();
    const {
        cards: adminCards,
        total: activeCount,
        isLoading: cardsLoading, refetch: refetchAdminCards,
    } = useAdminCardsApi(1, 12, undefined, undefined, 'Active');
    const { total: frozenCount } = useAdminCardsApi(1, 1, undefined, undefined, 'Frozen');

    const kpis = summary?.kpis;

    const stats: StatItem[] = [
        {
            key: 'active-cards',
            icon: 'card',
            svgIcon: card2Icon,
            label: 'Active cards',
            value: `${kpis?.activeCards ?? 0}`,
            caption: `${kpis?.totalCardsIssued ?? 0} total issued`,
            tone: 'lilac',
        },
        {
            key: 'verified-members',
            icon: 'members',
            svgIcon: userIcon,
            label: 'Verified members',
            value: `${kpis?.verifiedMembers?.verified ?? 0}/${kpis?.verifiedMembers?.total ?? 0}`,
            caption: `${kpis?.pendingKyc ?? 0} pending KYC`,
            tone: 'rose',
        },
        {
            key: 'pending-approvals',
            icon: 'clock',
            label: 'Pending approvals',
            value: `${kpis?.openRequests ?? 0}`,
            caption: 'Action needed',
            tone: 'lavender',
        },
        {
            key: 'month-spent',
            icon: 'bank',
            svgIcon: bankImageIcon,
            label: 'This month spent',
            value: formatRupeesDecimal(kpis?.spentThisMonth ?? 0),
            caption: `${kpis?.transactionCount ?? 0} transactions`,
            tone: 'cream',
        },
    ];

    const utilisationRows: ProgressRow[] = (summary?.cardUtilisation ?? [])
        .slice(0, 4)
        .map(card => {
            const percent = utilisationPercent(card.spent, card.limit);
            return {
                key: String(card.cardIssuanceId),
                label: (card.nameOnCard || card.holder) ?? '—',
                subLabel: `•• ${card.last4 ?? '----'}`,
                valueText: `${formatRupeesDecimal(card.spent)} / ${formatRupeesDecimal(card.limit)}`,
                percent,
                color: utilisationColor(percent),
            };
        });

    const walletInfo: WalletInfo = {
        available: formatRupeesDecimal(wallet?.balance ?? 0),
        note: 'Real, spendable money. Every active card draws from this same pool.',
        cardLimitsUsed: kpis?.spentThisMonth ?? 0,
        cardLimitsTotal: wallet?.totalCardLimits ?? 0,
        cardLimitsLabel: formatRupeesDecimal(wallet?.totalCardLimits ?? 0),
        cardLimitsCaption: `across ${wallet?.cardCount ?? 0} cards`,
        fundingAccountLast4: wallet?.fundingAccount?.maskedAccountNumber ?? '',
        fundingAccountRef: wallet?.fundingAccount?.ifsc ?? '',
    };

    const cardsAssigned: CardData[] = adminCards
        .filter(card => card.last4)
        .map(card => ({
            key: card.key,
            holder: card.holder,
            nameOnCard: card.nameOnCard,
            last4: card.last4,
            maskedCardNumber: card.maskedCardNumber,
            validFrom: '',
            validTo: '',
            balance: formatRupeesDecimal(card.remaining),
            used: card.spent,
            limit: card.cardLimit,
        }));

    const renderRecentTransactions = () => {
        if (summaryLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
        if ((summary?.recentTransactions ?? []).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-listBg">
                        <img src={transactionIcon} alt="" className="h-7 w-7" />
                    </div>
                    <Text className="text-sm font-semibold text-textHeadings">No transactions yet</Text>
                    <Text className="max-w-[200px] text-xs -mt-2 text-textBody">Your transaction history will appear here once you start using your Peko card.</Text>
                </div>
            );
        }
        return <RecentTransactions items={(summary!.recentTransactions!).slice(0, 4).map(toRecentItem)} />;
    };

    const renderCardUtilisation = () => {
        if (summaryLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
        if (utilisationRows.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-listBg">
                        <img src={graphIcon} alt="" className="h-7 w-7" />
                    </div>
                    <Text className="text-sm font-semibold text-textHeadings">No card utilisation data available</Text>
                    <Text className="max-w-[200px] text-xs -mt-2 text-textBody">Currently, we lack the data needed to provide insights on utilisation. Please check back later!</Text>
                </div>
            );
        }
        return <ProgressList rows={utilisationRows} />;
    };

    return (
        <div className="flex flex-col mt-2 gap-6">
            {/* Header */}
            <div className="mt-5 flex flex-col gap-1">
                <Title level={3} className="!mb-0 !text-textHeadings">
                    Corporate Card Dashboard
                </Title>
                <Text className="text-sm text-textBody">
                    Real-time spend, balances, and activity across Peko.
                </Text>
            </div>

            {/* Subscription fee unpaid banner */}
            {/* <Flex
                align="center"
                justify="space-between"
                gap={16}
                className="rounded-2xl border border-[#EF4444] bg-bgLightPink px-5 py-4"
            >
                <Flex align="flex-start" gap={10}>
                    <ExclamationCircleFilled className="mt-0.5 shrink-0 text-base text-[#EF4444]" />
                    <Flex vertical gap={2}>
                        <Text className="text-sm font-semibold text-[#EF4444]">
                            Subscription Fee Unpaid
                        </Text>
                        <Text className="text-sm text-[#EF4444]">
                            Monthly platform fee — November 2024 of ₹49.00 is overdue (due 15 Nov
                            2024). Pay now to avoid service interruption.
                        </Text>
                    </Flex>
                </Flex>
                <Button type="primary" className="shrink-0 !bg-[#EF4444] hover:!bg-red-600">
                    Pay Now
                </Button>
            </Flex> */}

            {/* KPI stat row */}
            <div className="grid mt-2 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
                {summaryLoading
                    ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    : stats.map(stat => <StatCard key={stat.key} stat={stat} />)}
            </div>

            {/* Row 1: transactions, utilisation, wallet */}
            <div className="grid mt-3 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <SectionCard
                    title="Recent Transactions"
                    action={<ViewAllLink onClick={() => navigate('transactions')} />}
                >
                    {renderRecentTransactions()}
                </SectionCard>

                <SectionCard
                    title="Card Utilisation"
                    action={<ViewAllLink onClick={() => navigate('cards')} />}
                >
                    {renderCardUtilisation()}
                </SectionCard>

                <WalletPanel wallet={walletInfo} loading={summaryLoading || walletLoading} />
            </div>

            {/* Row 2: daily spend chart (wide) + cards assigned */}
            <div className="grid mt-3 grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DailySpendChart
                        data={toDailyPoints(summary?.dailySpend.points ?? [])}
                        total={formatRupeesDecimal(summary?.dailySpend.total ?? 0)}
                        loading={summaryLoading}
                    />
                </div>
                <CardsAssignedPanel
                    cards={cardsAssigned}
                    cardRecords={adminCards}
                    activeCount={activeCount}
                    frozenCount={frozenCount}
                    onManageSuccess={refetchAdminCards}
                    loading={cardsLoading}
                />
            </div>
        </div>
    );
};

export default AdminDashboardHome;
