import { useState } from 'react';

import { useAppDispatch } from '@src/hooks/hooks';
import { useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { createNupayPaymentLinkApi } from '../../api/invoices';
import { SendPaymentLinkFormValues } from '../../types/CollectPayment';

const EXPIRY_TO_MINUTES: Record<string, number> = {
    '5m': 5,
    '10m': 10,
    '1h': 60,
    '6h': 360,
    '12h': 720,
    '24h': 1440,
};

const useSendPaymentLink = (invoiceId?: string) => {
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const generatePaymentLink = async (
        values: SendPaymentLinkFormValues,
        onSuccess: (values: SendPaymentLinkFormValues, paymentLink: string) => void
    ) => {
        setIsLoading(true);

        const expiryMinutes = values.linkExpiry ? EXPIRY_TO_MINUTES[values.linkExpiry] ?? 60 : 60;
        const resp = await createNupayPaymentLinkApi({
            userId,
            userType,
            amount: values.amount,
            expiry_time: String(expiryMinutes),
            customerName: values.customerName || undefined,
            customerPhone: values.customerPhone || undefined,
            invoiceId,
        });
        setIsLoading(false);
        if (resp && resp.status && resp.data?.paymentLink) {
            onSuccess(values, resp.data.paymentLink);
        } else {
            dispatch(showToast({
                description: (resp && resp.message) || 'Failed to create payment link.',
                variant: 'error',
            }));
        }
    };

    return { generatePaymentLink, isLoading };
};

export default useSendPaymentLink;
