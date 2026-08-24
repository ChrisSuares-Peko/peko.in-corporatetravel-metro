import { useCallback, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getValuationPriceRange } from '../api/index';
import { PriceBand, ValuationFormValues } from '../types/index';

// Fetches the Droom OBV price bands for a filled-in valuation form.
//
// The result is never rendered before payment — the bands ARE the paid product. This
// runs once at submit, purely so the order is recorded against the price Droom quoted
// at that moment; the user first sees them on the order detail, after paying.
const useValuationEstimate = () => {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEstimate = useCallback(
        async (values: ValuationFormValues): Promise<PriceBand[] | null> => {
            setIsLoading(true);
            const bands = await getValuationPriceRange({
                userId,
                userType,
                make: values.make,
                model: values.model,
                year: values.manufacturingYear,
                // Droom calls the catalog's trim level `trim`; the form field is `variant`.
                trim: values.variant,
                kmsDriven: values.kilometresDriven,
                city: values.city,
                purpose: values.purpose,
                counterparty: values.counterparty,
            });
            setIsLoading(false);

            // `false` means the request failed — the ApiClient interceptor has already
            // toasted why, and the caller must not take payment for a report we could
            // not produce.
            return bands || null;
        },
        [userId, userType]
    );

    return { isLoading, fetchEstimate };
};

export default useValuationEstimate;
