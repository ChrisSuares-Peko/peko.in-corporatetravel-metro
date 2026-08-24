import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { OndcIssue } from '../types/ondcIssue';
import {
    OndcOrderDetail,
    OndcOrderDetailRequestPayload,
    OndcOrderHistoryRequestPayload,
    OndcOrderHistoryResponse,
} from '../types/ondcOrderHistory';
import { IssuePhoto } from '../utils/issuePhoto';

/** ONDC order history list (confirmed orders), paginated/filterable. */
export const getOndcOrderHistoryApi = async (payload: OndcOrderHistoryRequestPayload) => {
    try {
        const { userId, userType, from, to, search, page, itemsPerPage } = payload;
        const params = { from, to, search, page, itemsPerPage };
        const resp: SuccessGenericResponse<OndcOrderHistoryResponse> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders`,
            { params }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

/** Single confirmed order detail (Order Details page). */
export const getOndcOrderByIdApi = async (payload: OndcOrderDetailRequestPayload) => {
    try {
        const { userId, userType, id } = payload;
        const resp: SuccessGenericResponse<OndcOrderDetail> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders/${id}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

/** Cancel a confirmed ONDC order — a real, direct /cancel call to the seller
 *  (Order Details page's "Cancel order" flow), not a request queued for later. */
export const cancelOndcOrderApi = async (
    payload: OndcOrderDetailRequestPayload & { reason: string; description: string }
) => {
    try {
        const { userId, userType, id, reason, description } = payload;
        await ApiClient.post(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders/${id}/cancel`,
            { reason, description }
        );
        return true;
    } catch (err) {
        return false;
    }
};

/** Get issues raised on a confirmed order (newest first, each with its full thread). */
export const getOndcOrderIssuesApi = async (payload: OndcOrderDetailRequestPayload) => {
    try {
        const { userId, userType, id } = payload;
        const resp: SuccessGenericResponse<{ rows: OndcIssue[] }> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders/${id}/issues`
        );
        return resp.data.rows;
    } catch (err) {
        return [];
    }
};

/** Raise a new issue on a confirmed order */
export const raiseOndcIssueApi = async (
    payload: OndcOrderDetailRequestPayload & {
        category: string;
        subCategory: string;
        description: string;
        images?: IssuePhoto[];
        clientRequestId: string;
    }
) => {
    try {
        const { userId, userType, id, category, subCategory, description, images, clientRequestId } = payload;
        const resp = await ApiClient.post(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders/${id}/issues`,
            { category, subCategory, description, images, clientRequestId }
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};

/** Reply or close an existing issue */
export const respondToOndcIssueApi = async (
    payload: OndcOrderDetailRequestPayload & {
        issueId: number;
        message: string;
        cannotProvideProof?: boolean;
        images?: IssuePhoto[];
        clientRequestId: string;
    }
) => {
    try {
        const { userId, userType, id, issueId, message, cannotProvideProof, images, clientRequestId } = payload;
        await ApiClient.post(
            `${userType}/${userId}/purchase/ecommerce/ondc/orders/${id}/issues/${issueId}/respond`,
            { message, cannotProvideProof, images, clientRequestId }
        );
        return true;
    } catch (err) {
        return false;
    }
};
