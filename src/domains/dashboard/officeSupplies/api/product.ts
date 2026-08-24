import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { CategoryListResponse, CategoryListPayload } from '../types/category';
import { ProductDetailsPayload, ProductDetailsResponse } from '../types/productDetails';
import {
    CitySearchPayload,
    DeliveryEstimatePayload,
    DeliveryEstimateResponse,
    OfficeSupplySectionsResponse,
    ProductListPayload,
    ProductListResponse,
    SectionsPayload,
} from '../types/products';

export const getCategoryList = async (payload: CategoryListPayload) => {
    try {
        const resp: SuccessGenericResponse<CategoryListResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/purchase/ecommerce/categories`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getProductList = async (payload: ProductListPayload) => {
    try {
        const {
            limit,
            offset,
            userId,
            search,
            userType,
            city,
            categoryId,
            localCategory,
            priceMax,
            minDiscount,
            sellers,
        } = payload;
        const params = { offset, limit, search, city, categoryId, localCategory, priceMax, minDiscount, sellers };
        const resp: SuccessGenericResponse<ProductListResponse> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/products`,
            { params }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

/**
 * Fetch the combined storefront sections (Top Deals, Top Rated, Frequently
 * Bought, All Products) for a city in one call.
 */
export const getOfficeSupplySections = async (payload: SectionsPayload) => {
    try {
        const { userId, userType, city, limit } = payload;
        const params = { city, limit };
        const resp: SuccessGenericResponse<OfficeSupplySectionsResponse> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/products/sections`,
            { params }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

/**
 * Ask the backend to fire an ONDC /search for a city (when it has no products
 * yet). Returns immediately; products arrive asynchronously via the webhook, so
 * the caller polls getProductList afterwards.
 */
export const triggerCitySearch = async (payload: CitySearchPayload) => {
    try {
        const { userId, userType, city } = payload;
        // The backend holds this response until the first on_search webhook (or
        // its ~30s cap), so allow a longer-than-default client timeout.
        const resp: SuccessGenericResponse<{ city: string }> = await ApiClient.post(
            `${userType}/${userId}/purchase/ecommerce/ondc/search`,
            { city },
            { timeout: 40000 }
        );
        return resp;
    } catch (err) {
        return false;
    }
};

/**
 * On-demand ONDC delivery estimate for a single product (PDP "Get estimated
 * delivery date" button). The backend fires a directed /search then /select and
 * holds this response until the on_select webhook (or its ~30s-per-step cap), so
 * allow a long client timeout. Returns a null date when the seller can't quote —
 * never a fabricated one.
 */
export const getDeliveryEstimateApi = async (payload: DeliveryEstimatePayload) => {
    try {
        const { userId, userType, ondcProductId, quantity, city, gps } = payload;
        const resp: SuccessGenericResponse<DeliveryEstimateResponse> = await ApiClient.post(
            `${userType}/${userId}/purchase/ecommerce/ondc/deliveryEstimate`,
            { ondcProductId, quantity, city, gps },
            { timeout: 65000 }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getProductDetailsApi = async (payload: ProductDetailsPayload) => {
    try {
        const { userId, userType, ondcProductId } = payload;

        // Cached row only — no directed ONDC seller refresh on every click
        // (that used to hold this call open for up to ~25s just to view a
        // product's details). The listing/refresh flows elsewhere already
        // keep this row reasonably current.
        const resp: SuccessGenericResponse<ProductDetailsResponse> = await ApiClient.get(
            `${userType}/${userId}/purchase/ecommerce/product/details`,
            { params: { ondcProductId } }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
