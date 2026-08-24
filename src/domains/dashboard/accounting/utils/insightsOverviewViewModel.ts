import dayjs from 'dayjs';

import { BarLineChartData, dashboardColors, KpiCardItem, Tone } from './insightsDashboardData';
import { formatCompact, monthLabel, niceTicks, signedCompact, toLakhs } from './reportFormat';
import { AccountingInsights, AccountsReceivable, ReportSummary } from '../api/reports';

// Net margin as a percentage of income, to one decimal. Guards zero/negative income
// (returns 0 instead of NaN/Infinity) while still allowing a negative result.
const pctOfIncome = (part: number, income: number): number =>
    income > 0 ? Number(((part / income) * 100).toFixed(1)) : 0;

const periodLabel = (period: AccountingInsights['period']): string => {
    if (!period.from || !period.to) return 'Selected period';
    return `${dayjs(period.from).format('MMM YYYY')} – ${dayjs(period.to).format('MMM YYYY')}`;
};

// Shown while the prior-period figures are still loading, or when no prior baseline exists.
const pendingYoyTail: KpiCardItem['tail'] = { text: '— YoY', tone: 'muted', arrow: false };

const changeTone = (isZero: boolean, favorable: boolean): Tone => {
    if (isZero) return 'muted';
    return favorable ? 'success' : 'danger';
};

// Year-over-year change tail computed from the prior equivalent period. `favorableWhenUp` drives
// the colour (revenue up = good/green; expenses up = bad/red). KpiCard only has an up-caret, so the
// arrow shows only on an increase; the sign + colour convey direction for a decrease.
const deltaTail = (
    current: number,
    prior: number | null,
    favorableWhenUp: boolean
): KpiCardItem['tail'] => {
    if (prior === null) return pendingYoyTail; // prior period still loading / unavailable
    if (prior === 0) return undefined; // no prior-year baseline to compare against
    const change = ((current - prior) / Math.abs(prior)) * 100;
    const up = change > 0;
    return {
        text: `${up ? '+' : ''}${change.toFixed(0)}% YoY`,
        tone: changeTone(change === 0, up === favorableWhenUp),
        arrow: up,
    };
};

// Margins are percentages, so their YoY movement is in percentage points (pp), not a % change.
const marginDeltaTail = (
    currentMargin: number,
    prior: ReportSummary | null
): KpiCardItem['tail'] => {
    if (prior === null) return pendingYoyTail;
    if (prior.totals.income <= 0) return undefined; // no prior income → no prior margin to compare
    const priorMargin = (prior.totals.net / prior.totals.income) * 100;
    const pp = currentMargin - priorMargin;
    const up = pp > 0;
    return {
        text: `${up ? '+' : ''}${pp.toFixed(1)}pp YoY`,
        tone: changeTone(pp === 0, up),
        arrow: up,
    };
};

export const toOverviewView = (
    insights: AccountingInsights,
    ar: AccountsReceivable | null,
    prior: ReportSummary | null
) => {
    const { income, expense, net } = insights.totals;
    const margin = pctOfIncome(net, income);
    const rangeLabel = periodLabel(insights.period);
    const priorTotals = prior ? prior.totals : null;

    const primaryKpis: KpiCardItem[] = [
        {
            key: 'revenue',
            label: 'Total Revenue',
            value: formatCompact(income),
            sub: rangeLabel,
            tail: deltaTail(income, priorTotals ? priorTotals.income : null, true),
        },
        {
            key: 'expenses',
            label: 'Total Expenses',
            value: formatCompact(expense),
            sub: rangeLabel,
            tail: deltaTail(expense, priorTotals ? priorTotals.expense : null, false),
        },
        {
            key: 'net-profit',
            label: 'Net Profit',
            value: signedCompact(net),
            valueTone: net >= 0 ? 'success' : 'danger',
            sub: `${margin}% net margin`,
            tail: deltaTail(net, priorTotals ? priorTotals.net : null, true),
        },
        // TODO(backend): Cash Balance has no backend source (no account-balances data) — neither the
        // value nor its YoY % can be real yet. Keeping the mock value/design; tail shown as pending.
        {
            key: 'cash-balance',
            label: 'Cash Balance',
            value: '₹24.6L',
            sub: 'as of Mar 2026',
            tail: pendingYoyTail,
        },
    ];

    const arOutstanding = ar ? ar.totals.outstanding : 0;
    const arOverdue = ar ? ar.collection.overdueAmount : 0;
    const arOverduePct =
        arOutstanding > 0 ? ((arOverdue / arOutstanding) * 100).toFixed(1) : '0';

    const secondaryKpis: KpiCardItem[] = [
        {
            key: 'net-margin',
            label: 'Net Margin',
            value: `${margin}%`,
            valueTone: margin >= 0 ? 'success' : 'danger',
            sub: 'Target 20%',
            tail: marginDeltaTail(margin, prior),
        },
        ar
            ? {
                  key: 'ar-outstanding',
                  label: 'AR Outstanding',
                  value: formatCompact(arOutstanding),
                  valueTone: 'danger',
                  sub: `${arOverduePct}% overdue`,
                  tail: { text: `${formatCompact(arOverdue)} at risk`, tone: 'danger' },
              }
            : {
                  key: 'ar-outstanding',
                  label: 'AR Outstanding',
                  value: '—',
                  valueTone: 'muted',
                  sub: 'Receivables data unavailable',
              },
        // TODO(backend): Accounts Payable is on hold (no AP data source). Keeping the mock value and
        // design; wire to an AP endpoint analogous to accounts-receivable when it ships.
        {
            key: 'ap-outstanding',
            label: 'AP Outstanding',
            value: '₹3.22L',
            valueTone: 'warning',
            sub: '5.7% overdue',
            tail: { text: '₹18,500 past due', tone: 'warning' },
        },
    ];

    const points: BarLineChartData['points'] = (insights.monthly ?? []).map(m => ({
        month: monthLabel(m.month),
        revenue: toLakhs(m.income),
        expense: toLakhs(m.expense),
        profit: toLakhs(m.income - m.expense),
    }));
    const peak = (insights.monthly ?? []).reduce(
        (max, m) => Math.max(max, toLakhs(m.income), toLakhs(m.expense)),
        0
    );

    const revenueVsExpenses: BarLineChartData = {
        title: 'Revenue vs Expenses',
        subtitle: 'Monthly revenue and expenses with net profit trend',
        ticks: niceTicks(peak),
        xKey: 'month',
        bars: [
            { dataKey: 'revenue', color: dashboardColors.revenueBar },
            { dataKey: 'expense', color: dashboardColors.expenseBar },
        ],
        line: { dataKey: 'profit', color: dashboardColors.netProfitLine },
        points,
    };

    return { primaryKpis, secondaryKpis, revenueVsExpenses };
};

export type OverviewView = ReturnType<typeof toOverviewView>;
