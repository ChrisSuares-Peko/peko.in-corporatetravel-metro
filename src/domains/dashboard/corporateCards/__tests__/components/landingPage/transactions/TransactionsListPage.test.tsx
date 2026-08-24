import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector, useAppDispatch } from '@src/hooks/store';

import { exportTransactions } from '../../../../api/user/transactionsApi';
import TransactionsListPage from '../../../../components/landingPage/transactions/TransactionsListPage';
import { useUserTransactionsApi } from '../../../../hooks/user/useUserTransactionsApi';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('../../../../api/user/transactionsApi', () => ({
    exportTransactions: vi.fn(),
}));

vi.mock('../../../../hooks/user/useUserTransactionsApi', () => ({
    useUserTransactionsApi: vi.fn(),
}));

// Admin filter options are API-sourced (all cardholders + all cards), not derived from the loaded page.
vi.mock('../../../../hooks/admin/useCardholderOptions', () => ({
    useCardholderOptions: vi.fn(() => [
        { label: 'Alice', value: '101' },
        { label: 'Bob', value: '102' },
    ]),
}));

vi.mock('../../../../hooks/admin/useAllAdminCardsApi', () => ({
    useAllAdminCardsApi: vi.fn(() => ({
        cards: [
            { last4: '1234', maskedCardNumber: '**** **** **** 1234' },
            { last4: '5678', maskedCardNumber: '**** **** **** 5678' },
        ],
        isLoading: false,
    })),
}));

// The cardholder's own card list (ADO 28814) — must be sourced independently of the (filterable)
// transactions list, so it's mocked separately here rather than derived from `makeRow` fixtures.
vi.mock('../../../../hooks/user/useCardsApi', () => ({
    useCardsApi: vi.fn(() => ({
        cards: [
            { last4: '1234', maskedCardNumber: '**** **** **** 1234' },
            { last4: '5678', maskedCardNumber: '**** **** **** 5678' },
        ],
        isLoading: false,
    })),
}));

