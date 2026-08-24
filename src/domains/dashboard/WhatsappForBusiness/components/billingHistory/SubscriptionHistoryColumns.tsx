import { DownloadOutlined } from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { capitalize } from 'lodash';

import { formattedDateTime } from '@utils/dateFormat';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { ActiveSubscription, Package } from '../../types/orderHistory';

const isBundledRow = (record: ActiveSubscription): boolean =>
    !record.subscriptionPaymentRefId &&
    (record.billingPlan ?? '').toUpperCase() === 'BASIC' &&
    !record.isCustom;

const getPurchaseHistoryColumns = (
    handleDownloadInvoice: any,
    loadingRows: any
): ColumnsType<ActiveSubscription> => [
    {
        key: 'subscriptionPaymentRefId',
        title: 'Order ID',
        dataIndex: 'subscriptionPaymentRefId',
        render: (refId: string | null, record: ActiveSubscription) => {
            if (refId) return refId;
            if (isBundledRow(record)) return 'Bundled with Peko+';
            return '—';
        },
    },
    {
        key: 'createdAt',
        title: 'Billing Date',
        // createdAt is the actual purchase/charge timestamp. subscriptionStartDate is normalized to
        // start-of-day in the backend (moment().startOf('day')), so it always renders as "12 AM".
        dataIndex: 'createdAt',
        render: (date: string) => (date ? formattedDateTime(new Date(date)) : 'N/A'),
    },
    {
        key: 'package',
        title: 'Plan',
        dataIndex: 'package',
        render: (data: Package) => data.packageName,
    },
    {
        key: 'subscriptionAmountPaid',
        title: 'Amount',
        dataIndex: 'subscriptionAmountPaid',
        render: (amount: number, record: ActiveSubscription) =>
            isBundledRow(record) ? 'Free' : `₹ ${formatNumberWithLocalString(amount)}`,
    },
    {
        title: 'Payment Mode',
        dataIndex: 'paymentMode',
        key: 'paymentMode',
        render: (_: unknown, record: ActiveSubscription) =>
            isBundledRow(record) ? 'Bundled' : 'Card',
    },
    {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (text: string) => {
            const displayText = text === 'PENDING' ? 'Purchased' : capitalize(text);
            const tagColor = text === 'ACTIVE' || text === 'PENDING' ? 'success' : 'error';

            return (
                <Tag color={tagColor} className="rounded-2xl px-3 py-0.5">
                    {displayText}
                </Tag>
            );
        },
    },
    {
        key: 'details',
        title: 'Details',
        dataIndex: 'id',
        render: (invoiceId: string) => (
            <span
                tabIndex={0}
                role="button"
                onClick={() => handleDownloadInvoice(invoiceId)}
                aria-disabled={loadingRows[invoiceId]}
                onKeyDown={(event: React.KeyboardEvent<HTMLSpanElement>) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        handleDownloadInvoice(invoiceId);
                    }
                }}
                className="text-bgOrange2 text-nowrap"
                aria-label={`Download invoice for transaction ID ${invoiceId}`}
            >
                {loadingRows[invoiceId] ? (
                    <Spin size="small" className="text-xs pe-3" />
                ) : (
                    <DownloadOutlined className="text-xs pe-2" />
                )}
                {loadingRows[invoiceId] ? 'Downloading...' : 'Download Invoice'}
                {/* Download Invoice */}
            </span>
        ),
    },
];

export default getPurchaseHistoryColumns;
