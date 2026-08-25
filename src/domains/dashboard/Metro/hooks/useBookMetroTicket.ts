import { useCallback, useState } from 'react';

import { bookMetroQrTicket } from '../api';
import { FareBreakdown, MetroTicket } from '../types/metro';

export default function useBookMetroTicket() {
    const [isLoading, setIsLoading] = useState(false);

    const bookTicket = useCallback(
        async (payload: {
            cityId: string;
            boardingStationId: string;
            boardingStationName: string;
            dropStationId: string;
            dropStationName: string;
            passengerCount: number;
            fare: FareBreakdown;
        }): Promise<MetroTicket> => {
            setIsLoading(true);
            try {
                return await bookMetroQrTicket(payload);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return { bookTicket, isLoading };
}
