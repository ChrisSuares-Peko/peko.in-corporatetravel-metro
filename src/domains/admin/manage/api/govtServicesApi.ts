import { SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    GovtService,
    GovtServiceData,
    GovtServiceFilters,
    GovtServiceRequest,
    GovtServiceUpdateStatus,
} from '../types/govtServicesTypes';

export const getAllGovtServices = async (payload: UserPayload & GovtServiceFilters) => {
    try {
        const resp: SuccessGenericResponse<GovtServiceData> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/purchase/govt-services/all`,
            {
                params: {
                    page: payload.page,
                    pageSize: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sortField: payload.sortField,
                    orderCol: payload.sort,
                },
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

export const getGovtServiceById = async (payload: UserPayload & { id: number }) => {
    try {
        const resp: SuccessGenericResponse<GovtService> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/purchase/govt-services/${payload.id}`
        );
        return resp.data;
    } catch {
        return false;
    }
};

const sanitizePayload = (payload: GovtServiceRequest) => {
    const { authority, ...rest } = payload;
    return authority ? { ...rest, authority } : rest;
};

export const createGovtService = async ({
    userId,
    userType,
    ...payload
}: UserPayload & GovtServiceRequest) => {
    try {
        const resp: SuccessGenericResponse<GovtService> = await ApiClient.post(
            `${userType}/${userId}/purchase/govt-services/`,
            sanitizePayload(payload)
        );
        return resp;
    } catch {
        return false;
    }
};

export const updateGovtService = async ({
    userId,
    userType,
    id,
    ...payload
}: UserPayload & GovtServiceRequest) => {
    try {
        const resp: SuccessGenericResponse<GovtService> = await ApiClient.put(
            `${userType}/${userId}/purchase/govt-services/${id}`,
            sanitizePayload(payload)
        );
        return resp;
    } catch {
        return false;
    }
};

export const updateGovtServiceStatus = async (
    payload: UserPayload & GovtServiceUpdateStatus
) => {
    try {
        const resp: SuccessGenericResponse<GovtService> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/purchase/govt-services/updateStatus/${payload.id}`,
            { status: payload.status }
        );
        return resp.data;
    } catch {
        return false;
    }
};
