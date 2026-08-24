import { useState, useCallback, useEffect } from 'react';

import dayjs from 'dayjs';

import { useAppSelector } from '@src/hooks/store';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { getPayrollHistoryByEmployeeId } from '../../../api/employeeSalaryApi/employeeSalary';
import { PayslipTableRow } from '../../../types/salaryProfileTypes/employeeSalaryTable';

export const useGetPayslipByEmployee = (
    employeeId?: string,
    year: number = new Date().getFullYear(),
    page: number = 1,
    limit: number = 10
) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [tableDatas, setTableDatas] = useState<PayslipTableRow[]>([]);
    const [orderCount, setOrderCount] = useState<number>(0);
    const [emailCount, setEmailCount] = useState<number>(0);
    const [tableLoading, setTableLoading] = useState<boolean>(true);

    const getPayslipList = useCallback(async () => {
        if (!employeeId) {
            setTableDatas([]);
            setOrderCount(0);
            setEmailCount(0);
            setTableLoading(false);
            return;
        }

        setTableLoading(true);
        const response = await getPayrollHistoryByEmployeeId({
            id: employeeId,
            year,
            limit,
            page,
            userType: role,
            userId: id,
        })

        if (response) {
            const rows = response.rows.map(item => ({
                key: item.id,
                payrun: dayjs(item.salaryCycleStart).format("DD-MM-YYYY"),
                payrunMode: 'N/A',
                status: item.paymentStatus || 'N/A',
                totalPaid: `₹ ${formatNumberWithLocalString(item.totalPayable || 0)}`,
            }));
            setTableDatas(rows);
            setOrderCount(response.count || 0);
            setEmailCount(response.totalEmailed || 0);
        } else {
            setTableDatas([]);
            setOrderCount(0);
            setEmailCount(0);
        }
        setTableLoading(false);
    }, [employeeId, id, limit, page, role, year]);

    useEffect(() => {
        getPayslipList();
    }, [getPayslipList]);

    return { tableDatas, orderCount, emailCount, tableLoading, getPayslipList };
};
