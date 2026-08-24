import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    PriceBand,
    ReportOrderDetail,
    ValuationCounterparty,
    ValuationPurpose,
} from '../types/index';

interface CatalogPayload {
    userId: number;
    userType: string;
    category: string;
    make?: string;
    model?: string;
    year?: string;
}

interface ValuationPayload {
    userId: number;
    userType: string;
    make: string;
    model: string;
    year: string;
    trim: string;
    kmsDriven: string;
    city: string;
    // Drive Droom's transaction_type / customer_type — mapped server-side, since the
    // vendor's codes (`S`, `dealer`) are an integration detail, not form vocabulary.
    purpose: ValuationPurpose | '';
    counterparty: ValuationCounterparty | '';
}

// One cascade level of the Valuation/Inspection forms' Vehicle Information block —
// which level comes back depends on which of make/model/year are given, per the
// backend's Droom MYBIZ catalog proxy (see DROOM_MYBIZ_API_REFERENCE.md at the
// workspace root, and officeAndBusiness/services/droomCatalog.js).
export const getVehicleCatalog = async (payload: CatalogPayload) => {
    try {
        const resp: SuccessGenericResponse<string[]> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/officeAndBusiness/garage/car-report/catalog`,
            {
                params: {
                    category: payload.category,
                    make: payload.make,
                    model: payload.model,
                    year: payload.year,
                },
            }
        );
        return resp.data;
    } catch (err) {
        return false;
    }
};

// Fair market value for a completed vehicle spec — Droom's OBV endpoint, proxied by
// the backend (see DROOM_MYBIZ_API_REFERENCE.md §3). Returns the four condition bands
// already normalized to Peko's grade casing and ordering, or false on failure; the
// ApiClient response interceptor has already toasted the backend's message by then.
export const getValuationPriceRange = async ({ userId, userType, ...body }: ValuationPayload) => {
    try {
        const resp: SuccessGenericResponse<{ bands: PriceBand[] }> = await ApiClient.post(
            `${userType}/${userId}/officeAndBusiness/garage/car-report/valuation`,
            body
        );
        return resp.data?.bands ?? false;
    } catch (err) {
        return false;
    }
};

// ------------------------------------------------------------------------- orders
// Same officeAndBusiness/garage prefix as the lookups above — that service owns the whole
// Car Reports feature, purchase and order record included (see
// Peko-IN/officeAndBusiness/routes/API/v1/corporate/garage.js).

interface OrdersPayload {
    userId: number;
    userType: string;
    searchText?: string;
    from?: string;
    to?: string;
    page?: number;
    itemsPerPage?: number;
}

// Filtering, sorting and paging are all server-side — `count` is the unpaged total.
export const getCarReportOrders = async ({ userId, userType, ...params }: OrdersPayload) => {
    try {
        const resp: SuccessGenericResponse<{ orders: ReportOrderDetail[]; count: number }> =
            await ApiClient.get(
                `${userType}/${userId}/officeAndBusiness/garage/car-report/orders`,
                { params }
            );
        return { orders: resp.data?.orders ?? [], count: resp.data?.count ?? 0 };
    } catch (err) {
        return false;
    }
};

export const getCarReportOrderDetail = async ({
    userId,
    userType,
    orderId,
}: {
    userId: number;
    userType: string;
    orderId: string;
}) => {
    try {
        const resp: SuccessGenericResponse<ReportOrderDetail> = await ApiClient.get(
            `${userType}/${userId}/officeAndBusiness/garage/car-report/orders/${orderId}/detail`
        );
        return resp.data ?? false;
    } catch (err) {
        return false;
    }
};
