import { useState } from 'react';

import { useDispatch } from 'react-redux';

import { useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { updatePaymentMethodsApi } from '../../api/paymentMethods';
import { PaymentMethodsState } from '../../types/paymentMethods';

export default function useUpdatePaymentMethodsApi() {
    const [isLoading, setIsLoading] = useState(false);
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useDispatch();

    const updatePaymentMethods = async (switchStates: PaymentMethodsState) => {
        if (!switchStates) {
            return;
        }
        setIsLoading(true);
        const payload = {
            isCouponApplicable: switchStates.isCouponApplicable ?? false,
            isGatewayPaymentAvailable: switchStates.isGatewayPaymentAvailable ?? false,
            isWalletPaymentAvailable: switchStates.isWalletPaymentAvailable ?? false,
        };

        const response = await updatePaymentMethodsApi({ userId: id, userType: role, ...payload });

        if (response) {
            dispatch(
                showToast({
                    description: `Payment method settings have been updated`,
                    variant: 'success',
                })
            );
        }

        setIsLoading(false);
    };

    return { updatePaymentMethods, isLoading };
}
