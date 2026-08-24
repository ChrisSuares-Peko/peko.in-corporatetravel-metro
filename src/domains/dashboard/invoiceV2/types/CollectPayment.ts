export type CollectPaymentStep =
    | 'options'
    | 'send-link'
    | 'upi'
    | 'record'
    | 'payment-link-created'
    | 'payment-received';

export type SendPaymentLinkFormValues = {
    amount: string;
    customerName: string;
    customerPhone: string;
    linkExpiry: string | null;
};

export type RecordManuallyFormValues = {
    amountPaid: string;
    paymentMethod: string;
    paymentDate: string | null;
    referenceId: string;
    notes: string;
};
