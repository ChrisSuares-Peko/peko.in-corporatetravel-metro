import { Col, Flex, Row } from 'antd';

import CashFlowSummary from './CashFlowSummary';
import TrendChart from './TrendChart';
import { cashBalanceTrend, cashFlowSummary, fcfTrend } from '../../utils/insightsDashboardData';

const CashFlowTab = () => (
    <Flex vertical gap={24}>
        <TrendChart data={cashBalanceTrend} />

        <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} xl={12}>
                <CashFlowSummary data={cashFlowSummary} />
            </Col>
            <Col xs={24} xl={12}>
                <TrendChart data={fcfTrend} />
            </Col>
        </Row>
    </Flex>
);

export default CashFlowTab;
