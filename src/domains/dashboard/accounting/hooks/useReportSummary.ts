import { useCallback, useEffect, useRef, useState } from 'react';

import { saveAs } from 'file-saver';

import { useAppSelector } from '@src/hooks/store';

import {
    AccountingInsights,
    AccountsPayable,
    AccountsReceivable,
    BalanceSheet,
    BusinessHealth,
    CashFlowOverview,
    CashFlowStatement,
    FreeCashFlow,
    getAccountingInsights,
    getAccountingReportSummary,
    getAccountsPayable,
    getAccountsReceivable,
    getBalanceSheet,
    getBusinessHealth,
    getCashFlowOverview,
    getCashFlowStatement,
    getFreeCashFlow,
    getGstSummary,
    getProfitAndLoss,
    GstSummary,
    ProfitAndLoss,
    ReportSummary,
} from '../api/reports';
import { ApiTransaction, exportTransactions, getTransactions } from '../api/transactions';

export interface ReportPeriod {
    fy?: number;
    quarter?: number;
    month?: number;
    category?: string;
    from?: string;
    to?: string;
}

export const useReportSummary = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, category, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getAccountingReportSummary({
            userId,
            userType,
            fy,
            quarter,
            month,
            category,
            from,
            to,
        }).then(data => {
            if (!active) return;
            setSummary(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, category, from, to]);

    return { summary, loading };
};

export const useProfitAndLoss = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [pnl, setPnl] = useState<ProfitAndLoss | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getProfitAndLoss({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setPnl(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { pnl, loading };
};

export const useBalanceSheet = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getBalanceSheet({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setBalanceSheet(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { balanceSheet, loading };
};

export const useCashFlowStatement = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getCashFlowStatement({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setCashFlowStatement(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { cashFlowStatement, loading };
};

export const useCashFlowOverview = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [cashFlowOverview, setCashFlowOverview] = useState<CashFlowOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getCashFlowOverview({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setCashFlowOverview(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { cashFlowOverview, loading };
};

export const useFreeCashFlow = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [freeCashFlow, setFreeCashFlow] = useState<FreeCashFlow | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getFreeCashFlow({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setFreeCashFlow(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { freeCashFlow, loading };
};

export const useAccountsPayable = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [accountsPayable, setAccountsPayable] = useState<AccountsPayable | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getAccountsPayable({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setAccountsPayable(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { accountsPayable, loading };
};

export const useGstSummary = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [gstSummary, setGstSummary] = useState<GstSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getGstSummary({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setGstSummary(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { gstSummary, loading };
};

export const useAccountingInsights = (from?: string, to?: string) => {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [insights, setInsights] = useState<AccountingInsights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getAccountingInsights({ userId, userType, from, to }).then(data => {
            if (!active) return;
            setInsights(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, from, to]);

    return { insights, loading };
};

export const useAccountsReceivable = (period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [ar, setAr] = useState<AccountsReceivable | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getAccountsReceivable({ userId, userType, fy, quarter, month, from, to }).then(data => {
            if (!active) return;
            setAr(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, fy, quarter, month, from, to]);

    return { ar, loading };
};

export const useBusinessHealth = (from?: string, to?: string) => {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [health, setHealth] = useState<BusinessHealth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getBusinessHealth({ userId, userType, from, to }).then(data => {
            if (!active) return;
            setHealth(data || null);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, from, to]);

    return { health, loading };
};

export const useReportTransactions = (kind: 'Income' | 'Expense', period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to, category } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [rows, setRows] = useState<ApiTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getTransactions({
            userId,
            userType,
            type: kind,
            itemsPerPage: 100,
            fy,
            quarter,
            month,
            from,
            to,
            category,
        }).then(data => {
            if (!active) return;
            setRows(data ? data.transactions : []);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [userId, userType, kind, fy, quarter, month, from, to, category]);

    return { rows, loading };
};

export const useReportExport = (kind: 'Income' | 'Expense', period: ReportPeriod = {}) => {
    const { fy, quarter, month, from, to, category } = period;
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [exporting, setExporting] = useState(false);

    const busyRef = useRef(false);

    const exportReport = useCallback(
        async (filename: string) => {
            if (busyRef.current) return;
            busyRef.current = true;
            setExporting(true);
            try {
                const data = await exportTransactions({
                    userId,
                    userType,
                    type: kind,
                    fy,
                    quarter,
                    month,
                    from,
                    to,
                    category,
                    format: 'excel',
                });
                if (data) {
                    const blob = new Blob([new Uint8Array(data.buffer.data)], {
                        type: data.fileType,
                    });
                    saveAs(blob, filename);
                }
            } finally {
                busyRef.current = false;
                setExporting(false);
            }
        },
        [userId, userType, kind, fy, quarter, month, from, to, category]
    );

    return { exporting, exportReport };
};
