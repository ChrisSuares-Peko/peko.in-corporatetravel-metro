import { useEffect, useState } from 'react';

import { DropDown } from '@customtypes/general';

import { getCountries } from '../../api/employeeApi/index';
import { CountriesResponse } from '../../types/types';

export default function useGeneralApi() {
    const [countriesList, setCountriesList] = useState<DropDown>();
    const [searchQuery, setSearchQuery] = useState<string>();
    const getCountriesList = async (query?: string) => {
        const data: CountriesResponse | false = await getCountries(query);
        if (data) {
            setCountriesList(data.countries);
        }
    };
    useEffect(() => {
        getCountriesList(searchQuery);
    }, [searchQuery]);

    return { countriesList, setSearchQuery };
}
