import React, { useMemo, useState } from 'react';

import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
    Card,
    Checkbox,
    Typography,
    DatePicker,
    Input,
    Row,
    Col,
    Button,
    Badge,
    Tooltip,
    Skeleton,
    Modal,
    Flex,
} from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useLocation, useNavigate } from 'react-router-dom';

import GenericTable from '@components/atomic/GenericTable';
import { paths } from '@src/routes/paths';

import { useEmployeeSalaryListing } from '../hooks/employeeProfileHooks/useEmployeeSalaryListing';
import { SalaryInfo } from '../types/salaryProfileTypes/employeeSalaryTable';
import { getInitials } from '../utils/employeeDetails/data';
import { getMonthName } from '../utils/general/formatter';
import { allowanceKeys, formatCurrency, salaryProfileNewColumns } from '../utils/salaryTable/data';

const { Title, Text } = Typography;
dayjs.extend(utc)

const SalaryProfileNew: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const routeState = (location.state || {}) as {
        month?: number | string;
        year?: number | string;
    };

    const currentDate = new Date();
    const fallbackMonth = currentDate.getMonth() + 1;
    const fallbackYear = currentDate.getFullYear();
    const [isSendPayslip, setIsSendPayslip] = useState(false);
    const [payingDate, setPayingDate] = useState(dayjs());

    const selectedMonth = Number(routeState.month);
    const selectedYear = Number(routeState.year);
    const month =
        Number.isFinite(selectedMonth) && selectedMonth >= 1 && selectedMonth <= 12
            ? selectedMonth
            : fallbackMonth;
    const year =
        Number.isFinite(selectedYear) && selectedYear > 0 ? selectedYear : fallbackYear;

    const [searchText, setSearchText] = useState('');
    const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
    const { salaryResponse, loading, handleMarkAsPaid, handleMarkAsApproved, approveLoading } =
        useEmployeeSalaryListing(year, month, searchText);
    const showSkeleton = loading && !salaryResponse ;
    const columns = salaryProfileNewColumns({
        month:Number(routeState.month),
        year:Number(routeState.year)
    }, navigate);
    const paymentStatus = salaryResponse?.rows?.[0]?.paymentStatus?.toLowerCase() || '';
    const isApproved = paymentStatus === 'approved';
    const isPending = paymentStatus === 'pending';
    const isPaid = paymentStatus === 'paid';
    const isUpcoming = paymentStatus.includes('upcoming');
    const paidViaRollout = salaryResponse?.rows?.[0]?.paidViaRollout;
    let badgeStatus: 'success' | 'error' | 'warning' = 'warning';
    let badgeBgColor = '#FFF6EA';
    let badgeTextColor = '#FFA940';

    if (isApproved || isPaid) {
        badgeStatus = 'success';
        badgeBgColor = '#ECFDF3';
        badgeTextColor = '#12B76A';
    } else if (isPending) {
        badgeStatus = 'error';
        badgeBgColor = '#FFF1F0';
        badgeTextColor = '#FF4D4F';
    }

    const tableData = useMemo(
        () =>
            (salaryResponse?.rows || []).map(row => {
                const salaryInformation = (row.salaryInformation || {}) as SalaryInfo;
                const totalAllowance = allowanceKeys.reduce(
                    (sum, key) => sum + Number(salaryInformation[key] || 0),
                    0
                );
                const totalDeductions =
                    Number(salaryInformation.deductionAmount || 0) +
                    Number(salaryInformation.leavesAmount || 0);

                return {
                    key: row.id,
                    name: row.employee.personalInformation.fullName || '-',
                    employeeId: row.employee.employeeInformation.employeeId || '-',
                    designation: row.employee.employeeInformation.designation || '-',
                    department: row.department?.departmentName || '-',
                    basicSalary: formatCurrency(Number(salaryInformation.basicPay || 0)),
                    totalAllowance: formatCurrency(totalAllowance),
                    totalDeductions: formatCurrency(totalDeductions),
                    netSalary: formatCurrency(Number(row.totalPayable || 0)),
                    initials: getInitials(row.employee.personalInformation.fullName || ''),
                    bankDetails:row?.bankDetails || [],
                    id:row.employee.id || ""
                };
            }),
        [salaryResponse]
    );

    const salaryCycleText =
        salaryResponse?.salaryCycle?.salaryCycleStart && salaryResponse?.salaryCycle?.salaryCycleEnd
            ? `${dayjs.utc(salaryResponse.salaryCycle.salaryCycleStart).format('DD-MM-YYYY')} - ${dayjs.utc(salaryResponse.salaryCycle.salaryCycleEnd).format('DD-MM-YYYY')}`
            : '-';

    return (
        <Row className="w-full min-h-screen flex-col bg-white pb-10">
            <Col>
                <Title level={3} className="mt-0 mb-6 text-xl font-semibold text-[#3B3B3B]">
                    Review Salary Details
                </Title>

                <Card className="mt-7 rounded-2xl border border-[#e5e7eb] shadow-sm">
                    {showSkeleton ? (
                        <Skeleton active paragraph={{ rows: 5 }} />
                    ) : (
                    <Row gutter={10}>
                                <Col md={3}>
                                    <Col className="flex flex-col gap-1">
                                        <Text className=" font-semibold text-[#4b5563]">Paying Date</Text>
                                        <DatePicker
                                            placeholder="Calendar"
                                            value={payingDate}
                                            disabled={isUpcoming}
                                            onChange={value => setPayingDate(value || dayjs())}
                                        />
                                    </Col>
                                </Col>

                                <Col md={2}>
                                    <Col className="flex flex-col gap-2">
                                        <Text className="text-center font-semibold text-[#4b5563]">
                                            Month{' '}
                                            <Tooltip title="To change the month, go back to the Employee Salary page...">
                                                <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 4 }} />
                                            </Tooltip>
                                        </Text>
                                        <Text className=" font-medium text-[#1f2937]">
                                            {getMonthName(month)}
                                        </Text>
                                    </Col>
                                </Col>

                                <Col md={5}>
                                    <Col className="flex flex-col gap-2">
                                        <Text className="text-center font-semibold text-[#4b5563]">Salary Cycle</Text>
                                        <Text className=" font-medium text-[#1f2937] text-center">{salaryCycleText}</Text>
                                    </Col>
                                </Col>

                                <Col md={3}>
                                    <Col className="flex flex-col gap-2">
                                        <Text className=" font-semibold text-[#4b5563]">No. of working days</Text>
                                        <Text className=" font-medium text-[#1f2937]">
                                            {salaryResponse?.salaryCycle?.workingDays || 0} Days
                                        </Text>
                                    </Col>
                                </Col>

                                <Col md={3}>
                                    <Col className="flex flex-col gap-2">
                                        <Text className=" font-semibold text-[#4b5563]">Number of employees</Text>
                                        <Text className=" font-medium text-[#1f2937]">
                                            {salaryResponse?.count || 0}
                                        </Text>
                                    </Col>
                                </Col>

                                <Col md={4}>
                                    <Col className="flex flex-col gap-2">
                                        <Text className=" font-semibold text-[#4b5563]">Total Payable</Text>
                                        <Text strong className=" text-[#111827]">
                                            {formatCurrency(Number(salaryResponse?.totalPayableSum || 0))}
                                        </Text>
                                    </Col>
                                </Col>
                                <Col md={4}>
                                    <Badge
                                        status={badgeStatus}
                                        text={salaryResponse?.rows?.[0]?.paymentStatus}
                                        style={{
                                            backgroundColor: badgeBgColor,
                                            color: badgeTextColor,
                                            padding: '4px 10px',
                                            borderRadius: '10px',
                                        }}
                                        className="m-1"
                                    />
                                    <Flex vertical gap={8} className="mt-2">
                                        <Button
                                            type="primary"
                                            danger
                                            className="w-full"
                                            disabled={!isApproved || isPaid || isUpcoming}
                                            onClick={() => setShowMarkAsPaidModal(true)}
                                            loading={approveLoading}
                                        >
                                            Mark as Paid
                                        </Button>
                                        <Button
                                            danger
                                            className="w-full"
                                            disabled={isUpcoming || isPaid}
                                            onClick={() =>
                                                navigate(
                                                    `/${paths.payroll.index}/${paths.payroll.salaryProcess}`,
                                                    { state: { month, year } }
                                                )
                                            }
                                        >
                                            Initiate to Salary Rollout
                                        </Button>
                                        <Button
                                            danger
                                            className="w-full"
                                            disabled={!isPaid || isUpcoming || paidViaRollout !== false}
                                            onClick={async () => {
                                                const isSuccess = await handleMarkAsApproved();
                                                if (isSuccess) {
                                                    navigate(
                                                        `/${paths.payroll.index}/${paths.payroll.employeesSalary}/${paths.payroll.payrollRecordSuccess}`,
                                                        { state: { month, year } }
                                                    );
                                                }
                                            }}
                                            loading={approveLoading}
                                        >
                                            Mark as Approved
                                        </Button>
                                    </Flex>
                                </Col>
                    </Row>
                    )}

                    {!showSkeleton && <Row className="mt-11">
                        <Checkbox
                            className="text-sm font-medium text-[#1f2937]"
                            checked={isSendPayslip}
                            onChange={e => setIsSendPayslip(e.target.checked)}
                        >
                            Generate and send Payslip to all the employees
                        </Checkbox>
                    </Row>}
                </Card>
            </Col>

            <Col className='py-5'>
              
                    <Input
                        prefix={<SearchOutlined className="text-base text-[#9ca3af]" />}
                        placeholder="Search by name"
                        variant="outlined"
                        allowClear
                        value={searchText}
                        onChange={e => {
                            const value = e.target.value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
                            setSearchText(value)
                        }}
                    />
            </Col>

            <Col>
                {showSkeleton ? (
                    <Card className="rounded-2xl border border-[#e5e7eb] shadow-sm">
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </Card>
                ) : (
                    <GenericTable
                        columns={columns}
                        dataSource={tableData}
                        loading={loading}
                        pagination={false}
                        className="border-t-0"
                        rowClassName={() => 'align-middle'}
                    />
                )}
            </Col>

            <Modal
                open={showMarkAsPaidModal}
                title="Confirm Salary Disbursement"
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{ danger: true, type: 'primary', loading: approveLoading }}
                onOk={async () => {
                    setShowMarkAsPaidModal(false);
                    const isSuccess = await handleMarkAsPaid(payingDate, isSendPayslip);
                    if (isSuccess) {
                        navigate(
                            `/${paths.payroll.index}/${paths.payroll.employeesSalary}/${paths.payroll.payrollRecordSuccess}`,
                            { state: { month, year } }
                        );
                    }
                }}
                onCancel={() => setShowMarkAsPaidModal(false)}
            >
                <Typography.Paragraph>
                    By proceeding, you confirm that salary disbursement for the selected employees
                    has been initiated outside of Peko. This action will mark their status as Paid
                    but will not trigger any payment via the Peko platform.
                </Typography.Paragraph>
            </Modal>
        </Row>
    );
};

export default SalaryProfileNew;
