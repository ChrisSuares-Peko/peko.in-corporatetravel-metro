export type FilterType = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: string;
    sortField?: string;
};

export type PaymentMethodsState = {
    isGatewayPaymentAvailable: boolean;
    isWalletPaymentAvailable: boolean;
    isCouponApplicable: boolean;
};

export type PaymentMethod = {
    id: number;
    partnerId: number;
    name: string;
    paymentMethod: 'PAYMENT_GATEWAY' | 'WALLET';
    createdAt: string;
    updatedAt: string;
    limits: {
        limitPerTransaction: number;
        limitPerDay: number;
        limitPerMonth: number;
    };
    serviceList: number[];
};

export type PaymentMethodsResponse = {
    paymentMethods: PaymentMethodsState;
    data: {
        recordsFiltered: number;
        recordsTotal: number;
        rows: PaymentMethod[];
    };
};

export type CreatePGMethodsByService = {
    partnerId: number | string | null;
    paymentMethod: 'PAYMENT_GATEWAY' | 'WALLET';
    services: number[];
};

export type CreatePGMethodsByServiceResponse = {
    id: number;
    partnerId: null | number;
    paymentMethod: 'PAYMENT_GATEWAY' | 'WALLET';
    updatedAt: string;
    createdAt: string;
};

export type EditPGMethodsByService = {
    rowIdToUpdate: number;
    partnerId: number | string | null;
    paymentMethod: string;
    services: number[];
    limits: {
        limitPerTransaction: number;
        limitPerDay: number;
        limitPerMonth: number;
    };
};
