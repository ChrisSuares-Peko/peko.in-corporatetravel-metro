import { useState, useCallback, useEffect } from 'react';

import type { Dayjs } from 'dayjs';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import { approveSalary, employeeSalaryListing, markAsPaidSalary, markAsApprovedSalary } from '../../api/employeeSalaryApi/employeeSalary';
import { employeeSalaryListingResponse } from '../../types/salaryProfileTypes/employeeSalaryTable';
import { invalidateDashboardCache } from '../dashboardHooks/useDashboardApi';

export const useEmployeeSalaryListing = (
    year: number,
    month: number,
    searchText: string
) => {
    const dispatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [loading, setLoading] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);
    const [salaryResponse, setSalaryResponse] = useState<employeeSalaryListingResponse | null>(
        null
    );

    const fetchSalaryData = useCallback(async () => {
        setLoading(true);
        const data = await employeeSalaryListing({
            userId: id,
            userType: role,
            year,
            month,
            searchText,
            sort: 'ASC',
            page: 1,
            limit: 10,
            filter: '',
        });

        if (data) {
            setSalaryResponse(data);
        } else {
            setSalaryResponse(null);
        }
        setLoading(false);
        return true
    }, [id, role, year, month, searchText]);

    useEffect(() => {
        if (id && role) {
            fetchSalaryData();
        }
    }, [id, role, fetchSalaryData]);

    const handleApproveAndRecord = useCallback(
        async (payingDate: Dayjs | null, isSendPayslip: boolean) => {
            if (!payingDate) {
                dispatch(
                    showToast({
                        variant: 'warning',
                        description: 'Please select a paying date.',
                    })
                );
                return false;
            }

            setApproveLoading(true);
            const response: any = await approveSalary({
                payingDate: payingDate.toISOString(),
                month,
                year,
                sendPayslip: isSendPayslip,
                userType: role,
                userId: id,
            });
            setApproveLoading(false);
            console.log(response)
            if (response && response.status === true) {
                invalidateDashboardCache();
                dispatch(
                    showToast({
                        variant: 'success',
                        description: response.data?.message || 'Salary approved successfully.',
                    })
                );
                return true;
            }

            dispatch(
                showToast({
                    variant: 'error',
                    description: response?.message || response?.data?.message || 'Unable to approve salary. Please try again.',
                })
            );
            return false;
        },
        [dispatch, id, month, role, year]
    );

    const handleMarkAsPaid = useCallback(
        async (payingDate: Dayjs | null, isSendPayslip: boolean) => {
            if (!payingDate) {
                dispatch(showToast({ variant: 'warning', description: 'Please select a paying date.' }));
                return false;
            }
            setApproveLoading(true);
            const response: any = await markAsPaidSalary({
                payingDate: payingDate.toISOString(),
                month,
                year,
                sendPayslip: isSendPayslip,
                userType: role,
                userId: id,
            });
            setApproveLoading(false);
            if (response && response.status === true) {
                invalidateDashboardCache();
                dispatch(showToast({ variant: 'success', description: 'Salary marked as paid successfully.' }));
                return true;
            }
            dispatch(showToast({ variant: 'error', description: response?.message || response?.data?.message || 'Unable to mark salary as paid. Please try again.' }));
            return false;
        },
        [dispatch, id, month, role, year]
    );

    const handleMarkAsApproved = useCallback(
        async () => {
            setApproveLoading(true);
            const response: any = await markAsApprovedSalary({ month, year, userType: role, userId: id });
            setApproveLoading(false);
            if (response && response.status === true) {
                invalidateDashboardCache();
                dispatch(showToast({ variant: 'success', description: 'Salary status reverted to approved.' }));
                return true;
            }
            dispatch(showToast({ variant: 'error', description: response?.message || response?.data?.message || 'Unable to revert salary status. Please try again.' }));
            return false;
        },
        [dispatch, id, month, role, year]
    );

    return { salaryResponse, loading, fetchSalaryData, handleApproveAndRecord, handleMarkAsPaid, handleMarkAsApproved, approveLoading };
};
