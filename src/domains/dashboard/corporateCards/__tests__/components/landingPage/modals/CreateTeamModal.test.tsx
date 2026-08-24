import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import CreateTeamModal from '../../../../components/landingPage/modals/CreateTeamModal';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreateTeamModal', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    describe('when closed', () => {
        it('does not render modal content when open=false', () => {
            render(<CreateTeamModal open={false} onClose={mockOnClose} />);
            expect(screen.queryByText('Create a team')).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    describe('when open', () => {
        const renderOpen = () => render(<CreateTeamModal open onClose={mockOnClose} />);

        it('renders the modal title', () => {
            renderOpen();
            expect(screen.getByText('Create a team')).toBeInTheDocument();
        });

        it('renders the description text', () => {
            renderOpen();
            expect(screen.getByText(/group existing members/i)).toBeInTheDocument();
        });

        it('renders the Team name field', () => {
            renderOpen();
            expect(screen.getByText('Team name')).toBeInTheDocument();
        });

        it('renders the Team lead field', () => {
            renderOpen();
            expect(screen.getByText('Team lead')).toBeInTheDocument();
        });

        it('renders the Description field', () => {
            renderOpen();
            expect(screen.getByText('Description')).toBeInTheDocument();
        });

        it('renders the Members field', () => {
            renderOpen();
            expect(screen.getByText('Members')).toBeInTheDocument();
        });

        it('renders the Cancel button', () => {
            renderOpen();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('renders the Create team button', () => {
            renderOpen();
            expect(screen.getByRole('button', { name: /create team/i })).toBeInTheDocument();
        });

        it('calls onClose when Cancel is clicked', () => {
            renderOpen();
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
