import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import InitiateKyb from '../../../../components/kyb/admin/InitiateKyb';
import { KYB_DOCUMENTS, KYB_INTRO } from '../../../../utils/kybData';

describe('InitiateKyb', () => {
    it('renders the intro header and the full document checklist', () => {
        render(<InitiateKyb onInitiate={vi.fn()} />);

        expect(screen.getByText(KYB_INTRO.title)).toBeInTheDocument();
        expect(screen.getByText(KYB_INTRO.checklistTitle)).toBeInTheDocument();
        KYB_DOCUMENTS.forEach(doc => {
            expect(screen.getByText(doc.label)).toBeInTheDocument();
        });
    });

    it('calls onInitiate when the CTA is clicked', () => {
        const onInitiate = vi.fn();
        render(<InitiateKyb onInitiate={onInitiate} />);

        fireEvent.click(screen.getByRole('button', { name: KYB_INTRO.ctaLabel }));

        expect(onInitiate).toHaveBeenCalledTimes(1);
    });

    it('does not render a Terms & Conditions consent checkbox', () => {
        render(<InitiateKyb onInitiate={vi.fn()} />);

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(screen.queryByText(/Terms & Conditions/)).not.toBeInTheDocument();
    });

    // ADO 28847: a green check mark next to every document — before KYB is even started — misled
    // users into thinking those documents were already verified/uploaded. This is a "keep ready"
    // reminder list, not a completion tracker, so it should show no checked/verified state at all.
    it('does not render a misleading verified/checked icon next to any document', () => {
        const { container } = render(<InitiateKyb onInitiate={vi.fn()} />);

        expect(container.querySelector('.anticon-check-circle')).not.toBeInTheDocument();
    });
});
