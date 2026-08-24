import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { accessKeys } from '@utils/accessKeys';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { setPaymentData } from '../../payments/slices/payment';

export default function useVerificationPayment(quantity: number, unitPrice: number) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const amount = quantity * unitPrice;

    const handleSubmission = useCallback(async () => {
        setLoading(true);
        try {
            const total = amount;

            const billSummary = [
                { key: 'Service name', value: 'Verification Suite Add-on' },
                { key: 'Verifications', value: quantity },
                { key: 'Amount', value: formatNumberWithLocalString(amount) },
            ];

            const paymentSummary: { key: string; value: string }[] = [];

            const requestBody = {
                accessKey: accessKeys.verificationSuite,
                quantity,
                amount,
            };

            dispatch(
                setPaymentData({
                    billSummary,
                    paymentSummary,
                    totalAmount: total,
                    title: 'Verification Suite',
                    payload: requestBody,
                    // Placeholder purchase route — swap once the backend endpoint is confirmed.
                    url: 'officeAndBusiness/verification/v2/add-ons/purchase',
                    navigatePath: `${paths.dashboard.verificationSuite}/${paths.verificationSuite.settings}`,
                })
            );

            navigate(`${paths.dashboard.verificationSuite}/${paths.verificationSuite.reviewOrder}`);
        } finally {
            setLoading(false);
        }
    }, [amount, quantity, dispatch, navigate]);

    return { handleSubmission, loading };
}
