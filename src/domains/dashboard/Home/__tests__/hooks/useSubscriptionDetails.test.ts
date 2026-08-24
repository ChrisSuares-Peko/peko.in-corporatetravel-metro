import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { useAppSelector } from '@src/hooks/store';

import { cancelSubscriptionPlanPatch, fetchPekoPlusDetails } from '../../api';
import useSubscriptionDetails from '../../hooks/useSubscriptionDetails';

vi.mock('@src/hooks/store', () => ({
    useAppSelector: vi.fn(),
}));

vi.mock('../../api', () => ({
    fetchPekoPlusDetails: vi.fn(),
    cancelSubscriptionPlanPatch: vi.fn(),
}));

const mockFetch = fetchPekoPlusDetails as Mock;
const mockCancel = cancelSubscriptionPlanPatch as Mock;

const mockUser = (accountType?: 'freelancer' | 'corporate') => {
    (useAppSelector as Mock).mockImplementation((selector: (state: any) => any) =>
        selector({ reducer: { user: { user: accountType ? { accountType } : {} } } })
    );
};

describe('useSubscriptionDetails', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should fetch plan details for a corporate user', async () => {
        mockUser('corporate');
        const resp = { isPurchased: true, previousSubscription: { id: 1 } };
        mockFetch.mockResolvedValue(resp);

        const { result } = renderHook(() => useSubscriptionDetails());

        await waitFor(() => {
            expect(result.current.subscriptionDetails).toEqual(resp);
        });
        expect(mockFetch).toHaveBeenCalled();
    });

    it('should treat a freelancer as already purchased and skip the fetch', async () => {
        mockUser('freelancer');

        const { result } = renderHook(() => useSubscriptionDetails());

        expect(result.current.subscriptionDetails.isPurchased).toBe(true);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should default isPurchased to false for a corporate user', () => {
        mockUser('corporate');
        mockFetch.mockResolvedValue(false);

        const { result } = renderHook(() => useSubscriptionDetails());

        expect(result.current.subscriptionDetails.isPurchased).toBe(false);
    });

    it('should cancel a subscription and refresh details on success', async () => {
        mockUser('corporate');
        mockFetch.mockResolvedValue({ isPurchased: true, previousSubscription: null });
        mockCancel.mockResolvedValue({ message: 'Cancelled' });

        const { result } = renderHook(() => useSubscriptionDetails());

        let returnValue: boolean | undefined;
        await act(async () => {
            returnValue = await result.current.handleCancelSubscriptionPlan(123);
        });

        expect(mockCancel).toHaveBeenCalledWith(123);
        expect(returnValue).toBe(true);
    });

    it('should return false when cancellation fails', async () => {
        mockUser('corporate');
        mockFetch.mockResolvedValue({ isPurchased: true, previousSubscription: null });
        mockCancel.mockResolvedValue(false);

        const { result } = renderHook(() => useSubscriptionDetails());

        let returnValue: boolean | undefined;
        await act(async () => {
            returnValue = await result.current.handleCancelSubscriptionPlan(123);
        });

        expect(returnValue).toBe(false);
    });
});
