import { Flex, Typography } from 'antd';

import { formattedDateOnly, formattedTime } from '@utils/dateFormat';
import { formatNumberWithLocalString } from '@utils/priceFormat';

export const walletReportcolumns = [
    {
        title: 'Transaction Date',
        sorter: true,
        dataIndex: 'transactionDate',
        render: (date: any) => (
            <Flex vertical>
                <Typography.Text>{formattedDateOnly(new Date(date))}</Typography.Text>
                <Typography.Text>{formattedTime(new Date(date))}</Typography.Text>
            </Flex>
        ),
    },
    {
        sorter: true,
        title: 'Transaction ID',
        dataIndex: 'corporateTxnId',
        render: (data: string) => data,
    },
    {
        sorter: true,
        title: 'Corporate Name',
        dataIndex: ['credential', 'name'],
        render: (data: any, record: any) => (
            <Typography.Text>{record?.credential?.name}</Typography.Text>
        ),
    },
    {
        title: 'Corporate ID',
        sorter: true,
        dataIndex: ['credential', 'username'],
        render: (data: any, record: any) => (
            <Typography.Text>{record?.credential?.username}</Typography.Text>
        ),
    },
    {
        title: 'Transaction Type',
        sorter: true,
        dataIndex: 'transactionType',
        render: (data: string) => data,
    },
    {
        title: 'Debit Amount',
        sorter: true,
        dataIndex: 'debitAmount',
        render: (amount: string) => `₹ ${formatNumberWithLocalString(amount)}`,
    },
    {
        title: 'Credit Amount',
        sorter: true,
        dataIndex: 'creditAmount',
        render: (amount: string) => `₹ ${formatNumberWithLocalString(amount)}`,
    },
    {
        title: 'Status',
        sorter: true,
        dataIndex: 'status',
        render: (status: string) => status || '-',
    },
];
