import { useCallback, useState } from 'react';

import { SuccessGenericResponse } from '@customtypes/general';
import { useAppSelector } from '@src/hooks/store';

import { createDocument, updateDocument } from '../api/ServiceRules';

const useUpdateServiceRule = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const updateDoc = useCallback(
        async (payload: any) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<Document> | false = await updateDocument({
                userId: id,
                userType: role,
                ...payload,
            });
            if (data) {
                return data;
            }
            setIsLoading(false);
            return false;
        },
        [id, role]
    );
    const createDoc = useCallback(
        async (payload: any) => {
            setIsLoading(true);
            const data: SuccessGenericResponse<Document> | false = await createDocument({
                userId: id,
                userType: role,
                ...payload,
            });
            if (data) {
                return data;
            }
            setIsLoading(false);
            return false;
        },
        [id, role]
    );

    return { isLoading, createDoc, updateDoc };
};

export default useUpdateServiceRule;
