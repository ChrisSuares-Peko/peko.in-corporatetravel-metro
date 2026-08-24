import React from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Space, Button, Pagination } from 'antd';

import GenericTable from '@components/atomic/GenericTable';
import { formatNumberWithLocalString } from '@utils/priceFormat';

type DeductionDetailsProps = {
    data: Array<{
        deductionName: string;
        deductionType: string;
        calculationType: string;
        amount: string | number;
        calculationBasis: string;
        status: string;
        applicabilityCriteria?: string;
        id?: string;
    }>;
    page: number;
    totalCount?: number;
    tableLoading: boolean;
    handlePageChange: (page: number, pageSize: number) => void;
    handleEdit: (selectedRowData: any) => void;
    handleDelete: (selectedRowData: any) => void;
    handleDeleteDeductionComp: () => void;
};
const formatText = (text: string | number) => {
    if (!text) return '';
    const stringText = String(text); // Convert any input to a string
    return stringText.charAt(0).toUpperCase() + stringText.slice(1).toLowerCase();
};
const DeductionDetails = ({
    data,
    page,
    totalCount,
    tableLoading,
    handlePageChange,
    handleEdit,
    handleDelete,
    handleDeleteDeductionComp,
}: DeductionDetailsProps) => {
    const columns = [
        {
            title: 'Deduction Name',
            dataIndex: 'deductionName',
            key: 'deductionName',
        },
        
        {
            title: 'Calculation Type',
            dataIndex: 'calculationType',
            // key: 'calculationType',
            render: (text: any, record: any) => {
                const calculationType = formatText(record.calculationType) || 'N/A';
                return calculationType;
            },
        },
        {
            title: 'Amount/Percentage',
            key: 'amountOrPercentage',
            render: (text: any, record: any) => {
                if (record.calculationType === 'FIXED') {
                    return record.amountPercentage ? `${formatNumberWithLocalString(Number(record.amountPercentage))}` : '0'; // `${record.amountPercentage}` : '0';
                }
                if (record.calculationType === 'PERCENTAGE') {
                    return record.amountPercentage
                        ? `${record.amountPercentage}% of ${record?.salaryDeductionType?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`
                        : '0';
                }
                return '0';
            },
        },
        {
            title: 'Calculation Basis',
            dataIndex: 'calculationBasis',
            key: 'calculationBasis',
            render: (text: any, record: any) => {
                const calculationBasis = formatText(record.calculationBasis) || 'N/A';
                return calculationBasis;
            },
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: any) => {
                let colorClass = '';

                if (status === 'ACTIVE') {
                    colorClass = 'text-[#05BE63] bg-[#DDFFE2]';
                } else if (status === 'INACTIVE') {
                    colorClass = 'text-[#FDA700] bg-[#FFFBE4]';
                }

                const formattedStatus = formatText(status);

                return (
                    <span
                        className={`${colorClass} font-normal px-3 py-1 rounded-2xl -ml-[.125rem]`}
                    >
                        {formattedStatus}
                    </span>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <EditOutlined
                        className="text-[#E30000]"
                        onClick={() => handleEdit(record)}
                    />

                    {record?.deductionName !== 'Provident Fund (PF)' && (
                        <Button
                            className="border-0"
                            onClick={() => handleDelete(record)}
                        >
                            <DeleteOutlined className="text-[#E30000]" />
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <GenericTable
                columns={columns}
                dataSource={data}
                className="mt-2"
                pagination={false}
                loading={tableLoading}
            />
            <Pagination
                current={page}
                total={totalCount}
                size="default"
                className="text-end pt-7"
                pageSize={10}
                onChange={handlePageChange}
                style={{ marginTop: '16px', textAlign: 'right' }}
            />
        </>
    );
};

export default DeductionDetails;
