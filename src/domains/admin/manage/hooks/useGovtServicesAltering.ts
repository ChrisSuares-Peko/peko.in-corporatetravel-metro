import { useCallback, useState } from 'react';

import { SuccessGenericResponse } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';

import { createGovtService, updateGovtService } from '../api/govtServicesApi';
import { GovtService, GovtServiceRequest } from '../types/govtServicesTypes';

const useGovtServicesAltering = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const createService = useCallback(
        async (payload: GovtServiceRequest) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<GovtService> | false = await createGovtService({
                userId: id,
                userType: role,
                ...payload,
            });
            setIsLoading(false);
            return data;
        },
        [id, role]
    );

    const updateService = useCallback(
        async (payload: GovtServiceRequest) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<GovtService> | false = await updateGovtService({
                userId: id,
                userType: role,
                ...payload,
            });
            setIsLoading(false);
            return data;
        },
        [id, role]
    );

    return { isLoading, createService, updateService };
};

export default useGovtServicesAltering;
