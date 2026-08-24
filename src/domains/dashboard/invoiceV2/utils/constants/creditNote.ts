export const CREDIT_NOTE_REASON_OPTIONS = [
    { label: 'Goods Returned', value: 'GOODS_RETURNED' },
    { label: 'Overcharge', value: 'OVERCHARGE' },
    { label: 'Service Cancelled', value: 'SERVICE_CANCELLED' },
    { label: 'Discount Applied', value: 'DISCOUNT' },
    { label: 'Other', value: 'OTHER' },
];

export const CREDIT_NOTE_REASON_LABELS: Record<string, string> = {
    GOODS_RETURNED: 'Goods Returned',
    OVERCHARGE: 'Overcharge',
    SERVICE_CANCELLED: 'Service Cancelled',
    DISCOUNT: 'Discount Applied',
    OTHER: 'Other',
};

export const CREDIT_NOTE_STATUS_CONFIG: Record<
    string,
    { label: string; color: string; bg: string }
> = {
    DRAFT: { label: 'Draft', color: '#71717A', bg: '#F4F4F5' },
    SENT: { label: 'Sent', color: '#2563EB', bg: '#EFF6FF' },
    APPLIED: { label: 'Applied', color: '#16A34A', bg: '#DCFCE7' },
    CANCELLED: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2' },
};

export const CREDIT_NOTE_STATUS_OPTIONS = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sent', value: 'SENT' },
    { label: 'Applied', value: 'APPLIED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

export const CREDIT_NOTE_REASON_COLORS: Record<string, string> = {
    GOODS_RETURNED: '#EA580C',
    OVERCHARGE: '#DC2626',
    SERVICE_CANCELLED: '#2563EB',
    DISCOUNT: '#16A34A',
    OTHER: '#71717A',
};
