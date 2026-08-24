import { UserPayload } from '@customtypes/general';

export type OrderDatatype = {
    id: string;
    credential: string;
    email: string;
    mobileNo: string;
    partnerName: string;
    action: JSX.Element;
};

export type Credential = {
    username: string;
    role: string;
    name: string;
    registeredBy: any; // Change this to the appropriate type if known
    passwordProtection: number;
    accountType?: 'freelancer' | 'corporate';
};

export type Data = {
    id: number;
    email: string;
    mobileNo: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    designation: string | null;
    website: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    sector: string | null;
    poBox: string | null;
    countryCode: string;
    contactPersonName: string | null;
    companyName: string;
    companySize: string | null;
    contactPersonEmail: string | null;
    contactPersonPhone: string | null;
    cinNumber: string | null;
    activity: string | null;
    tradeLicenseExpiry: string | null;
    tradeLicenseDoc: string | null;
    trnCertificate: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    issuingAuthority: string | null;
    referralCode: string | null;
    kycRemarks: string | null;
    kycStatus: string;
    latLng: string | null;
    logo: string | null;
    isActive: number;
    registeredBy: string | null;
    isMFA: number;
    sendMfaCodeToEmail: number;
    sendMfaCodeToPhone: number;
    sendMfaCodeToAuthApp: number;
    totpSecret: string | null;
    landlineNo: string | null;
    backupCodes: string | null;
    monthlyReport: string | null;
    weeklyReport: string | null;
    dailyReport: string | null;
    eidDoc: string | null;
    trnExpiry: string | null;
    createdAt: string;
    updatedAt: string;
    packageId: number;
    credentialId: number;
    credential: Credential;
    balance: string;
    partnerId: number | null;
    partner?: {
        id: number | null;
        name: string | null;
    };
    partnerName?: string;
    status?: string;
    remarks?: string;
};

export type ApiResponse = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: Data[];
};
export type updateStatus = {
    corporateId: string | number;
    isActive: any;
};
export type categorySearch = {
    searchText: string;
};
export type activeResponse = {
    data: string;
};
export type categoryResponse = {
    data: categoryData[];
};
export type categoryData = {
    id: number | string;
    username: string;
    name: string;
};

export type getCorporateUsers = {
    searchText: string;
    page: number;
    itemsPerPage: number;
    partnerId: string | number;
    type?: string;
    sort?: string;
    sortField?: string;
    from?: string;
    to?: string;
    status?: string;
};

export type updateData = {
    id?: number;
    contactPersonName: string;
    name: string;
    activity?: string;
    state?: string;
    city: string;
    email: string;
    kycStatus: string;
    mobileNo: string;
    packageId: string;
    passwordProtection: boolean;
    designation: string;
    cinNumber?: string;
    tradeLicenseExpiry: string | null;
    gstNumber?: string;
    panNumber?: string;
    trnExpiry: string | null;
};

export type kycResponse = {
    kycType: kycTypes[];
};

export type kycTypes = {
    value: string;
    label: string;
};
export type packagesResponse = {
    data: packagesTypes[];
};

export type packagesTypes = {
    id: string;
    packageName: string;
};
export type partnerData = {
    partnerId?: string;
};

export type AddNewCorporate = {
    name: string;
    contactPersonName: string;
    email: string;
    mobileNo: string;
    countryCode: string;
    autoPasswordGeneration: boolean;
    registeredBy?: string | number | null;
};

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
export type CustomerParam = {
    dataType: string;
    maxLength: number;
    minLength: number;
    isOptional: string;
    paramName: string;
    regex: string;
    values: string | null;
    visibility: boolean;
};

export type OptionsType = {
    value: string;
    label: string;
    customerParams: CustomerParam[] | [];
};

export type StateListResponse = {
    states: { label: string; value: string }[];
};

export interface verifyGSTPayload extends UserPayload {
    value: string;
    type: 'gst' | 'pan' | 'cin';
    email: string;
}

export interface GSTDetailsResponse {
    requestId: string;
    result: {
        registrationDate: string;
        tradeName: string;
        natureOfBusiness: string[];
        principalBusinessAddress: {
            nature: string;
            email: string;
            mobile: string;
            address: string;
        };
        gstin: string;
        stateJurisdiction: string;
        taxPayerType: string;
        businessConstitution: string;
        gstRegistrationStatus: string;
        legalName: string;
    };
    source: string;
}

export type PendingSignupData = {
    id: string | number;
    status?: string;
    remarks?: string;
};
