import React from 'react';

// import { DownloadOutlined } from '@ant-design/icons';
import { Space, Typography, Avatar, Tabs, Flex } from 'antd';
import { useLocation } from 'react-router-dom';

import PayrollSlipTab from './PayrollSlipTab';
import SalaryProfileTab from './SalaryProfileTab';
import GetEmployeeDetails from '../../hooks/employeeHooks/useGetEmployee';
import { useGetPayslipByEmployee } from '../../hooks/employeeSalaryHooks/salaryTableHooks/useGetPayslipByEmployee';
import { useGetSalaryDetailsByEmployee } from '../../hooks/employeeSalaryHooks/salaryTableHooks/useGetSalaryDetailsByEmployee';
import { getInitials } from '../../utils/employeeDetails/data';

const { Title, Text } = Typography;

export default function EmployeeSalaryProfile() {
    const location = useLocation();
    const state = (location.state || {}) as { month?: number; year?: number,eid:string };
    const year = Number(state.year) || new Date().getFullYear();
    const month = Number(state.month) || new Date().getMonth() + 1;
    const {eid} = state

    const { tableDatas, tableLoading } = useGetPayslipByEmployee(
        eid,
        year,
        1,
        10
    );
    const { salaryRows, totals, tableLoading: salaryDetailsLoading,status } = useGetSalaryDetailsByEmployee(
        eid,
        month,
        year
    );
    const {data} = GetEmployeeDetails(eid as string)

    return (
        <Flex
            vertical
            gap="large"
            style={{ padding: '24px', backgroundColor: '#fff', minHeight: '100vh', maxWidth: 1200 }}
        >
            {/* Header Profile Section */}
            <Flex gap="middle" align="center" style={{ marginBottom: 16 }}>
                <Avatar
                    size={72}
                    style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}
                > {getInitials(data ? data.personalInformation.fullName : '')}</Avatar>
                <Flex vertical justify="center" gap="small">
                    <Space align="center" size="large">
                        <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                            {data?.personalInformation?.fullName}
                        </Title>
                        {/* <Button
                        type='text'
                            className='font-[500] flex justify-center items-center gap-3 text-[#52c41a] hover:text-[#93ea68_!important] hover:bg-[#00000000_!important]'
                        >
                            Download Salary Certificate <DownloadOutlined />
                        </Button> */}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 14, marginTop: -4 }}>
                        {data?.employeeInformation?.designation}
                    </Text>
                </Flex>
            </Flex>

            {/* Tabs Section */}
            <Tabs
                defaultActiveKey="1"
                tabBarStyle={{ marginBottom: 32 }}
                items={[
                    {
                        key: '1',
                        label: <span style={{ fontWeight: 500 }}>Salary Profile</span>,
                        children: (
                            <SalaryProfileTab
                                salaryRows={salaryRows}
                                totals={totals}
                                tableLoading={salaryDetailsLoading}
                                month={month}
                                year={year}
                                status={status}
                            />
                        ),
                    },
                    {
                        key: '2',
                        label: <span style={{ fontWeight: 500 }}>Payroll Slip</span>,
                        children: (
                            <PayrollSlipTab eid={eid as string} payslipData={tableDatas} tableLoading={tableLoading} />
                        ),
                    },
                ]}
            />
        </Flex>
    );
}
