import { useCallback, useState } from 'react';

import { capitalize } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { accessKeys } from '@utils/accessKeys';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import useCheckProjectExist from './useCheckProjectExist';
import GetSurcharge from './useSurchargeApi';
import { setPaymentData } from '../../payments/slices/payment';
import { resetWhatsappBusinessState } from '../slices/paymentSlice';
import { PlanMode, PlanType } from '../types/index';

export default function useWhatsAppSubscriptionPayment() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { getSurchargeData } = GetSurcharge();
    const { checkProject } = useCheckProjectExist();

    // State to manage the overall loading state
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmission = useCallback(
        async (
            plan: PlanMode | string,
            duration: PlanType | string,
            planId: number,
            discountedAmount: number,
            botBuilderValue: number,
            subscription: any,
            deduction: number | null,
            isRenewal: boolean = false
        ) => {
            try {
                // Set loading to true when starting the process
                setIsLoading(true);

                // Use the checkProject function to determine if the project exists
                const projectPayload = {
                    userId: id,
                    userType: role,
                };

                // Wait for the checkProject to complete
                const isExist = await checkProject(projectPayload);

                // Only proceed if the project exists
                if (isExist) {
                    console.error('Project does not exist');
                    return;
                }

                const amount = `${discountedAmount}`;
                const surchargeData = await getSurchargeData(amount);

                const total =
                    (amount ? parseFloat(amount) : 0) +
                    (surchargeData?.surcharge ? parseFloat(surchargeData.surcharge) : 0) +
                    (botBuilderValue ? parseFloat(botBuilderValue.toString()) : 0) -
                    (deduction ? parseFloat(deduction.toString()) : 0);

                const billSummary = [
                    { key: 'Service name', value: 'WhatsApp for Business' },
                    { key: 'Plan name', value: plan },
                    { key: 'Billing cycle', value: capitalize(duration) },
                    ...(botBuilderValue > 0
                        ? [
                              {
                                  key: 'Add on',
                                  value: `₹ ${new Intl.NumberFormat('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }).format(Number(botBuilderValue))}`,
                              },
                          ]
                        : []),
                    ...(deduction
                        ? [
                              {
                                  key: 'Balance amount',
                                  value: new Intl.NumberFormat('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }).format(Number(deduction)),
                              },
                          ]
                        : []),
                    {
                        key: 'Amount',
                        value: new Intl.NumberFormat('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }).format(Number(amount) ?? 0),
                    },
                ];

                const paymentSummary = [
                    {
                        key: 'Platform fee (inclusive of GST)',
                        value: `₹ ${formatNumberWithLocalString(surchargeData?.surcharge ?? 0)}`,
                    },
                ];

                // Backend splits pgAmount into the plan row (pgAmount - botBuilder) and a
                // separate Bot Builder row, so pgAmount must be the plan + botBuilder total.
                // Sending plan-only made subscriptionAmountPaid go negative when the (yearly)
                // botBuilder cost exceeded the discounted annual plan price.
                const pgAmount = `${parseFloat(amount) + (botBuilderValue > 0 ? Number(botBuilderValue) : 0)}`;

                const requestBody = {
                    amount,
                    pgAmount,
                    ...(botBuilderValue > 0 && { botBuilder: botBuilderValue }),
                    subscriptionPlan: plan,
                    isSubscription: true,
                    ...(subscription && !isRenewal && { isUpgrade: true }),
                    ...(subscription && isRenewal && { isRenewal: true }),
                    ...(subscription && { projectId: subscription.projectId }),
                    subscriptionDuration: duration,
                    packageId: planId,
                    accessKey: accessKeys.whatsappBasic,
                    currentUrl: window.location.href,
                    successUrl: `${paths.dashboard.whatsappForBusiness}/${paths.whatsappForBusiness.paymentsuccess}`,
                    isWhatsAppSubscription: true,
                };

                // Dispatch the payment data to the store
                dispatch(
                    setPaymentData({
                        billSummary,
                        paymentSummary,
                        totalAmount: total,
                        title: 'Bill Summary',
                        payload: requestBody,
                        url: '',
                        earningCashbackAmount: Number(surchargeData?.corporateCashback) || 0,
                    })
                );

                // Navigate to the payments page
                navigate(paths.dashboard.payments);

                // Reset WhatsApp business state after navigation
                dispatch(resetWhatsappBusinessState());
            } catch (error) {
                console.error('Error in handleSubmission:', error);
            } finally {
                // Reset the loading state after the process is complete
                setIsLoading(false);
            }
        },
        [dispatch, navigate, getSurchargeData, checkProject, id, role]
    );

    return { handleSubmission, isLoading };
}
