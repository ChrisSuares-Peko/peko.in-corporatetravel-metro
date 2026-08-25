import { useEffect, useState } from 'react';

import { getMetroCities } from '../api';
import { MetroCity } from '../types/metro';

export default function useMetroCities() {
    const [cities, setCities] = useState<MetroCity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        getMetroCities().then(data => {
            if (isMounted) {
                setCities(data);
                setIsLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return { cities, isLoading };
}
