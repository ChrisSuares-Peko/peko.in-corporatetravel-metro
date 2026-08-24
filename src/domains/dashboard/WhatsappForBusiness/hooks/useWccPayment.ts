import { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { accessKeys } from '@utils/accessKeys';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import GetSurcharge from './useSurchargeApi';
import { setPaymentData } from '../../payments/slices/payment';
import { resetWhatsappBusinessState } from '../slices/paymentSlice';

export default function useWccPayment() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { getSurchargeData } = GetSurcharge();

    const handleSubmission = useCallback(
        async (amount: string, projectId: string) => {
            const surchargeData = await getSurchargeData(amount);

            const total =
                (amount ? parseFloat(amount) : 0) +
                (surchargeData?.surcharge ? parseFloat(surchargeData.surcharge) : 0);

            const billSummary = [
                {
                    key: 'Service Name',
                    value: 'WhatsApp for Business',
                },
                {
                    key: 'Amount',
                    value: formatNumberWithLocalString(amount),
                },
            ];

            const paymentSummary = [
                {
                    key: 'Platform fee (inclusive of GST)',
                    value: `₹ ${formatNumberWithLocalString(surchargeData?.surcharge ?? 0)}`,
                },
            ];

            const requestBody = {
                amount,
                project_id: projectId,
                accessKey: accessKeys.whatsappBasic,
                currentUrl: window.location.href,
            };

            dispatch(
                setPaymentData({
                    billSummary,
                    paymentSummary,
                    totalAmount: total,
                    title: 'Bill Summary',
                    payload: requestBody,
                    url: 'officeAndBusiness/whatsapp-business/payment',
                    earningCashbackAmount: Number(surchargeData?.corporateCashback) || 0,
                })
            );

            navigate(paths.dashboard.payments);
            dispatch(resetWhatsappBusinessState());
        },
        [dispatch, navigate, getSurchargeData]
    );

    return { handleSubmission };
}
