import { Button, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';

import { type InvoiceStatus, type PaymentStatus } from './data';
import { formatShortDate } from './index';


const invoiceStatusCfg: Record<InvoiceStatus, { color: string; bg: string }> = {
    'Paid':     { color: '#43B75D', bg: '#ECFDF5' },
    'Pending':  { color: '#fa8c16', bg: '#fff7e6' },
    'Overdue':  { color: '#f5222d', bg: '#fff1f0' },
    'Disputed': { color: '#8c8c8c', bg: '#f5f5f5' },
};

const paymentStatusCfg: Record<PaymentStatus, { color: string; bg: string }> = {
    'Completed':      { color: '#43B75D', bg: '#ECFDF5' },
    'Pending':        { color: '#fa8c16', bg: '#fff7e6' },
    'Failed':         { color: '#f5222d', bg: '#fff1f0' },
    'Partially Paid': { color: '#1677ff', bg: '#e6f4ff' },
};

export const invoicingColumns = (
    onView: (id: number, invoiceNumber: string) => void,
    onPay?: (row: any) => void,
    isVirtualAccountReady?: boolean,
): TableColumnsType<any> => [
    {
        title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber',
        render: (v) => <Typography.Text className="text-[13px] text-[#262626] font-medium">{v}</Typography.Text>,
    },
    {
        title: 'Vendor', key: 'vendor',
        render: (_: any, row: any) => (
            <Typography.Text className="text-[13px] text-[#262626]">{row.purchaseOrder?.vendor?.businessName || 'N/A'}</Typography.Text>
        ),
    },
    {
        title: 'PO #', key: 'poRef',
        render: (_: any, row: any) => (
            <Typography.Text className="text-[13px] text-[#262626]">{row.purchaseOrder?.refNumber || 'N/A'}</Typography.Text>
        ),
    },
    {
        title: 'Invoice Date', dataIndex: 'invoiceDate', key: 'invoiceDate',
        render: (v) => <Typography.Text className="text-[13px] text-[#262626]">{formatShortDate(v)}</Typography.Text>,
    },
    {
        title: 'Amount', dataIndex: 'amount', key: 'amount',
        render: (v) => <Typography.Text className="text-[13px] text-[#262626] ">{v ? `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</Typography.Text>,
    },
    {
        title: 'Invoice Status', dataIndex: 'status', key: 'status',
        render: (v: InvoiceStatus) => {
            const cfg = invoiceStatusCfg[v] ?? { color: '#595959', bg: '#f5f5f5' };
            return (
                <Tag className="border-none rounded-[6px] font-medium" style={{ color: cfg.color, background: cfg.bg }}>
                    {v}
                </Tag>
            );
        },
    },
    {
        title: 'Payment Status', dataIndex: 'paymentStatus', key: 'paymentStatus',
        render: (v: PaymentStatus) => {
            const cfg = paymentStatusCfg[v] ?? { color: '#595959', bg: '#f5f5f5' };
            const label = v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : '';
            return v ? (
                <Tag className="border-none rounded-[6px] font-medium" style={{ color: cfg.color, background: cfg.bg }}>
                    {label}
                </Tag>
            ) : <Typography.Text className="text-[#bfbfbf]">—</Typography.Text>;
        },
    },
    {
        title: 'Actions', key: 'actions',
        render: (_: any, row: any) => (
            <div className="flex gap-2">
                <Button size="small" type="primary" danger className="rounded-[6px] min-w-[49px]" disabled={!isVirtualAccountReady} onClick={() => onPay?.(row)}>
                    Pay
                </Button>
                <Button size="small" danger variant="outlined" className="rounded-[6px] min-w-[49px]" onClick={() => onView(row.id, row.invoiceNumber)}>
                    View
                </Button>
            </div>
        ),
    },
];
