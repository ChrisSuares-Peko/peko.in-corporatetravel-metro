import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getOfficeSupplySections } from '../api/product';
import { OfficeSupplySectionsResponse, ProductCardProps } from '../types/products';
import { mapProductsWithImages } from '../utils/mapProductCard';

const EMPTY: ProductCardProps[] = [];

/**
 * Fetch the curated storefront rows (Top Deals / Top Rated / Frequently Bought)
 * for a city in one call. `topRated` and `frequentlyBought` are empty until the
 * backend has rating / order data — callers should hide an empty section.
 *
 * All Products is intentionally NOT handled here: that grid keeps using
 * `useProductsApi` so its ONDC city-search trigger, pagination, search and
 * category filtering stay intact.
 */
export function useOfficeSupplySections(city: string | undefined) {
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const [topDeals, setTopDeals] = useState<ProductCardProps[]>(EMPTY);
    const [topRated, setTopRated] = useState<ProductCardProps[]>(EMPTY);
    const [frequentlyBought, setFrequentlyBought] = useState<ProductCardProps[]>(EMPTY);
    const [isLoading, setIsLoading] = useState(false);

    const getSections = useCallback(async () => {
        // Clear up-front so a city switch (or a failed fetch) never leaves the
        // previous city's rows on screen.
        setTopDeals(EMPTY);
        setTopRated(EMPTY);
        setFrequentlyBought(EMPTY);
        if (!city) return;

        setIsLoading(true);
        const data: OfficeSupplySectionsResponse | false = await getOfficeSupplySections({
            userId: id,
            userType: role,
            city,
        });

        if (data) {
            setTopDeals(mapProductsWithImages(data.topDeals));
            setTopRated(mapProductsWithImages(data.topRated));
            setFrequentlyBought(mapProductsWithImages(data.frequentlyBought));
        }
        setIsLoading(false);
    }, [city, id, role]);

    useEffect(() => {
        getSections();
    }, [getSections]);

    // `refetch` lets the caller re-read the sections after the ONDC city
    // search populates a fresh city's catalog (the city-keyed fetch above runs
    // ~30s before that data exists).
    return { topDeals, topRated, frequentlyBought, isLoading, refetch: getSections };
}
