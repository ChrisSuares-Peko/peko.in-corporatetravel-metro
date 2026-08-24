import React from 'react';

import { Badge } from 'antd';
import { BadgeProps } from 'antd/lib/badge'; // Import the BadgeProps type from antd

interface SalaryStatusBadgeProps {
    status: string;
}

const SalaryStatusBadge: React.FC<SalaryStatusBadgeProps> = ({ status }) => {
    const getBadgeProps = (status2: string): BadgeProps & { text: string } => {
        switch (status2) {
            case 'PAID':
                return {
                    status: 'success',
                    text: 'Paid',
                    className: 'px-2 rounded-2xl',
                    style: { backgroundColor: '#ECFDF3', color: '#027A48' },
                };
            case 'PENDING':
                return {
                    status: 'error',
                    text: 'Pending',
                    className: 'px-2 rounded-2xl',
                    style: { backgroundColor: '#FFF2EA', color: '#F15046' },
                };
            case 'APPROVED':
                return {
                    status: 'success',
                    text: 'Approved',
                    className: 'px-2 rounded-2xl',
                    style: { backgroundColor: '#ECFDF3', color: '#027A48' },
                };
            case 'FAILD':
                return {
                    status: 'error',
                    text: 'Pending',
                    className: 'px-2 rounded-2xl',
                    style: { backgroundColor: '#FFF2EA', color: '#F15046' },
                };
            case 'UPCOMING':
                return {
                    status: 'warning',
                    text: 'Upcoming',
                    className: 'rounded-2xl',
                    style: {
                        color: '#FAAD14',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '0 4px',
                    },
                };
            default:
                return {
                    status: 'default',
                    text: status2,
                    className: 'px-2 rounded-2xl',
                };
        }
    };

    const { status: badgeStatus, text, className, style } = getBadgeProps(status);

    return <Badge status={badgeStatus} text={text} className={className} style={style} />;
};

export default SalaryStatusBadge;
