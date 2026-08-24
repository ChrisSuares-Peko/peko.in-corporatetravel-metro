import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { debounce } from 'lodash';

export type PlaceOption = {
    label: string;
    lat: number;
    lng: number;
};

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

/** Keep places whose label (or first segment) starts with the typed query. */
const filterPlacesByPrefix = (items: PlaceOption[], query: string): PlaceOption[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(o => {
        const label = o.label.toLowerCase();
        const head = label.split(',')[0]?.trim() || label;
        return label.startsWith(q) || head.startsWith(q);
    });
};

/**
 * One-off, awaitable geocode of a single place name — for click handlers that
 * need "resolve this now" rather than live-typing suggestions (e.g. the
 * "Locate on map" tab centering on the currently selected city). Not
 * debounced/stateful like useNominatimSearch below; callers firing this
 * repeatedly should debounce themselves.
 */
export async function geocodeFirstMatch(query: string): Promise<{ lat: number; lng: number } | null> {
    const q = query.trim();
    if (!q) return null;
    try {
        const res = await fetch(
            `${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=1`,
            { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : null;
        if (!first) return null;
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        // A malformed/missing coordinate must fall through to the caller's
        // own fallback, not hand back a truthy {NaN, NaN} that defeats it.
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
    } catch {
        return null;
    }
}

/**
 * Debounced free-text place search via OpenStreetMap Nominatim, scoped to
 * India — used by LocationMapStep's search bar to pan the map to a typed
 * area/locality/pincode. Mirrors useCitySearch's 500ms debounce convention.
 */
export function useNominatimSearch() {
    const [options, setOptions] = useState<PlaceOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const runId = useRef(0);
    const abortRef = useRef<AbortController | null>(null);

    const run = useCallback(async (text: string) => {
        const q = text.trim();
        runId.current += 1;
        const thisRun = runId.current;

        abortRef.current?.abort();
        if (!q) {
            setOptions([]);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setIsSearching(true);
        try {
            const res = await fetch(
                `${NOMINATIM_SEARCH_URL}?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=5`,
                { headers: { Accept: 'application/json' }, signal: controller.signal }
            );
            const data = res.ok ? await res.json() : [];

            if (runId.current !== thisRun) return; // a newer keystroke superseded this one

            setOptions(
                filterPlacesByPrefix(
                    (Array.isArray(data) ? data : [])
                        .map((r: { display_name: string; lat: string; lon: string }) => ({
                            label: r.display_name,
                            lat: parseFloat(r.lat),
                            lng: parseFloat(r.lon),
                        }))
                        .filter(o => Number.isFinite(o.lat) && Number.isFinite(o.lng)),
                    q
                )
            );
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') return;
            if (runId.current === thisRun) setOptions([]);
        } finally {
            if (runId.current === thisRun) setIsSearching(false);
        }
    }, []);

    const search = useMemo(() => debounce((text: string) => run(text), 500), [run]);

    useEffect(
        () => () => {
            search.cancel();
            abortRef.current?.abort();
        },
        [search]
    );

    return { options, isSearching, search };
}
