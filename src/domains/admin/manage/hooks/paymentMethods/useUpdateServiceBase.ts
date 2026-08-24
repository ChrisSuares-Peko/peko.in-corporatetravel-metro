import { useCallback, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import {
    createPaymentMethodsByService,
    updatePaymentMethodsByService,
} from '../../api/paymentMethods';
import {
    CreatePGMethodsByService,
    EditPGMethodsByService,
    CreatePGMethodsByServiceResponse,
} from '../../types/paymentMethods';

type Props = {
    handleCancel: () => void;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

const useUpdatePaymentMethodsApi = ({ handleCancel, setRefresh }: Props) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const createNewPgMethodsByService = useCallback(
        async (payload: CreatePGMethodsByService) => {
            setIsLoading(true);
            payload.partnerId = payload.partnerId === 'default' ? null : payload.partnerId;

            const data: CreatePGMethodsByServiceResponse | false =
                await createPaymentMethodsByService({
                    userId: id,
                    userType: role,
                    ...payload,
                });
            if (data) {
                handleCancel();
                setRefresh(true);
                dispatch(
                    showToast({
                        description: `Payment method created successfully`,
                        variant: 'success',
                    })
                );
            }
            setIsLoading(false);
        },
        [id, role, dispatch, handleCancel, setRefresh]
    );

    const updatePgMethodsByService = useCallback(
        async (payload: EditPGMethodsByService) => {
            setIsLoading(true);
            payload.partnerId = payload.partnerId === 'default' ? null : payload.partnerId;

            const data: {} | false = await updatePaymentMethodsByService({
                userId: id,
                userType: role,
                ...payload,
            });
            if (data) {
                handleCancel();
                setRefresh(true);
                dispatch(
                    showToast({
                        description: `Payment method updated successfully`,
                        variant: 'success',
                    })
                );
            }
            setIsLoading(false);
        },
        [id, role, dispatch, handleCancel, setRefresh]
    );

    return { isLoading, createNewPgMethodsByService, updatePgMethodsByService };
};

export default useUpdatePaymentMethodsApi;
