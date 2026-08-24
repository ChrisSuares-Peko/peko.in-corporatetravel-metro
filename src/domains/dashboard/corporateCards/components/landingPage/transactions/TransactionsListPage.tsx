import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import TransactionsFilterBar from './TransactionsFilterBar';
import TransactionsHeader from './TransactionsHeader';
import TransactionsTable, {
    TransactionApprovalHandlers,
    TransactionsVariant,
} from './TransactionsTable';
import { exportTransactions } from '../../../api/user/transactionsApi';
import { useAllAdminCardsApi } from '../../../hooks/admin/useAllAdminCardsApi';
import { useCardholderOptions } from '../../../hooks/admin/useCardholderOptions';
import { useCardsApi } from '../../../hooks/user/useCardsApi';
import { useUserTransactionsApi } from '../../../hooks/user/useUserTransactionsApi';
import { SelectOption, TransactionRow } from '../../../utils/types';

type DateRange = [Dayjs | null, Dayjs | null] | null;

export interface ExternalTransactionFilters {
    dateRange: DateRange;
    search: string;
    selectedCardholder?: string;
    selectedAdminCard?: string;
    selectedCard?: string;
    selectedStatus?: string;
}

export interface TransactionDropdownOptions {
    cardholderOptions: SelectOption[];
    cardOptions: SelectOption[];
}

interface TransactionsListPageProps {
    variant?: TransactionsVariant;
    onView: (txn: TransactionRow) => void;
    hideHeader?: boolean;
    hideActions?: boolean;
    externalFilters?: ExternalTransactionFilters;
    onOptionsChange?: (opts: TransactionDropdownOptions) => void;
    approvalHandlers?: TransactionApprovalHandlers;
    refreshKey?: number;
    initialCard?: string;
    onInitialCardFilterConsumed?: () => void;
}

const fmt = (d: Dayjs | null) => d?.format('YYYY-MM-DD');

const uniqueOptions = (values: (string | undefined)[]): SelectOption[] => {
    const seen = new Set<string>();
    return values
        .filter((v): v is string => !!v && v !== '—' && !seen.has(v) && !!seen.add(v))
        .map(v => ({ label: v, value: v }));
};

