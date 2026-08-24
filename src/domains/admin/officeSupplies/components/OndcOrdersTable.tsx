import React from 'react';

import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { Flex, Tag, Tooltip, Typography } from 'antd';
import { TableProps } from 'antd/lib';

import GenericTable from '@components/atomic/GenericTable';
import { getOrderStateTagStyle } from '@src/domains/dashboard/officeSupplies/components/OrderHistory/OndcStatusTag';
import {
    formatFulfillmentStateLabel,
    getDeliveryFulfillment,
    getFulfillmentStatusStyle,
} from '@src/domains/dashboard/officeSupplies/utils/fulfillmentStatus';
import { useAppDispatch } from '@src/hooks/store';
import { showToast } from '@src/slices/apiSlice';
import { formattedDateOnly, formattedTime } from '@utils/dateFormat';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { AllOrdersRow } from '../types/types';

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
    PAID: { bg: '#ecfdf3', color: '#027a48' },
    'NOT-PAID': { bg: '#fef2f2', color: '#ef4444' },
};

type Props = {
    tableData: AllOrdersRow[] | undefined;
    isLoading: boolean;
    onTableChange: TableProps<AllOrdersRow>['onChange'];
    onView: (record: AllOrdersRow) => void;
    /** Cancelled/Returned sections omit this — a Cancelled order's Delivery
     *  leg is stale, a Returned order's is almost always "Delivered". */
    showFulfilment?: boolean;
};

/** Shared ONDC-order columns/table — the "All orders" tab and the Cancelled/Returned sections on the other 3 tabs all render the same row shape. */
const OndcOrdersTable = ({ tableData, isLoading, onTableChange, onView, showFulfilment = true }: Props) => {
    const dispatch = useAppDispatch();

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        dispatch(showToast({ variant: 'success', description: 'Order ID copied.' }));
    };

    // Explicit widths — GenericTable (@components/atomic/GenericTable) fits
    // columns against `window.innerWidth` assuming 200px per column with no
    // `width`; 8-9 uncapped columns (1600-1800px) can exceed a real admin
    // viewport (sidebar eats several hundred px), silently pushing columns
    // into its hidden "expandable" set and leaving a populated table looking
    // empty. These are sized to what each column actually needs.
    const columns = [
        {
            title: 'Order Date',
            dataIndex: 'createdAt',
            sorter: true,
            key: 'createdAt',
            width: 120,
            render: (createdAt: string) => (
                <Flex vertical>
                    <Typography.Text>{formattedDateOnly(new Date(createdAt))}</Typography.Text>
                    <Typography.Text>{formattedTime(new Date(createdAt))}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: 'Order ID',
            key: 'orderId',
            width: 190,
            render: (_: any, record: AllOrdersRow) => {
                const displayId = record.orderId || record.transactionId;
                return (
                    <Flex align="center" gap={6}>
                        <Typography.Text>{displayId}</Typography.Text>
                        <Tooltip title="Copy Order ID">
                            <CopyOutlined onClick={() => handleCopy(displayId)} className="cursor-pointer" />
                        </Tooltip>
                    </Flex>
                );
            },
        },
        {
            title: 'Corporate',
            dataIndex: 'corporateName',
            key: 'corporateName',
            width: 110,
            render: (name: string | undefined) => name || '-',
        },
        {
            title: 'Seller',
            dataIndex: 'vendorName',
            key: 'vendorName',
            width: 130,
            render: (name: string | null) => name || '-',
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            sorter: true,
            key: 'totalAmount',
            width: 100,
            render: (amount: string | null) =>
                amount ? `₹ ${formatNumberWithLocalString(Number(amount))}` : '-',
        },
        {
            title: 'Order State',
            dataIndex: 'orderState',
            key: 'orderState',
            width: 120,
            render: (state: string | null) => {
                const style = getOrderStateTagStyle(state || '');
                return (
                    <Tag style={{ background: style.bg, color: style.color, border: 'none', borderRadius: 999 }}>
                        {style.label}
                    </Tag>
                );
            },
        },
        ...(showFulfilment
            ? [
                  {
                      title: 'Fulfilment',
                      dataIndex: 'fulfillments',
                      key: 'fulfillments',
                      width: 130,
                      render: (_: any, record: AllOrdersRow) => {
                          const deliveryCode = getDeliveryFulfillment(record.fulfillments)?.state?.descriptor
                              ?.code;
                          const style = getFulfillmentStatusStyle(deliveryCode);
                          return (
                              <Tag
                                  style={{
                                      background: style.bg,
                                      color: style.color,
                                      border: 'none',
                                      borderRadius: 999,
                                  }}
                              >
                                  {formatFulfillmentStateLabel(deliveryCode)}
                              </Tag>
                          );
                      },
                  },
              ]
            : []),
        {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 110,
            render: (status: string | null) => {
                const style = PAYMENT_STYLES[status || ''] || { bg: '#f5f5f5', color: '#595959' };
                return (
                    <Tag style={{ background: style.bg, color: style.color, border: 'none', borderRadius: 999 }}>
                        {status || 'Unknown'}
                    </Tag>
                );
            },
        },
        {
            title: 'View',
            key: 'action',
            width: 60,
            render: (_: any, record: AllOrdersRow) => <EyeOutlined onClick={() => onView(record)} />,
        },
    ];

    return (
        <GenericTable
            rowKey={record => record.id}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            loading={isLoading}
            onChange={onTableChange}
        />
    );
};

export default OndcOrdersTable;
