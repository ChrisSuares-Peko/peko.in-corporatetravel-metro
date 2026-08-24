import React from 'react';

import { Flex, Typography } from 'antd';

import { TopCustomerBase } from '../../types/customer';
import { formatAmount } from '../../utils/helperFunctions';

type RevenueVariant = TopCustomerBase & { variant: 'revenue' };
type TxnVariant = TopCustomerBase & { variant: 'txn' };
type TopCustomerRowProps = RevenueVariant | TxnVariant;

const TopCustomerRow: React.FC<TopCustomerRowProps> = props => {
    const { variant, rank, name } = props;
    const isRevenue = variant === 'revenue';
    const r = props as RevenueVariant;
    const t = props as TxnVariant;

    const badgeBgClass = isRevenue ? 'bg-[#ECFDF5]' : 'bg-[#F2F7FB]';
    const badgeColorClass = isRevenue ? 'text-[#43B75D]' : 'text-[#2B5678]';
    const primaryRightClass = isRevenue ? 'text-[#1E293B]' : 'text-[#038E36]';
    const secondaryRightClass = isRevenue ? 'text-[#43B75D]' : 'text-[#A1A1AA]';

    const secondaryText = isRevenue
        ? `${r.transactionCount} transactions`
        : formatAmount(t?.totalRevenue || 0);
    const primaryRight = isRevenue
        ? formatAmount(r?.totalRevenue || 0)
        : `${t.transactionCount} orders`;
    const changePercent = r.changePercent ?? 0;
    const percentOfTotal = t.percentOfTotal ?? 0;
    const secondaryRight = isRevenue
        ? `${changePercent > 0 ? '+' : ''}${changePercent}%`
        : `${percentOfTotal > 0 ? '+' : ''}${percentOfTotal}% of total`;

    return (
        <Flex
            justify="space-between"
            align="center"
            gap={12}
            className="bg-white rounded-xl px-4 py-3 min-w-0"
        >
            <Flex align="center" gap={8} className="flex-1 min-w-0">
                <Flex
                    align="center"
                    justify="center"
                    className={`w-10 self-stretch rounded-full flex-shrink-0 ${badgeBgClass}`}
                >
                    <Typography.Text className={`text-sm font-semibold ${badgeColorClass}`}>
                        #{rank}
                    </Typography.Text>
                </Flex>
                <Flex vertical gap={2} className="min-w-0">
                    <Typography.Text className="text-[#101828] text-sm font-medium block truncate">
                        {name}
                    </Typography.Text>
                    <Typography.Text className="text-[#A1A1AA] text-xs font-normal block">
                        {secondaryText}
                    </Typography.Text>
                </Flex>
            </Flex>
            <Flex vertical align="flex-end" gap={2} className="flex-shrink-0">
                <Typography.Text className={`text-sm font-semibold ${primaryRightClass}`}>
                    {primaryRight}
                </Typography.Text>
                <Typography.Text className={`text-xs font-normal ${secondaryRightClass}`}>
                    {secondaryRight}
                </Typography.Text>
            </Flex>
        </Flex>
    );
};

export default React.memo(TopCustomerRow);
