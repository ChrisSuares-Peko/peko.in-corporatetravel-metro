import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

import { CorporateDocumentsMap } from '../types/corporateDocuments';

interface UserContext {
    userId: string | number;
    userType: string;
}

export const getCorporateDocumentsForAdmin = async (
    ctx: UserContext,
    corporateId: number
): Promise<CorporateDocumentsMap | false> => {
    try {
        const resp: SuccessGenericResponse<{ corporateDocuments: CorporateDocumentsMap }> =
            await ApiClient.get(
                `${ctx.userType}/${ctx.userId}/corporate-cards/corporate-documents/${corporateId}`
            );
        return resp.data.corporateDocuments;
    } catch {
        return false;
    }
};

export const getCorporateDocumentFileForAdmin = async (
    ctx: UserContext,
    docKey: string
): Promise<{ buffer: { data: number[] }; type: string } | false> => {
    try {
        const resp: SuccessGenericResponse<{ buffer: { data: number[] }; type: string }> =
            await ApiClient.get(`${ctx.userType}/${ctx.userId}/corporate-cards/document/${docKey}`);
        return resp.data;
    } catch {
        return false;
    }
};
