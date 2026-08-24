export type CatalogRow = {
    id: number;
    vendorCatalogId: string;
    serviceId: number | null;
    serviceName: string;
    variantName: string;
    marketPrice: string;
    vendorPrice: string;
    amount: string | null;
    status: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
};

export type CatalogListResponse = {
    recordsTotal: number;
    recordsFiltered: number;
    data: CatalogRow[];
};

export type CatalogGetParams = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: 'ASC' | 'DESC';
    sortField?: string;
};

export type CatalogUpdatePayload = {
    id: number | string;
    amount?: number | string | null;
    status?: boolean;
    sortOrder?: number;
};

export type CatalogStatusPayload = {
    id: number | string;
    status: boolean;
};
