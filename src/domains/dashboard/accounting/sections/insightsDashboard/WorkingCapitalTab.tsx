import { Col, Flex, Row } from 'antd';

import AgingBreakdown from './AgingBreakdown';
import WorkingCapitalMetric from './WorkingCapitalMetric';
import { apAging, arAging, workingCapitalMetrics } from '../../utils/insightsDashboardData';

const WorkingCapitalTab = () => (
    <Flex vertical gap={24}>
        <Row gutter={[20, 20]} align="stretch">
            {workingCapitalMetrics.map(metric => (
                <Col key={metric.key} xs={24} sm={12} xl={8}>
                    <WorkingCapitalMetric item={metric} />
                </Col>
            ))}
        </Row>

        <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} xl={12}>
                <AgingBreakdown data={arAging} />
            </Col>
            <Col xs={24} xl={12}>
                <AgingBreakdown data={apAging} />
            </Col>
        </Row>
    </Flex>
);

export default WorkingCapitalTab;
