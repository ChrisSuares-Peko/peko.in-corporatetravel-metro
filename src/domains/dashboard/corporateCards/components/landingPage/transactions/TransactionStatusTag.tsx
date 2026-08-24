import { Tag, Typography } from 'antd';

import { cn } from '../../../utils/cn';
import { TransactionApprovalStatus, TransactionStatus } from '../../../utils/types';

const { Text } = Typography;

const STATUS_TONE: Record<TransactionStatus, string> = {
    Completed: 'bg-savingsTagLightBg text-savingsTagLightText',
    Posted: 'bg-savingsTagLightBg text-savingsTagLightText',
    Processing: 'bg-bgOrangeShade text-textOrange',
    Pending: 'bg-bgOrangeShade text-textOrange',
    Declined: 'bg-bgLightPink text-errorTextRed',
};

const APPROVAL_TONE: Partial<Record<TransactionApprovalStatus, string>> = {
    Approved: 'bg-savingsTagLightBg text-savingsTagLightText',
    Pending: 'bg-bgOrangeShade text-textOrange',
    Rejected: 'bg-bgLightPink text-errorTextRed',
};

/** Settlement-status pill for a Transactions row: 'Posted' green, 'Pending' amber. */
export const TxnStatusTag = ({ status }: { status: TransactionStatus }) => (
    <Tag
        bordered={false}
        className={cn(
            'm-0 rounded-full px-3 py-0.5 text-xs font-medium leading-none',
            STATUS_TONE[status]
        )}
    >
        {status}
    </Tag>
);

/**
 * Approval-state cell for a Transactions row. 'Approved'/'Pending' render as coloured pills;
 * 'Auto-approved' renders as plain muted text (matches Figma — it isn't a status pill).
 */
export const TxnApprovalTag = ({ approval }: { approval: TransactionApprovalStatus }) => {
    if (approval === 'Auto-approved') {
        return <Text className="text-sm text-textBody">Auto-approved</Text>;
    }

    return (
        <Tag
            bordered={false}
            className={cn(
                'm-0 rounded-full px-3 py-0.5 text-xs font-medium leading-none',
                APPROVAL_TONE[approval]
            )}
        >
            {approval}
        </Tag>
    );
};
