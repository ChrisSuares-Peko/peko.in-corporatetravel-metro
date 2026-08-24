import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { setPaymentData } from '../../../payments/slices/payment';
import useVerificationPayment from '../../hooks/useVerificationPayment';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('@src/hooks/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

vi.mock('../../../payments/slices/payment', () => ({
    setPaymentData: vi.fn((payload: any) => ({ type: 'payment/setPaymentData', payload })),
}));

describe('useVerificationPayment Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('dispatches the payment payload and navigates to the review order page', async () => {
        const { result } = renderHook(() => useVerificationPayment(10, 5));

        await act(async () => {
            await result.current.handleSubmission();
        });

        expect(setPaymentData).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Verification Suite',
                totalAmount: 50,
                payload: expect.objectContaining({
                    accessKey: 'verification_suite',
                    quantity: 10,
                    amount: 50,
                }),
            })
        );
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/verification-suite/review-order');
        expect(result.current.loading).toBe(false);
    });
});
