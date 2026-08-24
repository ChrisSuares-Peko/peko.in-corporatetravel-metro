import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { getPaymentMethodsApi } from '../../api/paymentMethods';
import {
    FilterType,
    PaymentMethod,
    PaymentMethodsResponse,
    PaymentMethodsState,
} from '../../types/paymentMethods';

export default function useGetPaymentMethods(filter: FilterType) {
    const [switchStates, setSwitchStates] = useState<PaymentMethodsState>({
        isGatewayPaymentAvailable: false,
        isWalletPaymentAvailable: false,
        isCouponApplicable: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [tableData, setTableData] = useState<PaymentMethod[]>();
    const [count, setCount] = useState<number>(1);
    const [refresh, setRefresh] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const fetchInitialValues = useCallback(async () => {
        setIsLoading(true);

        const response: PaymentMethodsResponse | false = await getPaymentMethodsApi({
            userId: id,
            userType: role,
            ...filter,
        });
        if (response) {
            setSwitchStates(response.paymentMethods);
            setTableData(response.data.rows);
            setCount(response.data.recordsTotal);
        }
        setIsLoading(false);
        setRefresh(false);
    }, [id, role, filter]);

    useEffect(() => {
        fetchInitialValues();
    }, [fetchInitialValues, refresh]);

    const onChange = (key: keyof PaymentMethodsState) => (checked: boolean) => {
        setSwitchStates(prevState => {
            const updatedState = { ...prevState, [key]: checked };

            // Ensure Coupon Applicable can only be turned on when Card Payment is available
            if (key === 'isGatewayPaymentAvailable' && !checked) {
                updatedState.isCouponApplicable = false;
            }

            if (key === 'isCouponApplicable' && !prevState.isGatewayPaymentAvailable) {
                dispatch(
                    showToast({
                        description: `Coupons can only be applied when the payment option is enabled. Please enable card payments to use a coupon.`,
                        variant: 'info',
                    })
                );
                return prevState; // Prevent toggling Coupon Applicable if Payment is off
            }

            return updatedState;
        });
    };

    return { switchStates, tableData, count, onChange, isLoading, setRefresh };
}
