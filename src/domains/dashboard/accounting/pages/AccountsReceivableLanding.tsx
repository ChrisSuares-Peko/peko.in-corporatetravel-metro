import { useMemo, useState } from 'react';

import { Empty, Flex, Spin } from 'antd';
import { saveAs } from 'file-saver';

import { useAccountsReceivable } from '../hooks/useReportSummary';
import AgingAnalysisCard from '../sections/accountsReceivable/AgingAnalysisCard';
import ArHeader from '../sections/accountsReceivable/ArHeader';
import CollectionSummary from '../sections/accountsReceivable/CollectionSummary';
import CustomerDistributionCard from '../sections/accountsReceivable/CustomerDistributionCard';
import InvoicesCard from '../sections/accountsReceivable/InvoicesCard';
import OutstandingTrendCard from '../sections/accountsReceivable/OutstandingTrendCard';
import { Invoice, statusOptions } from '../utils/accountsReceivableData';
import { toArView } from '../utils/accountsReceivableViewModel';
import { FULL_YEAR, currentFyStart } from '../utils/reportFilters';

const csvCell = (c: string | number) => `"${String(c).replace(/"/g, '""')}"`;

const AccountsReceivableLanding = () => {
    const [fy, setFy] = useState(currentFyStart());
    const [period, setPeriod] = useState(FULL_YEAR);
    const [status, setStatus] = useState(statusOptions[0].value);

    // fy alone → full financial year; fy + month → single calendar month within the FY.
    const month = period === FULL_YEAR ? undefined : Number(period);

    const { ar, loading } = useAccountsReceivable({ fy, month });
    const view = useMemo(() => (ar ? toArView(ar) : null), [ar]);

    const visibleInvoices = useMemo(() => {
        if (!view) return [];
        return status === 'all'
            ? view.invoicesRows
            : view.invoicesRows.filter(i => i.status === status);
    }, [view, status]);

    const invoicesData = useMemo(() => {
        const totals = visibleInvoices.reduce(
            (a, i) => ({
                amount: a.amount + i.amount,
                paid: a.paid + i.paid,
                outstanding: a.outstanding + i.outstanding,
                count: a.count + 1,
            }),
            { amount: 0, paid: 0, outstanding: 0, count: 0 }
        );
        return {
            invoices: visibleInvoices,
            totals,
            totalLabel: `Totals (${totals.count} invoices)`,
        };
    }, [visibleInvoices]);

    const handleExport = () => {
        if (!visibleInvoices.length) return;
        const header = [
            'Customer',
            'Invoice No.',
            'Invoice Date',
            'Due Date',
            'Amount',
            'Paid',
            'Outstanding',
            'Status',
        ];
        const lines = [
            header.map(csvCell).join(','),
            ...visibleInvoices.map((i: Invoice) =>
                [
                    i.customer,
                    i.invoiceNo,
                    i.invoiceDate,
                    i.dueDate,
                    i.amount,
                    i.paid,
                    i.outstanding,
                    i.status,
                ]
                    .map(csvCell)
                    .join(',')
            ),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'Accounts Receivable.csv');
    };

    return (
        <Flex vertical gap={24} className="px-2 py-5">
            <ArHeader
                fy={fy}
                period={period}
                status={status}
                onFyChange={setFy}
                onPeriodChange={setPeriod}
                onStatusChange={setStatus}
                onExport={handleExport}
            />

            {loading && (
                <Flex align="center" justify="center" className="min-h-[300px]">
                    <Spin />
                </Flex>
            )}

            {!loading && !view && (
                <Flex align="center" justify="center" className="min-h-[300px]">
                    <Empty description="No receivables data" />
                </Flex>
            )}

            {!loading && view && (
                <>
                    <InvoicesCard data={invoicesData} />
                    <AgingAnalysisCard data={view.aging} />
                    <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[7fr_5fr]">
                        <OutstandingTrendCard trend={view.trend} />
                        <CustomerDistributionCard bars={view.distribution} />
                    </div>
                    <CollectionSummary data={view.collection} />
                </>
            )}
        </Flex>
    );
};

export default AccountsReceivableLanding;
