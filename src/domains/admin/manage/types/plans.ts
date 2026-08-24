export type PlanBody = {
    id: number;
    name: string;
    price: string;
    billingCycle: string;
    description: string;
    highlights: string;
    logo: string;
    is_available: number;
    status: number;
    createdAt: string;
    updatedAt: string;
};

export type PlanWithoutID = {
    id?: number;
    name: string;
    price: string;
    billingCycle: string;
    description: string;
    highlights: string;
    logo: string;
    is_available: number;
    status: number;
    createdAt: string;
    updatedAt: string;
};

export type ApiResponsePlan = {
    recordsTotal: number;
    recordsFiltered: number;
    data: PlanBody[];
};

export type updatePlanStatusPayload = {
    status: boolean;
    planId: string | number;
};

export type PlanID = Omit<updatePlanStatusPayload, 'status'>;

export type getPlan = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: 'ASC' | 'DESC';
    type?: string;
    sortField?: string;
};

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
