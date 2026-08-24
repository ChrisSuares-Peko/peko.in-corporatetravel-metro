export type TransactionInfo = {
    id: number;
    transactionDate: string;
    customerName: string;
    service: string;
    serviceCategory: string;
    Amount: string;
    VAT: number | null;
    totalAmount: string;
    paymentGatewayCost: number | null;
    amountReceivable: string;
    partner: string;
    credentialId: number;
    vendorCost: string;
    VATP: string;
    amountSurplus: string;
    partnerShare: string;
    actualEarnings: string;
};
export interface transactionResponse {
    recordsTotal: number;
    recordsFiltered?: number;
    data: TransactionInfo[];
}
