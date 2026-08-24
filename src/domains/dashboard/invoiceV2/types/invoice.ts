import { InvoiceType } from './index';

export interface InvoiceRow {
    id: string;
    prefix: string;
    invoiceNumber: string;
    name: string;
    gstNumber?: string;
    phoneNumber: string;
    createdAt: string;
    totalAmount: string;
    invoiceType: string;
    currency?: string;
    status: 'Paid' | 'Pending' | 'Overdue';
    invoiceDate: string;
    dueDate: string;
    amountDue: string;
    recurringId?: string | null;
    recurring?: { id: string; status: string } | null;
}

export type InvoiceStats = {
    totalInvoices: string;
    totalPaid: string;
    totalDue: string;
};

export type GetAllInvoicesResponse = {
    invoiceData: InvoiceRow[];
    recordsTotal: number;
};

export interface GetInvoiceByIdResponse {
    id: string;
    invoiceType: InvoiceType;
    prefix: string;
    invoiceNumber: string;
    currency: string;
    invoiceDate: string;
    dueDate: string;
    dateOfSupply?: string;
    createdAt?: string;
    updatedAt?: string;
    // buyer
    customerId?: string;
    name: string;
    gstNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    email: string;
    phoneNumber: string;
    // items
    items: {
        name: string;
        hsn: string;
        quantity: string;
        unit: string;
        unitPrice: string;
        discount: string;
        taxRate: string;
        taxMode: 'Exclusive' | 'Inclusive';
        netAmount: string;
        productId?: string;
        itemId?: string;
    }[];
    // additional
    termsAndConditions: string;
    notes: string;
    shippingCost: string;
    amountPaid: string;
    paymentMode: string;

    subtotal: string;
    discount: string;
    tax: string;
    totalAmount: string;
    amountDue: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED' | 'ACCEPTED' | 'CONVERTED';
    paymentDate?: string;
    documentType?: 'INVOICE' | 'SALES_ORDER' | 'QUOTATION' | 'CREDIT_NOTE';
    isCreditNoteCreated?: boolean;
    linkedInvoiceId?: string;
    creditNoteDetails?: {
        reason?: string;
        additionalDetails?: string;
        linkedInvoiceNumber?: string;
        linkedInvoicePrefix?: string;
    };
}

export interface GetAllInvoicesPayload {
    sort?: 'ASC' | 'DESC';
    sortField?: string;
    page?: number;
    itemsPerPage?: number;
    searchText?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    invoiceType?: 'DOMESTIC' | 'INTERNATIONAL';
    hasEInvoice?: boolean;
    documentType?: 'INVOICE' | 'QUOTATION' | 'CREDIT_NOTE';
    linkedInvoiceId?: string;
}

export type QuotationDashboard = {
    totalQuotations: number;
    accepted: number;
    pending: number;
};
