import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

/**
 * Backend kybStatus (see corporateCard constants/corporateCardApplication.js):
 * PENDING with no row / no kybReference = not yet submitted; PENDING with a kybReference = the
 * corporate has submitted and it's awaiting our team to forward the documents to the KYB vendor;
 * SUBMITTED = our team has forwarded them to the vendor (set manually via the admin Manage drawer);
 * UNDER_REVIEW = the vendor/reviewer is actively assessing it; VERIFIED/REJECTED = reviewer's
 * decision; COMPLETED = fully provisioned (card scheme + SVC + virtual account all set by an admin) —
 * the only status that unlocks the dashboard without an interstitial.
 */
export type KybApiStatus = 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'COMPLETED';

export interface KybApplicationApiShape {
    corporateId: number;
    kybStatus: KybApiStatus;
    kybReference: string | null;
    rejectionReason: string | null;
    updatedAt: string | null;
}

interface KybStatusResponse {
    application: KybApplicationApiShape | null;
}

export const getKybStatus = async (userType: string, userId: number) => {
    try {
        const res: SuccessGenericResponse<KybStatusResponse> = await ApiClient.get(
            `${userType}/${userId}/corporate-cards/kyb-status`
        );
        return res;
    } catch (error) {
        return false;
    }
};

export const initiateKyb = async (userType: string, userId: number) => {
    try {
        const res: SuccessGenericResponse<KybStatusResponse> = await ApiClient.post(
            `${userType}/${userId}/corporate-cards/kyb-status/initiate`
        );
        return res;
    } catch (error) {
        return false;
    }
};

export const completeKyb = async (userType: string, userId: number) => {
    try {
        const res: SuccessGenericResponse<KybStatusResponse> = await ApiClient.post(
            `${userType}/${userId}/corporate-cards/kyb-status/complete`
        );
        return res;
    } catch (error) {
        return false;
    }
};

export interface KybDocumentUpload {
    documentName: string;
    fileBase: string;
    fileFormat: string;
    expiryDate?: string | null;
}

export const uploadKybDocuments = async (userType: string, userId: number, documents: KybDocumentUpload[]) => {
    try {
        const res: SuccessGenericResponse<Record<string, never>> = await ApiClient.post(
            `${userType}/${userId}/corporate-cards/kyb-documents`,
            { documents }
        );
        return res;
    } catch (error) {
        return false;
    }
};
