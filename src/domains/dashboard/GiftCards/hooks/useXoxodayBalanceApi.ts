import { useCallback, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getXoxodayBalance } from '../api/index';
import { XoxodayBalanceResponse } from '../types/types';

export default function useXoxodayBalance(serviceOperatorId?: number, accessKey?: string) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [balanceData, setBalanceData] = useState<XoxodayBalanceResponse>();
    const [isLoading, setIsLoading] = useState(false);

    const isXoxoday = accessKey === 'xoxoday';

    const fetchBalance = useCallback(async () => {
        if (!isXoxoday || !serviceOperatorId) return;

        setIsLoading(true);
        const data = await getXoxodayBalance({
            userId: id,
            userType: role,
            serviceOperatorId,
        });
        if (data) {
            setBalanceData(data as XoxodayBalanceResponse);
        }
        setIsLoading(false);
    }, [id, role, serviceOperatorId, isXoxoday]);

    return { balanceData, isLoading, fetchBalance };
}
