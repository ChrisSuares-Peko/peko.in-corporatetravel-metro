import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import { getKycStatus } from '../../api/user/kycApi';
import { setKycInfo, setKycStage } from '../../slices/corporateCardsSlice';
import { KycStage } from '../../utils/types';

const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso)
        .toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
        .replace(/am|pm/i, match => match.toUpperCase());
};

export const useKycStatusApi = (enabled: boolean) => {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(enabled);

    useEffect(() => {
        if (!enabled) return;

        const fetchStatus = async () => {
            setIsLoading(true);
            const res = await getKycStatus(role, id);
            if (res && res.data?.kyc) {
                const { state, refId, submittedOn } = res.data.kyc;
                // Map the backend-derived KYC state to a gate stage:
                //  - COMPLETED (video KYC approved) → dashboard.
                //  - IN_REVIEW (video KYC status 4, review pending) → the "under review" screen only.
                //  - everything else (in progress / rejected / action required) → the initiate screen.
                let stage: KycStage = 'initiate';
                if (state === 'COMPLETED') stage = 'verified';
                else if (state === 'IN_REVIEW') stage = 'submitted';
                dispatch(setKycStage(stage));
                dispatch(
                    setKycInfo({
                        refId: refId ?? null,
                        submittedOn: formatDate(submittedOn ?? null),
                    })
                );
            }
            setIsLoading(false);
        };

        fetchStatus();
    }, [enabled, role, id, dispatch]);

    return { isLoading };
};
