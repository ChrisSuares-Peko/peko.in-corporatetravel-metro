import { Flex, Typography } from 'antd';

import { CfStat } from '../../utils/cashFlowData';

const { Text } = Typography;

interface CashFlowSummaryCardsProps {
    stats: CfStat[];
}

const CashFlowSummaryCards = ({ stats }: CashFlowSummaryCardsProps) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat: CfStat) => (
            <Flex
                key={stat.key}
                vertical
                gap={2}
                className="min-w-0 rounded-2xl border border-borderStrong bg-white px-5 py-4"
            >
                <Text className="text-xs font-medium tracking-wide text-slate-400 break-words">
                    {stat.label}
                </Text>
                <Text className="text-lg font-semibold text-ink break-words">{stat.value}</Text>
                <Text
                    className={`whitespace-nowrap text-xs font-medium ${
                        stat.up ? 'text-success' : 'text-danger'
                    }`}
                >
                    {stat.up ? '▲' : '▼'} {stat.delta}
                </Text>
            </Flex>
        ))}
    </div>
);

export default CashFlowSummaryCards;
