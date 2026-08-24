import { SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { CorporateRechargeData, ServiceResp, corporateDataResp } from '../types/createTransactions';

export const createTransactiond = async (payload: UserPayload & CorporateRechargeData) => {
    try {
        const resp: SuccessGenericResponse<CorporateRechargeData> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/others/createTransaction`,
            payload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getCorporates = async (payload: UserPayload & { searchText: string }) => {
    try {
        const resp: SuccessGenericResponse<corporateDataResp> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/transferFunds/corporate-users?searchText=${payload.searchText}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getOperators = async (payload: UserPayload & { searchText: string }) => {
    try {
        const resp: SuccessGenericResponse<ServiceResp> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/createTransaction/services?searchText=${payload.searchText}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
