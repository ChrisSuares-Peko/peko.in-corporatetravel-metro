import { useEffect } from 'react';

import { Flex, Spin } from 'antd';

import PaymentLink from './PaymentLink';
import PaymentLinkOnboarding from './PaymentLinkOnboarding';
import { usePaymentLinkOnboarding } from '../hooks/usePaymentLinkOnboarding';

const PaymentLinkLanding = () => {
    const {  record, fetchStatus,statusLoading } = usePaymentLinkOnboarding();

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    if (statusLoading) {
        return (
            <Flex justify="center" align="center" className="h-[70vh]">
                <Spin size="large" />
            </Flex>
        );
    }

    if (record?.status === 'active') {
        return <PaymentLink />;
    }

    return <PaymentLinkOnboarding onboardingRecord={record} refresh={()=>fetchStatus()} />;
};

export default PaymentLinkLanding;
