import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { resendInvitation } from '@src/domains/dashboard/settings/api/userManagement';
import { showToast } from '@src/slices/apiSlice';

import PeopleLandingPage from '../../../components/landingPage/PeopleLandingPage';
import { useCardUsersApi } from '../../../hooks/admin/useCardUsersApi';
import { Member } from '../../../utils/types';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@src/hooks/store', () => ({
    useAppDispatch: () => vi.fn(),
}));

vi.mock('@src/slices/apiSlice', () => ({
    showToast: vi.fn(),
}));

vi.mock('@src/domains/dashboard/settings/api/userManagement', () => ({
    deleteSubCorporate: vi.fn().mockResolvedValue(true),
    resendInvitation: vi.fn().mockResolvedValue({}),
}));

// ---------------------------------------------------------------------------
// Hook mocks
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/admin/useCardUsersApi', () => ({
    useCardUsersApi: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Component mocks
// ---------------------------------------------------------------------------

vi.mock('../../../components/landingPage/PeopleHeader', () => ({
    default: ({ onInviteMember }: any) => (
        <div data-testid="people-header">
            <button type="button" data-testid="invite-member-btn" onClick={onInviteMember}>
                Invite member
            </button>
        </div>
    ),
}));

vi.mock('../../../components/common/PageTabs', () => ({
    default: ({ tabs, activeKey, onChange }: any) => (
        <div data-testid="page-tabs">
            {tabs.map((tab: any) => (
                <button
                    type="button"
                    key={tab.key}
                    data-testid={`tab-${tab.key}`}
                    data-active={String(activeKey === tab.key)}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../../../components/landingPage/MembersTable', () => ({
    default: ({ members, isLoading, onEdit, onRemove, onResendInvite, resendingKey }: any) => (
        <div
            data-testid="members-table"
            data-loading={String(isLoading)}
            data-resending-key={resendingKey ?? ''}
        >
            {(members ?? []).map((m: any) => (
                <div key={m.key} data-testid={`member-row-${m.key}`}>
                    <span>{m.name}</span>
                    <button
                        type="button"
                        data-testid={`edit-btn-${m.key}`}
                        onClick={() => onEdit(m)}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        data-testid={`remove-btn-${m.key}`}
                        onClick={() => onRemove(m)}
                    >
                        Remove
                    </button>
                    <button
                        type="button"
                        data-testid={`resend-btn-${m.key}`}
                        onClick={() => onResendInvite(m)}
                    >
                        Resend
                    </button>
                </div>
            ))}
        </div>
    ),
}));

vi.mock('../../../components/landingPage/TeamsGrid', () => ({
    default: () => <div data-testid="teams-grid" />,
}));

vi.mock('../../../components/landingPage/modals/InviteMemberModal', () => ({
    default: ({ open, onClose, onSuccess }: any) =>
        open ? (
            <div data-testid="invite-member-modal">
                <button type="button" data-testid="close-invite-btn" onClick={onClose}>
                    Close invite
                </button>
                <button type="button" data-testid="invite-success-btn" onClick={onSuccess}>
                    Success
                </button>
            </div>
        ) : null,
}));

vi.mock('../../../components/landingPage/modals/CreateTeamModal', () => ({
    default: ({ open, onClose }: any) =>
        open ? (
            <div data-testid="create-team-modal">
                <button type="button" data-testid="close-create-team-btn" onClick={onClose}>
                    Close create team
                </button>
            </div>
        ) : null,
}));

vi.mock('../../../components/landingPage/modals/EditMemberModal', () => ({
    default: ({ open, member, onClose }: any) =>
        open ? (
            <div data-testid="edit-member-modal" data-member-name={member?.name}>
                <button type="button" data-testid="close-edit-btn" onClick={onClose}>
                    Close edit
                </button>
            </div>
        ) : null,
}));

vi.mock('../../../components/landingPage/modals/RemoveMemberModal', () => ({
    default: ({ open, member, onClose }: any) =>
        open ? (
            <div data-testid="remove-member-modal" data-member-name={member?.name}>
                <button type="button" data-testid="close-remove-btn" onClick={onClose}>
                    Close remove
                </button>
            </div>
        ) : null,
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

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

const defaultApiReturn = {
    members: [],
    isLoading: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PeopleLandingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useCardUsersApi as Mock).mockReturnValue(defaultApiReturn);
    });

    // -----------------------------------------------------------------------
    describe('layout', () => {
        it('renders the people header', () => {
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('people-header')).toBeInTheDocument();
        });

        it('renders the page tabs', () => {
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('page-tabs')).toBeInTheDocument();
        });

        it('shows the Members tab and hides the Teams tab (Teams hidden for now)', () => {
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('tab-members')).toBeInTheDocument();
            expect(screen.queryByTestId('tab-teams')).toBeNull();
        });

        it('shows the Members tab as active by default', () => {
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('tab-members').dataset.active).toBe('true');
        });
    });

    // -----------------------------------------------------------------------
    describe('tab switching', () => {
        it('shows MembersTable when the Members tab is active', () => {
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('members-table')).toBeInTheDocument();
            expect(screen.queryByTestId('teams-grid')).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    describe('MembersTable integration', () => {
        it('passes members from the API to MembersTable', () => {
            const members = [
                makeMember({ key: 'm1' }),
                makeMember({ key: 'm2', name: 'Bob Baker' }),
            ];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('member-row-m1')).toBeInTheDocument();
            expect(screen.getByTestId('member-row-m2')).toBeInTheDocument();
        });

        it('passes isLoading=true to MembersTable while data is loading', () => {
            (useCardUsersApi as Mock).mockReturnValue({ members: [], isLoading: true });
            render(<PeopleLandingPage />);
            expect(screen.getByTestId('members-table').dataset.loading).toBe('true');
        });
    });

    // -----------------------------------------------------------------------
    describe('InviteMemberModal', () => {
        it('InviteMemberModal is closed initially', () => {
            render(<PeopleLandingPage />);
            expect(screen.queryByTestId('invite-member-modal')).toBeNull();
        });

        it('opens InviteMemberModal when Invite member is clicked', () => {
            render(<PeopleLandingPage />);
            fireEvent.click(screen.getByTestId('invite-member-btn'));
            expect(screen.getByTestId('invite-member-modal')).toBeInTheDocument();
        });

        it('closes InviteMemberModal when its close button is clicked', () => {
            render(<PeopleLandingPage />);
            fireEvent.click(screen.getByTestId('invite-member-btn'));
            fireEvent.click(screen.getByTestId('close-invite-btn'));
            expect(screen.queryByTestId('invite-member-modal')).toBeNull();
        });

        it('refreshes the members list after a successful invite', () => {
            render(<PeopleLandingPage />);
            fireEvent.click(screen.getByTestId('invite-member-btn'));
            fireEvent.click(screen.getByTestId('invite-success-btn'));
            expect(useCardUsersApi).toHaveBeenCalledWith(1, undefined, 1);
        });
    });

    // -----------------------------------------------------------------------
    // Create Team is hidden for now (Teams not wired to a backend); the modal stays mounted but closed.
    describe('CreateTeamModal', () => {
        it('CreateTeamModal is closed (Create Team hidden for now)', () => {
            render(<PeopleLandingPage />);
            expect(screen.queryByTestId('create-team-modal')).toBeNull();
            expect(screen.queryByTestId('create-team-btn')).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    describe('EditMemberModal', () => {
        it('EditMemberModal is closed initially', () => {
            render(<PeopleLandingPage />);
            expect(screen.queryByTestId('edit-member-modal')).toBeNull();
        });

        it('opens EditMemberModal with the correct member when Edit is clicked', () => {
            const members = [makeMember({ key: 'm1', name: 'Alice Adams' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('edit-btn-m1'));
            const modal = screen.getByTestId('edit-member-modal');
            expect(modal).toBeInTheDocument();
            expect(modal.dataset.memberName).toBe('Alice Adams');
        });

        it('closes EditMemberModal when its close button is clicked', () => {
            const members = [makeMember({ key: 'm1' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('edit-btn-m1'));
            fireEvent.click(screen.getByTestId('close-edit-btn'));
            expect(screen.queryByTestId('edit-member-modal')).toBeNull();
        });

        it('only one modal is open at a time (edit closes when invite opens)', () => {
            const members = [makeMember({ key: 'm1' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('edit-btn-m1'));
            expect(screen.getByTestId('edit-member-modal')).toBeInTheDocument();

            // Close edit and open invite
            fireEvent.click(screen.getByTestId('close-edit-btn'));
            fireEvent.click(screen.getByTestId('invite-member-btn'));
            expect(screen.queryByTestId('edit-member-modal')).toBeNull();
            expect(screen.getByTestId('invite-member-modal')).toBeInTheDocument();
        });
    });

    // -----------------------------------------------------------------------
    describe('RemoveMemberModal', () => {
        it('RemoveMemberModal is closed initially', () => {
            render(<PeopleLandingPage />);
            expect(screen.queryByTestId('remove-member-modal')).toBeNull();
        });

        it('opens RemoveMemberModal with the correct member when Remove is clicked', () => {
            const members = [makeMember({ key: 'm1', name: 'Bob Baker' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('remove-btn-m1'));
            const modal = screen.getByTestId('remove-member-modal');
            expect(modal).toBeInTheDocument();
            expect(modal.dataset.memberName).toBe('Bob Baker');
        });

        it('closes RemoveMemberModal when its close button is clicked', () => {
            const members = [makeMember({ key: 'm1' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('remove-btn-m1'));
            fireEvent.click(screen.getByTestId('close-remove-btn'));
            expect(screen.queryByTestId('remove-member-modal')).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    describe('resend invitation', () => {
        it('calls resendInvitation with the member id when Resend is clicked', async () => {
            const members = [makeMember({ key: '42', inviteStatus: 'PENDING' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('resend-btn-42'));
            await waitFor(() => expect(resendInvitation).toHaveBeenCalledWith(42));
        });

        it('shows a success toast when the resend succeeds', async () => {
            const members = [makeMember({ key: '42', inviteStatus: 'PENDING' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('resend-btn-42'));
            await waitFor(() =>
                expect(showToast).toHaveBeenCalledWith({
                    variant: 'success',
                    description: 'Invitation resent successfully.',
                })
            );
        });

        it('does not show a success toast when the resend fails', async () => {
            (resendInvitation as Mock).mockResolvedValueOnce(false);
            const members = [makeMember({ key: '42', inviteStatus: 'PENDING' })];
            (useCardUsersApi as Mock).mockReturnValue({ members, isLoading: false });
            render(<PeopleLandingPage />);

            fireEvent.click(screen.getByTestId('resend-btn-42'));
            await waitFor(() => expect(resendInvitation).toHaveBeenCalled());
            expect(showToast).not.toHaveBeenCalled();
        });
    });
});
