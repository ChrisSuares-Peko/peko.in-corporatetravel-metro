import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import {
    getCorporateCardApplication,
    getCorporatesForApplication,
    updateCorporateCardApplication,
} from '../../../api/corporateCardApplications';
import ManageApplicationDrawer from '../../../component/corporateCardApplications/ManageApplicationDrawer';
import { CorporateCardApplicationRow } from '../../../types/corporateCardApplications';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('@src/hooks/useScreenSize', () => ({
    default: vi.fn(() => ({ md: true })),
}));

vi.mock('@src/slices/apiSlice', () => ({
    showToast: vi.fn((payload: any) => ({ type: 'toast/show', payload })),
}));

vi.mock('../../../api/corporateCardApplications', () => ({
    getCorporateCardApplication: vi.fn(),
    getCorporatesForApplication: vi.fn(),
    updateCorporateCardApplication: vi.fn(),
}));

vi.mock('@ant-design/icons', () => ({
    CloseOutlined: ({ onClick }: any) => (
        <button type="button" data-testid="close-icon-btn" onClick={onClick} aria-label="close" />
    ),
}));

vi.mock('antd', async () => {
    const actual = await vi.importActual<typeof import('antd')>('antd');

    const Drawer = ({ open, children, footer, title, extra }: any) => {
        if (!open) return null;
        return (
            <div data-testid="drawer">
                <div data-testid="drawer-header">
                    <span>{title}</span>
                    {extra}
                </div>
                <div data-testid="drawer-body">{children}</div>
                {footer && <div data-testid="drawer-footer">{footer}</div>}
            </div>
        );
    };

    const Button = ({ children, onClick, disabled, loading }: any) => (
        <button type="button" onClick={onClick} disabled={disabled || loading} data-loading={loading ? 'true' : undefined}>
            {children}
        </button>
    );

    const Input = ({ value, onChange, placeholder, disabled }: any) => (
        <input value={value ?? ''} onChange={onChange} placeholder={placeholder} disabled={disabled} />
    );
    Input.TextArea = ({ value, onChange, placeholder }: any) => (
        <textarea value={value ?? ''} onChange={onChange} placeholder={placeholder} />
    );

    // Mirrors antd's real contract: `parser` runs on the raw typed string and returns the
    // parsed number directly (NaN when nothing valid was typed), so a `parser` that strips
    // non-digits (as ours does) must be exercised here for the digit-only behavior to be testable.
    const InputNumber = ({ value, onChange, placeholder, parser }: any) => (
        <input
            value={value ?? ''}
            onChange={e => {
                if (parser) {
                    const parsed = parser(e.target.value);
                    onChange?.(Number.isNaN(parsed) ? null : parsed);
                    return;
                }
                onChange?.(e.target.value === '' ? null : Number(e.target.value));
            }}
            placeholder={placeholder}
        />
    );

    const Select = ({ value, onChange, options, placeholder }: any) => (
        <select value={value ?? ''} onChange={e => onChange?.(e.target.value)}>
            <option value="">{placeholder ?? 'Select'}</option>
            {(options ?? []).map((opt: any) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                </option>
            ))}
        </select>
    );

    const Tag = ({ children }: any) => <span data-testid="status-tag">{children}</span>;
    const Alert = ({ message }: any) => <div role="alert">{message}</div>;
    const Skeleton = ({ active }: any) => (active ? <div data-testid="skeleton" /> : null);
    Skeleton.Button = () => <div data-testid="skeleton-button" />;

    const Typography = {
        Text: ({ children, className }: any) => <span className={className}>{children}</span>,
        Title: ({ children }: any) => <h4>{children}</h4>,
    };

    return { ...actual, Drawer, Button, Input, InputNumber, Select, Tag, Alert, Skeleton, Typography };
});

const mockDispatch = vi.fn();
const mockAuth = { reducer: { auth: { role: 'admin', id: 5 } } };

const baseRow: CorporateCardApplicationRow = {
    corporateId: 42,
    companyName: 'Steel & Co',
    fullName: 'Jane Doe',
    pekoAccountNumber: '100000726',
    email: 'jane@example.com',
    kybStatus: 'REJECTED',
    cardSchemeId: null,
    svcCardNumberLast4: null,
    beneficiaryName: null,
    virtualAccountNumberLast4: null,
    virtualAccountIfsc: null,
    bankName: null,
    updatedAt: '2026-07-10T10:00:00.000Z',
};

