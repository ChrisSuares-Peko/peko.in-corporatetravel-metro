import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { getSurcharge } from '@src/services/surcharge';
import { showToast } from '@src/slices/apiSlice';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import useSurchargeDetails from './useSurchargeApi';
import { setPaymentData } from '../../payments/slices/payment';
import { getXoxodayBalance } from '../api/index';
import { GiftCardOrderTypes } from '../types/employee';
import { SurchargeResponse } from '../types/types';

export default function usePayment() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const { surchargeData, isLoading: surchargeLoading } = useSurchargeDetails();


    const { role, id } = useAppSelector(state => state.reducer.auth);
    const itemData = useAppSelector(state => state.reducer.giftcardCheckout.productDetails);
    const formData = useAppSelector(state => state.reducer.giftcardCheckout.formDetails);

    const { product } = formData;
    const amount = product;

    const handleSubmission = useCallback(
        async (values: any) => {
            setLoading(true);
            try {
                const { receiverFirstName, receiverEmail, message, senderName, employee, orderType } =
                    values;

                const giftCardId = itemData.id;
                const number_of_items = formData.quantity;

                const first_name = receiverFirstName;
                const email = receiverEmail;

                const quantity =
                    orderType === GiftCardOrderTypes.BUYFOREMPLOYEE && Array.isArray(employee) && employee.length > 0
                        ? employee.length
                        : parseInt(formData.quantity, 10) || 1;

                let resolvedSurcharge: SurchargeResponse | undefined = surchargeData;
                if (!resolvedSurcharge || surchargeLoading) {
                    const data = await getSurcharge({
                        userId: id,
                        userType: role,
                        amount: parseFloat(amount) || 0,
                        accessKey: itemData.accessKey,
                        quantity,
                    });
                    if (data) resolvedSurcharge = data as SurchargeResponse;
                }

                const baseSurcharge = resolvedSurcharge?.surcharge ? parseFloat(resolvedSurcharge.surcharge) : 0;
                const platformFee = baseSurcharge;

                const total = (amount ? parseFloat(amount) : 0) + platformFee;
                  const serviceDetails = {
                brand_name: itemData.product_name,
                amount: formData.amount,
                mode: orderType,
                quantity: parseFloat(formData.quantity),
            };
            sessionStorage.setItem(
                'service_details',
                JSON.stringify({
                    serviceDetails,
                })
            );


                const billSummary = [
                    { key: 'Service name', value: 'Gift Cards' },
                    { key: 'Gift card name', value: itemData.product_name },
                    { key: 'Quantity', value: formData.quantity },
                    {
                        key: 'Amount',
                        value: formatNumberWithLocalString(amount ?? 0),
                    },
                ];

                const paymentSummary = [
                    {
                        key: 'Platform fee (inclusive of GST)',
                        value: `₹ ${formatNumberWithLocalString(platformFee)}`,
                    },
                ];

                const requestBody = {
                    giftCardId,
                    first_name,
                    email,
                    number_of_items,
                    amount,
                    senderName,
                    message,
                    employee,
                    orderType,
                    accessKey: itemData.accessKey,
                };

                dispatch(
                    setPaymentData({
                        billSummary,
                        paymentSummary,
                        totalAmount: total,
                        title: 'Bill Summary',
                        payload: requestBody,
                        url: 'purchase/giftcards/payment',
                        earningCashbackAmount: Number(resolvedSurcharge?.corporateCashback) || 0,
                        navigatePath: `/${paths.giftcards.index}/${paths.giftcards.details}/${giftCardId}/${paths.giftcards.checkout}`,
                    })
                );

                if (itemData.accessKey === 'xoxoday') {
                    const balanceData = await getXoxodayBalance({
                        userId: id,
                        userType: role,
                        serviceOperatorId: itemData.serviceOperatorId!,
                    });
                    if (balanceData === false) {
                        dispatch(
                            showToast({
                                description: 'Something went wrong while fetching wallet balance.',
                                variant: 'error',
                            })
                        );
                    } else if (balanceData && (balanceData as any).value >= total) {
                        navigate(paths.dashboard.payments);
                    } else {
                        dispatch(
                            showToast({
                                description: 'Insufficient balance. Please add funds and try again.',
                                variant: 'error',
                            })
                        );
                    }
                } else {
                    navigate(paths.dashboard.payments);
                }
            } finally {
                setLoading(false);
            }
        },
        [amount, dispatch, navigate, itemData, formData, surchargeData, surchargeLoading, id, role]
    );

    return { handleSubmission, loading };
}
