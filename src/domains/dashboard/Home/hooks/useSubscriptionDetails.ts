import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { cancelSubscriptionPlanPatch, fetchPekoPlusDetails } from '../api';
import { SubscriptionDetailsResponse } from '../types';

const useSubscriptionDetails = () => {
    const { user } = useAppSelector(state => state.reducer.user);
    const isFreelancer = user?.accountType === 'freelancer';

    const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetailsResponse>({
        isPurchased: !!isFreelancer,
        previousSubscription: null,
    });

    const [isLoader, setIsLoader] = useState(false);

    const getPekoPlusDetails = useCallback(async () => {
        if (isFreelancer) return;
        const resp = await fetchPekoPlusDetails();
        if (resp) {
            setSubscriptionDetails(resp);
        }
    }, [isFreelancer]);

    useEffect(() => {
        getPekoPlusDetails();
    }, [getPekoPlusDetails]);

    const handleCancelSubscriptionPlan = useCallback(
        async (subscriptionId: number) => {
            setIsLoader(true);
            const data: { message: string } | false =
                await cancelSubscriptionPlanPatch(subscriptionId);
            setIsLoader(false);
            if (data) {
                await getPekoPlusDetails();
                return true;
            }
            return false;
        },
        [getPekoPlusDetails]
    );

    return {
        subscriptionDetails,
        handleCancelSubscriptionPlan,
        isLoader,
    };
};

export default useSubscriptionDetails;
