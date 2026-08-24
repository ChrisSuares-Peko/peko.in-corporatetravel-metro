import { Col, Flex, Row } from 'antd';

import BarLineChart from './BarLineChart';
import FilingCalendar from './FilingCalendar';
import PnlSummary from './PnlSummary';
import { filingCalendar, gstSummary, taxCashFlow } from '../../utils/insightsDashboardData';

const TaxGstTab = () => (
    <Flex vertical gap={24}>
        <Row gutter={[24, 24]} align="stretch">
            <Col xs={24} xl={8}>
                <BarLineChart data={taxCashFlow} />
            </Col>
            <Col xs={24} xl={8}>
                <PnlSummary data={gstSummary} />
            </Col>
            <Col xs={24} xl={8}>
                <FilingCalendar data={filingCalendar} />
            </Col>
        </Row>
    </Flex>
);

export default TaxGstTab;
