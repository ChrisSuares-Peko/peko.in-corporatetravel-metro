import { CommonFileBuffer, SuccessGenericResponse, UserPayload } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import {
    AddNewCorporate,
    ApiResponse,
    GSTDetailsResponse,
    PendingSignupData,
    StateListResponse,
    activeResponse,
    categoryResponse,
    categorySearch,
    getCorporateUsers,
    kycResponse,
    packagesResponse,
    partnerData,
    updateData,
    updateStatus,
    verifyGSTPayload,
} from '../types/corporateUserTypes';
import {
    RolesResponse,
    SystemPartnerData,
    UserType,
    getAllRolesResp,
    getPermissionsResp,
    getSystemUsers,
    systemUserResponse,
    updateRole,
    userUpdateBody,
} from '../types/systemUserTypes';

export const getCorporateUserData = async (payload: UserPayload & getCorporateUsers) => {
    try {
        const resp: SuccessGenericResponse<ApiResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/corporate-users`,
            {
                params: {
                    partnerId: payload.partnerId,
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sort: payload.sort,
                    sortField: payload.sortField,
                    from: payload.from,
                    to: payload.to,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getFileBufferReportCorporate = async (payload: UserPayload & getCorporateUsers) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/corporate-users/${payload.type}`,
            {
                params: {
                    partnerId: payload.partnerId,
                    searchText: payload.searchText,
                    to: payload.to,
                    from: payload.from,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getUpdateStatus = async (payload: UserPayload & updateStatus) => {
    try {
        const { corporateId, ...paylod } = payload;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/users/status-update/${corporateId}`,
            paylod
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getpartner = async (payload: UserPayload & categorySearch) => {
    try {
        const resp: SuccessGenericResponse<categoryResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/fetch-partner?q=${payload.searchText}`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const updateUserData = async (payload: UserPayload & updateData) => {
    const reqbody: updateData = {
        name: payload.name,
        contactPersonName: payload.contactPersonName,
        state: payload?.state ?? undefined,
        activity: payload.activity,
        city: payload.city,
        email: payload.email,
        kycStatus: payload.kycStatus,
        mobileNo: payload.mobileNo,
        packageId: payload.packageId,
        passwordProtection: payload.passwordProtection,
        designation: payload.designation,
        cinNumber: payload.cinNumber,
        tradeLicenseExpiry: payload.tradeLicenseExpiry,
        gstNumber: payload.gstNumber,
        panNumber: payload.panNumber,
        trnExpiry: payload.trnExpiry,
    };
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/users/${payload.id}`,
            reqbody
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getKycStatus = async (payload: UserPayload) => {
    try {
        const resp: SuccessGenericResponse<kycResponse> = await ApiClient.get(
            `user/general/corporateUser/kycStatus`
        );
        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};
export const getPackages = async (payload: UserPayload) => {
    try {
        const resp: SuccessGenericResponse<packagesResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/fetch-packages`
        );
        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const getSystemUserData = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<systemUserResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-users`,
            {
                params: {
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sort: payload.sort,
                    sortField: payload.sortField,
                    userType: 'SYSTEMUSER',
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getFileBufferReportSystem = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-users/${payload.type}`,
            {
                params: {
                    searchText: payload.searchText,
                    userType: 'SYSTEMUSER',
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getRoles = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<RolesResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions`,
            {
                params: {
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sort: payload.sort,
                    sortField: payload.sortField,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getFileBufferReportRoles = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/${payload.type}`,
            {
                params: {
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const deleteRole = async (payload: UserPayload & { id: number }) => {
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.delete(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/${payload.id}`
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const deleteUser = async (payload: UserPayload & { id: number }) => {
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.delete(
            `${payload.userType}/${payload.userId}/others/users/system-users/${payload.id}`
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const resentEmail = async (payload: UserPayload & { id: number }) => {
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-users/resend-mail/${payload.id}`
        );
        return resp;
    } catch (err) {
        return false;
    }
};

export const updateUser = async (payload: UserPayload & userUpdateBody) => {
    try {
        const { id, userId, userType, ...rest } = payload;
        const body = { ...rest };
        if (body.registeredBy === null) delete body.registeredBy;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${userType}/${userId}/others/users/system-users/${id}`,
            body
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const createUser = async (payload: UserPayload & userUpdateBody) => {
    try {
        delete payload.id;
        if (payload.registeredBy === null) delete payload.registeredBy;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/others/users/system-users`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const getAllRoles = async (payload: UserPayload) => {
    try {
        const resp: SuccessGenericResponse<getAllRolesResp> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/list`,
            {
                params: {
                    userType: 'SYSTEMUSER',
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getPermissionsApi = async (payload: UserPayload) => {
    try {
        const resp: SuccessGenericResponse<getPermissionsResp> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/initial-roles`
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const createRoles = async (payload: UserPayload & updateRole) => {
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const updateRoles = async (payload: UserPayload & updateRole) => {
 
    try {
        const { id } = payload;
        delete payload.id;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/${id}`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};

export const getUpdateSystemUserStatus = async (payload: UserPayload & updateStatus) => {
    try {
        const { corporateId } = payload;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/users/system-users/update-status/${corporateId}`,
            { isActive: payload.isActive }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const putUpdateRolesStatus = async (payload: UserPayload & updateStatus) => {
    try {
        const { corporateId } = payload;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/roleAndPermissions/update-status/${corporateId}`,
            { status: payload.isActive }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getPendingSignUpsData = async (payload: UserPayload & getCorporateUsers) => {
    try {
        const resp: SuccessGenericResponse<ApiResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/pendingSignUps`,
            {
                params: {
                    partnerId: payload.partnerId,
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sort: payload.sort,
                    sortField: payload.sortField,
                    from: payload.from,
                    to: payload.to,
                    status: payload.status,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getFileBufferReportPendingSignUps = async (
    payload: UserPayload & getCorporateUsers
) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/pendingSignUps/export/${payload.type}`,
            {
                params: {
                    partnerId: payload.partnerId,
                    searchText: payload.searchText,
                    to: payload.to,
                    from: payload.from,
                    status: payload.status,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getFileBufferReportPartner = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<CommonFileBuffer> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-users/${payload.type}`,
            {
                params: {
                    searchText: payload.searchText,
                    userType: 'PARTNER',
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getPartnerUserData = async (payload: UserPayload & getSystemUsers) => {
    try {
        const resp: SuccessGenericResponse<systemUserResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-users`,
            {
                params: {
                    page: payload.page,
                    itemsPerPage: payload.itemsPerPage,
                    searchText: payload.searchText,
                    sort: payload.sort,
                    sortField: payload.sortField,
                    userType: 'PARTNER',
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
export const getSystemPartnerdetails = async (payload: UserPayload & SystemPartnerData) => {
    try {
        const resp: SuccessGenericResponse<packagesResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/system-partner/permission/${payload.id}`
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const createPartner = async (payload: UserPayload & UserType) => {
 
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/others/users/system-partner`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const getPartnerdetails = async (payload: UserPayload & partnerData) => {
    try {
        const resp: SuccessGenericResponse<packagesResponse> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/partner/getPackagesCashback`,
            {
                params: {
                    partnerId: payload.partnerId,
                },
            }
        );
        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};
export const updatePartner = async (payload: UserPayload & UserType) => {
    try {
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/users/system-partner/${payload.id}`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const createClonePartner = async (payload: UserPayload & updateRole) => {
    try {
        delete payload.id;
        const resp: SuccessGenericResponse<activeResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/others/partner/clonePartner`,
            payload
        );
        return resp;
    } catch (err) {
        return false;
    }
};
export const addNewCorporateUser = async (payload: AddNewCorporate) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.post(`user/add-corporate`, {
            ...payload,
            isAdminCreation: true,
        });
        const { data } = resp;

        return data;
    } catch (err) {
        return false;
    }
};

export const stateOptions = async () => {
    try {
        const res: SuccessGenericResponse<StateListResponse> =
            await ApiClient.get(`/user/general/indian-states`);
        const { data } = res;
        return data;
    } catch (error) {
        return false;
    }
};

export const verifyGSTPan = async (payload: verifyGSTPayload) => {
    try {
        const resp: SuccessGenericResponse<GSTDetailsResponse> = await ApiClient.post(
            `${payload.userType}/${payload.userId}/kyc/gstPanVerification`,
            payload
        );
        const data = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const updateDocument = async (payload: UserPayload & PendingSignupData) => {
    try {
        const resp: SuccessGenericResponse<ApiResponse> = await ApiClient.put(
            `${payload.userType}/${payload.userId}/others/pendingSignUps/${payload.id}`,
            { status: payload.status, remarks: payload.remarks }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getCorporateLookupDetails = async (payload: UserPayload & { searchText: string }) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/corporate-users/details`,
            {
                params: {
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};

export const getCorporateDropdownOptions = async (payload: UserPayload & { searchText: string }) => {
    try {
        const resp: SuccessGenericResponse<any> = await ApiClient.get(
            `${payload.userType}/${payload.userId}/others/users/corporate-users/list`,
            {
                params: {
                    searchText: payload.searchText,
                },
            }
        );
        const { data } = resp;
        return data;
    } catch (err) {
        return false;
    }
};
