import { Col, Flex, Row, Typography } from 'antd';

import { BalanceStat } from '../../utils/balanceSheetData';

const { Text } = Typography;

interface BalanceSheetSummaryCardsProps {
    stats: BalanceStat[];
}

const BalanceSheetSummaryCards = ({ stats }: BalanceSheetSummaryCardsProps) => (
    <Row gutter={[16, 16]} align="stretch" className="w-full">
        {stats.map((stat: BalanceStat) => (
            <Col key={stat.key} xs={24} sm={12} xl={6} className="flex">
                <Flex
                    vertical
                    gap={4}
                    justify="center"
                    className="h-full w-full rounded-[22px] border px-7 py-5"
                    style={{ backgroundColor: stat.bg, borderColor: stat.border }}
                >
                    <Text className="text-sm text-bodyText">{stat.label}</Text>
                    <Text
                        className="text-xl font-semibold text-ink"
                        style={stat.valueColor ? { color: stat.valueColor } : undefined}
                    >
                        {stat.value}
                    </Text>
                    <Text className="text-sm text-bodyText opacity-50">{stat.caption}</Text>
                </Flex>
            </Col>
        ))}
    </Row>
);

export default BalanceSheetSummaryCards;
