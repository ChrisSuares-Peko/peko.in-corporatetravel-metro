import { useState } from 'react';

import { resolveCity, SelectedCity } from '../utils/indianCityStdCodes';

const GPS_TIMEOUT_MS = 8000;

export type CurrentLocationResult =
    | { status: 'ok'; city: SelectedCity; pincode?: string; state?: string }
    | { status: 'denied' }
    | { status: 'error' };

/** Resolve the browser's GPS position to a lat/lng (or null on denial/error). */
export const getPosition = (): Promise<GeolocationPosition | null> =>
    new Promise(resolve => {
        if (!('geolocation' in navigator)) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos => resolve(pos),
            () => resolve(null),
            { timeout: GPS_TIMEOUT_MS, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false }
        );
    });

/**
 * "Use my current location": browser GPS → BigDataCloud reverse-geocode (free,
 * no API key). The detected city always resolves to a valid ONDC
 * "std:<STD_CODE>" — its own code when the name is in the merged std-code
 * index, else its state's anchor city code. Returns a tagged result so the
 * caller can toast appropriately.
 */
export const useCurrentLocation = () => {
    const [isDetecting, setIsDetecting] = useState(false);

    const detect = async (): Promise<CurrentLocationResult> => {
        setIsDetecting(true);
        try {
            const pos = await getPosition();
            if (!pos) return { status: 'denied' };

            const { latitude, longitude } = pos.coords;
            const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (!res.ok) return { status: 'error' };
            const data = await res.json();

            const cityName: string | undefined = data.city || data.locality;
            if (!cityName) return { status: 'error' };

            // Always resolves to a valid std: code — the city's own when the
            // name is in the merged index, else its state's anchor city.
            return {
                status: 'ok',
                city: resolveCity(cityName, data.principalSubdivision),
                pincode: data.postcode || undefined,
                state: data.principalSubdivision || undefined,
            };
        } catch {
            return { status: 'error' };
        } finally {
            setIsDetecting(false);
        }
    };

    return { detect, isDetecting };
};
