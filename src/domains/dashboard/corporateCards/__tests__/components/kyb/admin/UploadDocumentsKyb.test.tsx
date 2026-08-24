import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import UploadDocumentsKyb from '../../../../components/kyb/admin/UploadDocumentsKyb';
import { KYB_DOCUMENTS, KYB_UPLOAD } from '../../../../utils/kybData';

const mockDispatch = vi.fn();
vi.mock('@hooks/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

describe('UploadDocumentsKyb', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders every KYB document as a mandatory upload field', () => {
        render(<UploadDocumentsKyb onBack={vi.fn()} onSubmit={vi.fn()} />);

        expect(screen.getByText(KYB_UPLOAD.sectionTitle)).toBeInTheDocument();
        KYB_DOCUMENTS.forEach(doc => {
            // Some documents' label and uploadLabel are identical strings, so more than one
            // element can legitimately match — assert presence, not uniqueness.
            expect(screen.getAllByText(doc.label).length).toBeGreaterThan(0);
        });
        // One mandatory-field asterisk per document.
        expect(screen.getAllByText('*')).toHaveLength(KYB_DOCUMENTS.length);
    });

    it('calls onBack when "Go Back" is clicked', () => {
        const onBack = vi.fn();
        render(<UploadDocumentsKyb onBack={onBack} onSubmit={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: KYB_UPLOAD.backLabel }));

        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('does not render a Terms & Conditions consent checkbox', () => {
        render(<UploadDocumentsKyb onBack={vi.fn()} onSubmit={vi.fn()} />);

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        expect(screen.queryByText(/Terms & Conditions/)).not.toBeInTheDocument();
    });

    it('shows a document-specific inline "required" error per missing document instead of a toast, and blocks submit', async () => {
        const onSubmit = vi.fn();
        const { container } = render(<UploadDocumentsKyb onBack={vi.fn()} onSubmit={onSubmit} />);

        fireEvent.click(screen.getByRole('button', { name: KYB_UPLOAD.submitLabel }));

        await waitFor(() => {
            KYB_DOCUMENTS.forEach(doc => {
                expect(screen.getByText(`Please upload the ${doc.label}.`)).toBeInTheDocument();
            });
        });
        expect(container.querySelectorAll('.ant-form-item-has-error')).toHaveLength(KYB_DOCUMENTS.length);
        expect(onSubmit).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('submits once every document is uploaded', async () => {
        const onSubmit = vi.fn();
        const { container } = render(<UploadDocumentsKyb onBack={vi.fn()} onSubmit={onSubmit} />);

        const inputs = Array.from(container.querySelectorAll('input[type="file"]'));
        expect(inputs).toHaveLength(KYB_DOCUMENTS.length);
        inputs.forEach((input, i) => {
            const file = new File(['x'.repeat(10)], `doc-${i}.pdf`, { type: 'application/pdf' });
            Object.defineProperty(input, 'files', { value: [file] });
            fireEvent.change(input);
        });

        // Wait for every FileReader (async) to finish staging its file in Formik state.
        await waitFor(() => {
            inputs.forEach((_, i) => expect(screen.getByText(`doc-${i}.pdf`)).toBeInTheDocument());
        });

        fireEvent.click(screen.getByRole('button', { name: KYB_UPLOAD.submitLabel }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        KYB_DOCUMENTS.forEach(doc => {
            expect(screen.queryByText(`Please upload the ${doc.label}.`)).not.toBeInTheDocument();
        });
    });
});
