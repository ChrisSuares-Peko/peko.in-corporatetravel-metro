import { useCallback, useEffect, useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { useAppSelector } from '@src/hooks/store';

import {
    cancelOndcOrderApi,
    getOndcOrderByIdApi,
    getOndcOrderIssuesApi,
    raiseOndcIssueApi,
    respondToOndcIssueApi,
} from '../api/ondcOrderHistory';
import { OndcIssue } from '../types/ondcIssue';
import { OndcOrderDetail } from '../types/ondcOrderHistory';
import { IssuePhoto } from '../utils/issuePhoto';

/** Fetches a single confirmed ONDC order and manages backend ONDC issues. */
export function useOndcOrderDetailApi(id: string) {
    const { role, id: userId } = useAppSelector(state => state.reducer.auth);
    const [order, setOrder] = useState<OndcOrderDetail | null>(null);
    const [issues, setIssues] = useState<OndcIssue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const fetchIssues = useCallback(async () => {
        if (!id) return;
        const list = await getOndcOrderIssuesApi({ userId, userType: role, id });
        setIssues(list);
    }, [id, userId, role]);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        const data = await getOndcOrderByIdApi({ userId, userType: role, id });
        if (data) {
            setOrder(data);
            await fetchIssues();
        } else {
            setNotFound(true);
        }
        setIsLoading(false);
    }, [userId, role, id, fetchIssues]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const cancelOrder = useCallback(
        async (reason: string, description: string) => {
            const succeeded = await cancelOndcOrderApi({ userId, userType: role, id, reason, description });
            if (succeeded) await fetchOrder();
            return succeeded;
        },
        [userId, role, id, fetchOrder]
    );

    const raiseIssue = useCallback(
        async (
            category: string,
            subCategory: string,
            description: string,
            images?: IssuePhoto[]
        ): Promise<boolean> => {
            if (!id) return false;
            const clientRequestId = uuidv4();
            const success = await raiseOndcIssueApi({
                userId,
                userType: role,
                id,
                category,
                subCategory,
                description,
                images,
                clientRequestId,
            });
            if (success) {
                await fetchIssues();
                return true;
            }
            return false;
        },
        [id, userId, role, fetchIssues]
    );

    const replyToIssue = useCallback(
        async (
            issueId: number,
            message: string,
            cannotProvideProof?: boolean,
            images?: IssuePhoto[]
        ): Promise<boolean> => {
            if (!id) return false;
            const clientRequestId = uuidv4();
            const success = await respondToOndcIssueApi({
                userId,
                userType: role,
                id,
                issueId,
                message,
                cannotProvideProof,
                images,
                clientRequestId,
            });
            if (success) {
                await fetchIssues();
            }
            return success;
        },
        [id, userId, role, fetchIssues]
    );

    return {
        order,
        issues,
        isLoading,
        notFound,
        cancelOrder,
        raiseIssue,
        replyToIssue,
    };
}
