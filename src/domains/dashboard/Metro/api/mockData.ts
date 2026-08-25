// Placeholder city/station data for the Metro prototype.
// Replace with a real backend response shape once an API exists — `getMetroCities`
// / `getMetroStations` in `./index.ts` are the only place that needs to change.

import { MetroCity, MetroStation } from '../types/metro';

export const MOCK_CITIES: MetroCity[] = [
    { id: 'delhi', name: 'Delhi' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'bangalore', name: 'Bangalore' },
];

export const MOCK_STATIONS: MetroStation[] = [
    // Delhi
    { id: 'del-rajiv-chowk', cityId: 'delhi', name: 'Rajiv Chowk' },
    { id: 'del-kashmere-gate', cityId: 'delhi', name: 'Kashmere Gate' },
    { id: 'del-hauz-khas', cityId: 'delhi', name: 'Hauz Khas' },
    { id: 'del-dwarka-sec-21', cityId: 'delhi', name: 'Dwarka Sector 21' },
    { id: 'del-noida-city-centre', cityId: 'delhi', name: 'Noida City Centre' },

    // Mumbai
    { id: 'mum-andheri', cityId: 'mumbai', name: 'Andheri' },
    { id: 'mum-ghatkopar', cityId: 'mumbai', name: 'Ghatkopar' },
    { id: 'mum-versova', cityId: 'mumbai', name: 'Versova' },
    { id: 'mum-dn-nagar', cityId: 'mumbai', name: 'D N Nagar' },
    { id: 'mum-bandra', cityId: 'mumbai', name: 'Bandra' },

    // Bangalore
    { id: 'blr-mg-road', cityId: 'bangalore', name: 'MG Road' },
    { id: 'blr-indiranagar', cityId: 'bangalore', name: 'Indiranagar' },
    { id: 'blr-majestic', cityId: 'bangalore', name: 'Majestic' },
    { id: 'blr-whitefield', cityId: 'bangalore', name: 'Whitefield' },
    { id: 'blr-electronic-city', cityId: 'bangalore', name: 'Electronic City' },
];
