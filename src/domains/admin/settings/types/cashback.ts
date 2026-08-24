import { DropDown } from '@customtypes/general';

export type ServiceOperator = {
    serviceProvider: string;
};

export type Package = {
    packageName: string;
};
export type Vendor = {
    vendorName: string;
};
export type ServiceData = {
    id: number;
    serviceStatus: number;
    cashbackType: string;
    surchargeType: string;
    cashback: string;
    packageId: number;
    serviceOperatorId: number;
    serviceCategory: string;
    surcharge: string;
    createdAt: string;
    updatedAt: string;
    serviceOperator: ServiceOperator;
    package: Package;
    vendor: Vendor;
    unitPrice: string;
    baseLimit: string;
    partnerName: string;
    partnerId: string;
};

export type ServiceResponse = {
    recordsTotal: number;
    data: ServiceData[];
};
export type refresh = {
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    packageData: DropDown | undefined;
    serviceData: DropDown | undefined;
};
export type updateStatus = {
    cashbackId?: string | number;
    serviceStatus: any;
};
export type activeResponse = {
    data: string;
};
export type getData = {
    page: number;
    searchText: string;
    itemsPerPage: number;
    sort: string;
    type?: string;
    sortField?: string;
    partnerId?: string;
};
export type newCashback = {
    id?: number;
    packageId: string;
    serviceOperatorId: string;
    cashbackType: string;
    cashback: string;
    surcharge: string;
    serviceStatus: boolean;
    unitPrice: string;
    baseLimit: string;
};

export type packages = {
    id: number;
    packageName: string;
    packagePrice: string;
    description: string;
    status: number;
    createdAt: string;
    updatedAt: string;
};

export type getPackagesApiResp = {
    data: packages[];
};
export type ServiceProvider = {
    id: number;
    serviceProvider: string;
};
export type ServiceCategory = {
    id: number;
    serviceCategory: string;
};
export type ServiceProviderData = {
    data: ServiceProvider[];
};

export type serviceOperatorsIds = {
    operatorIds: [string];
    partnerId: string | null;
    packageId: string | null;
};

export type RolePermissionAccessData = {
    view?: boolean;
    write?: boolean;
    update?: boolean;
};
