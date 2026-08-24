import { Flex, Typography } from 'antd';

import { formatNumberWithLocalString } from '@utils/priceFormat';

import { GstStat } from '../../utils/gstSummaryData';

const { Text } = Typography;

interface GstSummaryCardsProps {
    stats: GstStat[];
}

const GstSummaryCards = ({ stats }: GstSummaryCardsProps) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat: GstStat) => (
            <Flex
                key={stat.key}
                vertical
                gap={8}
                className="min-w-0 rounded-[22px] border border-borderStrong bg-surfaceGray px-5 py-5 md:px-6 md:py-6"
            >
                <Text className="break-words text-sm font-medium uppercase tracking-wide text-slate-400">
                    {stat.label}
                </Text>
                <Text
                    className={`break-words text-xl font-semibold ${
                        stat.highlight ? 'text-warning' : 'text-ink'
                    }`}
                >
                    ₹{formatNumberWithLocalString(stat.value)}
                </Text>
            </Flex>
        ))}
    </div>
);

export default GstSummaryCards;
