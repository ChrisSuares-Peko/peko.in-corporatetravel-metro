import React, { useEffect, useMemo } from 'react';

import { Button, Flex, Typography } from 'antd';
import dayjs from 'dayjs';
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';

import paymentSuccess from '@assets/animation/paymentSuccess2.json';
import { useAppSelector } from '@src/hooks/hooks';
import { paths } from '@src/routes/paths';

import { formatInr } from '../utils/priceInr';

const { Text } = Typography;

/** Seller-payout state as shown on the receipt. FAILED never reaches this page. */
const SETTLEMENT_LABELS: Record<string, string> = {
    SPLIT: 'Settled',
    PARTIAL: 'Partially settled',
    SKIPPED: 'Not applicable',
    DISABLED: 'Not applicable',
};

// same animated green check the other success pages use (payments/PaymentSuccess)
const successAnimation = {
    loop: false,
    autoplay: true,
    animationData: paymentSuccess,
};

/**
 * Office Supplies "order placed" page (Figma 2381-26815), shown after Pay runs
 * the ONDC init + confirm chain: green verified badge, confirmation copy,
 * order-history / continue-shopping actions and the transaction details table
 * built from the confirm response stored in the cart slice.
 */
const OrderPlaced: React.FC = () => {
    const navigate = useNavigate();
    const confirmation = useAppSelector(state => state.reducer.cart.confirmation);
    const { totalAmount } = useAppSelector(state => state.reducer.payment);

    // The success message is only shown once the seller settlement is resolved.
    // SKIPPED/DISABLED (nothing to settle) and an absent key (older backend) pass;
    // FAILED does not, so a direct visit or a history back-navigation can't surface
    // success for an order whose payout we know failed.
    const settlementFailed = confirmation?.settlement?.status === 'FAILED';

    // Deep link / refresh safety: without a confirmed order there is nothing to show.
    useEffect(() => {
        if (!confirmation?.anyConfirmed || settlementFailed) {
            navigate(`/${paths.officeSupplies.index}`, { replace: true });
        }
    }, [confirmation, navigate, settlementFailed]);

    const confirmed = useMemo(
        () => (confirmation?.groups || []).filter(group => group.status === 'confirmed'),
        [confirmation]
    );
    const failed = useMemo(
        () => (confirmation?.groups || []).filter(group => group.status === 'failed'),
        [confirmation]
    );

    const rows = useMemo(() => {
        const sellerSuffix = confirmed.length > 1 ? ` (${confirmed.length} sellers)` : '';
        return [
            {
                label: 'Date',
                value: confirmation?.confirmedAt
                    ? dayjs(confirmation.confirmedAt).format('MMMM DD, YYYY hh:mm A')
                    : '—',
            },
            {
                label: 'Transaction ID',
                value: confirmed.map(group => group.transactionId).filter(Boolean).join(', ') || '—',
            },
            { label: 'Service', value: 'Office Supplies' },
            {
                label: 'Orders',
                // some BPPs omit order.id on on_confirm — fall back to the order state
                value:
                    confirmed
                        .map(group => group.orderId || group.orderState || '—')
                        .join(', ') + sellerSuffix,
            },
            { label: 'Amount Paid', value: formatInr(totalAmount || confirmation?.amountPaidTotal || confirmation?.confirmedTotal || 0) },
            { label: 'Payment Mode', value: 'Payment Gateway' },
            // Cashfree reference the capture settled under — the id support and ops
            // reconcile against, so show it whenever we have one.
            ...(confirmation?.paymentRef
                ? [{ label: 'Payment Reference', value: confirmation.paymentRef }]
                : []),
            // Seller payout state, so it's stated rather than implied. FAILED never
            // reaches this page (the guard above sends it back).
            ...(confirmation?.settlement
                ? [
                      {
                          label: 'Seller Settlement',
                          value:
                              SETTLEMENT_LABELS[confirmation.settlement.status] ??
                              'Not applicable',
                      },
                  ]
                : []),
        ];
    }, [confirmation, confirmed,totalAmount]);

    if (!confirmation?.anyConfirmed || settlementFailed) return null;

    const goOrderHistory = () =>
        navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderHistory}`);
    const goShopping = () => navigate(`/${paths.officeSupplies.index}`);

    return (
        <Flex vertical align="center" gap={32} className="w-full px-4 py-10">
            {/* Badge + confirmation copy + actions */}
            <Flex vertical align="center" gap={2}>
                <Lottie options={successAnimation} height={100} width={100} />
                <Flex vertical align="center" gap={24} className="max-w-[726px]">
                    <Flex vertical align="center" gap={7} className="text-center">
                        <Text className="text-[29px] leading-[39px] text-black/85">
                            Your order has been placed
                        </Text>
                        <Text className="text-[17px] leading-[27px] text-black/45">
                            You will receive a confirmation email shortly. Thank you for using
                            Peko.
                        </Text>
                    </Flex>
                    <Flex gap={12} wrap="wrap" justify="center">
                        <Button
                            onClick={goOrderHistory}
                            className="!h-10 !w-[222px] !rounded-md !border-lightRed !text-[16px] !font-medium !text-lightRed"
                        >
                            View order history
                        </Button>
                        <Button
                            onClick={goShopping}
                            className="!h-10 !w-[222px] !rounded-md !border-lightRed !text-[16px] !font-medium !text-lightRed"
                        >
                            Continue shopping
                        </Button>
                    </Flex>
                </Flex>
            </Flex>

            {/* Transaction details table (from the ONDC confirm response) */}
            <div className="w-full max-w-[938px] overflow-hidden rounded-xl border-[1.5px] border-solid border-[#e6e6e6] bg-white">
                {rows.map((row, index) => (
                    <div
                        key={row.label}
                        className={`grid min-h-[55px] grid-cols-2 ${
                            index > 0 ? 'border-0 border-t-[1.5px] border-solid border-[#e6e6e6]' : ''
                        }`}
                    >
                        <div className="flex items-center border-0 border-r-[1.5px] border-solid border-[#e6e6e6] px-5 py-4">
                            <Text className="text-[17px] text-[#4a5565]">{row.label}</Text>
                        </div>
                        <div className="flex items-center px-5 py-4">
                            <Text className="break-all text-[17px] text-black">{row.value}</Text>
                        </div>
                    </div>
                ))}
            </div>

            {/* Partial-success note: sellers whose items could not be placed */}
            {failed.length > 0 && (
                <Text className="max-w-[938px] text-center text-[14px] text-[#b45309]">
                    Items from {failed.map(g => g.vendorName || g.bppId || 'a seller').join(', ')}{' '}
                    could not be placed and are not part of this order.
                </Text>
            )}
        </Flex>
    );
};

export default OrderPlaced;
