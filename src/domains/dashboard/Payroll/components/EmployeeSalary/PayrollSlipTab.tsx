import { SearchOutlined} from '@ant-design/icons';
import { Input,  Col } from 'antd';
import Lottie from 'react-lottie';

import loadingLottie from '@assets/animation/add-Employee-Loader.json';
import GenericTable from '@components/atomic/GenericTable';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';

import DownloadPayslipData from '../../hooks/dashboardHooks/useDownloadPayslip';
import useSendPayslipEmail from '../../hooks/dashboardHooks/useSendPayslipEmail';
import { PayrollSlipTabProps } from '../../types/salaryProfileTypes/employeeSalaryTable';
import { payslipColumns } from '../../utils/salaryTable/data';

export default function PayrollSlipTab({ payslipData, tableLoading,eid }: PayrollSlipTabProps) {
    const dispatch = useAppDispatch();
    const { getPayslipDetails, isLoading } = DownloadPayslipData();
    const { sendPayslipEmail, isSending } = useSendPayslipEmail();
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loadingLottie,
    };

    const handleDownload = async(year:string,month:string) => {
        const success = await getPayslipDetails(eid,year,month,false);
        if (success) dispatch(showToast({ description: 'Payroll slip downloaded successfully', variant: 'success' }));
    }
    const handleEmail = async(year:string,month:string) => {
        const success = await sendPayslipEmail(eid, year, month);
        if (success) dispatch(showToast({ description: 'Email sent successfully', variant: 'success' }));
    }
    return (
        <Col>
            <Input
                placeholder="Search"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8 }}
            />
            <GenericTable
                columns={payslipColumns(handleDownload, handleEmail)}
                dataSource={payslipData}
                loading={tableLoading}
                pagination={false}
            />
            {(isLoading || isSending) && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        zIndex: 1000,
                    }}
                >
                    <Lottie options={defaultOptions} height={120} width={120} />
                </div>
            )}
        </Col>
    );
}
