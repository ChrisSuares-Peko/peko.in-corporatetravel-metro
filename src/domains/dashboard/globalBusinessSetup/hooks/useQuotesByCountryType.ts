import { useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getPlanPricing, getProviders } from '../api/globalBusinessSetup';
import { Provider } from '../types/globalBusinessSetup';
import { PricingType } from '../types/pricing';

export type Quote = {
    id: string;
    provider: Provider;
    freezone: string;
    freezoneLabel: string;
    pricings: PricingType[];
    displayPrice: number;
    displayPackageName: string;
    includedActivities: number;
    includedShareholders: number;
};

type FreezoneOption = { value: string; label: string };

export const useQuotesByCountryType = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(false);
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const fetchQuotes = async (country: string, type: string, freezones: FreezoneOption[]) => {
        setLoading(true);

        // Comma-join the active freezones (already filtered to is_active=true
        // upstream in `useCountries`). For freezone-less countries the BE
        // strips the freezone= clause when the value is empty.
        const freezoneCsv = (freezones ?? [])
            .map(f => f.value)
            .filter(Boolean)
            .join(',');

        // Single providers call — vendor's pattern.
        const providersRes = await getProviders({
            country,
            company_type: type,
            freezone: freezoneCsv,
            userId: id,
            userType: role,
        });
        // Defensive: drop inactive providers before rendering aggregated quotes.
        const providers: Provider[] = ((providersRes?.providers as Provider[]) || []).filter(
            (p: Provider) => p.is_active === true
        );

        // Per-provider pricing fetch using each provider's own embedded scope.
        // Falls back to the form's values when a provider record doesn't carry
        // the field.
        const enriched = await Promise.all(
            providers.map(async provider => {
                const pCountry = provider.country?._id ?? country;
                const pType = provider.company_type ?? type;
                const pFreezone = provider.freezone ?? '';

                const pricingRes = await getPlanPricing({
                    userId: id,
                    userType: role,
                    country: pCountry,
                    company_type: pType,
                    freezone: pFreezone,
                });
                // Defensive: drop inactive pricing rows; the empty-state card
                // already handles a provider that ends up with zero pricings.
                const pricing: PricingType[] = ((pricingRes as PricingType[] | false) || [])
                    .filter(p => p.status === 'active')
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                return { provider, freezone: pFreezone, pricing };
            })
        );

        // Pull the headline price out of a pricing record, honouring the
        // record's `pricing_model`:
        //   - fixed:  first fixed_packages[].price (the only entry for single
        //             plans, or the base for plans with size variants)
        //   - table:  visa_table[String(min_visas)] (cheapest configured row)
        //   - tiered: license (base license fee, before tier add-ons)
        const computeDisplayPrice = (p?: PricingType): number => {
            if (!p) return 0;
            if (p.pricing_model === 'fixed') {
                return p.fixed_packages?.[0]?.price ?? 0;
            }
            if (p.pricing_model === 'table') {
                const key = String(p.min_visas ?? 0);
                return p.visa_table?.[key] ?? 0;
            }
            if (p.pricing_model === 'tiered') {
                return p.license ?? 0;
            }
            return 0;
        };

        const combined: Quote[] = enriched.map(({ provider, freezone, pricing }) => {
            const firstPricing = pricing[0];
            const displayPrice = computeDisplayPrice(firstPricing);
            const freezoneLabel = (freezones ?? []).find(f => f.value === freezone)?.label ?? '';

            return {
                id: `${provider._id}-${freezone}`,
                provider,
                freezone,
                freezoneLabel,
                pricings: pricing,
                displayPrice,
                displayPackageName: firstPricing?.name ?? '',
                includedActivities: firstPricing?.included_activities ?? 0,
                includedShareholders: firstPricing?.included_shareholders ?? 0,
            };
        });

        setQuotes(combined);
        setLoading(false);
    };

    const clearQuotes = () => setQuotes([]);

    return { quotes, loading, fetchQuotes, clearQuotes };
};
