import { SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    AllSalaryComponentListResponse,
    BankDetailsType,
    BankListResponse,
    CompanyUserData,
    createDeductionComponentPayload,
    createDeductionComponentResponse,
    createSalaryComponentPayload,
    createSalaryComponentResponse,
    DeductionComponentListResponse,
    existingOrganizationSettings,
    GetBankDetailsType,
    GetCompanyProfileType,
    GetDeductionComponent,
    GetPayrollSettingsType,
    GetSalaryComponent,
    PayrollSettingsType,
    SalaryComponentListResponse,
    updateDeductionComponentPayload,
    updateSalaryCompoentPayload,
} from '../../types/organizationSettings';

export const companyProfileApi = async (
    payload: GetCompanyProfileType & { userId: number; userType: string }
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<GetCompanyProfileType> = await ApiClient.post(
            `${userType}/${userId}/payroll/organization-settings/company-profile`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const payrollSettingsApi = async (
    payload: GetPayrollSettingsType & { userId: number; userType: string }
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<PayrollSettingsType> = await ApiClient.post(
            `${userType}/${userId}/payroll/organization-settings/payroll-settings`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const skipDashboard = async (payload: {
    isSkipDasboard: boolean;
    userId: number;
    userType: string;
}) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<any> = await ApiClient.post(
            `${userType}/${userId}/payroll/dashBoard/dashboardStatus`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const bankDetailsApi = async (
    payload: GetBankDetailsType & { userId: number; userType: string }
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<BankDetailsType> = await ApiClient.post(
            `${userType}/${userId}/payroll/organization-settings/bank-details`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getOrganizationSettingsApi = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp: SuccessGenericResponse<existingOrganizationSettings> = await ApiClient.get(
            `${userType}/${userId}/payroll/organization-settings`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        console.error(err, 'error');
        return false;
    }
};
export const getCorporateorporateDetails = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp: SuccessGenericResponse<CompanyUserData> = await ApiClient.get(
            `${userType}/${userId}/payroll/organization-settings/corporate-details`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getBanks = async (payload: UserPayload) => {
    try {
        const resp: SuccessGenericResponse<BankListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/profile/bank`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getSalaryComponent = async (
    payload: GetSalaryComponent & { userId: number; userType: string }
) => {
    try {
        const res: SuccessGenericResponse<SalaryComponentListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary-component`,
            {
                params: {
                    page: payload.page,
                    limit: payload.limit,
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};
export const getAllSalaryComponent = async (payload: {
    userId: number;
    userType: string;
    eId: string;
}) => {
    try {
        const res: SuccessGenericResponse<AllSalaryComponentListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary-component/salary-component-listByEmail/${payload.eId}`,
            {}
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};
export const getCurrentSalaryComponent = async (payload: { userId: number; userType: string }) => {
    try {
        const resp: SuccessGenericResponse<AllSalaryComponentListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary-component/currentGlobalComponent`
        );
        const { data } = resp;
        
        return data;
    } catch (err) {
        return false;
    }
};
export const getCurrentEmployeeSalaryComponent = async (payload: {
    userId: number;
    userType: string;
    eId: string;
}) => {
    try {
        const resp: SuccessGenericResponse<AllSalaryComponentListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary-component/currentEmployeeComponent/${payload.eId}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const createEmployeeSalaryComponent = async (
    payload: createSalaryComponentPayload & UserPayload
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const res: SuccessGenericResponse<createSalaryComponentResponse> = await ApiClient.post(
            `${userType}/${userId}/payroll/salary-component/employee`,
            restPayload
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const updateEmployeeSalaryComponent = async (
    payload: updateSalaryCompoentPayload & UserPayload
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<any> = await ApiClient.post(
            `${userType}/${userId}/payroll/salary-component/employee`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const createSalaryComponent = async (
    payload: createSalaryComponentPayload & UserPayload
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const res: SuccessGenericResponse<createSalaryComponentResponse> = await ApiClient.post(
            `${userType}/${userId}/payroll/salary-component`,
            restPayload
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const updateSalaryComponent = async (payload: updateSalaryCompoentPayload & UserPayload) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<any> = await ApiClient.put(
            `${userType}/${userId}/payroll/salary-component/${restPayload.id}`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const deleteSalaryComponent = async (payload: UserPayload & { id: string }) => {
    try {
        const { userId, userType } = payload;
        const res: SuccessGenericResponse<{}> = await ApiClient.delete(
            `${userType}/${userId}/payroll/salary-component/${payload.id}`
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};
export const getDeductionComponent = async (payload: GetDeductionComponent & UserPayload) => {
    try {
        const res: SuccessGenericResponse<DeductionComponentListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/deduction-component`,
            {
                params: {
                    page: payload.page,
                    limit: payload.limit,
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const createDeductionComponent = async (
    payload: createDeductionComponentPayload & UserPayload
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const res: SuccessGenericResponse<createDeductionComponentResponse> = await ApiClient.post(
            `${userType}/${userId}/payroll/deduction-component`,
            restPayload
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const updateDeductionComponent = async (
    payload: updateDeductionComponentPayload & UserPayload
) => {
    try {
        const { userId, userType, ...restPayload } = payload;
        const resp: SuccessGenericResponse<any> = await ApiClient.put(
            `${userType}/${userId}/payroll/deduction-component/${payload.id}`,
            restPayload
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const deleteDeductionComponent = async (payload: UserPayload & { id: string }) => {
    try {
        const { userId, userType } = payload;
        const res: SuccessGenericResponse<{}> = await ApiClient.delete(
            `${userType}/${userId}/payroll/deduction-component/${payload.id}`
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};
export const getCompanyProfile = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp: SuccessGenericResponse<GetCompanyProfileType> = await ApiClient.get(
            `${userType}/${userId}/payroll/organization-settings/companyProfile`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        console.error(err, 'error');
        return false;
    }
};
export const getPayrollCycle = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp: SuccessGenericResponse<GetPayrollSettingsType> = await ApiClient.get(
            `${userType}/${userId}/payroll/organization-settings/payrollCycle`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        console.error(err, 'error');
        return false;
    }
};

export const getPayrollActiveYears = async (payload: UserPayload) => {
    try {
        const { userId, userType } = payload;
        const resp = await ApiClient.get(`${userType}/${userId}/payroll/organization-settings/active-years`);
        const { data } = resp;
        return data;
    } catch (err) {
        console.error(err, 'hello error');
        return false;
    }
};