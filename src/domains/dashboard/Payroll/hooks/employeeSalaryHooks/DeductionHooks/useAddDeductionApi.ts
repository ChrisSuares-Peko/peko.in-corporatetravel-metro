import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { addDeduction } from '../../../api/employeeSalaryApi/deductionApi/index';
import { DeductionFormType } from '../../../types/salaryProfileTypes/deductionTypes/index';

export function useAddDeduction(handleCancel?: () => void) {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();

    const deductionAdd = useCallback(
        async (payload: DeductionFormType) => {
            const data = await addDeduction({
                ...payload,
                amountPercentage: Number(payload.amountPercentage),
                userId: id,
                userType: role,
            });

            if (data && data.data) {
                dispatch(
                    showToast({
                        description: data.message,
                        variant: 'success',
                    })
                );
                if (handleCancel) handleCancel();
            }
            return data;
        },
        [id, role, dispatch, handleCancel]
    );

    return { deductionAdd };
}
