import { SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    CreatePGMethodsByService,
    CreatePGMethodsByServiceResponse,
    EditPGMethodsByService,
    FilterType,
    PaymentMethodsResponse,
    PaymentMethodsState,
} from '../types/paymentMethods';

export const getPaymentMethodsApi = async (payload: UserPayload & FilterType) => {
    try {
        const resp: SuccessGenericResponse<PaymentMethodsResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payment-gateway/payment-methods`,
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
        return resp.data;
    } catch (err) {
        return false;
    }
};

export const updatePaymentMethodsApi = async ({
    userId,
    userType,
    ...payload
}: UserPayload & PaymentMethodsState) => {
    try {
        const resp: SuccessGenericResponse<PaymentMethodsState> = await ApiClient.put(
            `${userType}/${userId}/payment-gateway/payment-methods/update`,
            payload
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};

export const createPaymentMethodsByService = async ({
    userId,
    userType,
    ...payload
}: UserPayload & CreatePGMethodsByService) => {
    try {
        const resp: SuccessGenericResponse<CreatePGMethodsByServiceResponse> = await ApiClient.post(
            `${userType}/${userId}/payment-gateway/payment-methods/create`,
            payload
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};

export const updatePaymentMethodsByService = async ({
    userId,
    userType,
    ...payload
}: UserPayload & EditPGMethodsByService) => {
    try {
        const resp: SuccessGenericResponse<{}> = await ApiClient.put(
            `${userType}/${userId}/payment-gateway/payment-methods/edit/${payload.rowIdToUpdate}`,
            payload
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};
