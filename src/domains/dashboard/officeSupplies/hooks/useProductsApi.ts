import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getProductList, triggerCitySearch } from '../api/product';
import { ProductCardProps, ProductFilters, ProductListResponse } from '../types/products';
import { mapProductsWithImages } from '../utils/mapProductCard';

/**
 * Fetch ONDC products for a city.
 *
 * - Same city, page/filter/search change: a single product fetch.
 * - City just changed (e.g. confirming a new spot on the map): always fire a
 *   fresh ONDC search first — an explicit location pick is a strong signal
 *   the catalog should be current, not just whatever's cached — then fetch
 *   products once. Same for a city with an empty cache (page 1, no search),
 *   even if it didn't just change. Search blocks until the first on_search
 *   webhook or a timeout; no periodic polling either way.
 *
 * `isFetchingCity` covers the search-and-refetch window; both loading flags are
 * always cleared afterwards (no lingering spinner).
 */
export function useProductsApi(
    city: string | undefined,
    currentPage: number,
    pageSize: number,
    searchText: string,
    localCategory?: string,
    filters?: ProductFilters
) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [products, setProducts] = useState<ProductCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCity, setIsFetchingCity] = useState(false);
    const [count, setCount] = useState<number>(0);
    // Increments each time an ONDC city search completes (fresh catalog).
    const [citySearchTick, setCitySearchTick] = useState(0);

    const userId = id;
    const userType = role;

    // stable key so the effect re-runs when any filter changes
    const filtersKey = JSON.stringify(filters || {});

    // latest params for the async closures without re-subscribing the effect
    const paramsRef = useRef({ currentPage, pageSize, searchText, localCategory, filters });
    paramsRef.current = { currentPage, pageSize, searchText, localCategory, filters };

    // Initialized to the mount-time city so the very first run is never
    // mistaken for a "just changed" city (e.g. a city restored from
    // localStorage shouldn't force a search on every app load).
    const prevCityRef = useRef(city);

    // Pure fetch — deliberately does NOT touch React state itself. It used to
    // call setProducts/setCount directly the moment its response arrived, with
    // no awareness of whether that particular call had since been superseded
    // (e.g. the user switched category again before it resolved) — so a slow,
    // now-stale response could land AFTER a newer one and silently overwrite
    // the correct, freshly-loaded products. Callers apply the result via
    // applyProductData, gated on their own `cancelled` flag.
    const fetchOnce = useCallback(async () => {
        const {
            currentPage: page,
            pageSize: size,
            searchText: text,
            localCategory: category,
            filters: f,
        } = paramsRef.current;
        return getProductList({
            userId,
            userType,
            city: city || '',
            limit: size,
            offset: (page - 1) * size,
            search: text || '',
            localCategory: category || undefined,
            priceMax: f?.priceMax,
            minDiscount: f?.minDiscount,
            sellers: f?.sellers?.length ? f.sellers.join(',') : undefined,
        });
    }, [userId, userType, city]);

    const applyProductData = (data: ProductListResponse | false) => {
        if (data) {
            setProducts(mapProductsWithImages(data.rows));
            setCount(data.count || 0);
        } else {
            // Failed fetch: clear instead of keeping the previous city's products.
            setProducts([]);
            setCount(0);
        }
    };

    useEffect(() => {
        if (!city) {
            setProducts([]);
            setCount(0);
            setIsLoading(false);
            setIsFetchingCity(false);
            prevCityRef.current = city;
            return undefined;
        }

        const cityJustChanged = prevCityRef.current !== city;
        prevCityRef.current = city;

        let cancelled = false;

        const run = async () => {
            setIsLoading(true);
            // A run that gets superseded mid-way through its OWN city-search
            // branch below can't safely reset this in its cleanup (that would
            // race a newer run legitimately using it) — so if that newer run
            // never needs the same branch itself, isFetchingCity is left
            // stuck at true forever with nothing left to clear it. Every fresh
            // run starts clean and re-derives whether IT needs it, below.
            setIsFetchingCity(false);
            let data: ProductListResponse | false = false;
            try {
                data = await fetchOnce();
            } finally {
                if (!cancelled) setIsLoading(false);
            }
            // Superseded by a newer category/page/filter/city change while this
            // was in flight — its data belongs to a request nobody wants
            // anymore, so it must never reach setProducts/setCount.
            if (cancelled) return;
            applyProductData(data);

            const { currentPage: page, searchText: text } = paramsRef.current;
            const isEmptyCity = data && data.count === 0 && !text && page === 1;
            if (!cityJustChanged && !isEmptyCity) return;

            // City just changed, or its cache is empty: search once (blocks
            // until first webhook / timeout), then fetch products once.
            // finally{} guarantees the spinner clears.
            setIsFetchingCity(true);
            try {
                await triggerCitySearch({ userId, userType, city });
                if (cancelled) return;
                const refreshed = await fetchOnce();
                if (!cancelled) {
                    applyProductData(refreshed);
                    // Signal that the catalog was (re)populated — dependent data
                    // fetched before the search (e.g. the Top Deals sections) must
                    // be re-read.
                    setCitySearchTick(t => t + 1);
                }
            } finally {
                if (!cancelled) setIsFetchingCity(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [city, currentPage, pageSize, searchText, localCategory, filtersKey, userId, userType, fetchOnce]);

    return { data: products, isLoading, isFetchingCity, count, citySearchTick };
}
