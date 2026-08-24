import type { OndcTag } from '@utils/ondcProductAttributes';

import { UserPayload } from '../../accounts/types/SelfTransferTypes';

/** One row of the admin ONDC products catalog. */
export type AdminOndcProduct = {
    id: number;
    name: string;
    image: string | null;
    vendorName: string | null;
    category: string | null;
    localCategory: string | null;
    /** ONDC domain minus the "ONDC:" prefix, e.g. "RET16". */
    domain: string;
    price: string | null;
    maxPrice: string | null;
    availableQuantity: number | null;
    inStock: boolean;
    cities: string[];
    visibleOnPeko: boolean;
    lastSyncedAt: string;
};

export type AdminOndcProductAttributes = {
    brand: string;
    packSize: string;
    hsn: string;
    gstRate: string;
    returnsLabel: string;
    manufacturer: string;
    countryOfOrigin: string;
    shippingLabel: string;
};

export type AdminOndcProductStatutory = {
    packagedCommodities?: Record<string, string> | null;
    prepackagedFood?: Record<string, string> | null;
} | null;

export type AdminOndcProductDetail = AdminOndcProduct & {
    images: string[];
    shortDesc?: string | null;
    longDesc?: string | null;
    bppId?: string | null;
    networkId?: string | null;
    ondcVendorId?: string | null;
    categoryId?: string | null;
    minQuantity?: number | null;
    maxQuantity?: number | null;
    timeToShip?: string | null;
    measureValue?: string | null;
    uom?: string | null;
    returnable?: boolean | null;
    tags?: OndcTag[] | null;
    statutory?: AdminOndcProductStatutory;
    attributes: AdminOndcProductAttributes;
};

export type OndcProductsResponse = {
    recordsTotal: number;
    recordsFiltered: number;
    data: AdminOndcProduct[];
};

export type OndcProductFilters = {
    categories: string[];
    sellers: string[];
    cities: { code: string; name: string }[];
};

export type OndcProductsQuery = {
    page: number;
    itemsPerPage: number;
    searchText?: string;
    category?: string;
    sellerName?: string;
    domain?: string;
    /** 'in' | 'out' */
    availability?: string;
    city?: string;
    /** 'visible' | 'hidden' */
    visibility?: string;
    sort?: string;
    sortField?: string;
};

export type OndcProductsPayload = UserPayload & OndcProductsQuery;
