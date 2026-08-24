import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Flex, Result, Spin, Typography, notification } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { paths } from '@src/routes/paths';

import { getCheckoutResultApi } from '../api/cart';
import { setConfirmation } from '../slices/cartSlice';

const { Text } = Typography;

// PG triggers ONDC confirm after Cashfree capture; Easy Split runs on on_confirm.
// These polls cover a slow confirm chain or a browser that left /complete early.
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 14; // ~42s, a little past the ONDC confirm hold

/** Comma-joined vendor names of the seller groups that failed to confirm. */
const failedNames = (groups: { status: string; vendorName: string; bppId: string | null }[]) =>
    groups
        .filter(group => group.status === 'failed')
        .map(group => group.vendorName || group.bppId || 'seller')
        .join(', ');

/**
 * Placing-order page — landing after Cashfree capture
 * (`successPath?status=success&transactionId=<paymentRef>`).
 *
 * Polls checkout-result while purchase confirm-after-payment (triggered by PG)
 * places orders with sellers. Easy Split settlement is informational and does
 * not block a confirmed order.
 */
const PlacingOrderPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const { role, id } = useAppSelector(state => state.reducer.auth);

    const [error, setError] = useState<string | null>(null);
    // We stopped polling before the backend produced a result. Distinct from
    // `error`: nothing failed, we just don't know the outcome yet.
    const [stillWorking, setStillWorking] = useState(false);
    // StrictMode's double mount must not start two polling loops.
    const firedRef = useRef(false);

    // The engine appends the settled capture's corporateTxnId, which is the
    // Cashfree paymentRefId and becomes the ONDC payment reference.
    const paymentRef = searchParams.get('transactionId');
    const cartPath = `${paths.dashboard.officeSupplies}/${paths.officeSupplies.cartPage}`;

    /** One read of the outcome. Returns true once a terminal state was handled. */
    const readResult = useCallback(async () => {
        const result = await getCheckoutResultApi({
            userId: id,
            userType: role,
            paymentRef: String(paymentRef),
        });

        // Transport failure — keep polling rather than declaring anything.
        if (!result) return false;
        // The backend chain hasn't produced orders yet. Keep waiting.
        if (result.status === 'PENDING') return false;

        if (result.status === 'FAILED' || !result.anyConfirmed) {
            const failed = failedNames(result.groups || []);
            const reason = failed
                ? `Your order could not be placed with the seller(s): ${failed}.`
                : 'Your order could not be placed with the sellers.';
            setError(`${reason} Your payment is being refunded.`);
            return true;
        }

        if (result.failedCount > 0) {
            notification.warning({
                message: 'Some items could not be ordered',
                description: `Items from ${failedNames(result.groups)} could not be placed and are excluded from this order. That amount is being refunded.`,
            });
        }

        dispatch(
            setConfirmation({
                ...result,
                paymentRef: String(paymentRef),
                confirmedAt: result.confirmedAt || new Date().toISOString(),
            })
        );

        // Seller payout (Cashfree Easy Split) — order is already placed.
        const { settlement } = result;
        if (
            (settlement?.status === 'PARTIAL' || settlement?.status === 'FAILED') &&
            settlement.skipped?.length
        ) {
            notification.warning({
                message: 'Seller settlement is still pending for some sellers',
                description: `${settlement.skipped
                    .map(s => s.seller)
                    .join(', ')} could not be settled automatically. Your order is placed — our team will complete their payout.`,
            });
        } else if (settlement?.status === 'FAILED') {
            notification.warning({
                message: 'Seller settlement is still pending',
                description:
                    'Your order is placed. Automatic seller payout could not complete — our team will finish it.',
            });
        }

        navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderPlaced}`, {
            replace: true,
        });
        return true;
    }, [dispatch, id, navigate, paymentRef, role]);

    useEffect(() => {
        if (firedRef.current) return undefined;
        // Nothing to read: this wasn't reached from a settled payment.
        if (!paymentRef) {
            navigate(cartPath, { replace: true });
            return undefined;
        }
        firedRef.current = true;

        // PG triggers purchase confirm-after-payment after Cashfree capture; Easy
        // Split runs on on_confirm. First read often resolves immediately; the
        // poll covers a slow confirm or a /complete the browser didn't wait for.
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        let attempts = 0;

        const tick = async () => {
            if (cancelled) return;
            attempts += 1;
            const done = await readResult();
            if (done || cancelled) return;
            if (attempts >= MAX_POLLS) {
                setStillWorking(true);
                return;
            }
            timer = setTimeout(tick, POLL_INTERVAL_MS);
        };
        tick();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [cartPath, navigate, paymentRef, readResult]);

    // Nothing is lost by leaving — the backend owns the order now — but a reload
    // mid-chain means the buyer loses sight of the outcome, so still warn.
    useEffect(() => {
        if (error || stillWorking) return undefined;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [error, stillWorking]);

    // We stopped waiting before the backend reported an outcome. The order may well
    // have been placed — the backend owns it now — so this must not read as failure,
    // and it must not tell the buyer to pay again.
    if (stillWorking) {
        return (
            <Flex align="center" justify="center" className="w-full px-4 py-10">
                <Result
                    status="info"
                    title="We're still finalising your order"
                    subTitle={
                        <Flex vertical gap={6} align="center">
                            <Text className="text-[15px] text-black/65">
                                Your payment went through. Placing the order with the seller(s) is
                                taking longer than usual and is still being completed in the
                                background — check Order History in a few minutes. You don&apos;t
                                need to pay again.
                            </Text>
                            <Text className="text-[13px] text-black/45">
                                Payment reference: {paymentRef}
                            </Text>
                        </Flex>
                    }
                    extra={[
                        <Button
                            key="history"
                            type="primary"
                            danger
                            onClick={() =>
                                navigate(
                                    `${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderHistory}`
                                )
                            }
                        >
                            View order history
                        </Button>,
                        <Button
                            key="shop"
                            onClick={() => navigate(paths.dashboard.officeSupplies)}
                        >
                            Continue shopping
                        </Button>,
                    ]}
                />
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex align="center" justify="center" className="w-full px-4 py-10">
                <Result
                    status="warning"
                    title="We couldn't place your order"
                    subTitle={
                        <Flex vertical gap={6} align="center">
                            <Text className="text-[15px] text-black/65">{error}</Text>
                            <Text className="text-[13px] text-black/45">
                                Payment reference: {paymentRef}
                            </Text>
                        </Flex>
                    }
                    extra={[
                        <Button
                            key="history"
                            type="primary"
                            danger
                            onClick={() =>
                                navigate(
                                    `${paths.dashboard.officeSupplies}/${paths.officeSupplies.orderHistory}`
                                )
                            }
                        >
                            View order history
                        </Button>,
                        <Button key="cart" onClick={() => navigate(cartPath)}>
                            Back to cart
                        </Button>,
                    ]}
                />
            </Flex>
        );
    }

    return (
        <Flex
            vertical
            align="center"
            justify="center"
            gap={18}
            className="min-h-[60vh] w-full px-4 py-10 text-center"
        >
            <Spin size="large" />
            <Text className="text-[19px] font-medium text-black/85">
                Placing your order with the seller(s)…
            </Text>
            <Text className="max-w-[420px] text-[15px] text-black/45">
                Your payment went through. This can take up to a minute — please don&apos;t close or
                refresh this window.
            </Text>
        </Flex>
    );
};

export default PlacingOrderPage;
