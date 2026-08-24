import { CorporateUser } from '../../settings/types/disabledTypes';

type payload = {
    userId: number;
    userType: string;
};

export type walletReportListing = payload & {
    fromDate?: string;
    toDate?: string;
    sort: 'ASC' | 'DESC';
    page: number;
    searchText?: string;
    corporateId?: string;
    sortField?: string;
};

export type Reports = {
    id: number;
    corporateTxnId: string;
    transactionId: number | null;
    transactionDate: string;
    transactionType: string;
    transactionCategory: string;
    debitAmount: string;
    creditAmount: string;
    totalCashback: string;
    corporateCashback: string;
    systemCashback: string;
    balance: string;
    remarks: string;
    status: string | null;
    providerId: string;
    commissionDetails: any; // Define a specific type if possible
    createdAt: string;
    updatedAt: string;
    serviceOperatorId: number | null;
    credentialId: number;
    orderId: number | null;
    credential: {
        name: string;
    };
};

export type walletListingResponse = {
    data: Reports[];
    recordsTotal: number;
    recordsFiltered: number;
};

export type CorporateListResponse = {
    result: CorporateUser[];
};
