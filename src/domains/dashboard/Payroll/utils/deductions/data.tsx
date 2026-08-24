import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, TableProps, Typography } from 'antd';

import { deductionTableType } from '../../types/salaryProfileTypes/deductionTypes';

const formatText = (text: string | number) => {
    if (!text) return '';
    const stringText = String(text); // Convert any input to a string
    return stringText.charAt(0).toUpperCase() + stringText.slice(1).toLowerCase();
};
export const deductionColumn = (
    handleDelete: (id: deductionTableType) => void,
    handleEdit: (id: deductionTableType) => void
): TableProps<deductionTableType>['columns'] => [
    {
        title: <Typography.Text>Deduction Date</Typography.Text>,
        dataIndex: 'deductionDate',
        key: 'deductionDate',
    },

    {
        title: <Typography.Text>Deduction Amount</Typography.Text>,
        dataIndex: 'deductionAmount',
        key: 'deductionAmount',
        render: text =>
            `AED ${parseFloat(text)
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
    },

    {
        title: <Typography.Text>Status</Typography.Text>,
        dataIndex: 'deductionStatus',
        key: 'deductionStatus',
        render: text => formatText(text),
    },
    {
        title: <Typography.Text>Action</Typography.Text>,
        dataIndex: 'action',
        key: 'action',
        onCell: () => ({
            style: {
                minHeight: '52.8px',
                display: 'flex',
                alignItems: 'center',
            },
        }),
        render: (text, record) =>
            record.id && (
                <Space size="middle">
                    <Button className="border-0">
                        <DeleteOutlined
                            className="text-[#E30000]"
                            onClick={() => handleDelete(record)}
                        />
                    </Button>
                    <Button className="border-0">
                        <EditOutlined
                            className="text-[#E30000]"
                            onClick={() => handleEdit(record)}
                        />
                    </Button>
                </Space>
            ),
    },
];
