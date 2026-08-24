import { useState } from 'react';

import {
    createSubCorporate,
    validateCreateSubCorporate,
} from '@src/domains/dashboard/settings/api/userManagement';
import { FormValues } from '@src/domains/dashboard/settings/types/userManagement';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

const CORPORATE_CARDS_SERVICE = 'Corporate Cards';

export interface InviteMemberDetails {
    firstName: string;
    lastName: string;
    mobileNo: string;
    email: string;
    department?: string;
    role: string;
}

export const useInviteMemberApi = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Invite a member in one step: validate the details (duplicate email/mobile check) and, if clear,
     * create the sub-corporate with Corporate Cards access granted. Returns true only when the member
     * was created.
     */
    const submitInvite = async (details: InviteMemberDetails) => {
        setIsLoading(true);
        const base = {
            name: `${details.firstName} ${details.lastName}`.trim(),
            email: details.email,
            mobileNo: details.mobileNo,
            role: details.role,
            username: details.email,
        };
        try {
            const valid = await validateCreateSubCorporate(base as unknown as FormValues);
            if (!valid) return false;
            const created = await createSubCorporate({
                ...base,
                services: [{ label: CORPORATE_CARDS_SERVICE, hasAccess: true }],
            } as unknown as FormValues & { services: { label: string; hasAccess: boolean }[] });
            if (created) {
                dispatch(
                    showToast({ variant: 'success', description: 'Invitation sent successfully.' })
                );
            }
            return !!created;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, submitInvite };
};
