import { useCallback, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';

import { getKybStatus, KybApiStatus, KybApplicationApiShape } from '../../api/admin/kybStatusApi';
import { setKybInfo, setKybStage } from '../../slices/corporateCardsSlice';
import { KybStage } from '../../utils/types';

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

// 'upload' has no backend equivalent — it's a pure client-side sub-step between 'initiate' and the
// corporate actually submitting documents, so it's never dispatched from here.
//
// PENDING is ambiguous on its own: it's both "no row yet" (no application at all — handled below,
// before this table is consulted) AND "a row exists but nothing has been submitted" (an admin-created
// placeholder, per corporateCard/controllers/corporate/kybStatus.js's canResubmit) AND "the corporate
// has submitted and it's awaiting our team to forward the documents to the KYB vendor" (once a
// kybReference has been stamped). Resolved via resolveStage below using kybReference presence — this
// table only covers the unambiguous statuses.
//
// PENDING (with a kybReference) and SUBMITTED intentionally render the SAME 'submitted' screen: from
// the corporate's point of view "we've received it, awaiting review" reads the same whether our team
// has manually forwarded the documents to the vendor yet or not — that handoff is an internal-ops
// step (done by flipping kybStatus to SUBMITTED via the admin Manage drawer), not something the
// corporate needs to be told about separately.
const STAGE_BY_STATUS: Record<Exclude<KybApiStatus, 'PENDING'>, KybStage> = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    COMPLETED: 'complete',
};

const resolveStage = (application: KybApplicationApiShape | null): KybStage => {
    if (!application) return 'initiate';
    if (application.kybStatus === 'PENDING') return application.kybReference ? 'submitted' : 'initiate';
    return STAGE_BY_STATUS[application.kybStatus] ?? 'initiate';
};

/** Fetches the corporate's own KYB status on mount and syncs the redux gate (kybStage + kybInfo). */
export const useKybStatusApi = (enabled: boolean) => {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(enabled);

    const fetchStatus = useCallback(async () => {
        if (!enabled) return;
        setIsLoading(true);
        const res = await getKybStatus(role, id);
        if (res) {
            const application = res.data?.application ?? null;
            dispatch(setKybStage(resolveStage(application)));
            dispatch(
                setKybInfo({
                    refId: application?.kybReference ?? null,
                    submittedOn: formatDate(application?.updatedAt ?? null),
                    rejectionReason: application?.rejectionReason ?? null,
                })
            );
        }
        setIsLoading(false);
    }, [enabled, role, id, dispatch]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return { isLoading, refetch: fetchStatus };
};
