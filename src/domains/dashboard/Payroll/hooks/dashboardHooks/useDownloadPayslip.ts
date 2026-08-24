import { useState } from 'react';

import { saveAs } from 'file-saver';

import { useAppSelector } from '@src/hooks/store';

import { getEmployeePayslip } from '../../api/dashBoardIndex';

export default function DownloadPayslipData() {
    const { role, id } = useAppSelector(state => state.reducer.auth);
    const [isLoading, setIsLoading] = useState(false);

    const getPayslipDetails = async (
        employeeId: string,
        year: string,
        month: string,
        sendEmail: boolean
    ) => {
        setIsLoading(true);
        const data: any | false = await getEmployeePayslip({
            userId: id,
            userType: role,
            employeeId,
            year,
            month,
            sendEmail,
        });

        if (data) {
            const payslip = data as any;
            const uint8Array = new Uint8Array(payslip.pdfData.data);
            const blob = new Blob([uint8Array], { type: 'application/pdf' });
            saveAs(blob, 'Payslip.pdf');
        }
        setIsLoading(false);
        return !!data;
    };

    return { isLoading, getPayslipDetails };
}
