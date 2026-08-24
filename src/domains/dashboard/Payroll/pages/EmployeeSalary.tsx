import { useEffect, useState } from 'react';

import { Button, Col, Flex, Row, Tabs, TabsProps, Typography } from 'antd';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';


import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import { approveSalary } from '../api/employeeSalaryApi/employeeSalary';
import EmployeesSalaryListTab from '../components/EmployeeSalary/EmployeesSalaryListTab';
import PayrollHistoryTab from '../components/EmployeeSalary/PayrollHistoryTab';
import DeductionModal from '../components/modals/DeductionModal';
import IncentivesModal from '../components/modals/IncentivesModal';
import OverTimeModal from '../components/modals/OverTimeModal';
import SalaryProcessingModal from '../components/modals/SalaryProcessingModal';
import { invalidateDashboardCache } from '../hooks/dashboardHooks/useDashboardApi';
import { resetSalarySlice } from '../slices/payrollSalarySlice';

function EmployeesSalary() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab ?? '1');
    const [reloadTable, setReloadTable] = useState(false);
    const initialMonth = new Date().getMonth() + 1;
    const initialYear = new Date().getFullYear();
   
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [salaryCycle, setSalaryCycle] = useState<any>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [salaryArray, setSalaryArray] = useState([]);
    const [salaryPaymentStatus, setSalaryPaymentStatus] = useState('');

    const handleDateChange = (month: any, year: any) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Employees',
            children: (
                <EmployeesSalaryListTab
                    reloadTable={reloadTable}
                    onDateChange={handleDateChange}
                    handleSalaryCycle={setSalaryCycle}
                    setSalaryArray={setSalaryArray}
                    onPaymentStatusChange={setSalaryPaymentStatus}
                />
            ),
        },
        {
            key: '2',
            label: 'Payroll History',
            children: <PayrollHistoryTab />,
            disabled: false,
        },
    ];

    const [openSalaryProcessingModal, setOpenSalaryProcessingModal] = useState(false);
    const [openIncentivesModal, setOpenIncentivesModal] = useState(false);
    const [openOvertimeModal, setOpenOvertimeModal] = useState(false);
    const [openDeductionModal, setOpenDeductionModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [runPayrollLoading, setRunPayrollLoading] = useState(false);
    const navigate = useNavigate();
    const dipatch = useAppDispatch();
    const { role, id } = useAppSelector(state => state.reducer.auth);

    // const payrollPath = `${paths.payroll.index}/${paths.payroll.employeesSalary}/${paths.payroll.processSalary}`;

    useEffect(() => {
        dipatch(resetSalarySlice());
    }, [dipatch]);

    return (
        <Row>
            <Row justify="space-between" className=" w-full mt-3">
                <Col md={4}>
                    <Typography.Paragraph className=" text-neutral-700 text-xl font-medium">
                        Salary Details
                    </Typography.Paragraph>
                </Col>
                <Col>
                    <Flex gap={8}>
                        <Button
                            danger
                            type="primary"
                            loading={runPayrollLoading}
                            onClick={async () => {
                                setRunPayrollLoading(true);
                                const response: any = await approveSalary({
                                    payingDate: dayjs().toISOString(),
                                    month: Number(selectedMonth),
                                    year: selectedYear,
                                    sendPayslip: false,
                                    userType: role,
                                    userId: id,
                                });
                                setRunPayrollLoading(false);
                                const msg: string = response?.data?.message || response?.message || '';
                                const alreadyProcessed = msg.toLowerCase().includes('already approved') || msg.toLowerCase().includes('already paid');
                                if (response?.status === true || alreadyProcessed) {
                                    invalidateDashboardCache();
                                    navigate(paths.payroll.salaryProfile, {
                                        state: { month: Number(selectedMonth), year: selectedYear },
                                    });
                                } else {
                                    dipatch(showToast({
                                        variant: 'error',
                                        description: msg || 'Unable to run payroll. Please try again.',
                                    }));
                                }
                            }}
                        >
                            Run Payroll
                        </Button>
                        <Button danger disabled={salaryPaymentStatus.toLowerCase() === 'paid'} onClick={() => setOpenOvertimeModal(true)}>
                            Add Overtime
                        </Button>
                        <Button danger disabled={salaryPaymentStatus.toLowerCase() === 'paid'} onClick={() => setOpenIncentivesModal(true)}>
                            Add Incentives
                        </Button>
                        <Button danger disabled={salaryPaymentStatus.toLowerCase() === 'paid'} onClick={() => setOpenDeductionModal(true)}>
                            Add Deduction
                        </Button>
                    </Flex>
                </Col>
            </Row>

            <Row className="w-full">
                <Col xs={24} className="md:mt-10 mt-5 w-full">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
                </Col>
            </Row>
            {openOvertimeModal && (
                <OverTimeModal
                    open={openOvertimeModal}
                    handleCancel={() => setOpenOvertimeModal(false)}
                    reloadTable={setReloadTable}
                    year={selectedYear}
                    month={Number(selectedMonth)}
                />
            )}
            {openIncentivesModal && (
                <IncentivesModal
                    open={openIncentivesModal}
                    handleCancel={() => setOpenIncentivesModal(false)}
                    reloadTable={setReloadTable}
                    year={selectedYear}
                    month={Number(selectedMonth)}
                />
            )}
            {openDeductionModal && (
                <DeductionModal
                    year={selectedYear}
                    month={Number(selectedMonth)}
                    open={openDeductionModal}
                    handleCancel={() => setOpenDeductionModal(false)}
                    reloadTable={setReloadTable}
                />
            )}
            <SalaryProcessingModal
                open={openSalaryProcessingModal}
                handleCancel={() => setOpenSalaryProcessingModal(false)}
            />
        </Row>
    );
}

export default EmployeesSalary;
