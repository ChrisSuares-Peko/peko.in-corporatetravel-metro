import { KybStatus } from '../../types/corporateCardApplications';

// Single source of truth for KYB status display — colour/label for tags, plus the Select options.
export const KYB_STATUS_META: Record<KybStatus, { color: string; bg: string; label: string }> = {
    PENDING: { color: '#D97706', bg: '#FFFBEB', label: 'Pending' },
    SUBMITTED: { color: '#D97706', bg: '#FFFBEB', label: 'Submitted' },
    UNDER_REVIEW: { color: '#D97706', bg: '#FFFBEB', label: 'Under review' },
    VERIFIED: { color: '#3AB75E', bg: '#ECFDF3', label: 'Verified' },
    REJECTED: { color: '#DC2626', bg: '#FEF2F2', label: 'Rejected' },
    COMPLETED: { color: '#3AB75E', bg: '#ECFDF3', label: 'Completed' },
};

export const KYB_STATUS_OPTIONS: { label: string; value: KybStatus }[] = (
    Object.keys(KYB_STATUS_META) as KybStatus[]
).map(value => ({ value, label: KYB_STATUS_META[value].label }));
