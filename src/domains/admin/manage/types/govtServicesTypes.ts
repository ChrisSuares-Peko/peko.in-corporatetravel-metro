export type GovtService = {
    id: number;
    name: string;
    description: string | null;
    category: string;
    tag: 'Mandatory' | 'Regulatory Dependent' | 'Good-to-have';
    processingTime: string | null;
    price: string | number;
    govtFee: string | number | null;
    accessKey: string | null;
    status: boolean | number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
};

export type GovtServiceData = {
    recordsTotal: number;
    recordsFiltered: number;
    data: GovtService[];
};

export type GovtServiceFilters = {
    searchText: string;
    page: number;
    itemsPerPage: number;
    sort: string;
    sortField: string;
};

export type GovtServiceRequest = {
    id?: number;
    name: string;
    description?: string;
    category: string;
    tag: string;
    authority?: string;
    accessKey?: string;
    processingTime?: string;
    price: number | string;
    govtFee?: number | string;
    sortOrder?: number;
};

export type GovtServiceUpdateStatus = {
    id: number;
    status: boolean;
};

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};

export type refreshState = {
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};
