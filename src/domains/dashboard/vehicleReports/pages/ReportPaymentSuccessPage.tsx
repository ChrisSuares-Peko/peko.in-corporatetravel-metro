import { useEffect, useMemo } from 'react';

import { Button, Flex, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import SuccessScreen from '@components/molecular/success/SuccessScreen';
import useGetTransactionData from '@src/domains/dashboard/payments/hooks/useGetTransactionData';
import { useAppDispatch } from '@src/hooks/store';
import { paths } from '@src/routes/paths';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import { resetPaymentData } from '../../payments/slices/payment';
import OrderDetailsGrid from '../components/shared/OrderDetailsGrid';
import ReportSectionCard from '../components/shared/ReportSectionCard';
import { clearVehicleReport } from '../slices/vehicleReportSlice';
import { parseCarReportOrderResponse } from '../utils/parseCarReportOrder';
import { vehicleReportsRoot } from '../utils/reportMeta';

const ordersPath = `${vehicleReportsRoot}/${paths.turbo.reportOrders}`;
const orderDetailPath = `${ordersPath}/${paths.turbo.reportOrderDetails}`;

// Car Reports' own post-payment screen, reached via the payment slice's `successPath`
// on the wallet and gateway legs, and via sessionStorage('cardPaymentSuccessPath') on
// the card-link leg (which is a full page reload, so nothing in redux survives it).
//
// The order id is resolved from the transaction rather than carried in redux for that
// same reason: the vehicleReport slice is not persisted, so a card payment would come
// back with nothing to deep-link to. The backend writes it onto the transaction's
// `orderResponse` when the payment settles.
const ReportPaymentSuccessPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();

    // Some legs quote the value; strip quotes before comparing.
    const status = (searchParams.get('status') || '').replace(/["']/g, '');
    const transactionId = searchParams.get('transactionId');
    const { transactionData, isLoading } = useGetTransactionData(transactionId);

    const order = useMemo(
        () => parseCarReportOrderResponse(transactionData?.orderResponse),
        [transactionData?.orderResponse]
    );

    useEffect(() => {
        // The payment slice is persisted, so leaving it populated would re-render this
        // purchase's summary the next time the user opens /payments. Clearing the report
        // draft means the next purchase starts from an empty form, not this one.
        dispatch(resetPaymentData());
        dispatch(clearVehicleReport());
        // Written by the card-link leg and normally cleared by the shared success page,
        // which we bypass — a stale key would hijack the next payment's success screen.
        sessionStorage.removeItem('cardPaymentSuccessPath');
    }, [dispatch]);

    // Reached without a successful payment (deep link, or a back-navigation after the
    // slice was cleared) — there is nothing to show.
    if (status !== 'success') {
        return <Navigate to={vehicleReportsRoot} replace />;
    }

    const details = [
        { label: 'Transaction ID', value: transactionData?.corporateTxnId || '—' },
        {
            label: 'Amount paid',
            value: transactionData?.amountInINR
                ? `₹ ${formatNumberWithLocalString(Number(transactionData.amountInINR))}`
                : '—',
        },
        {
            label: 'Date',
            value: transactionData?.transactionDate
                ? dayjs(transactionData.transactionDate).format('DD MMM YYYY, hh:mm A')
                : '—',
        },
        { label: 'Payment mode', value: transactionData?.paymentMode || '—' },
    ];

    return (
        <SuccessScreen
            title="Payment successful"
            message={
                order.reportName
                    ? `Your ${order.reportName} is ready to view.`
                    : 'Your report is ready to view.'
            }
        >
            <Flex vertical gap={24} className="w-full max-w-3xl">
                <Flex gap={16} justify="center" wrap="wrap">
                    <Button
                        type="primary"
                        size="large"
                        loading={isLoading}
                        onClick={() =>
                            navigate(
                                // Falls back to the list rather than a dead
                                // ?orderId=undefined when the id can't be resolved.
                                order.orderId
                                    ? `${orderDetailPath}?orderId=${order.orderId}`
                                    : ordersPath
                            )
                        }
                    >
                        View Order
                    </Button>
                    <Button size="large" onClick={() => navigate(vehicleReportsRoot)}>
                        Back to Car Reports
                    </Button>
                </Flex>

                <ReportSectionCard title="Payment details">
                    {isLoading ? (
                        <Skeleton active paragraph={{ rows: 2 }} title={false} />
                    ) : (
                        <OrderDetailsGrid items={details} />
                    )}
                </ReportSectionCard>
            </Flex>
        </SuccessScreen>
    );
};

export default ReportPaymentSuccessPage;
