import { useCallback, useState } from 'react';

import { calculateMetroFare } from '../api';
import { FareBreakdown } from '../types/metro';

export default function useMetroFare() {
    const [isLoading, setIsLoading] = useState(false);

    const getFare = useCallback(
        async (payload: {
            boardingStationId: string;
            dropStationId: string;
            passengerCount: number;
        }): Promise<FareBreakdown> => {
            setIsLoading(true);
            try {
                return await calculateMetroFare(payload);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { getFare, isLoading };
}
