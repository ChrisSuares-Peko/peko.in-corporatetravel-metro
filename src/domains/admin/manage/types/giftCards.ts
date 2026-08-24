export type GiftCardsBody = {
    id: number;
    product_id: string;
    brand_logo:
        | string
        | {
              imageBase: string;
              imageFormat: string;
          };
    brand_name: string;
    product_name: string;
    merchant_id: string;
    merchant_name: string;
    // mrp: string;
    // selling_price: string;
    min_price: string;
    max_price: string;
    expiry: string;
    is_open_denominnation: boolean;
    gv_type: string;
    denominations: [];
    // terms_and_condition: string;
    // how_to_redeem: string;
    status: boolean;
    createdAt: string;
    sold_quantity: number;
    serviceOperatorId: number | null;
    priceType: string;
};

export type GiftCardsFormValues = {
    id: number;
    product_id: string;
    brand_logo:
        | string
        | {
              imageBase: string;
              imageFormat: string;
          };
    brand_name: string;
    product_name: string;
    merchant_id: string;
    merchant_name: string;
    // mrp: string | number;
    // selling_price: string | number;
    min_price: string | number;
    max_price: string | number;
    expiry: string;
    is_open_denominnation: string | boolean;
    gv_type: string;
    denominations: [];
    // terms_and_condition: string;
    // how_to_redeem: string;
};

export type GiftCardsWithoutID = Omit<GiftCardsFormValues, 'id'>;

export type ApiResponseGiftCards = {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: GiftCardsBody[];
};

export type getGiftCards = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: 'ASC' | 'DESC';
    sortField?: string;
};

export type updateGiftCardsStatusPayload = {
    status: boolean;
    giftCardId: string | number;
};

export type GiftCardsID = Omit<updateGiftCardsStatusPayload, 'status'>;

export type IVendor = {
    id: number;
    accessKey: string;
    serviceProvider: string;
};

export type IVendorsListingResponse = {
    data: IVendor[];
};

export type autoUpdatePayload = {
    status: boolean;
    serviceOperatorId: string | number;
};

export type IAutoUpdateStatusResponse = {
    data: string[];
    message?: string;
};

export type IAutoUpdateResponse = {
    giftCards: GiftCardsBody[];
    message?: string;
};
export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
