import { useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getEcommerceSellers } from '../api/cityList';

/** Distinct seller names for a city (Filters sidebar → Seller group). */
export function useSellers(city: string | undefined) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [sellers, setSellers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!city) {
            setSellers([]);
            return undefined;
        }
        let cancelled = false;
        setIsLoading(true);
        getEcommerceSellers({ userId: id, userType: role, city })
            .then(list => {
                if (!cancelled) setSellers(list || []);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [city, id, role]);

    return { sellers, isLoading };
}
