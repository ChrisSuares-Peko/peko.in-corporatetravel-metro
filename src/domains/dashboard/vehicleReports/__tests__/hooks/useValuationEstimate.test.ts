import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getValuationPriceRange } from '../../api/index';
import useValuationEstimate from '../../hooks/useValuationEstimate';
import { ValuationFormValues } from '../../types/index';

vi.mock('../../api/index', () => ({
    getValuationPriceRange: vi.fn(),
}));

vi.mock('@src/hooks/store', () => ({
    useAppSelector: (selector: any) =>
        selector({ reducer: { auth: { id: 147, role: 'corporate' } } }),
}));

const values: ValuationFormValues = {
    purpose: 'buy',
    counterparty: 'dealer',
    vehicleCategory: 'car',
    make: 'Kia',
    model: 'Seltos',
    manufacturingYear: '2021',
    variant: 'HTX',
    kilometresDriven: '48000',
    city: 'Jaipur',
};

const bands = [{ grade: 'Excellent', min: 1120000, max: 1185000 }];

describe('useValuationEstimate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('sends the form values under the vendor-facing names', async () => {
        (getValuationPriceRange as any).mockResolvedValue(bands);

        const { result } = renderHook(() => useValuationEstimate());
        await act(async () => {
            await result.current.fetchEstimate(values);
        });

        expect(getValuationPriceRange).toHaveBeenCalledWith({
            userId: 147,
            userType: 'corporate',
            make: 'Kia',
            model: 'Seltos',
            year: '2021',
            // The form calls this `variant`; Droom calls it `trim`.
            trim: 'HTX',
            kmsDriven: '48000',
            city: 'Jaipur',
            purpose: 'buy',
            counterparty: 'dealer',
        });
    });

    it('returns the bands so the caller can carry them into the payment', async () => {
        (getValuationPriceRange as any).mockResolvedValue(bands);

        const { result } = renderHook(() => useValuationEstimate());
        let returned;
        await act(async () => {
            returned = await result.current.fetchEstimate(values);
        });

        expect(returned).toEqual(bands);
    });

    // The caller keys "should we take payment?" off this — a truthy value for a failed
    // request would charge for a report Droom just said it cannot produce.
    it('returns null when the vendor call fails', async () => {
        (getValuationPriceRange as any).mockResolvedValue(false);

        const { result } = renderHook(() => useValuationEstimate());
        let returned;
        await act(async () => {
            returned = await result.current.fetchEstimate(values);
        });

        expect(returned).toBeNull();
    });

    it('is not loading once the request settles, success or failure', async () => {
        (getValuationPriceRange as any).mockResolvedValue(false);

        const { result } = renderHook(() => useValuationEstimate());
        expect(result.current.isLoading).toBe(false);

        await act(async () => {
            await result.current.fetchEstimate(values);
        });

        expect(result.current.isLoading).toBe(false);
    });
});
