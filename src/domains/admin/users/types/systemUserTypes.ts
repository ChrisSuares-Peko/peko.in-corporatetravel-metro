export interface OrderDatatype {
    id: string;
    date: JSX.Element;
    productName: string;
    customer: string;
    amount: string;
    status: JSX.Element;
    action: JSX.Element;
    view: JSX.Element;
}

export type systemUserResponse = {
    recordsTotal: number;
    recordsFiltered: number;
    data: { rows: User[] };
};
export type RolesResponse = {
    count: number;
    rows: Role[];
};

export type User = {
    id: number;
    email: string;
    mobileNo: string;
    isActive: number; // Consider using boolean if isActive represents a boolean value (0 or 1)
    portalUrl: string;
    createdAt: string;
    updatedAt: string;
    credentialId: number;
    roleAndPermissionId: number;
    credential: Credential;
    registeredBy?: string | null;
    roleAndPermission: RoleAndPermission;
};
interface RoleAndPermission {
    roleName: string;
}
interface Credential {
    username: string;
    role: string;
    name: string;
    createdAt: string;
    partnerId?: string;
    passwordProtection: number;
    registeredBy?: string;
}
export type getSystemUsers = {
    searchText: string;
    page: number;
    itemsPerPage: number;
    type?: string;
    sort?: string;
    sortField?: string;
};

// Defines the structure of each service within a permission
export type Service = {
    view: any;
    service?: string;
    hasAccess: boolean;
    services: SubService[];
    category?: string;
};

export type SubService = {
    update: boolean | undefined;
    write: boolean | undefined;
    view: boolean | undefined;
    id: number;
    service: string;
    hasAccess: boolean;
};

// Defines the structure of each permission group
export type Permission = {
    services: Service[]; // This is an array of `Service` objects
    hasAccess: boolean;
    serviceCategory: string;
    view: boolean;
    write: boolean;
    update: boolean;
};

// Defines the structure of the role with permissions
export type Role = {
    id: number;
    roleName: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
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
};

export type getAllRolesResp = {
    roles: {
        label: string;
        value: string;
    }[];
};
export type getPermissionsResp = {
    permissions: Permission[];
};

export type updateRole = {
    id?: number | undefined;
    roleName: string | undefined;
    permissions: Permission[] | undefined;
};
export type activeResponse = {
    data: string;
};
export type SystemPartnerData = {
    id: string;
};
export type UserDetails = {
    name: string;
    username: string;
    email: string;
    mobileNo: string;
    portalUrl: string;
};
export type Permissions = {
    subServices: Service[];
    hasAccess: boolean;
    label: string;
};
export type UserType = {
    id?: string;
    permissions: any[];
    userDetails: UserDetails;
};
export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
