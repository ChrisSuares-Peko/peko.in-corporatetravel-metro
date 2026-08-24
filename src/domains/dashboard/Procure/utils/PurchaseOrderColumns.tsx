import React from 'react';

import { Button, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';

import { normalizePOStatus, type POStatus } from './data';
import { formatShortDate } from './index';

const { Text } = Typography;

const statusCfg: Record<string, { color: string; bg: string }> = {
    'Draft':     { color: '#535353', bg: '#f2f2f2' },
    'PO Issued': { color: '#2c46f0', bg: '#ecf1fd' },
    'Closed':    { color: '#03a254', bg: '#ecfdf5' },
};

export const purchaseOrdersColumns = (onView: (id: number) => void): TableColumnsType<any> => [
    {
        title: 'PO #', dataIndex: 'refNumber', key: 'refNumber',
        render: (v) => <Text style={{ fontSize: 13, color: '#171717', fontWeight: 500 }}>{v}</Text>,
    },
    {
        title: 'Title', dataIndex: 'title', key: 'title',
        render: (v) => <Text style={{ fontSize: 13, color: '#171717' }}>{v ?? 'N/A'}</Text>,
    },
    {
        title: 'Vendor', dataIndex: 'vendor', key: 'vendor',
        render: (v) => <Text style={{ fontSize: 13, color: '#171717' }}>{v?.businessName ?? 'N/A'}</Text>,
    },
    {
        title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount',
        render: (v) => <Text style={{ fontSize: 13, color: '#171717' }}>{v ? `₹ ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</Text>,
    },
    {
        title: 'Created', dataIndex: 'createdAt', key: 'createdAt',
        render: (v) => <Text style={{ fontSize: 13, color: '#171717' }}>{formatShortDate(v)}</Text>,
    },
    {
        title: 'Status', dataIndex: 'status', key: 'status',
        render: (v: string) => {
            const ns  = normalizePOStatus(v) as POStatus;
            const cfg = statusCfg[ns] ?? { color: '#595959', bg: '#f5f5f5' };
            return (
                <Tag style={{ color: cfg.color, background: cfg.bg, border: 'none', borderRadius: 20, fontWeight: 500, fontSize: 13 }}>
                    {ns}
                </Tag>
            );
        },
    },
   
    {
        title: 'Actions', key: 'actions',
        render: (_: any, row: any) => (
            <Button size="small" danger variant="outlined" style={{ borderRadius: 6 }} onClick={() => onView(row.id)}>
                View
            </Button>
        ),
    },
];
