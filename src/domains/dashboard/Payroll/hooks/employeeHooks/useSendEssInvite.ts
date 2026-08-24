import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { confirmJoiningApi } from '../../api/employeeApi';
import { createEmployeeUser, DEFAULT_EMPLOYEE_SERVICE_ACCESS } from '../../api/essInvite';

// Sends the ESS portal invite to an already-active employee. Reuses
// createEmployeeUser (creates the USER login + set-password email), then
// confirms joining for the payroll employee.
export const useSendEssInvite = () => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const dispatch = useAppDispatch();
    const [isSending, setIsSending] = useState(false);

    const sendInvite = async ({
        name,
        email,
        mobileNo,
        employeeId,
    }: {
        name: string;
        email: string;
        mobileNo?: string;
        employeeId?: string;
    }): Promise<boolean> => {
        setIsSending(true);
        try {
            const res = await createEmployeeUser({
                name,
                email,
                mobileNo: mobileNo || undefined,
                employeeId,
                // Grant ESS (Payroll) access so the employee can use the portal.
                userAccessService: DEFAULT_EMPLOYEE_SERVICE_ACCESS,
            });
            if (!res) {
                dispatch(
                    showToast({ description: 'Failed to send ESS invite.', variant: 'error' })
                );
                return false;
            }

            // Confirm joining for the payroll employee once the login is created.
            if (employeeId) {
                const joinRes = await confirmJoiningApi({
                    userId: id,
                    userType: role,
                    employeeId,
                });
                if (!joinRes.success) {
                    dispatch(
                        showToast({
                            description:
                                joinRes.errorMessage ||
                                'Invite sent, but confirming joining failed.',
                            variant: 'error',
                        })
                    );
                    return false;
                }
            }

            dispatch(
                showToast({
                    description: 'ESS onboarding invite sent to the employee.',
                    variant: 'success',
                })
            );
            return true;
        } catch (err: any) {
            dispatch(
                showToast({
                    description: err?.response?.data?.message || 'Something went wrong.',
                    variant: 'error',
                })
            );
            return false;
        } finally {
            setIsSending(false);
        }
    };

    return { sendInvite, isSending };
};
