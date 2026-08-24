import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { SalaryStatementApiResponse } from '../../types/salaryProfileTypes/employeeSalaryProfile';
import {
    approveSalaryPayload,
    employeePayrollHistory,
    employeeSalaryDetails,
    employeeSalaryListingPayload,
    employeeSalaryListingResponse,
    payrollHistoryExcelPayload,
    payrollHistoryExcelResponse,
    exportSalaryDatapPayload,
    exportSalaryDataResponse,
    payrollHistory,
    PayrollHistoryResponse,
    PayslipResponse,
    SalaryDetailsResponse,
} from '../../types/salaryProfileTypes/employeeSalaryTable';

export const employeeSalaryListing = async (payload: employeeSalaryListingPayload) => {
    try {
        const res: SuccessGenericResponse<employeeSalaryListingResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/calculateSalary`,
            {
                params: {
                    year: Number(payload.year),
                    month: Number(payload.month),
                    searchText: payload.searchText,
                    sort: payload.sort,
                    page: payload.page,
                    filter: payload.filter,
                    limit: 10,
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const employeeSalaryResponseListing = async (payload: employeeSalaryListingPayload) => {
    try {
        const res: SuccessGenericResponse<SalaryStatementApiResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/statement`,
            {
                params: {
                    year: Number(payload.year),
                    month: Number(payload.month),
                    searchText: payload.searchText,
                    sort: payload.sort,
                    page: payload.page,
                    filter: payload.filter,
                    limit: 10,
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const ExportSalaryData = async (payload: exportSalaryDatapPayload) => {
    try {
        const resp: SuccessGenericResponse<exportSalaryDataResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/statement/excel?month=${payload.month}&year=${payload.year}${payload.filter ? `&filter=${payload.filter}` : ''}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getPayrollHistoryByEmployeeId = async (payload: employeePayrollHistory) => {
    try {
        const res:SuccessGenericResponse<PayslipResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/all-payroll-slips/${payload.id}`,
            {
                params: {
                    year: Number(payload.year),
                    page: payload.page,
                    limit: 10,
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const approveSalary = async (payload: approveSalaryPayload) => {
    try {
        const res = await ApiClient.put(
            `${payload.userType}/${payload.userId}/payroll/salary/approve-salary`,
            {
                sendPayslip:payload.sendPayslip,
                payingDate:payload.payingDate,
                month:payload.month,
                year:payload.year,
                userType:payload.userType,
            }
        );
     
        return res;
    } catch (error: any) {
        return error?.response?.data || false;
    }
};

export const markAsPaidSalary = async (payload: approveSalaryPayload) => {
    try {
        const res = await ApiClient.put(
            `${payload.userType}/${payload.userId}/payroll/salary/mark-as-paid`,
            {
                payingDate: payload.payingDate,
                month: payload.month,
                year: payload.year,
                sendPayslip: payload.sendPayslip,
            }
        );
        return res;
    } catch (error: any) {
        return error?.response?.data || false;
    }
};

export const markAsApprovedSalary = async (payload: { userId: number; userType: string; month: number; year: number }) => {
    try {
        const res = await ApiClient.put(
            `${payload.userType}/${payload.userId}/payroll/salary/mark-as-approved`,
            { month: payload.month, year: payload.year }
        );
        return res;
    } catch (error: any) {
        return error?.response?.data || false;
    }
};

export const getSalaryDetailsByEmployeeId = async (payload:employeeSalaryDetails) =>{
     try {
        const res:SuccessGenericResponse<SalaryDetailsResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/empSalaryProfile/${payload.id}`,
            {
                params: {
                    year: payload.year,
                    month: payload.month
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
}

export const getPayrollHistory = async (payload:payrollHistory) =>{
    try {
        const res:SuccessGenericResponse<PayrollHistoryResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/payrollHistory`,
            {
                params: {
                    year: Number(payload.year),
                },
            }
        );
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
}

export const getPayrollHistoryExcel = async (payload: payrollHistoryExcelPayload) => {
    try {
        const res: payrollHistoryExcelResponse = await ApiClient.get(
            `${payload.userType}/${payload.userId}/payroll/salary/payrollHistory/excel`,
            {
                params: {
                    year: Number(payload.year),
                },
            }
        );
        return res;
    } catch (error) {
        return false;
    }
};
