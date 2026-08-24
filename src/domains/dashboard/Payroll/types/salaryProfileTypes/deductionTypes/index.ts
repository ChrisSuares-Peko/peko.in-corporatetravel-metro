export type addDeductionPayload = {
    employeeId: string;
    userId: number;
    userType: string;
    deductionName: string;
    amountPercentage: number;
};
export type getDeductionPayload = {
    eId: string | undefined;
    userId: number;
    userType: string;
    page: number;
    limit: number;
    year: number;
    month: number | string;
};
export type updateDeductionPayload = {
    id: string;
    employeeId: string;
    userId: number;
    userType: string;
    deductionDate: string;
    deductionType: string;
    deductionAmount: number;
};
export type singleDeductionPayload = {
    eId?: string;
    userId: number;
    userType: string;
    deductionId: string;
};
export type getDeductionResponse = {
    totalCount: number;
    deductions: deductionList[];
};
type deductionList = {
    corporateUser: string;
    employee: string;
    deductionDate: string;
    deductionType: string;
    deductionAmount: number;
    deductionStatus: string;
    createdAt: string; // ISO 8601 formatted date string
    updatedAt: string; // ISO 8601 formatted date string
    id: string;
    description?: string;
};

export type deductionTableType = {
    employeeId: string;
    employeeName: string;
    deductionDate: string;
    deductionType: string;
    deductionAmount: number;
    deductionStatus: string;
    id: string;
    description?: string;
};
export interface DeductionFormType {
    employeeId: string;
    deductionName: string;
    amountPercentage: number;
}
export type deduction = {
    deductionDate: string;
    deductionType: string;
    deductionAmount: number;
    deductionStatus: string;
    employeeId: string;
};
