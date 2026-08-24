import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { getData } from '../types/index';

export interface GovtServicesApplicationBody {
    id: number;
    applicationNumber: string;
    service: string;
    status: string;
    currentStep: number;
    formData: Record<string, Record<string, string>>;
    adminNotes: string | null;
    remarks: string | null;
    submittedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    credentialId: number;
    credential?: {
        name: string;
        username: string;
    };
}

export interface GovtServicesApplicationResponse {
    recordsTotal: number;
    data: GovtServicesApplicationBody[];
}

const BASE = (userType: string, userId: number) =>
    `${userType}/${userId}/purchase/govt-services/applications`;

export const getAllGovtServicesApplications = async (
    payload: { userType: string; userId: number } & getData
) => {
    try {
        const resp: SuccessGenericResponse<GovtServicesApplicationResponse> = await ApiClient.get(
            `${BASE(payload.userType, payload.userId)}/all`,
            {
                params: {
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    search: payload.searchText,
                    from: payload.from,
                    to: payload.to,
                    corporateId: payload.id,
                    status: payload.status || undefined,
                    sort: payload.sort,
                    sortField: payload.sortField || undefined,
                },
            }
        );
        return resp.data;
    } catch {
        return false;
    }
};

export const getGovtServicesApplicationById = async (
    userType: string,
    userId: number,
    id: number | string
) => {
    try {
        const resp: SuccessGenericResponse<GovtServicesApplicationBody> = await ApiClient.get(
            `${BASE(userType, userId)}/${id}`
        );
        return resp.data;
    } catch {
        return false;
    }
};

export const downloadGovtServicesDocument = async (
    userType: string,
    userId: number,
    url: string
) => {
    try {
        const resp = await ApiClient.get(`${BASE(userType, userId)}/download`, {
            params: { url },
        });
        return resp.data as { buffer: { type: string; data: number[] }; fileType: string };
    } catch {
        return false;
    }
};

export const updateGovtServicesApplicationStatus = async (
    userType: string,
    userId: number,
    id: number | string,
    payload: { status: string; remarks?: string; documentBase64?: string; documentFormat?: string }
) => {
    try {
        const resp: SuccessGenericResponse<GovtServicesApplicationBody> = await ApiClient.put(
            `${BASE(userType, userId)}/${id}/status`,
            payload
        );
        return resp;
    } catch {
        return false;
    }
};
