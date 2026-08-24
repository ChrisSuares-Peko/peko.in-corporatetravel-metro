import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getPlans } from '../api/index';
import { DataOptions } from '../types/eSIM';

export default function useGetOrderDetails(country: string) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isPlanLoading, setIsLoading] = useState(true);
    const [plans, setPlans] = useState<DataOptions>();

    const getPlansApi = useCallback(async () => {
        const selectedCountry = country;
        if (!selectedCountry) return;
        setIsLoading(true);
        const data = await getPlans({
            userId: id,
            userType: role,
            country,
        });
        if (data) {
            setPlans(data);
            setIsLoading(false);
        }
        setIsLoading(false);
    }, [country, id, role]);

    useEffect(() => {
        getPlansApi();
    }, [getPlansApi]);

    return { isPlanLoading, plans };
}
