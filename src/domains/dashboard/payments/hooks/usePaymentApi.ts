import { useCallback, useEffect, useRef, useState } from 'react';

import { load } from '@cashfreepayments/cashfree-js';
import { FormikProps } from 'formik';
import { useNavigate } from 'react-router-dom';

import { PAYMENT_FAiLURE_URL, PAYMENT_SUCCESS_URL, ENV } from '@src/config-global';
import { PLAN_DETAILS_SESSION_KEY } from '@src/domains/dashboard/plans/utils';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';
import { setUserInfo } from '@src/slices/userSlice';
import { accessKeys } from '@utils/accessKeys';
import { isCCavenueService } from '@utils/ccavenueServices';
import { formatNumberWithLocalString, roundMoney } from '@utils/priceFormat';

import { setVisaOrderNumber } from '../../CorporateTravel/store/visaSlice';
import { postApplyCoupon } from '../../plans/api';
import { ApplyCouponResponse } from '../../plans/types';
import {
    createPaymentLink,
    doWalletPayment,
    createPGTransaction,
    createSubscriptionOrderFromPayments,
    completePGPayment,
    initiateCCavenuePayment,
    // checkAgencyBalanceApi,
} from '../api/index';
import { setPaymentData } from '../slices/payment';
import {
    CardPaymentResponse,
    PaymentMode,
    PaymentResponse,
    UsePaymentApiProps,
} from '../types/index';

const SERVICE_NAME_MAP: Record<string, string> = {
    Airline: 'flight',
    Hotels: 'hotel',
    'Gift Cards': 'giftcard',
    'WhatsApp for Business': 'wa',
    'Mobile Prepaid': 'prepaid',
    'Mobile Postpaid': 'postpaid',
    'Electricity Bill': 'electricity',
    'LPG Cylinder': 'lpg_cylinder',
    'Piped Gas': 'piped_gas',
    'Broadband Bill': 'broadband',
    'Water Bill': 'water',
    'DTH Recharge': 'dth_recharge',
    'FASTag Recharge': 'fastag_recharge',
    'Landline Bill': 'landline',
    'Prepaid Meter': 'prepaid_meter',
    'Domain & Hosting': 'domain',
};

const getMoengageServiceName = (serviceName: string | number | undefined) => {
    const name = String(serviceName ?? '');
    return SERVICE_NAME_MAP[name] || name || 'N/A';
};

// The visa order is finalized by an async webhook that can still be in
// flight when this call lands, so the backend replies "processing" rather
// than with the final orderNumber — retry a few times to give it a chance
// to land before falling back to the generic pending page.
function retryIfPending<T extends { pending?: boolean; processing?: boolean }>(
    fn: () => Promise<T | false>,
    retries = 4,
    delayMs = 1500
): Promise<T | false> {
    return fn().then(res => {
        if (!res || (!res.pending && !res.processing) || retries === 0) return res;
        return new Promise<void>(resolve => setTimeout(resolve, delayMs)).then(() =>
            retryIfPending(fn, retries - 1, delayMs)
        );
    });
}

