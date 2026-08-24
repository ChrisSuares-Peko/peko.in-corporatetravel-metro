import { useCallback, useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';
import { formattedDateOnly } from '@utils/dateFormat';

import {
    exportStatement as exportStatementApi,
    getStatement,
    StatementApiResponse,
    StatementApiRow,
} from '../../api/admin/statementApi';
import { formatRupeesDecimal } from '../../utils/helpers';
import { StatementRow, StatementSummary } from '../../utils/types';

const currentMonth = () => dayjs().format('YYYY-MM');
// Server-side page size (the backend caps itemsPerPage at 100).
const PAGE_SIZE = 20;
const money = (v: number | null) => (v === null || v === undefined ? '' : formatRupeesDecimal(v));

const toSummary = (s: StatementApiResponse['summary'], monthLabel: string): StatementSummary[] => [
    {
        key: 'opening',
        icon: 'wallet',
        label: 'Opening balance',
        value: formatRupeesDecimal(s.openingBalance),
        caption: `Start of ${monthLabel}`,
        tone: 'lilac',
    },
    {
        key: 'money-in',
        icon: 'in',
        label: 'Money in',
        value: formatRupeesDecimal(s.moneyIn),
        caption: 'Top-ups, refunds, cashback',
        tone: 'rose',
    },
    {
        key: 'money-out',
        icon: 'out',
        label: 'Money out',
        value: formatRupeesDecimal(s.moneyOut),
        caption: 'Card spend & fees',
        tone: 'mint',
    },
    {
        key: 'closing',
        icon: 'check',
        label: 'Closing balance',
        value: formatRupeesDecimal(s.closingBalance),
        caption: `End of ${monthLabel}`,
        tone: 'lavender',
    },
];

// A credit (money in) trends down-green; a debit (money out) trends up-red. Opening/closing markers have none.
const rowTrend = (r: StatementApiRow): StatementRow['trend'] => {
    if (r.kind !== 'txn') return undefined;
    return r.moneyIn !== null ? 'inGreen' : 'upRed';
};

const toRow = (r: StatementApiRow, index: number): StatementRow => ({
    key: `${r.kind}-${index}`,
    date: r.kind === 'closing' ? 'End of period' : formattedDateOnly(new Date(r.date)),
    description: r.description,
    trend: rowTrend(r),
    reference: r.reference || '',
    type: r.type || '',
    moneyOut: money(r.moneyOut),
    moneyIn: money(r.moneyIn),
    balance: money(r.balance),
    kind: r.kind,
});

/**
 * The opening / closing markers anchor EVERY page, not just the first and last — an admin reading page 4
 * still needs the balances the movements are bracketed by. They're built from `summary` (whole-month, so
 * identical on every page) rather than from the API's own marker rows, which only arrive on the first and
 * last page. Any marker the API does send is dropped so it can't be rendered twice.
 */
const openingRow = (s: StatementApiResponse['summary'], month: string): StatementRow => ({
    key: 'opening',
    date: formattedDateOnly(dayjs(month).startOf('month').toDate()),
    description: 'Opening balance',
    reference: '',
    type: '',
    moneyOut: '',
    moneyIn: '',
    balance: formatRupeesDecimal(s.openingBalance),
    kind: 'opening',
});

const closingRow = (s: StatementApiResponse['summary']): StatementRow => ({
    key: 'closing',
    date: 'End of period',
    description: 'Closing balance',
    reference: '',
    type: '',
    moneyOut: formatRupeesDecimal(s.moneyOut),
    moneyIn: formatRupeesDecimal(s.moneyIn),
    balance: formatRupeesDecimal(s.closingBalance),
    kind: 'closing',
});

export const useStatementApi = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [month, setMonth] = useState(currentMonth());
    const [page, setPage] = useState(1);
    const [summary, setSummary] = useState<StatementSummary[]>([]);
    const [rows, setRows] = useState<StatementRow[]>([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const monthLabel = dayjs(month).format('MMMM YYYY');

    // Only `rows` paginate; the summary comes back whole-month on every page, so the tiles never flicker
    // between pages. `count` is the movement total (markers excluded) and drives the pager.
    const fetchStatement = useCallback(async () => {
        setIsLoading(true);
        const res = await getStatement(role, id, month, page, PAGE_SIZE);
        if (res && res.data) {
            const { summary: apiSummary, rows: apiRows, month: apiMonth } = res.data;
            setSummary(toSummary(apiSummary, dayjs(apiMonth).format('MMMM YYYY')));
            setRows([
                openingRow(apiSummary, apiMonth),
                ...apiRows.filter(r => r.kind === 'txn').map(toRow),
                closingRow(apiSummary),
            ]);
            setCount(res.data.count ?? 0);
        }
        setIsLoading(false);
    }, [role, id, month, page]);

    useEffect(() => {
        fetchStatement();
    }, [fetchStatement]);

    // A new month has its own row count — staying on page 8 would request a page that no longer exists.
    const changeMonth = (next: string) => {
        setMonth(next);
        setPage(1);
    };

    const exportStatement = async () => {
        // `count` is the whole month, so this verdict doesn't depend on which page is open (the export
        // itself is always the full month, never the page).
        if (count === 0) {
            dispatch(showToast({ variant: 'info', description: 'No data is available for export' }));
            return;
        }

        setExporting(true);
        const res = await exportStatementApi(role, id, month);
        setExporting(false);
        if (res) {
            const url = URL.createObjectURL(res);
            const a = document.createElement('a');
            a.href = url;
            a.download = `account-statement-${month}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            dispatch(showToast({ variant: 'success', description: 'Statement exported.' }));
        }
    };

    return {
        summary,
        rows,
        count,
        page,
        setPage,
        pageSize: PAGE_SIZE,
        isLoading,
        month,
        setMonth: changeMonth,
        monthLabel,
        exportStatement,
        exporting,
    };
};
