import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector } from '@src/hooks/store';

import {
    getCorporateDocumentFileForAdmin,
    getCorporateDocumentsForAdmin,
} from '../../../api/corporateDocuments';
import CorporateDocumentsPage from '../../../component/corporateCardApplications/CorporateDocumentsPage';

const mockLocationState: { current: any } = { current: null };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ corporateId: '42' }),
        useLocation: () => ({ state: mockLocationState.current }),
    };
});

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('../../../api/corporateDocuments', () => ({
    getCorporateDocumentsForAdmin: vi.fn(),
    getCorporateDocumentFileForAdmin: vi.fn(),
}));

const mockAuth = { reducer: { auth: { role: 'admin', id: 5 } } };

describe('CorporateDocumentsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocationState.current = {
            companyName: 'Steel & Co',
            fullName: 'Jane Doe',
            pekoAccountNumber: '100000726',
            email: 'jane@example.com',
        };
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) => fn(mockAuth));
        (getCorporateDocumentsForAdmin as Mock).mockResolvedValue({});
    });

    it('fetches documents for the corporateId from the URL', async () => {
        render(<CorporateDocumentsPage />);
        await waitFor(() =>
            expect(getCorporateDocumentsForAdmin).toHaveBeenCalledWith({ userType: 'admin', userId: 5 }, 42)
        );
    });

    it('renders the corporate context line from navigation state', async () => {
        render(<CorporateDocumentsPage />);
        await waitFor(() => expect(screen.getByText(/Steel & Co/)).toBeInTheDocument());
        expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
        expect(screen.getByText(/100000726/)).toBeInTheDocument();
        expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    });

    it('renders all 8 documents in order, each "Not uploaded" when the map is empty', async () => {
        render(<CorporateDocumentsPage />);

        await waitFor(() => expect(screen.getAllByText('Not uploaded')).toHaveLength(8));
        expect(screen.getByText('Corporate Agreement')).toBeInTheDocument();
        expect(screen.getByText('Certificate of Incorporation')).toBeInTheDocument();
    });

    it('marks an uploaded document with its tag and file name, and shows download/view icons', async () => {
        (getCorporateDocumentsForAdmin as Mock).mockResolvedValue({
            MOA: { document: 'corp/42/moa/some-uuid.pdf', expiryDate: null, status: 'uploaded' },
        });
        render(<CorporateDocumentsPage />);

        await waitFor(() => expect(screen.getByText('some-uuid.pdf')).toBeInTheDocument());
        const moaLabel = screen.getByText('MoA (Memorandum of Association)');
        const row = moaLabel.closest('.border-b') as HTMLElement;
        expect(row.querySelector('.anticon-download')).toBeInTheDocument();
        expect(row.querySelector('.anticon-eye')).toBeInTheDocument();
    });

    it('does not show download/view icons for a document that has not been uploaded', async () => {
        render(<CorporateDocumentsPage />);

        await waitFor(() => expect(screen.getAllByText('Not uploaded')).toHaveLength(8));
        const label = screen.getByText('Corporate Agreement');
        const row = label.closest('.border-b') as HTMLElement;
        expect(row.querySelector('.anticon-download')).not.toBeInTheDocument();
    });

    it('opens a blob URL in a new tab when the view icon is clicked', async () => {
        (getCorporateDocumentsForAdmin as Mock).mockResolvedValue({
            MOA: { document: 'corp/42/moa/some-uuid.pdf', expiryDate: null, status: 'uploaded' },
        });
        (getCorporateDocumentFileForAdmin as Mock).mockResolvedValue({
            buffer: { data: [1, 2, 3] },
            type: 'pdf',
        });
        const createObjectURL = vi.fn(() => 'blob:http://localhost/fake');
        const revokeObjectURL = vi.fn();
        Object.defineProperty(window, 'URL', { value: { createObjectURL, revokeObjectURL }, writable: true });
        const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

        render(<CorporateDocumentsPage />);
        await waitFor(() => expect(screen.getByText('some-uuid.pdf')).toBeInTheDocument());

        const row = screen.getByText('MoA (Memorandum of Association)').closest('.border-b') as HTMLElement;
        fireEvent.click(row.querySelector('.anticon-eye')!);

        await waitFor(() =>
            expect(getCorporateDocumentFileForAdmin).toHaveBeenCalledWith(
                { userType: 'admin', userId: 5 },
                'corp/42/moa/some-uuid.pdf'
            )
        );
        await waitFor(() => expect(windowOpen).toHaveBeenCalledWith('blob:http://localhost/fake', '_blank', 'noopener,noreferrer'));
    });

    it('falls back to opening the raw docKey when the file fetch returns no buffer', async () => {
        (getCorporateDocumentsForAdmin as Mock).mockResolvedValue({
            MOA: { document: 'corp/42/moa/some-uuid.pdf', expiryDate: null, status: 'uploaded' },
        });
        (getCorporateDocumentFileForAdmin as Mock).mockResolvedValue(false);
        const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

        render(<CorporateDocumentsPage />);
        await waitFor(() => expect(screen.getByText('some-uuid.pdf')).toBeInTheDocument());

        const row = screen.getByText('MoA (Memorandum of Association)').closest('.border-b') as HTMLElement;
        fireEvent.click(row.querySelector('.anticon-eye')!);

        await waitFor(() =>
            expect(windowOpen).toHaveBeenCalledWith('corp/42/moa/some-uuid.pdf', '_blank', 'noopener,noreferrer')
        );
    });

    it('falls back to "Unnamed corporate" when there is no companyName or fullName in navigation state', async () => {
        mockLocationState.current = null;
        render(<CorporateDocumentsPage />);

        await waitFor(() => expect(screen.getByText(/Unnamed corporate/)).toBeInTheDocument());
    });
});
