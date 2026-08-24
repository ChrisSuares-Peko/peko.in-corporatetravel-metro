export type activeResponse = {
    data: string;
};

export type Service = {
    label: string;
    hasAccess: boolean;
};
// Defines the structure of each permission group
export type Permission = {
    subServices: Service[]; // This is an array of `Service` objects
    hasAccess: boolean;
    label: string;
};

// Defines the structure of the role with permissions
export type Role = {
    id: number;
    registeredBy: string | number;
    partnerName?: string;
    permissions: Permission[];
    status: boolean | number;
    createdAt: string;
    updatedAt: string;
};

export type Partner = {
    id: number;
    name: string;
    portalUrl: string;
    isActive?: boolean | number;
    createdAt?: string;
    updatedAt?: string;
};

export type userUpdateBody = {
    id?: number;
    name: string;
    username: string;
    email: string;
    mobileNo: string;
    registeredBy?: string;
    roleAndPermissionId: string;
    portalUrl: string;
    passwordProtection: number | boolean;
};

export type getAllRolesResp = {
    roles: {
        label: string;
        value: string;
    }[];
};
export type getPermissionsResp = {
    sidebarData: Permission[];
};

export type updateRole = {
    id?: number | undefined;
    registeredBy: string | number | undefined | null;
    permissions: Permission[] | undefined;
};

export type updateStatus = {
    id?: string | number;
    status: any;
};

export type getSystemUsers = {
    searchText: string;
    page: number;
    itemsPerPage: number;
    type?: string;
    sort?: string;
    sortField?: string;
};

export type RolesResponse = {
    count: number;
    rows: Role[];
};

export type refresh = {
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export type getCorporateUsers = {
    searchText: string;
    page: number;
    itemsPerPage: number;
    partnerId: string | number;
    type?: string;
    sort?: string;
    sortField?: string;
};

export type categorySearch = {
    searchText: string;
};

export type categoryResponse = {
    data: categoryData[];
};
export type categoryData = {
    id: number | string;
    username: string;
    name: string;
};
export type ClonePartner = {
    id: number;
    name: string;
    permissions: Permission[];
};
export type CloneResponse = {
    data: ClonePartner[];
};
export type PartnerItem = {
    id: number;
    name: string;
};
export type PartnerResponse = {
    data: PartnerItem[];
};
export type updateClonePartner = {
    partnerId: null | number;
    newPartnerId: null | number;
};
export type CashbackItem = {
    serviceName: string;
    serviceCashBackAdded: boolean;
};
export type CashbackItemResponse = {
    data: CashbackItem[];
};
export type cashbackResponse = {
    recordId: number;
};
export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};