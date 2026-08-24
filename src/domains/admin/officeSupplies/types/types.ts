import { OndcOrderFulfillment } from '@src/domains/dashboard/officeSupplies/types/ondcOrderHistory';

import { UserPayload } from '../../accounts/types/SelfTransferTypes';

export interface OrderDatatype {
    id: string;
    date: JSX.Element;
    productName: string;
    customer: string;
    amount: string;
    currentStatus: JSX.Element;
    status: JSX.Element;
    action: JSX.Element;
    view: JSX.Element;
}

export type getData = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: string;
    from?: string;
    to?: string;
    status?: string;
    category?: string | number;
    type?: string;
    sortField?: string;
    id?: string;
};

export type TransactionInfo = {
    id: number;
    transactionDate: string;
    corporateTxnId: string;
    transactionCategory: string;
    corporateCashback: string;
    serviceOperator: {
        id: number;
        serviceProvider: string;
    };
    order: {
        id: number;
        amountInINR: string;
        paymentMode: string;
        status: string;
    };
    credential: {
        name: string;
        email: string;
    };
};
/**
 * Active ONDC order an admin can cancel/return directly (no separate
 * customer-request queue yet — see purchase's findOndcOrdersForAdminAction).
 * Shape mirrors the `ondcOrders` table, not the legacy `TransactionInfo`.
 */
export type OndcOrderInfo = {
    id: number;
    transactionId: string;
    orderId: string | null;
    orderState: string | null;
    vendorName: string | null;
    totalAmount: string | null;
    currency: string | null;
    createdAt: string;
    /** Seller's declared fee for cancelling at the order's CURRENT fulfillment
     * state (order.cancellation_terms) — null when unknown, not free. */
    cancellationFeePercent: string | null;
    /** Courier/link info from the last on_track callback — null before any
     * tracking data has arrived (e.g. order not yet shipped). */
    tracking: {
        status?: string | null;
        url?: string | null;
        courierName?: string | null;
        courierPhone?: string | null;
        updatedAt?: string | null;
    } | null;
};

export type transactionResponse = {
    recordsTotal: number;
    data: TransactionInfo[];
    /** Present alongside `data` on the cancelAndRefund/returnAndRefund list endpoints. */
    ondcOrders?: OndcOrderInfo[];
};

/**
 * One row of the "All orders" tab (real ONDC orders, every state — unlike
 * OndcOrderInfo above, which is scoped to orders still eligible for a direct
 * admin cancel/return action). `orderState` pairs with the customer-facing
 * OndcStatusTag's own label/color map. `fulfillments` is the RAW array
 * (same shape the customer-facing order-details page already gets) — the
 * Delivery leg's state is derived client-side via the same
 * getDeliveryFulfillment/formatFulfillmentStateLabel/getFulfillmentStatusStyle
 * helpers dashboard/officeSupplies already uses, rather than duplicating that
 * derivation on the backend.
 */
export type AllOrdersRow = {
    id: number;
    transactionId: string;
    orderId: string | null;
    orderState: string | null;
    fulfillments: OndcOrderFulfillment[] | null;
    vendorName: string | null;
    corporateName?: string;
    totalAmount: string | null;
    currency: string | null;
    createdAt: string;
    paymentStatus: string | null;
    /** Courier/link info from the last on_track callback — null before shipping. */
    tracking: OndcOrderInfo['tracking'];
};

export type allOrdersResponse = {
    recordsTotal: number;
    recordsFiltered: number;
    data: AllOrdersRow[];
};

/** One seller-quote breakup row as stored on the order (superset of the
 *  customer ValidatedQuoteRow — the persisted rows also carry the per-item
 *  cancellable/returnable flags). */
export type AdminOrderQuoteRow = {
    itemId?: string | null;
    /** "item" | "tax" | "delivery" | "packing" | "misc" | ... */
    titleType?: string | null;
    title?: string;
    productName?: string | null;
    quantity?: number | null;
    /** line total for the row (unit price = amount / quantity) */
    amount: number;
    currency?: string;
    cancellable?: boolean | null;
    returnable?: boolean | null;
    returnWindow?: string | null;
};

export type AdminOrderQuote = {
    total?: number;
    currency?: string;
    items?: { itemId: string; title: string; quantity: number | null; amount: number }[];
    deliveryCharge?: number;
    otherCharges?: { title: string; type: string; amount: number }[];
    rows?: AdminOrderQuoteRow[];
    ttl?: string | null;
};

export type AdminOrderItem = {
    productId?: number;
    ondcProductId?: string;
    productName?: string;
    productQuantity?: number;
    cancellable?: number | boolean;
    returnable?: number | boolean;
    returnWindow?: string;
};

/**
 * Full single-order detail (the admin order-detail page). The by-id admin
 * endpoint returns every raw ondcOrders column, so this is `AllOrdersRow` plus
 * the heavier JSON blobs (items/quote/billing/payment) and the cancel/return +
 * corporate-code fields the list view doesn't need.
 */
export type AdminOndcOrderDetail = AllOrdersRow & {
    corporateCode?: string | null;
    items?: AdminOrderItem[];
    quote?: AdminOrderQuote | null;
    billing?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            building?: string;
            locality?: string;
            city?: string;
            state?: string;
            country?: string;
            area_code?: string;
        };
    } | null;
    payment?: Record<string, any> | null;
    paymentType?: string | null;
    paymentRef?: string | null;
    cancelReason?: string | null;
    cancelledAt?: string | null;
    returnReason?: string | null;
    returnedAt?: string | null;
    expectedDeliveryDate?: string | null;
};

export type allOrdersPayload = UserPayload & {
    page: number;
    itemsPerPage: number;
    searchText?: string;
    status?: string;
    sellerName?: string;
    from?: string;
    to?: string;
    sort?: string;
    sortField?: string;
    needsAttention?: boolean;
};

export type payloadVendors = {
    productIds: string[];
};

export type VendorInfo = {
    id: number;
    name: string;
    price: string;
};

export type vendorListResponse = {
    id: number;
    name: string;
    vendors: VendorInfo[];
};

export type OrderUpdatePayload = {
    id: number;
    ecomOrderStatus: string;
    selectedVendor: Record<string, string>;
    // paymentStatus: string;
    trackingDetails?: {
        deliveryPartner: string;
        trackingNumber: string;
        trackingWebsite: string;
    };
    cancelReason?: string;
};

export interface UpdateOrderRequestPayload extends UserPayload {
    scope: string;
    otp: string;
    // Legacy (order/transaction table) fields — required for that flow, unused
    // for the ONDC flow below.
    productId?: number;
    corporateTxnId?: string;
    paymentStatus?: string;
    workspaceOrderStatus?: string;
    returnPickUpDate?: string;
    returnStatus?: string;
    // ONDC flow — set instead of corporateTxnId to route the request at the
    // real ONDC order (see purchase's cancelUpdateOrder/returnUpdateOrder
    // ondcOrderId branch). `reason` is optional context stored on the order.
    ondcOrderId?: number | string;
    reason?: string;
}

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
