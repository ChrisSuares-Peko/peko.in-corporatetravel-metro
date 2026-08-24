import { CommonFileBuffer, SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

export const getAllData = async (payload: UserPayload & any) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/service-rule`,
            {
                params: {
                    sort: payload.sort,
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sortField: payload.sortField,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getFileBufferReport = async (payload: UserPayload & any) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/service-rule/documents/${payload.type}`,
            {
                params: {
                    orderCol: payload.sort,
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getUpdateStatus = async ({ userId, userType, ...payload }: UserPayload & any) => {
    try {
        const { docId } = payload;
        const resp: SuccessGenericResponse<any> = await ApiClient.put(
            `${userType}/${userId}/others/service-rule/updateStatus/${docId}`,
            payload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const deleteDocument = async (payload: UserPayload & { docId: number }) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.delete(
            `${payload.userType}/${payload.userId}/others/service-rule/${payload.docId}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const createDocument = async ({ userId, userType, ...payload }: UserPayload & any) => {
    try {
        delete payload.id;
        const resp: SuccessGenericResponse<any> = await ApiClient.post(
            `${userType}/${userId}/others/service-rule/`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};

export const updateDocument = async ({ userId, userType, ...payload }: UserPayload & any) => {
    try {
        const { id } = payload;
        delete payload.id;
        const resp: SuccessGenericResponse<any> = await ApiClient.put(
            `${userType}/${userId}/others/service-rule/${id}`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