const baseDetail = {
    corporateId: 42,
    kybStatus: 'REJECTED' as const,
    kybReference: 'KYB-99',
    rejectionReason: 'Blurry PAN card.',
    cardSchemeId: 175491,
    svcCardNumberLast4: '3456',
    virtualAccount: {
        beneficiaryName: 'Steel & Co',
        accountNumber: '1234567890',
        ifsc: 'HDFC0001234',
        bankName: 'HDFC Bank',
        bankAddress: 'Mumbai',
        paymentReference: 'REF-1',
    },
    updatedAt: '2026-07-10T10:00:00.000Z',
};

describe('ManageApplicationDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as Mock).mockImplementation((fn: any) => fn(mockAuth));
        (useAppDispatch as unknown as Mock).mockReturnValue(mockDispatch);
        (getCorporateCardApplication as Mock).mockResolvedValue(baseDetail);
        (getCorporatesForApplication as Mock).mockResolvedValue([]);
        (updateCorporateCardApplication as Mock).mockResolvedValue({ ...baseDetail });
    });

    it('does not render when open is false', () => {
        render(<ManageApplicationDrawer open={false} mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        expect(screen.queryByTestId('drawer')).toBeNull();
    });

    it('shows "Add Application" as the title in create mode', () => {
        render(<ManageApplicationDrawer open mode="create" row={null} onClose={vi.fn()} onSaved={vi.fn()} />);
        expect(screen.getByText('Add Application')).toBeInTheDocument();
    });

    it('loads the corporate picker on open in create mode', async () => {
        render(<ManageApplicationDrawer open mode="create" row={null} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(getCorporatesForApplication).toHaveBeenCalledWith('admin', 5, undefined));
    });

    it('shows the company name and status tag as the title in edit mode', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);

        await waitFor(() => expect(screen.getByText('Steel & Co')).toBeInTheDocument());
        expect(screen.getByTestId('status-tag')).toHaveTextContent('Rejected');
    });

    it('fetches the application detail and populates the form in edit mode', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);

        expect(getCorporateCardApplication).toHaveBeenCalledWith('admin', 5, 42);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());
        expect(screen.getByDisplayValue('KYB-99')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });

    it('shows the rejection reason field when the KYB status is REJECTED', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);

        await waitFor(() => expect(screen.getByDisplayValue('Blurry PAN card.')).toBeInTheDocument());
    });

    it('hides the rejection reason field when the KYB status is not REJECTED', async () => {
        (getCorporateCardApplication as Mock).mockResolvedValue({ ...baseDetail, kybStatus: 'VERIFIED', rejectionReason: null });
        render(<ManageApplicationDrawer open mode="edit" row={{ ...baseRow, kybStatus: 'VERIFIED' }} onClose={vi.fn()} onSaved={vi.fn()} />);

        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());
        expect(screen.queryByPlaceholderText('Shown to the corporate on the KYB rejected screen')).not.toBeInTheDocument();
    });

    it('disables the Completed and Verified status options while required provisioning fields are missing', async () => {
        (getCorporateCardApplication as Mock).mockResolvedValue({
            ...baseDetail,
            cardSchemeId: null,
            svcCardNumberLast4: null,
            virtualAccount: { ...baseDetail.virtualAccount, accountNumber: '', ifsc: '' },
        });
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);

        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());
        const completedOption = screen.getByRole('option', { name: 'Completed' }) as HTMLOptionElement;
        const verifiedOption = screen.getByRole('option', { name: 'Verified' }) as HTMLOptionElement;
        expect(completedOption.disabled).toBe(true);
        expect(verifiedOption.disabled).toBe(true);
    });

    it('disables KYB Reference once the backend has already generated one', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        expect(screen.getByDisplayValue('KYB-99')).toBeDisabled();
    });

    it('leaves KYB Reference editable when the backend has not generated one yet', async () => {
        (getCorporateCardApplication as Mock).mockResolvedValue({ ...baseDetail, kybReference: null });
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        expect(
            screen.getByPlaceholderText('Auto-generated once the corporate submits KYB')
        ).not.toBeDisabled();
    });

    it('leaves KYB Reference editable in create mode', async () => {
        render(<ManageApplicationDrawer open mode="create" row={null} onClose={vi.fn()} onSaved={vi.fn()} />);

        expect(
            screen.getByPlaceholderText('Auto-generated once the corporate submits KYB')
        ).not.toBeDisabled();
    });

    it('still validates KYB Reference when it is editable and given an invalid value', async () => {
        (getCorporateCardApplication as Mock).mockResolvedValue({ ...baseDetail, kybReference: null });
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(
            screen.getByPlaceholderText('Auto-generated once the corporate submits KYB'),
            { target: { value: ' KYB-1' } }
        );
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(screen.getByText('Remove the leading or trailing spaces.')).toBeInTheDocument()
        );
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('requires a rejection reason before saving when the KYB status is REJECTED', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Shown to the corporate on the KYB rejected screen'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(screen.getByText('Tell the corporate why the KYB was rejected.')).toBeInTheDocument()
        );
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('shows a validation message on each missing mandatory field when saving as Verified with fields blank', async () => {
        (getCorporateCardApplication as Mock).mockResolvedValue({
            ...baseDetail,
            kybStatus: 'VERIFIED',
            cardSchemeId: null,
            svcCardNumberLast4: null,
            virtualAccount: { ...baseDetail.virtualAccount, accountNumber: '', ifsc: '' },
        });
        render(<ManageApplicationDrawer open mode="edit" row={{ ...baseRow, kybStatus: 'VERIFIED' }} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(
                screen.getByText('Card scheme ID is required to mark this application Verified or Completed.')
            ).toBeInTheDocument()
        );
        expect(
            screen.getByText('SVC card number is required to mark this application Verified or Completed.')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Account number is required to mark this application Verified or Completed.')
        ).toBeInTheDocument();
        expect(
            screen.getByText('IFSC code is required to mark this application Verified or Completed.')
        ).toBeInTheDocument();
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('strips spaces and letters typed into Card Scheme ID, SVC Card Number, and Account Number', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('e.g. 12345'), { target: { value: '1 111a11' } });
        fireEvent.change(screen.getByPlaceholderText('Enter to replace (16 digits)'), {
            target: { value: '1234 5678 abcd 9012' },
        });
        fireEvent.change(screen.getByPlaceholderText('Account number'), {
            target: { value: '12 34 ab 56' },
        });

        expect(screen.getByPlaceholderText('e.g. 12345')).toHaveValue('111111');
        expect(screen.getByPlaceholderText('Enter to replace (16 digits)')).toHaveValue('123456789012');
        expect(screen.getByPlaceholderText('Account number')).toHaveValue('123456');
    });

    it('rejects a Card Scheme ID with fewer than 4 digits', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('e.g. 12345'), { target: { value: '1' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(screen.getByText('Card scheme ID must be at least 4 digits.')).toBeInTheDocument()
        );
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it.each([
        ['a', 'Enter at least 2 characters.'],
        [' ab', 'Remove the leading or trailing spaces.'],
        ['ab ', 'Remove the leading or trailing spaces.'],
        ['ab  cd', 'Remove the consecutive spaces.'],
        ['abc123', "Only letters, spaces, and ' - & . are allowed."],
    ])('rejects Beneficiary Name %j with "%s"', async (value, message) => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Account holder name'), { target: { value } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument());
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('rejects a Bank Address containing disallowed special characters', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Bank branch address'), { target: { value: '@@invalid@@' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() =>
            expect(
                screen.getByText('Only letters, numbers, spaces, and , . / # : - are allowed.')
            ).toBeInTheDocument()
        );
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('rejects a Payment Reference that is a single character', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Payment reference / remark'), { target: { value: 'a' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(screen.getByText('Enter at least 2 characters.')).toBeInTheDocument());
        expect(updateCorporateCardApplication).not.toHaveBeenCalled();
    });

    it('accepts valid free-text values and saves successfully', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Account holder name'), {
            target: { value: "O'Brien & Sons" },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(updateCorporateCardApplication).toHaveBeenCalled());
        expect(screen.queryByText(/are allowed\.$/)).not.toBeInTheDocument();
    });

    it('saves without a svcCardNumber when none was entered, and shows the update toast on success', async () => {
        const onSaved = vi.fn();
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={onSaved} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(updateCorporateCardApplication).toHaveBeenCalled());
        const [, , corporateId, payload] = (updateCorporateCardApplication as Mock).mock.calls[0];
        expect(corporateId).toBe(42);
        expect(payload).not.toHaveProperty('svcCardNumber');
        expect(payload.virtualAccount.accountNumber).toBe('1234567890');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ payload: expect.objectContaining({ description: 'Application updated.' }) })
        );
        expect(onSaved).toHaveBeenCalled();
    });

    it('includes svcCardNumber in the payload when a new one is entered', async () => {
        render(<ManageApplicationDrawer open mode="edit" row={baseRow} onClose={vi.fn()} onSaved={vi.fn()} />);
        await waitFor(() => expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('Enter to replace (16 digits)'), {
            target: { value: '9876543210123456' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(updateCorporateCardApplication).toHaveBeenCalled());
        const [, , , payload] = (updateCorporateCardApplication as Mock).mock.calls[0];
        expect(payload.svcCardNumber).toBe('9876543210123456');
    });
});
