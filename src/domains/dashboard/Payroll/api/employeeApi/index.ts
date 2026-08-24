import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    ValidationLimitSubscriptionResponse,
    ValidationResponse,
    getEmployeeAssetPayload,
    getEmployeeDocsPayload,
    validateEmployeeInformationPayload,
} from '../../types/type';
import {
    EmployeePayload,
    EmployeeListResponse,
    DeletePayload,
    DeleteResponse,
    CreatePayload,
    CreateResponse,
    FetchEmployeePayload,
    EmployeeGetResponse,
    CountriesResponse,
    UpdatePayload,
    UpdateResponse,
    GetReportingStaffPayload,
    EmployeesResponse,
    exportEmployeeDataPayload,
    exportEmployeeDataResponse,
    BulkEmployeeUploadResponse,
    BulkUploadCreatePayload,
    excelTemplatePayload,
    UpdatePayloadNew,
    OffBoardEmployeePayload,
    validateLimitSubscription,
} from '../../types/types';

export const getEmployeeList = async (payload: EmployeePayload) => {
    try {
        const searchText = encodeURIComponent(payload.searchText);
        const page = encodeURIComponent(payload.page);
        const limit = encodeURIComponent(payload.limit);
        const status = encodeURIComponent(payload.status);
        const sortField = encodeURIComponent(payload.sortField || 'dateOfJoin');
        const sortOrder = encodeURIComponent(payload.sortOrder || 'asc');

        const resp: SuccessGenericResponse<EmployeeListResponse> = await ApiClient.get(
            `/${payload.userType}/${payload.userId}/payroll/employee?page=${page}&limit=${limit}&searchText=${searchText}&status=${status}&sortField=${sortField}&sortOrder=${sortOrder}`
        );

        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const deleteEmployee = async (payload: DeletePayload) => {
    try {
        const resp: SuccessGenericResponse<DeleteResponse> = await ApiClient.delete(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.idToDelete}`
        );

        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const createEmployee = async (payload: CreatePayload) => {
    try {
        const resp: SuccessGenericResponse<CreateResponse> = await ApiClient.post(
            `/${payload.userType}/${payload.userId}/payroll/employee/alldata`,
            payload
        );

        // return resp;
        return { success: true, data: resp };
    } catch (err) {
        // return err.response.data.message
        return { success: false, errorMessage: err.response.data.message };
    }
};

export const getEmployee = async (payload: FetchEmployeePayload) => {
    try {
        const resp: SuccessGenericResponse<EmployeeGetResponse> = await ApiClient.get(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.employeeID}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getReportingStaffAPI = async (payload: FetchEmployeePayload) => {
    try {
        const resp: SuccessGenericResponse<EmployeeGetResponse> = await ApiClient.get(
            `/${payload.userType}/${payload.userId}/payroll/employee/reporting-staff/${payload.employeeID}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const confirmJoiningApi = async ({
    userId,
    userType,
    employeeId,
}: {
    userId: number;
    userType: string;
    employeeId: string;
}) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.put(
            `/${userType}/${userId}/payroll/employee/${employeeId}/confirm-joining`,
            {}
        );
        return { success: true, data: resp.data };
    } catch (err: any) {
        return { success: false, errorMessage: err?.response?.data?.message };
    }
};

export const getCountries = async (searchQuery?: string) => {
    try {
        let url = 'user/general/countries';

        if (searchQuery) {
            url += `?searchQuery=${encodeURIComponent(searchQuery)}`;
        }

        const resp: SuccessGenericResponse<CountriesResponse> = await ApiClient.get(url);

        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const updateEmployee = async (payload: UpdatePayload) => {
    try {
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/alldata/${payload.id}`,
            payload
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const updateEmployeeBankDetails = async (payload: UpdatePayloadNew) => {
    try {
        const { bankDetails } = payload;
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.id}/bankDetails`,
            bankDetails
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const updateEmployeeSalaryDetails = async (payload: UpdatePayloadNew) => {
    try {
        const { salaryInformation } = payload;
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.id}/salaryInformation`,
            salaryInformation
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const updateEmployeeInformation = async (payload: UpdatePayloadNew) => {
    try {
        const { employeeInformation } = payload;
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.id}/employeeInformation`,
            employeeInformation
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const updateEmployeePersonalInfo = async (payload: any) => {
    try {
        const { employeeBasicInformation } = payload;
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.id}`,
            employeeBasicInformation
        );

        return { success: true, data: resp };
    } catch (err) {
        console.error(err, 'errorrrrrr');
        // return err.response.data.message
        return { success: false, errorMessage: err.response.data.message };
    }
};

export const updateEmployeeWorkEmail = async (payload: {
    id: string;
    userId: number;
    userType: string;
    workEmailId: string;
}) => {
    try {
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/${payload.id}/work-email`,
            { workEmailId: payload.workEmailId }
        );

        return { success: true, data: resp };
    } catch (err: any) {
        return { success: false, errorMessage: err?.response?.data?.message };
    }
};

export const updateExitInformation = async (payload: UpdatePayloadNew) => {
    try {
        const { employeeInformation } = payload;
        const resp: SuccessGenericResponse<UpdateResponse> = await ApiClient.put(
            `/${payload.userType}/${payload.userId}/payroll/employee/exit-information/${payload.id}`,
            { ...employeeInformation }
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const getReportingStaff = async (payload: GetReportingStaffPayload) => {
    try {
        const resp: SuccessGenericResponse<EmployeesResponse> = await ApiClient.get(
            `/${payload.userType}/${payload.userId}/payroll/employee/all-employees?searchText=${payload.searchText}`
        );

        return resp;
    } catch (err) {
        return false;
    }
};

export const ExportEmployeeData = async (payload: exportEmployeeDataPayload) => {
    try {
        const resp: SuccessGenericResponse<exportEmployeeDataResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/employee/excel`,
            {
                params: {
                    employeeStatus: payload.employeeStatus,
                },
            }
        );
        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const BulkEmployeeUpload = async (payload: {
    file: File;
    userId: number;
    userType: string;
}) => {
    // Create FormData object
    const formData = new FormData();
    formData.append('file', payload.file, payload.file.name); // Append the file with its name

    try {
        const resp: SuccessGenericResponse<BulkEmployeeUploadResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/payroll/employee/bulk-excel-upload`,
            formData // Pass FormData as payload
        );

        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const BulkEmployeeCreate = async (payload: BulkUploadCreatePayload) => {
    try {
        const resp: ValidationResponse = await ApiClient.post(
            `${payload.userType}/${payload.userId}/payroll/employee/bulk-create`,
            payload
        );
        return resp;
    } catch (err) {
        return null;
    }
};

export const BulkExcelTemplate = async (payload: excelTemplatePayload) => {
    try {
        const resp = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/employee/bulk-excel-template`
        );

        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const BulkValidate = async (payload: BulkUploadCreatePayload) => {
    try {
        const resp: ValidationResponse = await ApiClient.post(
            `${payload.userType}/${payload.userId}/payroll/employee/bulk-validate`,
            payload
        );
        return resp;
    } catch (err) {
        return null;
    }
};

export const OffBoardEmployee = async (payload: OffBoardEmployeePayload) => {
    const {
        lastWorkingDay,
        noticePeriod,
        offBoardingType,
        reasonForOffBoarding,
        resignationLetter,
        offBoardingDate,
    } = payload;

    const postData = {
        lastWorkingDay,
        noticePeriod,
        offBoardingType,
        reasonForOffBoarding,
        resignationLetter,
        offBoardingDate,
    };

    // eslint-disable-next-line no-useless-catch
    try {
        const resp = await ApiClient.post(
            `${payload.userType}/${payload.userId}/payroll/employee/off-boarding/${payload.employeeId}`,
            postData
        );

        return resp;
    } catch (err) {
        throw err;
        return false;
    }
};

export const validateEmployeeInformation = async ({
    userId,
    userType,
    ...payload
}: validateEmployeeInformationPayload) => {
    try {
        const resp: ValidationResponse = await ApiClient.post(
            `${userType}/${userId}/payroll/employee/validate`,
            payload
        );
        return { success: true, data: resp };
    } catch (err) {
        return { success: false, errorMessage: err.response.data.message };
    }
};

export const getEmployeeDocs = async ({ userId, userType, ...payload }: getEmployeeDocsPayload) => {
    try {
        const resp = await ApiClient.get(
            `${userType}/${userId}/payroll/documents/${payload.employeeId}`,
            {
                params: {
                    page: payload.page,
                    limit: payload.limit,
                    search: payload.search,
                },
            }
        );

        const { data } = resp;

        return { success: true, data };
    } catch (err) {
        return { success: false, errorMessage: err.response.data.message };
    }
};

export const getEmployeeAssets = async ({
    userId,
    userType,
    ...payload
}: getEmployeeAssetPayload) => {
    try {
        const resp = await ApiClient.get(
            `${userType}/${userId}/payroll/assets/${payload.employeeId}`,
            {
                params: {
                    page: payload.page,
                    limit: payload.limit,
                    assetType: payload.assetType,
                    status: payload.assetStatus,
                    searchText: payload.searchText,
                },
            }
        );

        const { data } = resp;

        return { success: true, data };
    } catch (err) {
        return { success: false, errorMessage: err.response.data.message };
    }
};

export type AttendanceMetrics = {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
    otHours: number;
    month: { from: string; to: string };
};

export const getAttendanceMetrics = async ({
    userType,
    userId,
    employeeId,
    month,
}: {
    userType: string;
    userId: number;
    employeeId: string;
    month?: string; // YYYY-MM
}) => {
    try {
        const resp: SuccessGenericResponse<AttendanceMetrics> = await ApiClient.get(
            `${userType}/${userId}/payroll/employee/${employeeId}/attendance/metrics`,
            { params: month ? { month } : undefined }
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};

export const validateEmployeeSubscriptionLimit = async (payload: validateLimitSubscription) => {
    try {
        const resp: ValidationLimitSubscriptionResponse = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/employee/validateSubscriptionLimit`
        );
        return resp;
    } catch (err) {
        return { success: false, errorMessage: err.response.data.message };
    }
};
