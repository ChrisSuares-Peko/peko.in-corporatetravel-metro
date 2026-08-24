import React from 'react';

import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import MembersTable from '../../../components/landingPage/MembersTable';
import { Member } from '../../../utils/types';

// GenericTable sizes its column set against window.innerWidth, so with the real one a wide table drops
// columns into the expandable row and header assertions become a function of the jsdom viewport. Mocking
// it exercises the column definitions themselves, which is what this table owns.
vi.mock('@components/atomic/GenericTable', () => ({
    default: ({ columns, dataSource }: any) => (
        <div data-testid="generic-table">
            <div data-testid="headers">
                {(columns ?? []).map((c: any) => (
                    <span key={c.key} data-testid={`header-${c.key}`}>
                        {c.title}
                    </span>
                ))}
            </div>
            {(dataSource ?? []).map((row: any) => (
                <div key={row.key} data-testid={`row-${row.key}`}>
                    {(columns ?? []).map((c: any) => (
                        <span key={c.key} data-testid={`cell-${c.key}-${row.key}`}>
                            {c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    ),
}));

const makeMember = (overrides: Partial<Member> = {}): Member => ({
    key: 'm1',
    name: 'Alice Adams',
    email: 'alice@test.com',
    role: 'Employee',
    cards: 1,
    accountStatus: 'Active',
    kycStatus: 'Completed',
    joined: '2024-01-01',
    ...overrides,
});

const renderTable = (members: Member[]) =>
    render(
        <MembersTable
            members={members}
            onEdit={vi.fn()}
            onRemove={vi.fn()}
            onResendInvite={vi.fn()}
            page={1}
            pageSize={10}
            total={members.length}
            onPageChange={vi.fn()}
        />
    );

describe('MembersTable', () => {
    describe('status columns', () => {
        it('renders an Account status column', () => {
            renderTable([makeMember()]);
            expect(screen.getByTestId('header-accountStatus')).toHaveTextContent('Account status');
        });

        it('renders a KYC status column', () => {
            renderTable([makeMember()]);
            expect(screen.getByTestId('header-kycStatus')).toHaveTextContent('KYC status');
        });

        // The Team column it replaced was never backed by data — useCardUsersApi hardcoded team: '-',
        // so every row rendered a literal dash.
        it('no longer renders a Team column', () => {
            renderTable([makeMember()]);
            expect(screen.queryByTestId('header-team')).toBeNull();
        });

        it('shows the KYC status label for the row', () => {
            renderTable([makeMember({ kycStatus: 'Not started' })]);
            expect(screen.getByTestId('cell-kycStatus-m1')).toHaveTextContent('Not started');
        });

        // cardStatus was a rollup of the member's issuances (ACTIVE/INACTIVE/NONE), which duplicated the
        // Cards count and said nothing about whether the member can be issued a card at all.
        it('no longer renders a Card status column', () => {
            renderTable([makeMember()]);
            expect(screen.queryByTestId('header-cardStatus')).toBeNull();
        });

        it('keeps the Cards count column', () => {
            renderTable([makeMember({ cards: 3 })]);
            expect(screen.getByTestId('cell-cards-m1')).toHaveTextContent('3');
        });

        it('shows the account status label for the row', () => {
            renderTable([makeMember({ accountStatus: 'Pending' })]);
            expect(screen.getByTestId('cell-accountStatus-m1')).toHaveTextContent('Pending');
        });

        // Two independent statuses that can read the same word — they must not be sourced from one field.
        it('renders the account and KYC statuses independently', () => {
            renderTable([makeMember({ accountStatus: 'Active', kycStatus: 'Rejected' })]);
            expect(screen.getByTestId('cell-accountStatus-m1')).toHaveTextContent('Active');
            expect(screen.getByTestId('cell-kycStatus-m1')).toHaveTextContent('Rejected');
        });
    });

    describe('row actions', () => {
        it('offers Resend invitation only while the account is still PENDING', () => {
            renderTable([makeMember({ inviteStatus: 'PENDING' })]);
            expect(
                screen.getByRole('button', { name: /resend invitation to alice adams/i })
            ).toBeInTheDocument();
        });

        it('does not offer Resend invitation once the account is ACTIVE', () => {
            renderTable([makeMember({ inviteStatus: 'ACTIVE' })]);
            expect(screen.queryByRole('button', { name: /resend invitation/i })).toBeNull();
        });
    });
});
