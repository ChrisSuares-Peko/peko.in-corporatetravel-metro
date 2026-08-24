export type EpfPayload = {
    epfNumber: string;
    employeeContributionRate: string;
    employerContributionRate: string;
    enableProRatedPfWage: boolean;
    considerSalaryComponents: boolean;
};

export type saveEpfResponse = {
    status: boolean;
    responseCode: string;
    message: string;
    data: EpfPayload;
};

export type EsiPayload = {
    esiNumber: string;
    deductionCycle: string;
    employeeContribution: number;
    employerContribution: number;
};

export type saveEsiResponse = {
    status: boolean;
    responseCode: string;
    message: string;
    data: EsiPayload;
};
export type IncomeSlab = {
    incomeStartRange: number;
    incomeEndRange: number;
    taxAmount: number;
};
export type TaxPayload = {
    ptNumber: string;
    deductionCycle: string;
    incomeSlabs: IncomeSlab[];
};

export type LabWelfarePayload = {
    deductionCycle: string;
    employeeContribution: number;
    employerContribution: number;
};

export interface BsrDetails {
    bankName: string;
    bsrCode: string;
}

export interface AuthorizedSignatoryDetails {
    name: string;
    fathersName: string;
    signature: string; // This could be a URL or file path to the signature image
    placeOfSigning: string;
}

export interface TdsSettingsPayload {
    taxRegime: string;
    assignedCommissioner: string;
    address: string;
    bsr: BsrDetails;
    authorizedSignatoryDetails: AuthorizedSignatoryDetails;
}

export type saveLabWelfareResponse = {
    status: boolean;
    responseCode: string;
    message: string;
    data: LabWelfarePayload;
};

export type ComplianceSettingsResponse = {
    status: boolean;
    responseCode: string;
    message: string;
    data: {
        epf: {
            epfNumber: string;
            employeeContributionRate: string;
            employerContributionRate: string;
            enableProRatedPfWage: boolean;
            considerSalaryComponents: boolean;
        };
        esi: {
            esiNumber: string;
            deductionCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
            employeeContribution: number;
            employerContribution: number;
        };
        professionalTax: {
            ptNumber: string;
            deductionCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
            incomeSlabs: {
                incomeStartRange: number;
                incomeEndRange: number;
                taxAmount: number;
                _id: string;
            }[];
        };
        laborWelfareFund: {
            deductionCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
            employeeContribution: number;
            employerContribution: number;
        };
    };
    _id: string;
};

export type UpdateComplianceSettingsPayload = {
    epf?: {
        epfNumber?: string;
        employeeContributionRate?: string;
        employerContributionRate?: string;
        enableProRatedPfWage?: boolean;
        considerSalaryComponents?: boolean;
    };
    esi?: {
        esiNumber?: string;
        deductionCycle?: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
        employeeContribution?: number;
        employerContribution?: number;
        enableEmployerContribution?: boolean;
    };
    professionalTax?: {
        ptNumber?: string;
        deductionCycle?: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
        incomeSlabs?: Array<{
            incomeStartRange: number;
            incomeEndRange: number;
            taxAmount: number;
        }>;
    };
    laborWelfareFund?: {
        deductionCycle?: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
        employeeContribution?: number;
        employerContribution?: number;
    };
};
