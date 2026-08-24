/* eslint-disable @typescript-eslint/no-unused-vars */
import { SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    AddCustomerFormValues,
    CustomerDashboardResponse,
    GetAllCustomersPayload,
    GetAllCustomersResponse,
    VerifyCustomerBankPayload,
    VerifyCustomerBankResponse,
} from '../types/customer';

export const getCustomerDashboard = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp: SuccessGenericResponse<CustomerDashboardResponse> = await ApiClient.get(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2/dashboard`
        );
        return resp;
    } catch {
        return false;
    }
};

export const getAllCustomers = async (payload: UserPayload & GetAllCustomersPayload) => {
    try {
        const { userId, userType, ...params } = payload;
        const resp: SuccessGenericResponse<GetAllCustomersResponse> = await ApiClient.get(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2`,
            { params }
        );
        return resp;
    } catch {
        return false;
    }
};

export const addNewCustomer = async (
    payload: AddCustomerFormValues & { userId: number; userType: string }
) => {
    try {
        const { userId, userType, bankAccounts, shippingSameAsPrimary, ...restPayload } = payload;
        const resp: SuccessGenericResponse<{}> = await ApiClient.post(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2`,
            { bankDetails: bankAccounts, ...restPayload }
        );
        return resp;
    } catch {
        return false;
    }
};

export const editCustomerApi = async (
    customerId: string,
    payload: AddCustomerFormValues & { userId: number; userType: string }
) => {
    try {
        const { userId, userType, bankAccounts, shippingSameAsPrimary, ...restPayload } = payload;
        const resp: SuccessGenericResponse<{}> = await ApiClient.put(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2/${customerId}`,
            { bankDetails: bankAccounts, ...restPayload }
        );
        return resp;
    } catch {
        return false;
    }
};

export const deleteCustomerApi = async (payload: {
    userId: number;
    userType: string;
    customerId: string;
}) => {
    try {
        const { userId, userType, customerId } = payload;
        const resp: SuccessGenericResponse<{}> = await ApiClient.delete(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2/${customerId}`
        );
        return resp;
    } catch {
        return false;
    }
};

export const verifyCustomerBankApi = async (
    payload: UserPayload & VerifyCustomerBankPayload
) => {
    try {
        const { userId, userType, ...body } = payload;
        const resp: SuccessGenericResponse<VerifyCustomerBankResponse> = await ApiClient.post(
            `${userType}/${userId}/officeAndBusiness/invoice-customer/v2/verify-bank`,
            body
        );
        return resp;
    } catch (error) {
        return (error as any)?.response?.data ?? false;
    }
};
