import { SuccessGenericResponse } from '@customtypes/general';
import { ApiClient } from '@src/services/config';

export interface BulkCardStatePayload {
    action: 'freeze' | 'unfreeze';
    cardIds: string[];
    /** Admin freeze reason code (1 Lost, 2 Stolen, 3 Physical Damage, 4 Others). Required on freeze. */
    reason?: number;
    /** Free-text detail, required by the backend only when `reason` is Others (4). */
    reasonNote?: string;
}

export interface BulkCardStateResult {
    id: number | string;
    ok: boolean;
    skipped: boolean;
    message: string;
}

export interface BulkCardStateResponse {
    summary: { requested: number; succeeded: number; failed: number; skipped: number };
    results: BulkCardStateResult[];
}

// Bulk freeze / unfreeze cards (admin). The backend loops the per-card vendor call and reports a per-card
// result — partial success is expected — so callers read the returned summary rather than assuming all-or-none.
export const bulkUpdateCardState = async (
    userType: string,
    userId: number,
    payload: BulkCardStatePayload
) => {
    try {
        const res: SuccessGenericResponse<BulkCardStateResponse> = await ApiClient.post(
            `${userType}/${userId}/corporate-cards/cards/bulk-state`,
            payload
        );
        return res;
    } catch {
        return false;
    }
};
