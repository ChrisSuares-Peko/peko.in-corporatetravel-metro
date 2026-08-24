import React, { useEffect } from 'react';

import { Result, Button, Flex, Skeleton } from 'antd';
import Pusher from 'pusher-js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { VITE_PUSHER_APPKEY } from '@src/config-global';
import { useAppSelector } from '@src/hooks/store';

import { completePGPayment } from '../api';
import Pending from '../assets/svg/clock.svg';

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 2;

const PaymentPending = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const { id, role } = useAppSelector(s => s.reducer.auth);

    const isLoading = false;

    useEffect(() => {
        const pusher = new Pusher(VITE_PUSHER_APPKEY, {
            cluster: 'ap2',
            forceTLS: true,
        });
        const channel = pusher.subscribe('corporate-pg-payment');

        const eventHandler = (data: any) => {
            if (Number(data?.credentialId) !== id) return;
            const watchedTxnId = state?.corporateTxnId;
            if (
                watchedTxnId &&
                data?.corporateTxnId &&
                String(data.corporateTxnId) !== String(watchedTxnId)
            ) {
                return;
            }
            if (data?.status === 'FAILURE') {
                navigate('/payments/payment-failure');
                return;
            }
            if (data?.redisKey) {
                const bulkPaymentDataString = encodeURIComponent(
                    JSON.stringify(data.redisKey)
                );
                navigate(
                    `/payments/payment-success?status=success&serviceName=esim&bulkPaymentData=${bulkPaymentDataString}`
                );
                return;
            }
            const stateAccessKey = state?.accessKey;
            const isEsim =
                stateAccessKey === 'esim' || stateAccessKey === 'esim_tunz';
            const esimSuffix = isEsim ? '&serviceName=esim' : '';
            navigate(
                `/payments/payment-success?status=success&transactionId=${data.corporateTxnId}${esimSuffix}`
            );
        };

        channel.bind('payment-pg-confirmed', eventHandler);

        return () => {
            channel.unbind('payment-pg-confirmed', eventHandler);
            pusher.unsubscribe('corporate-pg-payment');
            pusher.disconnect();
        };
    }, [id, navigate, state?.accessKey, state?.corporateTxnId]);

    useEffect(() => {
        const corporateTxnId = state?.corporateTxnId;
        if (!corporateTxnId) return undefined;

        let attempts = 0;
        let active = true;

        const poll = async () => {
            if (!active || attempts >= POLL_MAX_ATTEMPTS) return;
            attempts += 1;
            const res: any = await completePGPayment({
                userId: id,
                userType: role,
                ORDERID: corporateTxnId,
            });
            if (!active) return;
            if (!res) return;
            if (res.failed) {
                navigate('/payments/payment-failure');
                return;
            }
            if (res.processing || res.pending) return;
            const successPath = state?.successUrl || '/payments/payment-success';
            navigate(`${successPath}?status=success&transactionId=${res.corporateTxnId || corporateTxnId}`);
        };

        poll();
        const intervalId = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [id, role, navigate, state?.corporateTxnId, state?.successUrl]);

    return (
        <Flex vertical justify="center" align="center" gap={20} className="pgsuccess md:pt-12">
            <Result
                className="w-full max-w-lg md:max-w-sm p-0 text-center"
                icon={<ReactSVG src={Pending} className="flex justify-center items-center" />}
                title="Awaiting payment confirmation"
                subTitle={
                    isLoading ? (
                        <Skeleton
                            style={{ minWidth: 400, height: 10 }}
                            paragraph={{ rows: 2 }}
                            active
                        />
                    ) : (
                        state.message ||
                        'Your order is being processed. You will receive a confirmation email once your payment has been verified.'
                    )
                }
                extra={[
                    isLoading ? (
                        <Skeleton.Button
                            key="skeleton"
                            style={{ minWidth: 400, height: 30 }}
                            active
                        />
                    ) : (
                        <Flex
                            justify="center"
                            className="flex flex-col sm:flex-row gap-4"
                            key="btn"
                        >
                            <Link to={state.firstBtnLink || '/utility-payments'}>
                                <Button type="primary" danger>
                                    {state.firstBtnText || 'Go to Utility Payments'}
                                </Button>
                            </Link>
                            <Link to="/reports">
                                <Button>View Transaction </Button>
                            </Link>
                        </Flex>
                    ),
                ]}
            />
        </Flex>
    );
};
export default PaymentPending;
