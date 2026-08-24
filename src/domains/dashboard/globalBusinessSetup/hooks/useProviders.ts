import { useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getPlanPricing, getProviders } from '../api/globalBusinessSetup';
import { CountryDataValues, Provider } from '../types/globalBusinessSetup';
import { PricingType } from '../types/pricing';

export const useProviders = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [pricing, setPricing] = useState<PricingType[]>([]);
    const [loading, setLoading] = useState(false);
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const fetchProviders = async (countryData: CountryDataValues) => {
        setLoading(true);
        // Freezone is optional — most countries don't supply freezones for
        // their company types. Forward empty string so request URLs don't
        // include `freezone=undefined`.
        const freezone = countryData.freezone || '';
        const [res, pricingRes] = await Promise.all([
            getProviders({
                country: countryData.country,
                company_type: countryData.type,
                freezone,
                userId: id,
                userType: role,
            }),
            getPlanPricing({
                userId: id,
                userType: role,
                freezone,
                country: countryData.country,
                company_type: countryData.type,
            }),
        ]);
        // Defensive: drop any inactive provider/pricing records before display
        // so downstream renderers (DetailView, BasePackagePicker, EstimatedQuote)
        // never surface entries the vendor has deactivated.
        const allProviders: Provider[] = res?.providers || [];
        const allPricing: PricingType[] = (pricingRes as PricingType[]) || [];
        setProviders(allProviders.filter(p => p.is_active === true));
        const activePricing = allPricing
            .filter(p => p.status === 'active')
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setPricing(activePricing);
        setLoading(false);
    };

    const clearProviders = () => {
        setProviders([]);
        setPricing([]);
    };

    return { providers, pricing, loading, fetchProviders, clearProviders };
};
