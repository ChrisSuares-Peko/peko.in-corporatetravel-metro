import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import EditMemberModal from '../../../../components/landingPage/modals/EditMemberModal';
import { Member } from '../../../../utils/types';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const makeMember = (overrides: Partial<Member> = {}): Member => ({
    key: 'm1',
    name: 'Alice Adams',
    email: 'alice@test.com',
    role: 'Employee',
    cards: 2,
    accountStatus: 'Active',
    kycStatus: 'Completed',
    joined: '2024-01-01',
    ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EditMemberModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    describe('when closed', () => {
        it('does not render content when open=false', () => {
            render(<EditMemberModal open={false} member={makeMember()} onClose={mockOnClose} />);
            expect(screen.queryByText(/edit/i)).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    describe('when open with a member', () => {
        const renderOpen = (member: Member | null = makeMember()) =>
            render(<EditMemberModal open member={member} onClose={mockOnClose} />);

        it('shows the member name in the modal title', () => {
            renderOpen(makeMember({ name: 'Bob Baker' }));
            expect(screen.getByText('Edit Bob Baker')).toBeInTheDocument();
        });

        it('shows "Edit member" in the title when member is null', () => {
            renderOpen(null);
            expect(screen.getByText('Edit member')).toBeInTheDocument();
        });

        it('renders the description text', () => {
            renderOpen();
            expect(
                screen.getByText(/update this member's role, team, and department/i)
            ).toBeInTheDocument();
        });

        it('renders the Role field', () => {
            renderOpen();
            expect(screen.getByText('Role')).toBeInTheDocument();
        });

        it('renders the Team field', () => {
            renderOpen();
            expect(screen.getByText('Team')).toBeInTheDocument();
        });

        it('renders the Make team lead toggle', () => {
            renderOpen();
            expect(screen.getByText(/make team lead/i)).toBeInTheDocument();
        });

        it('renders the Department field', () => {
            renderOpen();
            expect(screen.getByText('Department')).toBeInTheDocument();
        });

        it('renders the Cancel button', () => {
            renderOpen();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('renders the Save changes button', () => {
            renderOpen();
            expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
        });

        it('calls onClose when Cancel is clicked', () => {
            renderOpen();
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('renders the roles note at the bottom', () => {
            renderOpen();
            // The roles note is a small helper text; just check it exists
            expect(screen.getByText(/roles/i)).toBeInTheDocument();
        });
    });
});
