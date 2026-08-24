import StatementHeader from './StatementHeader';
import StatementNote from './StatementNote';
import StatementSummaryCards from './StatementSummaryCards';
import StatementTable from './StatementTable';
import { useStatementApi } from '../../../hooks/admin/useStatementApi';

/**
 * Admin "Account Statement" page (Accounting → reconciliation): header with month picker + export,
 * the four balance summary tiles, the exclusions note, and the monthly statement table.
 */
const AccountStatementPage = () => {
    const {
        summary,
        rows,
        count,
        page,
        setPage,
        pageSize,
        isLoading,
        month,
        setMonth,
        monthLabel,
        exportStatement,
        exporting,
    } = useStatementApi();

    return (
        <div className="flex flex-col gap-6">
            <StatementHeader
                month={month}
                onMonthChange={setMonth}
                onExport={exportStatement}
                exporting={exporting}
            />
            <StatementSummaryCards items={summary} loading={isLoading} />
            <StatementNote />
            <StatementTable
                rows={rows}
                loading={isLoading}
                title={`Statement — ${monthLabel}`}
                total={count}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
            />
        </div>
    );
};

export default AccountStatementPage;
