import { DownloadOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import HistoryResultCard from '../components/orderDetail/HistoryResultCard';
import InspectionResultCard from '../components/orderDetail/InspectionResultCard';
import ValuationResultCard from '../components/orderDetail/ValuationResultCard';
import OrderDetailsGrid from '../components/shared/OrderDetailsGrid';
import ReportOrderStatusBadge from '../components/shared/ReportOrderStatusBadge';
import ReportPageHeader from '../components/shared/ReportPageHeader';
import ReportProgressTracker from '../components/shared/ReportProgressTracker';
import ReportSectionCard from '../components/shared/ReportSectionCard';
import useReportOrderDetail from '../hooks/useReportOrderDetail';
import { vehicleReportsRoot } from '../utils/reportMeta';

// Order detail. Which result card renders is decided by which result the order actually
// carries, not by its report type — a history order is BUILDING until the backend
// materialises it on this very request, so the same order legitimately has no result on
// one load and a full one on the next. The shared chrome (order details, progress,
// amount, payment mode) always renders: it is what makes an order supportable, and
// hiding it would strand an unfulfilled order with no way to see its own status.
const ReportOrderDetailPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { order, isLoading } = useReportOrderDetail(orderId);

    const ordersPath = `${vehicleReportsRoot}/${paths.turbo.reportOrders}`;

    if (!orderId) return <Navigate to={ordersPath} replace />;
    if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
    if (!order) {
        return (
            <Empty description={`No report order found for ${orderId}`}>
                <Button type="primary" onClick={() => navigate(ordersPath)}>
                    Back to order history
                </Button>
            </Empty>
        );
    }

    return (
        <Flex vertical gap={24}>
            <ReportPageHeader
                title={`Order ${order.orderId}`}
                actions={
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        disabled={order.status !== 'Ready'}
                        onClick={() =>
                            dispatch(
                                showToast({
                                    variant: 'info',
                                    description:
                                        'Report downloads will be available once the report service is live.',
                                })
                            )
                        }
                    >
                        Download report
                    </Button>
                }
            />

            <Flex vertical gap={20}>
                <ReportSectionCard title="Order details">
                    <OrderDetailsGrid
                        items={[
                            {
                                label: 'Status',
                                value: <ReportOrderStatusBadge status={order.status} />,
                            },
                            {
                                label: 'Amount',
                                value: `₹ ${formatNumberWithLocalString(order.amount)}`,
                            },
                            {
                                label: 'Order Date',
                                value: dayjs(order.orderDate).format('DD MMM YYYY'),
                            },
                            { label: 'Report', value: order.reportName },
                            { label: 'Vehicle', value: order.vehicleModel },
                            { label: 'Reg.no', value: order.vehicleNumber },
                            { label: 'Payment Mode', value: order.paymentMode },
                        ]}
                    />
                </ReportSectionCard>

                <ReportSectionCard title="Report progress">
                    <ReportProgressTracker steps={order.steps ?? []} />
                </ReportSectionCard>

                {order.valuation && (
                    <ValuationResultCard result={order.valuation} bodyType={order.bodyType} />
                )}
                {order.history && (
                    <HistoryResultCard result={order.history} bodyType={order.bodyType} />
                )}
                {order.inspection && (
                    <InspectionResultCard
                        booking={order.inspection}
                        vehicleModel={order.vehicleModel}
                        bodyType={order.bodyType}
                    />
                )}
                {!order.valuation && !order.history && !order.inspection && (
                    <ReportSectionCard title="Report result">
                        <Empty description="This report's result isn't available yet." />
                    </ReportSectionCard>
                )}
            </Flex>
        </Flex>
    );
};

export default ReportOrderDetailPage;
