import { ClockCircleOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Row } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import ReportTypeCard from '../components/landing/ReportTypeCard';
import ReportPageHeader from '../components/shared/ReportPageHeader';
import { setReportType } from '../slices/vehicleReportSlice';
import { PURCHASABLE_REPORT_TYPES, ReportType } from '../types/index';
import { reportTypeCards } from '../utils/data';
import { vehicleReportsRoot } from '../utils/reportMeta';

// Vehicle Reports landing screen: the three Droom report products.
const VehicleReportsPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const startFlow = (reportType: ReportType) => {
        dispatch(setReportType(reportType));
        navigate(`${vehicleReportsRoot}/${reportType}/${paths.turbo.selectVehicle}`);
    };

    // The design links "View sample" from every card but ships no target. Until
    // sample PDFs are supplied, tell the user rather than silently doing nothing.
    const viewSample = () =>
        dispatch(showToast({ variant: 'info', description: 'Sample reports are coming soon.' }));

    return (
        <Flex vertical gap={24}>
            <ReportPageHeader
                title="Vehicle Reports"
                subtitle="Know any vehicle's true value, history and condition before you buy, sell or renew."
                actions={
                    <Button
                        danger
                        size="large"
                        icon={<ClockCircleOutlined />}
                        onClick={() =>
                            navigate(`${vehicleReportsRoot}/${paths.turbo.reportOrders}`)
                        }
                    >
                        Order history
                    </Button>
                }
            />

            <Row gutter={[24, 24]}>
                {reportTypeCards.map(card => (
                    <Col key={card.reportType} xs={24} md={12} xl={8}>
                        <ReportTypeCard
                            card={card}
                            // History and Inspection are still on the page so the
                            // product line reads as a whole, but they aren't buyable:
                            // neither has a Droom integration that produces a result,
                            // and the payment endpoint rejects them.
                            isComingSoon={!PURCHASABLE_REPORT_TYPES.includes(card.reportType)}
                            onSelect={() => startFlow(card.reportType)}
                            onViewSample={viewSample}
                        />
                    </Col>
                ))}
            </Row>
        </Flex>
    );
};

export default VehicleReportsPage;
