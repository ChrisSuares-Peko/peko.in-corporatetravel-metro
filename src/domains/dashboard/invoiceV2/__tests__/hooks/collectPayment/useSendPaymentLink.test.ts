import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { showToast } from '@src/slices/apiSlice';

import { createNupayPaymentLinkApi } from '../../../api/invoices';
import useSendPaymentLink from '../../../hooks/collectPayment/useSendPaymentLink';

vi.mock('../../../api/invoices', () => ({
    createNupayPaymentLinkApi: vi.fn(),
}));

const dispatchMock = vi.fn();

vi.mock('@src/hooks/hooks', () => ({
    useAppDispatch: () => dispatchMock,
}));

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(() => ({ id: 'user123', role: 'admin' })),
}));

describe('useSendPaymentLink', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call onSuccess with generated payment link', async () => {
        (createNupayPaymentLinkApi as Mock).mockResolvedValue({
            status: true,
            data: { paymentLink: 'https://pay/abc' },
        });

        const { result } = renderHook(() => useSendPaymentLink('inv1'));
        const onSuccess = vi.fn();

        await act(async () => {
            await result.current.generatePaymentLink(
                {
                    amount: '100',
                    linkExpiry: '1h',
                    customerName: 'Arshid',
                    customerPhone: '999',
                } as any,
                onSuccess
            );
        });

        expect(createNupayPaymentLinkApi).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: '100',
                expiry_time: '60',
                customerName: 'Arshid',
                customerPhone: '999',
                invoiceId: 'inv1',
            })
        );
        expect(onSuccess).toHaveBeenCalledWith(expect.any(Object), 'https://pay/abc');
    });

    it('should fallback to 60 minutes when linkExpiry key is unknown', async () => {
        (createNupayPaymentLinkApi as Mock).mockResolvedValue({
            status: true,
            data: { paymentLink: 'https://pay/xyz' },
        });

        const { result } = renderHook(() => useSendPaymentLink());
        await act(async () => {
            await result.current.generatePaymentLink(
                { amount: '100', linkExpiry: 'unknown' } as any,
                vi.fn()
            );
        });

        expect(createNupayPaymentLinkApi).toHaveBeenCalledWith(
            expect.objectContaining({ expiry_time: '60' })
        );
    });

    it('should dispatch error toast when API fails', async () => {
        (createNupayPaymentLinkApi as Mock).mockResolvedValue({ status: false, message: 'nope' });

        const { result } = renderHook(() => useSendPaymentLink());
        await act(async () => {
            await result.current.generatePaymentLink(
                { amount: '100', linkExpiry: '5m' } as any,
                vi.fn()
            );
        });

        expect(dispatchMock).toHaveBeenCalledWith(
            showToast({ description: 'nope', variant: 'error' })
        );
    });

    it('should dispatch generic error toast when API resolves falsy', async () => {
        (createNupayPaymentLinkApi as Mock).mockResolvedValue(false);

        const { result } = renderHook(() => useSendPaymentLink());
        await act(async () => {
            await result.current.generatePaymentLink(
                { amount: '100', linkExpiry: '5m' } as any,
                vi.fn()
            );
        });

        expect(dispatchMock).toHaveBeenCalledWith(
            showToast({ description: 'Failed to create payment link.', variant: 'error' })
        );
    });
});