export default function usePaymentApi({
    setCheckoutJsInstance,
    checkoutJsInstance,
    successBasePath = '',
}: UsePaymentApiProps) {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const { user } = useAppSelector(state => state.reducer.user);
    const paymentState = useAppSelector(state => state.reducer.payment);
    const { searchInitiatedAt } = useAppSelector(
        state => state.reducer.airline
    );
     const serviceDetails = sessionStorage.getItem('service_details');
   

    const [selectedPayment, setselectedPayment] = useState<PaymentMode>(PaymentMode.empty);
    const [isCashbackChecked, setIsCashbackChecked] = useState<boolean>(false);
    const [ccavenueUrl, setCCavenueUrl] = useState<string | null>(null);

    const { payload, totalAmount, url, minimumAmount, maximumAmount, couponDiscount,billSummary, successPath } =
        useAppSelector(state => state.reducer.payment);

           const excludedFromCheckoutEvent = [
        accessKeys.subscriptions,
      
    ].includes(payload?.accessKey!);
    const [isLoading, setIsLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    // const [totalAmountBeforeCoupon, setTotalAmountBeforeCoupon] = useState(totalAmount);
    const couponFormikRef = useRef<FormikProps<{ couponCode: string }> | null>(null);
    const [isSpinnerLoading, setIsSpinnerLoading] = useState(false);

    const navigate = useNavigate();

    const base = successBasePath;
    const navSuccess = base ? `${base}/${paths.payments.paymentsuccess}` : paths.payments.paymentsuccess;
    const navFailure = base ? `${base}/${paths.payments.paymentFailure}` : paths.payments.paymentFailure;
    const navPending = base ? `${base}/${paths.payments.paymentPending}` : paths.payments.paymentPending;

    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setIsLoading(false);
                setIsSpinnerLoading(false);
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, []);

    // remove coupon discount when page intial loading
    useEffect(() => {
        const updatedPaymentSummary = (paymentState?.paymentSummary || []).filter(
            item => item.key !== 'Coupon Discount'
        );
        dispatch(
            setPaymentData({
                ...paymentState,
                totalAmount: totalAmount + (couponDiscount || 0),
                paymentSummary: updatedPaymentSummary,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyCoupon = useCallback(
        async (code: string, setSubmitting: (isSubmitting: boolean) => void) => {
            if (!payload?.accessKey) {
                dispatch(
                    showToast({
                        description: 'Coupons are not available for this service',
                        variant: 'warning',
                    })
                );
                return;
            }
            const applyCouponPayload: any = {
                userId: id,
                userType: role,
                amount: totalAmount,
                couponCode: code,
            };
            if (
                payload.accessKey === 'accounting' ||
                payload.accessKey === 'whatsApp_for_busines'
            ) {
                applyCouponPayload.packageId = payload.packageId!;
                applyCouponPayload.billingType = payload?.subscriptionDuration!.toString()!;
            } else {
                applyCouponPayload.accessKey = payload.accessKey!;
            }
            setSubmitting(true);
            const data: ApplyCouponResponse | false = await postApplyCoupon(applyCouponPayload);
            if (data) {
                setCouponCode(code);
                setselectedPayment(isCCavenueService(payload?.accessKey) ? PaymentMode.CCAVENUE : PaymentMode.PAYTM);
                setIsCashbackChecked(false);
                setIsCouponApplied(true);
                setIsLoading(false);
                let formatedDiscount = formatNumberWithLocalString(data.discountAmount);
                formatedDiscount = formatedDiscount.replace(/,/g, ''); // remove commas (1,000.00 -> 1000.00)

                const updatedPaymentSummary = [
                    ...(paymentState?.paymentSummary || []), // Ensure it's an array and create a copy
                    {
                        key: 'Coupon Discount',
                        value: `₹ ${formatNumberWithLocalString(formatedDiscount)}`,
                    },
                ];
                // setTotalAmountBeforeCoupon(totalAmount);

                dispatch(
                    setPaymentData({
                        ...paymentState,
                        couponDiscount: roundMoney(Number(data.discountAmount)),
                        totalAmount: roundMoney(totalAmount - Number(formatedDiscount)),
                        paymentSummary: updatedPaymentSummary,
                        // billSummary: updatedBillSummary,
                    })
                );
            } else {
                setCouponCode('');
            }
            setSubmitting(false);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [payload, id, role, totalAmount, dispatch, paymentState, selectedPayment]
    );

    const removeCoupon = useCallback(() => {
        couponFormikRef?.current?.resetForm();
        setCouponCode('');
        setIsCouponApplied(false);
        const updatedPaymentSummary = (paymentState?.paymentSummary || []).filter(
            item => item.key !== 'Coupon Discount'
        );
        dispatch(
            setPaymentData({
                ...paymentState,
                couponDiscount: 0,
                totalAmount: totalAmount + (couponDiscount || 0),
                paymentSummary: updatedPaymentSummary,
            })
        );
    }, [dispatch, paymentState, couponDiscount, totalAmount]);

    const handleWalletPaymentRequest = async () => {
        if (!checkPayableAmount()) {
            return;
        }
        setIsLoading(true);
        // const isAgencyBalanceSufficient = await checkAgencyBalance(
        //     payload?.accessKey,
        //     payload?.amount
        // );
        // if (!isAgencyBalanceSufficient) {
        //     // show error and redirect
        //     setIsLoading(false);
        //     return;
        // }

        if (url) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { accessKey: _accessKey, ...payloadWithoutAccessKey } = payload ?? {};
            const payloadToSend = url.includes('domain-and-hosting') ? payloadWithoutAccessKey : payload;
              const serviceName = billSummary.find(item => item.key === 'Service name')?.value;

            const requestBody = {
                ...payloadToSend,
                userId: id,
                userType: role,
                url,
                currentUrl: undefined,
            };
               if (typeof Moengage?.track_event === 'function') {
                Moengage.track_event('payment_attempted', {
                    service_name: serviceName || 'N/A',
                });
            }

            if (
                typeof Moengage?.track_event === 'function' &&
                serviceDetails &&
                !excludedFromCheckoutEvent
            ) {
                const request = JSON.parse(serviceDetails);
                const { moengage_prefix, ...checkoutData } = request.serviceDetails ?? {};
                const moengageServiceName = moengage_prefix || getMoengageServiceName(serviceName);
                Moengage.track_event(`${moengageServiceName}_checkout`, {
                    mode: selectedPayment,
                    ...checkoutData,
                    coupon_code_used: isCouponApplied,
                    ...(isCouponApplied && { coupon_code_used: couponCode }),
                    total_amount: totalAmount,
                });
                sessionStorage.removeItem('service_details');
                sessionStorage.setItem(
                    'paymentResult',
                    JSON.stringify({
                        final_amount: totalAmount,
                        coupon_code_used: isCouponApplied,
                        serviceName: moengageServiceName,
                    })
                );
            }
            const resp: PaymentResponse | false = await doWalletPayment(requestBody);
            setIsLoading(false);
            if (resp && resp.bulkPaymentData) {
                if (resp.corporateFinalBalance) {
                    dispatch(setUserInfo({ user: { ...user!, balance: resp.corporateFinalBalance } }));
                }
                const bulkPaymentDataString = encodeURIComponent(
                    JSON.stringify(resp.bulkPaymentData)
                );
                const isEsim =
                    payload?.accessKey === accessKeys.eSim ||
                    payload?.accessKey === accessKeys.eSimTunz ||
                    Array.isArray(payload?.orderGroups);
                const query = `?status=success&bulkPaymentData=${bulkPaymentDataString || ''}${isEsim ? '&serviceName=esim' : ''}`;
                navigate(`${navSuccess}${query}`);
            } else if (resp) {
                if (resp.pending || resp.processing) {
                    const { firstBtnText, firstBtnLink } = findButtonTextAndLink(
                        payload?.accessKey
                    );
                    navigate(navPending, {
                        state: {
                            ...resp.details,
                            firstBtnText,
                            firstBtnLink,
                        },
                    });
                    return;
                }
                if (url?.includes('softwaresV2')) {
                    navigate(paths.payments.subscriptionPending, {
                        state: { transactionId: resp.corporateTxnId },
                    });
                    return;
                }
                dispatch(setUserInfo({ user: { ...user!, balance: resp.corporateFinalBalance } }));
                if (payload?.accessKey === accessKeys.visa) {
                    const orderNumber =
                        resp?.orderNumber ?? resp?.order_number ?? (payload as any).orderNumber;
                    if (orderNumber) dispatch(setVisaOrderNumber(orderNumber));
                    navigate(
                        `${paths.dashboard.corporateTravel}/${paths.visa.index}/${paths.visa.visaSuccess}`,
                        { state: { orderNumber } }
                    );
                    return;
                }
                const query = `?status=success&transactionId=${resp.corporateTxnId || ''}`;
                if (successPath) {
                    navigate(successPath + query);
                } else {
                    navigate(`${navSuccess}${query}`);
                }
            } else {
                // doWalletPayment returned false — the request actually failed
                // (thrown/non-2xx). Previously visa treated this as a silent
                // success, which hid real backend errors; now it's created at
                // payment time, so failures here are real and must surface.
                navigate(navFailure);
            }
        }
    };

    const handlePaytmPaymentRequest = async ({
        isChecked,
        balance,
    }: {
        isChecked: boolean;
        balance: number;
    }) => {
        if (!checkPayableAmount()) {
            return;
        }
        setIsLoading(true);

        // const isAgencyBalanceSufficient = await checkAgencyBalance(
        //     payload?.accessKey,
        //     payload?.outbount?.amount
        // );
        // if (!isAgencyBalanceSufficient) {
        //     // show error and redirect
        //     setIsLoading(false);
        //     return;
        // }

        setIsSpinnerLoading(true);
        const AmountAfterWallet = totalAmount && totalAmount - balance;
        const pgAmount = isChecked ? AmountAfterWallet : totalAmount;

        const serviceName = billSummary.find(item => item.key === 'Service name')?.value;
        if (typeof Moengage?.track_event === 'function') {
            Moengage.track_event('payment_attempted', {
                service_name: serviceName || 'N/A',
            });
        }
        if (
            typeof Moengage?.track_event === 'function' &&
            serviceDetails &&
            !excludedFromCheckoutEvent
        ) {
            const request = JSON.parse(serviceDetails);
            const { moengage_prefix, ...checkoutData } = request.serviceDetails ?? {};
            const moengageServiceName = moengage_prefix || getMoengageServiceName(serviceName);
            Moengage.track_event(`${moengageServiceName}_checkout`, {
                mode: selectedPayment,
                ...checkoutData,
                coupon_code_used: isCouponApplied,
                ...(isCouponApplied && { coupon_code_used: couponCode }),
                total_amount: totalAmount,
            });
            sessionStorage.removeItem('service_details');
            sessionStorage.setItem(
                'paymentResult',
                JSON.stringify({
                    final_amount: totalAmount,
                    coupon_code_used: isCouponApplied,
                    serviceName: moengageServiceName,
                })
            );
        }

        const requestBody = {
            ...payload,
            pgAmount,
            userId: id,
            userType: role,
            couponCode: isCouponApplied ? couponCode : '',
            // Add timer information for airline bookings
            ...(payload?.accessKey === accessKeys.airline && {
                searchInitiatedAt: searchInitiatedAt || null,
            }),
        };

        if (payload?.isWhatsAppSubscription) {
            const waResp = await createSubscriptionOrderFromPayments({
                ...requestBody,
                pgAmount: totalAmount,
            });
            if (!waResp || !waResp.status) {
                dispatch(
                    showToast({
                        description: (waResp as any)?.message || 'Something went wrong. Please try after some time',
                        variant: 'error',
                    })
                );
                setIsLoading(false);
                setIsSpinnerLoading(false);
                return;
            }
            if (checkoutJsInstance) {
                sessionStorage.setItem(
                    PLAN_DETAILS_SESSION_KEY,
                    JSON.stringify({
                        service: 'WhatsApp For Business',
                        url: `${window.location.origin}${paths.dashboard.whatsappForBusiness}`,
                        selectedType: String((payload as any)?.subscriptionDuration ?? 'monthly').toLowerCase(),
                        isAddOns: false,
                    })
                );
                checkoutJsInstance
                    .subscriptionsCheckout({ subsSessionId: waResp.data?.session_id })
                    .then((result: any) => {
                        if (result?.error) {
                            dispatch(
                                showToast({
                                    description: 'Something went wrong. Please try after some time',
                                    variant: 'error',
                                })
                            );
                            setIsLoading(false);
                            setIsSpinnerLoading(false);
                        }
                    });
            } else {
                dispatch(
                    showToast({
                        description: 'Payment gateway is not ready. Please refresh the page and try again.',
                        variant: 'error',
                    })
                );
                setIsLoading(false);
                setIsSpinnerLoading(false);
            }
            return;
        }

        const resp = await createPGTransaction(requestBody);

        if (resp && resp.status === false) {
            dispatch(
                showToast({
                    description: resp.message || 'Something went wrong. Please try after some time',
                    variant: 'error',
                })
            );
            setIsLoading(false);
            setIsSpinnerLoading(false);
            return;
        }
        if (resp && resp.status) {
            // Validate the session_id BEFORE opening the SDK modal. If the backend
            // returned status:true but no session_id (mis-shaped response, wallet-
            // only flow, downstream provider failure), Cashfree would otherwise
            // open its modal and surface its own raw error string to the user.
            const sessionId = resp.data?.session_id;
            if (typeof sessionId !== 'string' || sessionId.trim() === '') {
                console.error('[Cashfree] create-order returned without a valid session_id', {
                    respKeys: resp?.data ? Object.keys(resp.data) : null,
                    orderId: resp?.data?.orderId,
                });
                dispatch(
                    showToast({
                        description: 'Unable to start the payment. Please try again.',
                        variant: 'error',
                    })
                );
                setIsLoading(false);
                setIsSpinnerLoading(false);
                return;
            }

            // Ensure the SDK is loaded before calling checkout — earlier code
            // fired loadCheckoutScript() without awaiting, so on the first click
            // `checkoutJsInstance` was still null and nothing happened, and on
            // subsequent clicks a stale instance could be used.
            const cashfree = checkoutJsInstance || (await loadCheckoutScript());
            if (!cashfree) {
                console.error('[Cashfree] SDK failed to load');
                dispatch(
                    showToast({
                        description: 'Unable to start the payment. Please try again.',
                        variant: 'error',
                    })
                );
                setIsLoading(false);
                setIsSpinnerLoading(false);
                return;
            }

            const checkoutOptions = {
                paymentSessionId: sessionId,
                redirectTarget: '_modal', // _self
            };
            cashfree.checkout(checkoutOptions).then((result: any) => {
                    if (result.error) {
                        setIsSpinnerLoading(false);
                        setIsLoading(false);
                        // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
                        console.log(
                            'User has closed the popup or there is some payment error, Check for Payment Status'
                        );
                        console.log(result.error);
                        // navigate(paths.payments.paymentFailure);
                    }
                    if (result.redirect) {
                        setIsSpinnerLoading(false);
                        // This will be true when the payment redirection page couldnt be opened in the same window
                        // This is an exceptional case only when the page is opened inside an inAppBrowser
                        // In this case the customer will be redirected to return url once payment is completed
                        console.log('Payment will be redirected');
                        navigate(navFailure);
                    }
                    if (result.paymentDetails) {
                        setIsSpinnerLoading(true);
                        // This will be called whenever the payment is completed irrespective of transaction status
                        console.log('Payment has been completed, Check for Payment Status');
                        const pgArgs = { userId: id, userType: role, ORDERID: resp.data.orderId };
                        let pgPromise: ReturnType<typeof completePGPayment>;
                        if (payload?.accessKey === accessKeys.hotels) {
                            pgPromise = retryIfPending(() => completePGPayment(pgArgs));
                        } else if (payload?.accessKey === accessKeys.visa) {
                            // Visa order creation involves a vendor API call plus a
                            // per-applicant document upload to S3, which can run well
                            // past the default retry budget — give it up to ~24s.
                            pgPromise = retryIfPending(() => completePGPayment(pgArgs), 12, 2000);
                        } else {
                            pgPromise = completePGPayment(pgArgs);
                        }
                        pgPromise.then(res => {
                            if (res) {
                                setIsSpinnerLoading(false);
                                if (res.corporateFinalBalance != null) {
                                    dispatch(
                                        setUserInfo({
                                            user: { ...user!, balance: res.corporateFinalBalance },
                                        })
                                    );
                                }
                                if (res.failed) {
                                    navigate(navFailure);
                                    return;
                                }
                                if (res.pending || res.processing) {
                                    const { firstBtnText, firstBtnLink } = findButtonTextAndLink(
                                        payload?.accessKey
                                    );
                                    navigate(navPending, {
                                        state: {
                                            ...res.details,
                                            corporateTxnId: res.corporateTxnId,
                                            accessKey: payload?.accessKey,
                                            successUrl: res.successUrl,
                                            firstBtnText,
                                            firstBtnLink,
                                        },
                                    });
                                    return;
                                }
                                if (url?.includes('softwaresV2')) {
                                    navigate(paths.payments.subscriptionPending, {
                                        state: { transactionId: res.corporateTxnId },
                                    });
                                    return;
                                }
                                let query = '';
                                if (res.bulkPaymentData) {
                                    const bulkPaymentDataString = encodeURIComponent(
                                        JSON.stringify(res.bulkPaymentData)
                                    );
                                    const isEsim =
                                        payload?.accessKey === accessKeys.eSim ||
                                        payload?.accessKey === accessKeys.eSimTunz ||
                                        Array.isArray(payload?.orderGroups);
                                    query = `?status=success&bulkPaymentData=${bulkPaymentDataString || ''}${isEsim ? '&serviceName=esim' : ''}`;
                                } else {
                                    query = `?status=success&transactionId=${res.corporateTxnId || ''}`;
                                }
                                // const encodedQueryParams = btoa(query);
                                if (payload?.accessKey === accessKeys.visa) {
                                    const orderNumber =
                                        (res as any)?.orderNumber ??
                                        (res as any)?.order_number ??
                                        (payload as any).orderNumber;
                                    if (orderNumber) dispatch(setVisaOrderNumber(orderNumber));
                                    navigate(
                                        `${paths.dashboard.corporateTravel}/${paths.visa.index}/${paths.visa.visaSuccess}`,
                                        { state: { orderNumber } }
                                    );
                                } 
                                else if (successPath) {
                                    navigate(successPath + query);
                                }
                                else if (res.successUrl) {
                                    navigate(res.successUrl + query);
                                } else {
                                    navigate(`${navSuccess}${query}`);
                                }
                            } else {
                                navigate(navFailure);
                            }
                        });
                        setIsLoading(false);
                    }
                });
        } else {
            dispatch(
                showToast({
                    description: 'Something went wrong. Please try after some time',
                    variant: 'error',
                })
            );
            setIsLoading(false);
            setIsSpinnerLoading(false);
        }
    };

    const handleCCavenuePaymentRequest = async () => {
        if (!checkPayableAmount()) return;
        setIsLoading(true);
        const requestBody = {
            ...payload,
            pgAmount: totalAmount,
            userId: id,
            userType: role,
            url,
            couponCode: isCouponApplied ? couponCode : '',
        };
        const resp = await initiateCCavenuePayment(requestBody as any);
        setIsLoading(false);
        if (resp && resp.iframeUrl) {
            setCCavenueUrl(resp.iframeUrl);
        } else {
            dispatch(showToast({ description: 'Something went wrong. Please try after some time', variant: 'error' }));
        }
    };

    const loadCheckoutScript = useCallback(async () => {
        const cashfree = await load({
            mode: ENV === 'production' ? 'production' : 'sandbox',
        });
        setCheckoutJsInstance(cashfree);
        return cashfree;
    }, [setCheckoutJsInstance]);

    function checkPayableAmount() {
        if (Number(payload?.amount!) <= 0) {
            dispatch(
                showToast({
                    description: 'Please enter a valid amount',
                    variant: 'warning',
                })
            );
            return false;
        }
        if (
            (minimumAmount && Number(payload?.amount!) < minimumAmount) ||
            (maximumAmount && Number(payload?.amount!) > maximumAmount)
        ) {
            dispatch(
                showToast({
                    description:
                        'Please enter the amount between minimum and maximum denominations.',
                    variant: 'warning',
                })
            );
            return false;
        }
        return true;
    }

    // not working (plural gateway)
    const handleCardPaymentRequest = async ({
        isChecked,
        balance,
    }: {
        isChecked: boolean;
        balance: number;
    }) => {
        if (!checkPayableAmount()) {
            return;
        }
        setIsLoading(true);

        const pgAfterWallet = totalAmount && totalAmount - balance;
        const pgAmount = isChecked ? pgAfterWallet : totalAmount;

        const requestBody = {
            ...payload,
            pgAmount,
            userId: id,
            userType: role,
            successUrl: PAYMENT_SUCCESS_URL,
            failureUrl: PAYMENT_FAiLURE_URL,
            // Add timer information for airline bookings
            ...(payload?.accessKey === accessKeys.airline && {
                searchInitiatedAt: searchInitiatedAt || null,
            }),
        };
        const resp: CardPaymentResponse | false = await createPaymentLink(requestBody);
        if (resp) {
            if (successPath) {
                sessionStorage.setItem('cardPaymentSuccessPath', successPath);
            }
            window.location.href = resp.redirectLink;
        }
        setIsLoading(false);
    };

    // const checkAgencyBalance = async (accessKey?: string, amount?: string | number) => {
    //     if (accessKey === 'tbo_airline' && amount) {
    //         const res = await checkAgencyBalanceApi({
    //             userId: id,
    //             userType: role,
    //             amount,
    //         });
    //         return res;
    //     }
    //     return true;
    // };

    const findButtonTextAndLink = (accessKey?: string) => {
        switch (accessKey) {
            case accessKeys.airline:
                return {
                    firstBtnText: 'Go to Manage Bookings',
                    firstBtnLink: `${paths.dashboard.corporateTravel}/${paths.airline.index}/${paths.airline.manage}`,
                };
            case accessKeys.prepaid:
                return {
                    firstBtnText: 'Go to Mobile Recharge',
                    firstBtnLink: `/mobile-recharge-&-bills`,
                };
            case accessKeys.companyIncorporation:
                return {
                    firstBtnText: 'Track Application',
                    firstBtnLink: `${paths.companyIncorporation.index}/${paths.companyIncorporation.tracking}`,
                };
            case accessKeys.eSim:
            case accessKeys.eSimTunz:
                return {
                    firstBtnText: 'Install eSIM',
                    firstBtnLink: '/corporate-travel/eSIM/orders/package-details',
                };
            default:
                return {
                    firstBtnText: 'Go to Utility Payments',
                    firstBtnLink: '/utility-payments',
                };
        }
    };

    return {
        selectedPayment,
        setselectedPayment,
        isCashbackChecked,
        setIsCashbackChecked,
        handleCardPaymentRequest,
        handlePaytmPaymentRequest,
        handleWalletPaymentRequest,
        handleCCavenuePaymentRequest,
        ccavenueUrl,
        setCCavenueUrl,
        isLoading,
        isSpinnerLoading,
        loadCheckoutScript,
        couponFormikRef,
        isCouponApplied,
        applyCoupon,
        setCouponCode,
        removeCoupon,
    };
}
