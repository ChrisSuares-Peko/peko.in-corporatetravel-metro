import React from 'react';

import { Spin } from 'antd';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import AdminCardDashboard from './AdminCardDashboard';
import CorporateCardDashboard from './CorporateCardDashboard';
import pineLabs from '../assets/pinelabs.png';
import { InitiateKyb, KybPending, KybRejected, KybSubmitted, KybVerified, UploadDocumentsKyb } from '../components/kyb/admin';
import { InitiateKyc, KycSubmitted } from '../components/kyc';
import { useCorporateCardsKyc } from '../hooks';
import { useCompleteKyb } from '../hooks/admin/useCompleteKyb';
import { useKybStatusApi } from '../hooks/admin/useKybStatusApi';
import { useSubmitKybDocuments } from '../hooks/admin/useSubmitKybDocuments';
import { useInitiateKycApi } from '../hooks/user/useInitiateKycApi';
import { useKycStatusApi } from '../hooks/user/useKycStatusApi';
import { setKybStage } from '../slices/corporateCardsSlice';

const SUB_CORPORATE_ROLE = 'corporate sub user';

/**
 * Corporate Cards entry page.
 *
 * - Corporate (admin) users: KYB gate renders based on kybStage, synced from the real kyb-status API
 *   on mount; verified → admin dashboard.
 * - Sub-corporate users: KYC status is fetched on mount; gate renders based on current stage.
 */
const CorporateCardsPage = () => {
    const dispatch = useAppDispatch();
    const { stage } = useCorporateCardsKyc();
    const { handleInitiateKyc, submitLoading } = useInitiateKycApi();
    const { roleName } = useAppSelector(state => state.reducer.auth);
    const { kybStage } = useAppSelector(state => state.reducer.corporateCards);

    const isSubCorporate = roleName === SUB_CORPORATE_ROLE;

    // Fetch live KYC status on mount for sub-corporate users only
    const { isLoading: isStatusLoading } = useKycStatusApi(isSubCorporate);

    // Fetch live KYB status on mount for corporate admins only
    const { isLoading: isKybLoading, refetch: refetchKybStatus } = useKybStatusApi(!isSubCorporate);
    const { handleSubmit: handleSubmitKybDocuments, submitLoading: kybSubmitLoading } =
        useSubmitKybDocuments(refetchKybStatus);
    const { handleComplete } = useCompleteKyb();

    // Admin KYB gate
    if (!isSubCorporate) {
        if (isKybLoading) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <Spin size="large" />
                </div>
            );
        }
        if (kybStage === 'complete') return <AdminCardDashboard />;

        let kybContent: React.ReactNode = null;
        if (kybStage === 'initiate') kybContent = <InitiateKyb onInitiate={() => dispatch(setKybStage('upload'))} />;
        if (kybStage === 'upload') kybContent = (
            <UploadDocumentsKyb
                onBack={() => dispatch(setKybStage('initiate'))}
                onSubmit={handleSubmitKybDocuments}
                submitLoading={kybSubmitLoading}
            />
        );
        if (kybStage === 'submitted') kybContent = <KybSubmitted />;
        if (kybStage === 'pending') kybContent = <KybPending />;
        if (kybStage === 'verified') kybContent = <KybVerified onGoToDashboard={handleComplete} />;
        if (kybStage === 'rejected') kybContent = <KybRejected onResubmit={() => dispatch(setKybStage('initiate'))} />;

        if (kybContent) return (
            <div className="w-full overflow-y-auto px-1 sm:px-4 pb-6 pt-1 sm:pb-10 sm:pt-2">
                <div className="flex justify-end">
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-textGreyLight sm:text-xs">Issued by</span>
                        <img src={pineLabs} alt="Pine Labs" className="h-4 sm:h-5" />
                    </div>
                </div>
                {kybContent}
            </div>
        );
    }

    if (isStatusLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    const kycScreens: Record<string, React.ReactNode> = {
        initiate: <InitiateKyc onInitiate={handleInitiateKyc} loading={submitLoading} />,
        submitted: <KycSubmitted />,
    };

    if (kycScreens[stage]) return (
        <div className="w-full overflow-y-auto px-1 sm:px-4 pb-6 pt-1 sm:pb-10 sm:pt-2">
            <div className="flex justify-end">
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-textGreyLight sm:text-xs">Issued by</span>
                    <img src={pineLabs} alt="Pine Labs" className="h-4 sm:h-5" />
                </div>
            </div>
            {kycScreens[stage]}
        </div>
    );

    return <CorporateCardDashboard />;
};

export default CorporateCardsPage;
