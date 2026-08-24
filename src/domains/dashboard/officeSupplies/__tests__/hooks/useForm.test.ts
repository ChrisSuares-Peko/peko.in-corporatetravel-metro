import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useAppSelector } from '@src/hooks/store';
import { getSurcharge } from '@src/services/surcharge';

import { initOrderApi } from '../../api/cart';
import useForm from '../../hooks/useForm';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

vi.mock('../../api/cart', () => ({ initOrderApi: vi.fn() }));
vi.mock('@src/services/surcharge', () => ({ getSurcharge: vi.fn() }));

vi.mock('../../hooks/useGetBasicInfo', () => ({
    default: () => ({ data: { name: 'Acme Pvt Ltd', email: 'buyer@example.com' } }),
}));
vi.mock('../../hooks/useSurchargeApi', () => ({
    default: () => ({ surchargeData: { surcharge: '11.80', corporateCashback: '5' }, isLoading: false }),
}));

vi.mock('@src/slices/apiSlice', () => ({
    default: (state = {}) => state,
    showToast: vi.fn(payload => ({ type: 'api/showToast', payload })),
}));

const mockDispatch = vi.fn();
vi.mock('@src/hooks/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: vi.fn(),
}));

const validatedGroup = {
    bppId: 'bpp.example.com',
    bppUri: 'https://bpp.example.com',
    providerId: 'P1',
    vendorName: 'Acme Stationery',
    cartItems: [],
    transactionId: 'txn-1',
    status: 'validated',
    quote: null,
};

const initializedGroup = {
    ...validatedGroup,
    status: 'initialized',
    quote: { total: 1040, currency: 'INR', rows: [], items: [], deliveryCharge: 0, otherCharges: 0 },
    payment: {},
};

const address = {
    contactName: 'Asha Rao',
    firstName: 'Asha Rao',
    lastName: '',
    phoneNumber: '9876543210',
    address: '12 MG Road',
    pincode: '560001',
    saveAddress: false,
} as any;

const dispatched = (type: string) =>
    mockDispatch.mock.calls.map(call => call[0]).find(action => action?.type === type);

describe('useForm — checkout handoff to the shared /payments screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as unknown as any).mockImplementation((selectorFn: any) =>
            selectorFn({
                reducer: {
                    auth: { id: 7, role: 'corporate' },
                    cart: {
                        totalGst: 100,
                        cartId: 55,
                        itemsTotalAmount: 1000,
                        shippingCharge: 0,
                        validation: { groups: [validatedGroup], anyValidated: true, validatedTotal: 1000 },
                    },
                },
            })
        );
        (getSurcharge as Mock).mockResolvedValue({ surcharge: '12.26', corporateCashback: '5' });
    });

    it('runs ONDC /init, prices off the initialized total and hands off to /payments', async () => {
        (initOrderApi as Mock).mockResolvedValue({
            groups: [initializedGroup],
            initializedTotal: 1040,
            allInitialized: true,
            anyInitialized: true,
            failedCount: 0,
        });

        const { result } = renderHook(() => useForm());
        await act(async () => {
            await result.current.handleSubmission(address);
        });

        // init reuses the select validation's transaction ids
        expect(initOrderApi).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 7,
                userType: 'corporate',
                pincode: '560001',
                name: 'Asha Rao',
                phone: '9876543210',
                addressLine: '12 MG Road',
                email: 'buyer@example.com',
                groups: [
                    { bppUri: 'https://bpp.example.com', providerId: 'P1', transactionId: 'txn-1' },
                ],
            })
        );

        // the platform fee is re-priced against the amount we are about to charge,
        // so pgAmount matches what the backend's validateAmount recomputes
        expect(getSurcharge).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 1040, accessKey: 'ecommerce' })
        );

        const paymentData = dispatched('payment/setPaymentData');
        expect(paymentData.payload.payload.amount).toBe(1040);
        expect(paymentData.payload.totalAmount).toBe(1052.26);
        expect(paymentData.payload.payload.accessKey).toBe('ecommerce');
        expect(paymentData.payload.payload.isOndc).toBe(true);
        expect(paymentData.payload.url).toBeNull();
        // the seam: the shared engine redirects here once Cashfree settles
        expect(paymentData.payload.successPath).toBe('/office-supplies/placing-order');
        expect(paymentData.payload.payload.successUrl).toBe('/office-supplies/placing-order');
        expect(paymentData.payload.navigatePath).toBe('/office-supplies/cart/checkout');

        expect(dispatched('cart/setInitialization')).toBeTruthy();
        expect(mockNavigate).toHaveBeenCalledWith('/payments');
    });

    it('keeps the buyer on checkout and charges nothing when /init fails for every seller', async () => {
        (initOrderApi as Mock).mockResolvedValue({
            groups: [{ ...validatedGroup, status: 'failed', vendorName: 'Acme Stationery' }],
            initializedTotal: 0,
            allInitialized: false,
            anyInitialized: false,
            failedCount: 1,
        });

        const { result } = renderHook(() => useForm());
        await act(async () => {
            await result.current.handleSubmission(address);
        });

        expect(dispatched('payment/setPaymentData')).toBeUndefined();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(getSurcharge).not.toHaveBeenCalled();
        expect(dispatched('api/showToast')).toBeTruthy();
    });

    it('continues with the sellers that did initialize when only some fail', async () => {
        (initOrderApi as Mock).mockResolvedValue({
            groups: [initializedGroup, { ...validatedGroup, status: 'failed', vendorName: 'Other Seller' }],
            initializedTotal: 1040,
            allInitialized: false,
            anyInitialized: true,
            failedCount: 1,
        });

        const { result } = renderHook(() => useForm());
        await act(async () => {
            await result.current.handleSubmission(address);
        });

        expect(dispatched('payment/setPaymentData')).toBeTruthy();
        expect(mockNavigate).toHaveBeenCalledWith('/payments');
    });
});
