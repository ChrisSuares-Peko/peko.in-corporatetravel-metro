import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { lookupPostcode } from '../api/cityList';
import { DEFAULT_CITY, resolveCity, type SelectedCity } from '../utils/indianCityStdCodes';

export type GeocodedAddress = {
    displayName: string;
    city: string | null;
    state: string | null;
    pincode: string | null;
    /** City + ONDC `std:<code>` resolved from city/state via resolveCity — always valid. */
    stdCity: SelectedCity;
};

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Reverse-geocodes a lat/lng via OpenStreetMap Nominatim (free, no API key) —
 * pairs with the Leaflet map in LocationMapStep. Stateful (owns `resolved`/
 * `isResolving` itself, rather than returning a bare promise for the caller
 * to juggle) so a fast pan-pan-pan can't let an older in-flight request's
 * response land after and overwrite a newer one: each call aborts whatever
 * request came before it, so only the latest one can ever update state.
 */
export function useReverseGeocode() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [resolved, setResolved] = useState<GeocodedAddress | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const reverseGeocode = useCallback((lat: number, lng: number) => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsResolving(true);
        (async () => {
            try {
                const res = await fetch(
                    `${NOMINATIM_REVERSE_URL}?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                    { headers: { Accept: 'application/json' }, signal: controller.signal }
                );
                if (!res.ok) {
                    setResolved(null);
                    return;
                }
                const data = await res.json();
                if (!data || data.error) {
                    setResolved(null);
                    return;
                }

                const address = data.address || {};
                let city = address.city || address.town || address.village || address.county || null;
                let state = address.state || null;
                const pincode = address.postcode || null;
                let resolvedVia: 'pincode (India Post)' | 'nominatim address' = 'nominatim address';

                // Prefer the pincode -> India Post -> city/state lookup — the
                // same pipeline "search by pincode" already uses
                // (useCitySearch.ts) — over Nominatim's own city/state text,
                // which resolveCity's name matching can miss.
                if (pincode) {
                    const postcodeResult = await lookupPostcode({ userId: id, userType: role, postcode: pincode });
                    // A newer pan may have superseded this call while the
                    // lookup was in flight — that newer call owns the final
                    // state, so leave it alone.
                    if (abortRef.current !== controller) return;
                    if (postcodeResult && postcodeResult.city) {
                        const { city: pincodeCity, state: pincodeState } = postcodeResult;
                        city = pincodeCity;
                        state = pincodeState || state;
                        resolvedVia = 'pincode (India Post)';
                    }
                }

                const cityName = city || state;
                const stdCity = cityName ? resolveCity(cityName, state) : DEFAULT_CITY;

                console.log('[useReverseGeocode] full address', {
                    displayName: data.display_name,
                    address,
                    pincode,
                    resolvedVia,
                    city,
                    state,
                    stdCity,
                });
                setResolved({
                    displayName: data.display_name || '',
                    city,
                    state,
                    pincode,
                    stdCity,
                });
            } catch (err) {
                // AbortError means a newer call superseded this one — that
                // newer call owns the final state, so leave it alone.
                if ((err as Error)?.name === 'AbortError') return;
                setResolved(null);
            } finally {
                if (abortRef.current === controller) setIsResolving(false);
            }
        })();
    }, [id, role]);

    // Abort any still-in-flight request when the owning component unmounts.
    useEffect(() => () => abortRef.current?.abort(), []);

    return { resolved, isResolving, reverseGeocode };
}
