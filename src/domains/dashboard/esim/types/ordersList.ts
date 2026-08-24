export type OrdersListPayload = {
    userId: number;
    userType: string;
    page: number;
    itemsPerPage: number;
    searchText: string;
    fromDate: string;
    toDate: string;
};


interface InstallationGuides {
    [key: string]: string;
}

interface PackageDetails {
    id: number;
    code: string;
    data: string;
    type: string;
    price: number;
    package: string;
    currency: string;
    quantity: string;
    validity: number;
    esim_type: string;
    created_at: string; // Assuming this is a valid date-time string
    package_id: string;
    description: null | string;
    installation_guides: InstallationGuides;
    manual_installation: string;
    qrcode_installation: string;
}

interface SimDetail {
    id: number;
    lpa: string;
    iccid: string;
    imsis: null | string;
    qrcode: string;
    apn_type: string;
    apn_value: null | string;
    created_at: string; // Assuming this is a valid date-time string
    is_roaming: boolean;
    qrcode_url: string;
    airalo_code: null | string;
    matching_id: string;
    confirmation_code: null | string;
}

interface Credential {
    id: number;
    name: string;
}

interface Transaction {
    corporateTxnId: string;
    order: {
        paymentMode: string;
        amountInINR: number;
    };
    status: string;
}

interface DataItem {
    id: number;
    packageDetails: PackageDetails;
    simDetails: SimDetail[];
    remarks: null | string;
    quantity: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
    credentialId: number;
    transactionId: number;
    credential: Credential;
    transaction: Transaction;
    orderId: number;
    corporateTxnId: number;
    paymentMode: string;
    simDetailsEsim: string;
    simDetailsPlanId: string | null;
    amountInINR: number;
    status: string;
    customerUid: string;
    country: string;
}

interface TopUpDetailItem {
    createdAt: string;
    transactionCategory: string;
    orderId: string;
    amountInINR: string;
    paymentMode: string;
    eSIM: string | null;
    planCreatedAt: string;
    metadata: string | null;
    planId: string;
    type: string;
    validity: string | null;
    data: string | null;
}

export interface ordersList {
    data: DataItem[];
    recordsTotal: number;
}

export interface topUpHistoryList {
    data: TopUpDetailItem[];
    recordsTotal: number;
}
