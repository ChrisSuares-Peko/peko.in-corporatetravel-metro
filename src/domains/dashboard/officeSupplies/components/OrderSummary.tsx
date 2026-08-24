import { useState } from 'react';

import { Button, Flex, Typography, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@src/hooks/hooks';
import { paths } from '@src/routes/paths';
import { showToast } from '@src/slices/apiSlice';

import { validateCartApi } from '../api/cart';
import { getPosition } from '../hooks/useCurrentLocation';
import { setValidation } from '../slices/cartSlice';
import { AddressField } from '../types/address';
import { formatInr } from '../utils/priceInr';

const { Text } = Typography;

type OrderSummaryProps =
    | { mode: 'cart' }
    | {
          mode: 'checkout';
          formRef: React.MutableRefObject<any>;
          /** delivery address picked in DeliveryDetails — its zipCode drives the seller validation */
          address?: AddressField;
      };

const isCheckoutMode = (
    p: OrderSummaryProps
): p is Extract<OrderSummaryProps, { mode: 'checkout' }> => p.mode === 'checkout';

const Row = ({ label, value, valueClass = 'text-[#252430]' }: {
    label: string;
    value: string;
    valueClass?: string;
}) => (
    <Flex align="center" justify="space-between" className="w-full">
        <Text className="text-[16px] tracking-[-0.3px] text-[#4a5565]">{label}</Text>
        <Text className={`text-[16px] ${valueClass}`}>{value}</Text>
    </Flex>
);

/**
 * Order summary panel (Figma 2304-27306 / 2342-24561): totals, savings, and
 * the checkout CTA — shared by the cart page (`mode="cart"`, just navigates
 * to the checkout page) and the checkout page (`mode="checkout"`, runs the
 * real ONDC seller validation before submitting).
 */
const OrderSummary = (props: OrderSummaryProps) => {
    const { mode } = props;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const cartDetails = useAppSelector(state => state.reducer.cart);
    const { role, id } = useAppSelector(state => state.reducer.auth);
    // 'select' = validating the cart with the sellers, 'init' = the delivery-form
    // submit running the ONDC init before the shared payment screen takes over.
    const [phase, setPhase] = useState<'select' | 'init' | null>(null);

    const grandTotal = cartDetails?.grandTotal || 0;
    const totalGst = cartDetails?.totalGst || 0;
    const shipping = cartDetails?.shippingCharge || 0;
    
    const totalSavings = (cartDetails?.items || [])
        .filter(item => item.available)
        .reduce(
            (sum, item) =>
                sum +
                (item.maxPrice > item.price
                    ? (item.maxPrice - item.price) * item.productQuantity
                    : 0),
            0
        );

    const discount = cartDetails?.discount || totalSavings || 0;

    const totalMaxPrice = (cartDetails?.items || [])
        .filter(item => item.available)
        .reduce(
            (sum, item) => sum + (item.maxPrice * item.productQuantity),
            0
        );

    const subTotal = (discount > 0 ? totalMaxPrice : (cartDetails?.itemsTotalAmount || 0)) - totalGst;

    /**
     * Pre-checkout ONDC seller validation: fires /select per seller group on
     * the backend (held until each on_select quote arrives), then submits the
     * delivery form, whose handler runs /init and hands off to the shared
     * /payments screen. Failed seller groups don't block checkout — they're
     * flagged and excluded; only an all-sellers failure keeps the user here.
     *
     * Both seller round-trips can take ~30s each, so the button stays busy for
     * the whole sequence with a label per phase.
     */
    const proceedToCheckout = async () => {
        if (!isCheckoutMode(props)) return;
        const { formRef, address } = props;

        // Surface delivery-form errors (incl. the pincode field) BEFORE the
        // seller round-trip — validating with sellers can take up to ~30s.
        const form = formRef.current;
        const formErrors = form ? await form.validateForm() : { form: 'missing' };
        if (Object.keys(formErrors).length > 0) {
            form?.handleSubmit(); // marks fields touched so the errors render
            dispatch(
                showToast({
                    description: 'Please complete the delivery details to continue',
                    variant: 'error',
                })
            );
            return;
        }

        const pincode = String(form.values?.pincode || address?.zipCode || '').trim();
        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            dispatch(
                showToast({
                    description: 'Please enter a valid 6-digit delivery pincode',
                    variant: 'error',
                })
            );
            return;
        }

        setPhase('select');
        try {
            // best-effort browser location — gps is optional, omitted when unavailable
            const pos = await getPosition();
            const gps = pos ? `${pos.coords.latitude},${pos.coords.longitude}` : undefined;

            const result = await validateCartApi({ userId: id, userType: role, pincode, gps });

            // A group can come back "validated" (fulfillment serviceable) yet still
            // carry no real price if the seller's on_select response was incomplete
            // — treat that the same as an all-sellers failure rather than silently
            // continuing to checkout with a ₹0 total.
            if (!result || !result.anyValidated || result.validatedTotal <= 0) {
                const failed = result
                    ? result.groups
                          .filter(g => g.status === 'failed')
                          .map(g => g.vendorName || g.bppId || 'seller')
                          .join(', ')
                    : '';
                dispatch(
                    showToast({
                        description: failed
                            ? `Could not validate your cart with the seller(s): ${failed}. Please try again or remove those items.`
                            : 'Could not validate your cart with the sellers. Please try again.',
                        variant: 'error',
                    })
                );
                return;
            }

            if (result.failedCount > 0) {
                const failed = result.groups
                    .filter(g => g.status === 'failed')
                    .map(g => g.vendorName || g.bppId || 'seller')
                    .join(', ');
                notification.warning({
                    message: 'Some items could not be validated',
                    description: `Items from ${failed} could not be confirmed and are excluded from this checkout.`,
                });
            }

            dispatch(setValidation(result));

            const serviceDetails = {
                cart_total_value: result.validatedTotal,
                cart_item_count: cartDetails.count,
                cart_shipping_fee: shipping,
            };
            sessionStorage.setItem('service_details', JSON.stringify({ serviceDetails }));

            // Yield a tick so useForm()'s `validation` selector reflects the
            // dispatch above before Formik's onSubmit (handleSubmission) reads it —
            // otherwise it can compute the bill from the PREVIOUS validation.
            await Promise.resolve();

            // submitForm (not handleSubmit) so we can await the delivery form's
            // handler — it runs the ONDC init and then navigates to /payments, and
            // the button has to stay busy for that second seller round-trip too.
            setPhase('init');
            await formRef.current.submitForm();
        } finally {
            setPhase(null);
        }
    };

    const isValidating = isCheckoutMode(props) && phase !== null;
    const handleProceed = isCheckoutMode(props)
        ? proceedToCheckout
        : () => navigate(`${paths.dashboard.officeSupplies}/${paths.officeSupplies.checkout}`);

    return (
        <Flex
            vertical
            gap={25}
            className="w-full rounded-3xl border border-solid border-[#e6e9f5] bg-white p-[30px]"
        >
            <Text className="text-[18px] font-semibold leading-[26px] text-[#101828]">
                Order summary
            </Text>

            <Flex vertical gap={15} className="w-full">
                <Row label="Sub-total" value={formatInr(subTotal)} />
                {discount > 0 && (
                    <Row
                        label="Discount"
                        value={`- ${formatInr(discount)}`}
                        valueClass="text-[#43b75d]"
                    />
                )}
                <Row label="GST (incl.)" value={formatInr(totalGst)} />
                <Row
                    label="Total Shipping"
                    value={cartDetails.freeDelivery ? formatInr(0) : formatInr(shipping)}
                />

                <div className="h-px w-full bg-[#e4e4e7]" />

                <Flex align="start" justify="space-between" className="w-full">
                    <Flex vertical>
                        <Text className="text-[16px] font-semibold leading-6 text-[#101828]">
                            Total Amount
                        </Text>
                        <Text className="text-[12px] tracking-[-0.3px] text-[#b2b2b2]">
                            Inclusive of all taxes
                        </Text>
                    </Flex>
                    <Text className="text-[16px] font-semibold leading-6 text-[#252430]">
                        {formatInr(grandTotal)}
                    </Text>
                </Flex>

                {totalSavings > 0 && (
                    <Flex
                        align="center"
                        justify="center"
                        className="w-full rounded-xl bg-[#f4fff7] px-4 py-2"
                    >
                        <Text className="text-[14px] font-medium tracking-[0.385px] text-[#43b75d]">
                            You save {formatInr(totalSavings)}
                        </Text>
                    </Flex>
                )}
            </Flex>

            <Flex vertical gap={17} align="center" className="w-full">
                <Flex vertical gap={8} className="w-full">
                    <Button
                        type="primary"
                        danger
                        disabled={cartDetails.count < 1}
                        loading={isValidating}
                        onClick={handleProceed}
                        className="!h-14 !w-full !rounded-lg !text-[18px] !font-medium"
                    >
                        {phase === 'select' && 'Validating with sellers…'}
                        {phase === 'init' && 'Confirming with sellers…'}
                        {!isValidating && 'Proceed to checkout'}
                    </Button>
                    {mode === 'cart' && (
                        <Button
                            danger
                            onClick={() => navigate(`/${paths.officeSupplies.index}`)}
                            className="!h-14 !w-full !rounded-lg !border-lightRed !text-[18px] !font-medium !text-lightRed"
                        >
                            Continue shopping
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default OrderSummary;