vi.mock('../../../../components/landingPage/transactions/TransactionsHeader', () => ({
    default: ({ onExport, isExporting }: any) => (
        <div data-testid="transactions-header">
            <button type="button" data-testid="export-btn" onClick={onExport}>
                {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
        </div>
    ),
}));

vi.mock('../../../../components/landingPage/transactions/TransactionsFilterBar', () => ({
    default: () => <div data-testid="filter-bar" />,
}));

vi.mock('../../../../components/landingPage/transactions/TransactionsTable', () => ({
    default: ({ dataSource, hideActions }: any) => (
        <div data-testid="transactions-table" data-hide-actions={hideActions}>
            {(dataSource ?? []).map((row: any) => (
                <div
                    key={row.key}
                    data-testid="table-row"
                    data-member={row.member}
                    data-card={row.cardLast4}
                >
                    {row.merchant}
                </div>
            ))}
        </div>
    ),
    TransactionsVariant: {},
}));

vi.mock('../../../../components/landingPage/transactions/TransactionDetailModal', () => ({
    default: () => null,
}));

const makeRow = (
    overrides: Partial<{
        key: string;
        merchant: string;
        member: string;
        holderId: string;
        cardLast4: string;
        status: string;
        date: string;
        amount: number;
        fee: number;
        approval: string;
    }> = {}
) => ({
    key: '1',
    merchant: 'Amazon',
    member: 'Alice',
    holderId: '101',
    cardLast4: '**** **** **** 1234',
    status: 'Completed',
    date: '01 Jan 2024',
    amount: 500,
    fee: 0,
    approval: 'Auto-approved',
    ...overrides,
});

const mockAuthState = {
    role: 'admin',
    id: 1,
    roleName: 'admin',
    username: 'testuser',
    subCorporateId: null,
};

describe('TransactionsListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) =>
            fn({ reducer: { auth: mockAuthState } })
        );
        (useAppDispatch as unknown as Mock).mockReturnValue(vi.fn());
        (useUserTransactionsApi as Mock).mockReturnValue({
            transactions: [],
            total: 0,
            isLoading: false,
            pageSize: 10,
        });
    });

    describe('header visibility', () => {
        it('renders TransactionsHeader when hideHeader is false (default)', () => {
            render(<TransactionsListPage onView={vi.fn()} />);
            expect(screen.getByTestId('transactions-header')).toBeInTheDocument();
        });

        it('does NOT render TransactionsHeader when hideHeader=true', () => {
            render(<TransactionsListPage onView={vi.fn()} hideHeader />);
            expect(screen.queryByTestId('transactions-header')).toBeNull();
        });
    });

    describe('filter bar visibility', () => {
        it('renders filter bar when no externalFilters provided', () => {
            render(<TransactionsListPage onView={vi.fn()} />);
            expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
        });

        it('does NOT render filter bar when externalFilters is provided', () => {
            render(
                <TransactionsListPage
                    onView={vi.fn()}
                    externalFilters={{ dateRange: null, search: '' }}
                />
            );
            expect(screen.queryByTestId('filter-bar')).toBeNull();
        });
    });

    describe('admin server-side filtering', () => {
        const rows = [
            makeRow({
                key: '1',
                member: 'Alice',
                holderId: '101',
                cardLast4: '**** **** **** 1234',
                merchant: 'Amazon',
                status: 'Completed',
            }),
            makeRow({
                key: '2',
                member: 'Bob',
                holderId: '102',
                cardLast4: '**** **** **** 5678',
                merchant: 'Flipkart',
                status: 'Declined',
            }),
        ];

        beforeEach(() => {
            // The list page filters server-side: the cardholder filter is sent as subCorporateId (the
            // member's holderId), never the name. Mirror that in the mock.
            (useUserTransactionsApi as Mock).mockImplementation((_page: number, params: any) => {
                let filtered = rows;
                if (params?.subCorporateId)
                    filtered = filtered.filter(
                        (r: any) => String(r.holderId) === String(params.subCorporateId)
                    );
                if (params?.cardLast4)
                    filtered = filtered.filter((r: any) => r.cardLast4 === params.cardLast4);
                if (params?.status)
                    filtered = filtered.filter((r: any) => r.status === params.status);
                return {
                    transactions: filtered,
                    total: filtered.length,
                    isLoading: false,
                    pageSize: 10,
                };
            });
        });

        it('shows all rows when no cardholder filter applied (admin)', () => {
            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{ dateRange: null, search: '' }}
                />
            );

            expect(screen.getAllByTestId('table-row')).toHaveLength(2);
        });

        it('filters by selectedCardholder (subCorporateId) in controlled mode', () => {
            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{ dateRange: null, search: '', selectedCardholder: '101' }}
                />
            );

            const tableRows = screen.getAllByTestId('table-row');
            expect(tableRows).toHaveLength(1);
            expect(tableRows[0]).toHaveTextContent('Amazon');
        });

        it('filters by selectedAdminCard in controlled mode', () => {
            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{
                        dateRange: null,
                        search: '',
                        selectedAdminCard: '**** **** **** 5678',
                    }}
                />
            );

            const tableRows = screen.getAllByTestId('table-row');
            expect(tableRows).toHaveLength(1);
            expect(tableRows[0]).toHaveTextContent('Flipkart');
        });

        it('filters by selectedStatus in controlled mode (ADO 28809)', () => {
            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{
                        dateRange: null,
                        search: '',
                        selectedStatus: 'Declined',
                    }}
                />
            );

            const tableRows = screen.getAllByTestId('table-row');
            expect(tableRows).toHaveLength(1);
            expect(tableRows[0]).toHaveTextContent('Flipkart');
        });
    });

    describe('user client-side filtering', () => {
        const rows = [
            makeRow({ key: '1', cardLast4: '**** **** **** 1234', merchant: 'Amazon' }),
            makeRow({ key: '2', cardLast4: '**** **** **** 5678', merchant: 'Flipkart' }),
        ];

        beforeEach(() => {
            (useUserTransactionsApi as Mock).mockImplementation((_page: number, params: any) => {
                let filtered = rows;
                if (params?.cardLast4)
                    filtered = filtered.filter((r: any) => r.cardLast4 === params.cardLast4);
                return {
                    transactions: filtered,
                    total: filtered.length,
                    isLoading: false,
                    pageSize: 10,
                };
            });
        });

        it('filters by selectedCard in controlled mode for user variant', () => {
            render(
                <TransactionsListPage
                    variant="user"
                    onView={vi.fn()}
                    externalFilters={{
                        dateRange: null,
                        search: '',
                        selectedCard: '**** **** **** 1234',
                    }}
                />
            );

            const tableRows = screen.getAllByTestId('table-row');
            expect(tableRows).toHaveLength(1);
            expect(tableRows[0]).toHaveTextContent('Amazon');
        });
    });

    // ADO 29155 — clicking "Transactions" from a specific card on the Cards page landed on My
    // Transactions with no card filter applied, showing every card's transactions.
    describe('initialCard (uncontrolled pre-filter)', () => {
        const rows = [
            makeRow({ key: '1', cardLast4: '2260', merchant: 'PinePerk_Test_MerchantT' }),
            makeRow({ key: '2', cardLast4: '9964', merchant: 'Amazon' }),
        ];

        beforeEach(() => {
            (useUserTransactionsApi as Mock).mockImplementation((_page: number, params: any) => {
                let filtered = rows;
                if (params?.cardLast4)
                    filtered = filtered.filter((r: any) => r.cardLast4 === params.cardLast4);
                return {
                    transactions: filtered,
                    total: filtered.length,
                    isLoading: false,
                    pageSize: 10,
                };
            });
        });

        it('pre-filters to the given card on mount, in uncontrolled (interactive) mode', () => {
            render(
                <TransactionsListPage variant="user" onView={vi.fn()} initialCard="2260" />
            );

            const tableRows = screen.getAllByTestId('table-row');
            expect(tableRows).toHaveLength(1);
            expect(tableRows[0]).toHaveTextContent('PinePerk_Test_MerchantT');
            // Unlike externalFilters, the filter bar still renders (the user can change the filter).
            expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
        });

        it('calls onInitialCardFilterConsumed once after applying the initial card', () => {
            const onInitialCardFilterConsumed = vi.fn();
            render(
                <TransactionsListPage
                    variant="user"
                    onView={vi.fn()}
                    initialCard="2260"
                    onInitialCardFilterConsumed={onInitialCardFilterConsumed}
                />
            );

            expect(onInitialCardFilterConsumed).toHaveBeenCalledTimes(1);
        });

        it('does not call onInitialCardFilterConsumed when no initialCard is given', () => {
            const onInitialCardFilterConsumed = vi.fn();
            render(
                <TransactionsListPage
                    variant="user"
                    onView={vi.fn()}
                    onInitialCardFilterConsumed={onInitialCardFilterConsumed}
                />
            );

            expect(onInitialCardFilterConsumed).not.toHaveBeenCalled();
        });
    });

    describe('onOptionsChange callback', () => {
        it('fires onOptionsChange with the API-sourced cardholder + card options (admin)', async () => {
            const rows = [
                makeRow({
                    key: '1',
                    member: 'Alice',
                    holderId: '101',
                    cardLast4: '**** **** **** 1234',
                }),
                makeRow({
                    key: '2',
                    member: 'Bob',
                    holderId: '102',
                    cardLast4: '**** **** **** 5678',
                }),
            ];
            (useUserTransactionsApi as Mock).mockReturnValue({
                transactions: rows,
                total: 2,
                isLoading: false,
                pageSize: 10,
            });

            const onOptionsChange = vi.fn();
            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{ dateRange: null, search: '' }}
                    onOptionsChange={onOptionsChange}
                />
            );

            await waitFor(() => expect(onOptionsChange).toHaveBeenCalled());

            const lastCall = onOptionsChange.mock.calls[onOptionsChange.mock.calls.length - 1][0];
            const cardholderLabels = lastCall.cardholderOptions.map((o: any) => o.label);
            expect(cardholderLabels).toContain('Alice');
            expect(cardholderLabels).toContain('Bob');
        });
    });

    describe('export', () => {
        it('calls exportTransactions when export button is clicked', async () => {
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
            (exportTransactions as Mock).mockResolvedValue(mockBlob);

            const createObjectURL = vi.fn(() => 'blob:http://localhost/fake');
            const revokeObjectURL = vi.fn();
            Object.defineProperty(window, 'URL', {
                value: { createObjectURL, revokeObjectURL },
                writable: true,
            });

            render(<TransactionsListPage onView={vi.fn()} />);

            screen.getByTestId('export-btn').click();

            await waitFor(() => {
                expect(exportTransactions).toHaveBeenCalled();
            });
        });

        // The export previously only forwarded dateFrom/dateTo/searchText/status, silently dropping
        // the Cardholder and Card filters — so the exported CSV always contained every cardholder's
        // and every card's transactions regardless of what the on-screen table was filtered to
        // (ADO 28815). Assert every active filter reaches exportTransactions.
        it('includes the active Cardholder and Card filters in the export params (ADO 28815)', async () => {
            (useUserTransactionsApi as Mock).mockReturnValue({
                transactions: [makeRow({ key: '1' })],
                total: 1,
                isLoading: false,
                pageSize: 10,
            });
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
            (exportTransactions as Mock).mockResolvedValue(mockBlob);
            Object.defineProperty(window, 'URL', {
                value: { createObjectURL: vi.fn(() => 'blob:http://localhost/fake'), revokeObjectURL: vi.fn() },
                writable: true,
            });

            render(
                <TransactionsListPage
                    variant="admin"
                    onView={vi.fn()}
                    externalFilters={{
                        dateRange: null,
                        search: 'PinePerk_Test_MerchantT',
                        selectedCardholder: '101',
                        selectedAdminCard: '**** **** **** 9964',
                        selectedStatus: 'Completed',
                    }}
                />
            );

            screen.getByTestId('export-btn').click();

            await waitFor(() => {
                expect(exportTransactions).toHaveBeenCalledWith(
                    'admin',
                    1,
                    expect.objectContaining({
                        searchText: 'PinePerk_Test_MerchantT',
                        subCorporateId: '101',
                        cardLast4: '**** **** **** 9964',
                        status: 'Completed',
                    })
                );
            });
        });

        // The export previously never told the backend which table it was exporting from, so it had to
        // re-derive that from role — which turned out to be unreliable, causing an account's own
        // user-variant "My transactions" tab to still get the admin-shaped CSV (Member/Approval/Fee
        // instead of Transaction ID/Category), the exact mismatch in ADO 29113. Assert the page's own
        // `variant` reaches exportTransactions so the backend can shape the CSV to match what's on screen.
        it('forwards the page variant to exportTransactions so the CSV matches the on-screen table (ADO 29113)', async () => {
            (useUserTransactionsApi as Mock).mockReturnValue({
                transactions: [makeRow({ key: '1' })],
                total: 1,
                isLoading: false,
                pageSize: 10,
            });
            const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
            (exportTransactions as Mock).mockResolvedValue(mockBlob);
            Object.defineProperty(window, 'URL', {
                value: { createObjectURL: vi.fn(() => 'blob:http://localhost/fake'), revokeObjectURL: vi.fn() },
                writable: true,
            });

            render(<TransactionsListPage variant="user" onView={vi.fn()} />);

            screen.getByTestId('export-btn').click();

            await waitFor(() => {
                expect(exportTransactions).toHaveBeenCalledWith(
                    expect.anything(),
                    expect.anything(),
                    expect.objectContaining({ variant: 'user' })
                );
            });
        });
    });
});
