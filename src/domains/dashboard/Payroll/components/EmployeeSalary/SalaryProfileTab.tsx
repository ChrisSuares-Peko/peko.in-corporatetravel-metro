import React from 'react';

import { Flex, Space, Typography, Table, Col, Badge } from 'antd';


import GenericTable from '@components/atomic/GenericTable';
import { formatNumberWithLocalString } from '@utils/priceFormat';



import { SalaryProfileTabProps } from '../../types/salaryProfileTypes/employeeSalaryTable';
import { monthNames, salaryProfileColumns } from '../../utils/salaryTable/data';

const { Title, Text } = Typography;





export default function SalaryProfileTab({
    salaryRows,
    totals,
    tableLoading,
    month,
    year,
    status = "UPCOMING"
}: SalaryProfileTabProps) {
    const salaryData = salaryRows.map(item => ({
        ...item,
        amount: `₹ ${formatNumberWithLocalString(item.amount || 0)}`,
    }));
    const monthTitle = month ? monthNames[month - 1] || '' : '';

   
    return (
        <Col>
            <Flex align="center" justify="space-between">
                <Space align="center" size="middle">
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                        {monthTitle} {year} Salary Info
                    </Title>
                    <Badge
                        status={
                            // eslint-disable-next-line no-nested-ternary
                            status.toLowerCase() === "approved"
                                ? "success"
                                : status.toLowerCase() === "pending"
                                    ? "error"
                                    : "warning"
                        }
                        text={status}
                        style={{
                            backgroundColor:
                                // eslint-disable-next-line no-nested-ternary
                                status.toLowerCase() === "approved"
                                    ? '#ECFDF3'
                                    : status.toLowerCase() === "pending"
                                        ? '#FFF1F0'
                                        : '#FFF6EA',
                            color:
                                // eslint-disable-next-line no-nested-ternary
                                status.toLowerCase() === "approved"
                                    ? '#12B76A'
                                    : status.toLowerCase() === "pending"
                                        ? '#ff4d4f'
                                        : '#FFA940',
                            padding: '4px 10px',
                            borderRadius: '10px',
                        }}
                    />
                </Space>
                {/* <Button type="primary" danger onClick={()=>dispatch(showToast({description:"Coming soon",variant:"info"}))} style={{ fontWeight: 500, padding: '0 24px', borderRadius: 6 }}>
                    Run Payroll
                </Button> */}
            </Flex>

            <GenericTable
                columns={salaryProfileColumns}
                dataSource={salaryData}
                loading={tableLoading}
                pagination={false}
                summary={() => (
                    <Table.Summary.Row style={{ borderTop: '1px solid #f0f0f0' }}>
                        <Table.Summary.Cell index={0}>
                            <Text strong style={{ fontSize: 16, color: '#262626', display: 'block', padding: '16px 16px' }}>
                                Net Salary
                            </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} />
                        <Table.Summary.Cell index={2}>
                            <Text strong style={{ color: '#52c41a', fontSize: 16, display: 'block', padding: '16px 16px' }}>
                                ₹ {formatNumberWithLocalString(totals?.netSalary || 0)}
                            </Text>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </Col>
    );
}
