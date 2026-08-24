import { useState, useCallback, useEffect } from 'react';

import { useAppSelector } from '@src/hooks/store';

import { getSalaryDetailsByEmployeeId } from '../../../api/employeeSalaryApi/employeeSalary';

export type SalaryDetailsRow = {
    key: string;
    componentName: string;
    category: string;
    amount: number;
};

export type SalaryDetailsTotals = {
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
};

type SalaryDetailsResponse = {
    status: boolean;
    salaryRows: {
        componentName: string;
        category: string;
        amount: number;
    }[];
    totals: SalaryDetailsTotals;
    salaryStatus:string
};

export const useGetSalaryDetailsByEmployee = (
    employeeId?: string,
    month: number = new Date().getMonth() + 1,
    year: number = new Date().getFullYear()
) => {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [salaryRows, setSalaryRows] = useState<SalaryDetailsRow[]>([]);
    const [status,setStatus] = useState("")
    const [totals, setTotals] = useState<SalaryDetailsTotals>({
        totalEarnings: 0,
        totalDeductions: 0,
        netSalary: 0,
    });
    const [tableLoading, setTableLoading] = useState<boolean>(true);

    const getSalaryDetails = useCallback(async () => {
        if (!employeeId) {
            setSalaryRows([]);
            setTotals({
                totalEarnings: 0,
                totalDeductions: 0,
                netSalary: 0,
            });
            setTableLoading(false);
            return;
        }

        setTableLoading(true);
        const response = (await getSalaryDetailsByEmployeeId({
            id: employeeId,
            month,
            year,
            userId: id,
            userType: role,
        })) as SalaryDetailsResponse | false;

        if (response) {
            const rows = (response.salaryRows || []).map((item, index) => ({
                key: `${item.componentName}-${index}`,
                componentName: item.componentName || '-',
                category: item.category || '-',
                amount: Number(item.amount || 0),
            }));
            setStatus(response.salaryStatus)
            setSalaryRows(rows);
            setTotals(
                response.totals || {
                    totalEarnings: 0,
                    totalDeductions: 0,
                    netSalary: 0,
                }
            );
        } else {
            setSalaryRows([]);
            setTotals({
                totalEarnings: 0,
                totalDeductions: 0,
                netSalary: 0,
            });
        }
        setTableLoading(false);
    }, [employeeId, id, month, role, year]);

    useEffect(() => {
        getSalaryDetails();
    }, [getSalaryDetails]);

    return { salaryRows, totals, tableLoading, getSalaryDetails,status };
};
