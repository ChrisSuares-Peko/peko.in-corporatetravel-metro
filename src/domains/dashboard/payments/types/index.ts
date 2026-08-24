import { UserPayload } from '@customtypes/general';

export type PaymentGeneric = {
    accessKey?: string;
    successUrl?: string;
    failureUrl?: string;
    amount?: number | string;
    total?: number;
    [key: string]: number | string | Object | undefined | null;
    outbount?: {
        amount: number;
    };
    billerId?: string;
};

export type CardPaymentResponse = {
    redirectLink: string;
};

export type WalletBalanceResponse = {
    balance: string | number;
    credentialId: number;
    'credential.name': string;
    'credential.role': string;
};
export interface BulkPaymentDataItem {
    account: string;
    transactionId: string;
    providerTransactionId: string;
    amount: number;
    lastBalance: string;
    type: string;
    flexiKey: string;
    typeKey: number;
    corporateTxnId: number;
    batchId: number;
    accessKey: string;
    isLastItem: boolean;
    paymentStatus: string;
}
export type PaymentResponse = {
    pending: boolean;
    processing?: boolean;
    failed?: boolean;
    details: {
        message: string;
    };
    corporateFinalBalance: string;
    corporateCashback: string;
    orderId: number;
    datetime: string;
    amount: number;
    corporateTxnId: number;
    bulkPaymentData: BulkPaymentDataItem[];
    successUrl?: string;
    orderNumber?: string;
    order_number?: string;
};

export type PaytmCreateOrderPayload = {
    pgAmount: number;
    successUrl?: string;
    failureUrl?: string;
    accessKey?: string;
    amount?: number | string;
    [key: string]: number | string | Object | undefined | null;
    couponCode?: string;
};

export type PaytmCreateOrderResponse = {
    amount: string;
    orderId: number;
    session_id: string;
    details?: {
        message: string;
    };
};

export enum PaymentMode {
    PAYTM = 'PAYTM',
    card = 'CARD',
    wallet = 'PEKO-WALLET',
    cashback = 'CASHBACK',
    CCAVENUE = 'CCAVENUE',
    empty = '',
}

export type CCavenueInitiateResponse = {
    iframeUrl: string;
};

export type TransactionDetailsPayload = {
    transactionId: string;
};
export type TransactionDetailsResponse = {
    id: number;
    corporateTxnId: string;
    operatorId: string;
    providerId: string;
    transactionDate: string;
    accountNo: string;
    amountInINR: string;
    baseAmount: string;
    paymentMode: string;
    orderResponse: string;
    paymentModeResponse: string;
    surcharge: string;
    baseCurrency: string;
    exchangeRate: string;
    status: string;
    message: string;
    ecomOrderStatus: string;
    workspaceOrderStatus: string;
    shipmentStatus: any[];
    createdAt: string;
    updatedAt: string;
    serviceOperatorId: number;
    credentialId: number;
    serviceOperator: {
        serviceProvider: string;
        accessKey: string;
    };
    couponData: {
        discountAmount: number;
    };
};
interface BillPaymentParam {
    paramName: string | null;
    paramValue: string | null;
}
export interface PaymentResultTableProps {
    paymentData: {
        transactionDate?: string;
        corporateTxnId?: string;
        serviceProvider?: string;
        amount?: number | string;
        paymentMode?: string;
        billPaymentParams?: BillPaymentParam[] | null;
        mobileNo?: string;
        amountInINR?: number;
        couponDiscount?: number;
    };
}

export type earningCashbackPayload = {
    billAmount: number;
    accessKey: string;
};

export type UsePaymentApiProps = {
    setCheckoutJsInstance: React.Dispatch<React.SetStateAction<any>>;
    checkoutJsInstance: any;
    successBasePath?: string;
};

export type BulkPaymentResp = {
    account: string;
    amount: number;
    surcharge: number;
    corporateTxnId: number;
    paymentStatus: string;
    batchId: number;
    serviceName?: string;
};

export type BulkPaymentStatusResp = {
    bulkPaymentStatus: {
        status: string;
        corporateTxnId: number;
    }[];
};

export type CheckAgencyBalance = UserPayload & {
    amount: string | number;
    passengers: [];
    traceId: string;
};

export type AgencyBalanceResponse = {};

export type PaymentMethodsResponse = {
    isCouponApplicable: boolean;
    gateway: {
        available: boolean;
        limits: {
            limitPerTransaction: number;
            limitPerDay: number;
            limitPerMonth: number;
        };
        usage: {
            today: number;
            month: number;
        };
    };
    wallet: {
        available: boolean;
        limits: {
            limitPerTransaction: number;
            limitPerDay: number;
            limitPerMonth: number;
        };
        usage: {
            today: number;
            month: number;
        };
    };
};