const TransactionsListPage = ({
    variant = 'admin',
    onView,
    hideHeader = false,
    hideActions = false,
    externalFilters,
    onOptionsChange,
    approvalHandlers,
    refreshKey = 0,
    initialCard,
    onInitialCardFilterConsumed,
}: TransactionsListPageProps) => {
    const isAdmin = variant === 'admin';
    const controlled = externalFilters !== undefined;

    const { cards: allAdminCards } = useAllAdminCardsApi(isAdmin);
    const allCardholderOptions = useCardholderOptions('COMPLETED', isAdmin);
   
    const { cards: myCards } = useCardsApi(!isAdmin);

    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();

    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange>([dayjs().subtract(1, 'month'), dayjs()]);
    const [search, setSearch] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // user filters (client-side)
    const [selectedCard, setSelectedCard] = useState<string | undefined>(initialCard);
    const onInitialCardFilterConsumedRef = useRef(onInitialCardFilterConsumed);
    onInitialCardFilterConsumedRef.current = onInitialCardFilterConsumed;
    useEffect(() => {
        if (initialCard) onInitialCardFilterConsumedRef.current?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // admin filters (client-side)
    const [selectedCardholder, setSelectedCardholder] = useState<string | undefined>(undefined);
    const [selectedAdminCard, setSelectedAdminCard] = useState<string | undefined>(undefined);

    // shared (client-side)
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

    const activeDateRange = controlled ? externalFilters.dateRange : dateRange;
    const activeSearch = controlled ? externalFilters.search : search;
    const activeCardholder = controlled ? externalFilters.selectedCardholder : selectedCardholder;
    const activeAdminCard = controlled ? externalFilters.selectedAdminCard : selectedAdminCard;
    const activeCard = controlled ? externalFilters.selectedCard : selectedCard;
    const activeStatus = controlled ? externalFilters.selectedStatus : selectedStatus;

    // Wrap each filter setter to also reset the page in the same event — React 18 batches
    // both setState calls into one render, preventing a double API call.
    const handleDateRangeChange = useCallback((val: DateRange) => {
        setDateRange(val);
        setPage(1);
    }, []);
    const handleSearchChange = useCallback((val: string) => {
        setSearch(val);
        setPage(1);
    }, []);
    const handleCardholderChange = useCallback((val: string | undefined) => {
        setSelectedCardholder(val);
        setPage(1);
    }, []);
    const handleAdminCardChange = useCallback((val: string | undefined) => {
        setSelectedAdminCard(val);
        setPage(1);
    }, []);
    const handleCardChange = useCallback((val: string | undefined) => {
        setSelectedCard(val);
        setPage(1);
    }, []);
    const handleStatusChange = useCallback((val: string | undefined) => {
        setSelectedStatus(val);
        setPage(1);
    }, []);

    const { transactions, total, isLoading, pageSize } = useUserTransactionsApi(
        page,
        {
            dateFrom: fmt(activeDateRange?.[0] ?? null),
            dateTo: fmt(activeDateRange?.[1] ?? null),
            searchText: activeSearch,
            subCorporateId: activeCardholder,
            cardLast4: activeAdminCard ?? activeCard,
            status: activeStatus,
        },
        refreshKey
    );

    const cardOptions = useMemo(
        () =>
            myCards.map(c => ({
                label: c.maskedCardNumber ?? `**** **** **** ${c.last4}`,
                value: c.last4,
            })),
        [myCards]
    );
    const userCardholderOptions = useMemo(
        () => uniqueOptions(transactions.map(t => t.member)),
        [transactions]
    );
    const cardholderOptions = isAdmin ? allCardholderOptions : userCardholderOptions;
    const adminCardOptions = useMemo(
        () =>
            allAdminCards.map(c => ({
                label: c.maskedCardNumber ?? `**** **** **** ${c.last4}`,
                value: c.last4,
            })),
        [allAdminCards]
    );

    const onOptionsChangeRef = useRef(onOptionsChange);
    onOptionsChangeRef.current = onOptionsChange;
    useEffect(() => {
        onOptionsChangeRef.current?.({
            cardholderOptions,
            cardOptions: isAdmin ? adminCardOptions : cardOptions,
        });
    }, [cardholderOptions, adminCardOptions, cardOptions, isAdmin]);

    const visibleTransactions = transactions;

    const handleExport = async () => {
        if (!visibleTransactions || visibleTransactions.length === 0) {
            dispatch(showToast({ variant: 'info', description: 'No data is available for export' }));
            return;
        }
        setIsExporting(true);
        
        const activeCardFilter = activeAdminCard ?? activeCard;
        const blob = await exportTransactions(role, id, {
            variant,
            ...(fmt(activeDateRange?.[0] ?? null)
                ? { dateFrom: fmt(activeDateRange?.[0] ?? null) }
                : {}),
            ...(fmt(activeDateRange?.[1] ?? null)
                ? { dateTo: fmt(activeDateRange?.[1] ?? null) }
                : {}),
            ...(activeSearch ? { searchText: activeSearch } : {}),
            ...(activeCardholder ? { subCorporateId: activeCardholder } : {}),
            ...(activeCardFilter ? { cardLast4: activeCardFilter } : {}),
            ...(activeStatus ? { status: activeStatus } : {}),
        });
        if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = isAdmin ? 'transactions.csv' : 'my-transactions.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        }
        setIsExporting(false);
    };

    return (
        <div className="flex flex-col gap-6">
            {!hideHeader && (
                <TransactionsHeader
                    variant={variant}
                    onExport={handleExport}
                    isExporting={isExporting}
                />
            )}
            {!controlled && (
                <TransactionsFilterBar
                    variant={variant}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    search={search}
                    onSearchChange={handleSearchChange}
                    // admin
                    selectedCardholder={selectedCardholder}
                    onCardholderChange={handleCardholderChange}
                    cardholderOptions={cardholderOptions}
                    selectedAdminCard={selectedAdminCard}
                    onAdminCardChange={handleAdminCardChange}
                    adminCardOptions={adminCardOptions}
                    // user
                    selectedCard={selectedCard}
                    onCardChange={handleCardChange}
                    cardOptions={cardOptions}
                    // shared
                    selectedStatus={selectedStatus}
                    onStatusChange={handleStatusChange}
                />
            )}
            <TransactionsTable
                variant={variant}
                onView={onView}
                hideActions={hideActions}
                approvalHandlers={approvalHandlers}
                dataSource={visibleTransactions}
                loading={isLoading}
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
            />
        </div>
    );
};

export default TransactionsListPage;
