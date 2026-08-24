import { SuccessGenericResponse } from '@customtypes/general';
import { FRONTEND_BASE_URL } from '@src/config-global';
import { ApiClient } from '@src/services/config';

export type UserServiceAccessEntry = { label: string; hasAccess: boolean };

export const DEFAULT_EMPLOYEE_SERVICE_ACCESS: { permission: UserServiceAccessEntry[] } = {
    permission: [{ label: 'Payroll', hasAccess: true }],
};

// Creates a payroll employee login (role USER, linked to the payroll employee
// via employeeId) and triggers the set-password / onboarding email.
export const createEmployeeUser = async (payload: {
    name: string;
    email: string;
    mobileNo?: string;
    employeeId?: string;
    userAccessService?: { permission: UserServiceAccessEntry[] };
}) => {
    const res: SuccessGenericResponse<{ resent?: boolean }> = await ApiClient.post(
        `user/ess/user`,
        {
            ...payload,
            baseUrl: FRONTEND_BASE_URL,
        }
    );
    return res;
};

// Removes the payroll employee's ESS login/access (used e.g. on offboarding).
export const removeEmployeeUserAccess = async (employeeId: string | number) => {
    try {
        const res: SuccessGenericResponse<{}> = await ApiClient.delete(
            `user/ess/user/${employeeId}`
        );
        return res;
    } catch (error) {
        return false;
    }
};
