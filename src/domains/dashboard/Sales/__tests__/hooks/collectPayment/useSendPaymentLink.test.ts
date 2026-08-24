import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { useAppDispatch } from '@src/hooks/hooks';
import { useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { createNupayPaymentLinkApi } from '../../../api/collectPayment';
import useSendPaymentLink from '../../../hooks/collectPayment/useSendPaymentLink';

vi.mock('@src/hooks/hooks', () => ({ useAppDispatch: vi.fn() }));
vi.mock('@src/hooks/store', () => ({ useAppSelector: vi.fn() }));
vi.mock('@src/slices/apiSlice', () => ({
    showToast: vi.fn(payload => ({ type: 'apiSlice/showToast', payload })),
}));
vi.mock('../../../api/collectPayment', () => ({
    createNupayPaymentLinkApi: vi.fn(),
}));

const mockDispatch = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    (useAppSelector as any).mockReturnValue({ id: 'u', role: 'merchant' });
    (useAppDispatch as any).mockReturnValue(mockDispatch);
});

describe('useSendPaymentLink', () => {
    it('maps preset expiry strings to minutes and calls onSuccess on success', async () => {
        (createNupayPaymentLinkApi as any).mockResolvedValueOnce({
            status: true,
            data: { paymentLink: 'https://peko.in/p/abc' },
        });
        const onSuccess = vi.fn();

        const { result } = renderHook(() => useSendPaymentLink('doc-1'));

        await act(async () => {
            await result.current.generatePaymentLink(
                {
                    amount: '500',
                    linkExpiry: '6h',
                    customerName: 'Acme',
                    customerPhone: '999',
                } as any,
                onSuccess
            );
        });

        expect(createNupayPaymentLinkApi).toHaveBeenCalledWith({
            userId: 'u',
            userType: 'merchant',
            amount: '500',
            expiry_time: '360',
            customerName: 'Acme',
            customerPhone: '999',
            invoiceId: 'doc-1',
        });
        expect(onSuccess).toHaveBeenCalledWith(expect.any(Object), 'https://peko.in/p/abc');
    });

    it('falls back to 60 minutes when linkExpiry is unknown', async () => {
        (createNupayPaymentLinkApi as any).mockResolvedValueOnce({
            status: true,
            data: { paymentLink: 'x' },
        });

        const { result } = renderHook(() => useSendPaymentLink());

        await act(async () => {
            await result.current.generatePaymentLink(
                { amount: '100', linkExpiry: 'mystery' } as any,
                vi.fn()
            );
        });

        expect(createNupayPaymentLinkApi).toHaveBeenCalledWith(
            expect.objectContaining({ expiry_time: '60' })
        );
    });

    it('shows API error message and skips onSuccess on failure', async () => {
        (createNupayPaymentLinkApi as any).mockResolvedValueOnce({ status: false, message: 'bad' });
        const onSuccess = vi.fn();

        const { result } = renderHook(() => useSendPaymentLink('doc-1'));

        await act(async () => {
            await result.current.generatePaymentLink({ amount: '1' } as any, onSuccess);
        });

        expect(showToast).toHaveBeenCalledWith({ description: 'bad', variant: 'error' });
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('shows fallback error when API returns falsy', async () => {
        (createNupayPaymentLinkApi as any).mockResolvedValueOnce(null);

        const { result } = renderHook(() => useSendPaymentLink('doc-1'));

        await act(async () => {
            await result.current.generatePaymentLink({ amount: '1' } as any, vi.fn());
        });

        expect(showToast).toHaveBeenCalledWith({
            description: 'Failed to create payment link.',
            variant: 'error',
        });
    });

    it('omits empty customer fields', async () => {
        (createNupayPaymentLinkApi as any).mockResolvedValueOnce({
            status: true,
            data: { paymentLink: 'x' },
        });

        const { result } = renderHook(() => useSendPaymentLink('doc-1'));

        await act(async () => {
            await result.current.generatePaymentLink(
                { amount: '1', customerName: '', customerPhone: '' } as any,
                vi.fn()
            );
        });

        expect(createNupayPaymentLinkApi).toHaveBeenCalledWith(
            expect.objectContaining({ customerName: undefined, customerPhone: undefined })
        );
    });
});
