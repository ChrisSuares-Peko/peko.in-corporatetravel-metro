export type getCoupon = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: string;
    type?: string;
    sortField?: string;
};

export type newCouponCode = {
    id?: number;
    couponCode: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discount: string | number;
    validFrom: string;
    validTo: string;
};

export type CouponData = {
    recordsTotal: number;
    data: Coupon[];
};

export type Coupon = {
    id: number;
    couponCode: string;
    discountType: string;
    discount: string;
    validFrom: string;
    validTo: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
};
export type updateStatus = {
    couponId?: string | number;
    status: any;
};

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
