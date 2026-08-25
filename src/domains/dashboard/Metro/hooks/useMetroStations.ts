import { useEffect, useState } from 'react';

import { getMetroStations } from '../api';
import { MetroStation } from '../types/metro';

export default function useMetroStations(cityId: string | null) {
    const [stations, setStations] = useState<MetroStation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!cityId) {
            setStations([]);
            return undefined;
        }

        let isMounted = true;
        setIsLoading(true);
        getMetroStations(cityId).then(data => {
            if (isMounted) {
                setStations(data);
                setIsLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [cityId]);

    return { stations, isLoading };
}
