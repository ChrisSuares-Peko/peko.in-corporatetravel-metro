import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';
import useDebounce from '@src/hooks/useDebounce';
import { formattedDateOnly } from '@utils/dateFormat';

import { GetTransactionsParams, getUserTransactions } from '../../api/user/transactionsApi';
import { TransactionRow } from '../../utils/types';

const PAGE_SIZE = 10;

export interface TransactionFilters {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    category?: string;
    searchText?: string;
    subCorporateId?: string;
    cardLast4?: string;
}

export const useUserTransactionsApi = (
    page: number,
    filters: TransactionFilters,
    refreshKey = 0
) => {
    const { role, id, subCorporateId } = useAppSelector(state => state.reducer.auth);
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const debouncedSearch = useDebounce(filters.searchText ?? '', 500);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        const params: GetTransactionsParams = {
            page,
            itemsPerPage: PAGE_SIZE,
            ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
            ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(debouncedSearch ? { searchText: debouncedSearch } : {}),
            ...(filters.cardLast4 ? { cardLast4: filters.cardLast4 } : {}),
            // Admin cardholder filter wins; otherwise a cardholder's own self-scope (backend re-derives
            // self for non-admins, so this is only a filter for admins).
            ...(filters.subCorporateId || subCorporateId
                ? { subCorporateId: filters.subCorporateId || subCorporateId }
                : {}),
        };
        const res = await getUserTransactions(role, id, params);
        if (res && res.data) {
            setTotal(res.data.count);
            setTransactions(
                res.data.rows.map(r => ({
                    key: String(r.id),
                    cardLast4: r.cardLast4 ? `**** **** **** ${r.cardLast4}` : '—',
                    date: r.date ? formattedDateOnly(new Date(r.date)) : '—',
                    merchant: r.merchant,
                    member: r.member ?? '',
                    holderId: r.holderId ?? null,
                    status: r.status as TransactionRow['status'],
                    approval: (r.approval ?? 'Auto-approved') as TransactionRow['approval'],
                    declineReason: r.declineReason ?? null,
                    fee: r.fee ?? 0,
                    amount: r.amount,
                    transactionId: r.transactionId,
                    category: r.category,
                }))
            );
        }
        setIsLoading(false);
    }, [
        role,
        id,
        subCorporateId,
        page,
        filters.dateFrom,
        filters.dateTo,
        filters.status,
        filters.category,
        debouncedSearch,
        filters.subCorporateId,
        filters.cardLast4,
    ]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions, refreshKey]);

    return { transactions, total, isLoading, pageSize: PAGE_SIZE };
};
