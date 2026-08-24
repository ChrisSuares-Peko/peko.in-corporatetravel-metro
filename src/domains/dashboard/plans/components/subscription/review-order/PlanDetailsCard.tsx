import React, { useEffect, useState } from 'react';

import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons';
import { Flex, Typography, Skeleton, Button, Divider, Tooltip } from 'antd';
import { capitalize } from 'lodash';
import { useNavigate } from 'react-router-dom';

import cardLogo from '@assets/images/cashfreeLogo.png';
import { FRONTEND_BASE_URL } from '@src/config-global';
import useScreenSize from '@src/hooks/useScreenSize';
import useSubscriptionCodes from '@src/hooks/useSubscriptionVoucherCode';
import { paths } from '@src/routes/paths';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import EnterCouponCode from './EnterCouponCode';
import SubscriptionVoucher from './EnterVoucherCode';
import PaymentMethod from './PaymentMethod';
import voucher from '../../../assets/voucher.png';
import useApplyCoupon from '../../../hooks/useApplyCoupon';
import useGetPackageDetails from '../../../hooks/useGetPackageDetails';
import useGetPackages from '../../../hooks/useGetPackages';
import usePaymentRequest from '../../../hooks/usePaymentRequset';
import { SelectedType, SubscriptionPaymentMode } from '../../../types';
import { getWhatsAppPlanDescription } from '../../../utils';
import { BoldText, GrayText } from '../../CustomText';
import { PlanInfoCard } from '../../review-order-card';

type Props = {
    selectedType: SelectedType;
    planId: number;
    isMandate?: boolean;
};

const PlanDetailsCard = ({ planId, selectedType, isMandate }: Props) => {
    const [totalPackagePrice, setTotalPackagePrice] = useState(0);
    const [finalPayableAmount, setFinalPayableAmount] = useState(0);
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = useGetPackageDetails({
        packageId: planId,
        selectedType,
        setTotalPackagePrice,
    });
    const { xl } = useScreenSize();
    // WhatsApp Basic/Pro pricing lives in the separate whatsappPlans list (same source the
    // plans comparison table uses); fetch it so the review card shows the same description.
    const { whatsappPlans } = useGetPackages();

    // coupon hook
    const {
        isApplied,
        applyCoupon,
        discountAmount,
        isLoading: couponLoading,
        removeCoupon,
        coupon,
    } = useApplyCoupon(planId);

    useEffect(() => {
        if (!data) {
            return;
        }
        const totalPayAmountAfterDiscount = totalPackagePrice - discountAmount;
        setFinalPayableAmount(totalPayAmountAfterDiscount > 0 ? totalPayAmountAfterDiscount : 0);
    }, [totalPackagePrice, discountAmount, data]);
    // voucher code hook
    const subscriptionCodesFn = useSubscriptionCodes(planId);
    const { isValidVoucher, activateSubscriptionCode, setIsValidVoucher, isActivating } =
        subscriptionCodesFn;
    // payment hook
    const {
        handlePaymentRequest,
        isLoading: paymentLoading,
        selectedPaymentMode,
        setselectedPaymentMode,
    } = usePaymentRequest();

    if (isLoading) {
        return <Skeleton active paragraph={{ rows: 5 }} className="py-20" />;
    }

    if (isError || !data) {
        return (
            <Flex vertical align="center" justify="center" gap={16} className="py-20 text-center">
                <Typography.Text className="text-base text-textGray">
                    We were unable to load this plan. Please try again.
                </Typography.Text>
                <Flex gap={12}>
                    <Button onClick={refetch}>Try Again</Button>
                    <Button type="primary" danger onClick={() => navigate(`/${paths.plans.index}`)}>
                        Back to Plans
                    </Button>
                </Flex>
            </Flex>
        );
    }

    const handleSubscribePackage = () => {
        if (selectedPaymentMode === SubscriptionPaymentMode.voucherCode) {
            activateSubscriptionCode();
            return;
        }
        handlePaymentRequest({
            billingType: selectedType.toUpperCase(),
            amount: finalPayableAmount,
            packageId: planId,
            couponCode: isApplied ? coupon : undefined,
            successUrl: `${FRONTEND_BASE_URL}/${paths.plans.index}/${paths.plans.paymentsuccess}`,
            failureUrl: `${FRONTEND_BASE_URL}/${paths.plans.index}/${paths.plans.paymentFailure}`,
            currentUrl: window.location.href,
            isMandate,
        });
        if (typeof Moengage?.track_event === 'function') {
            const serviceName = data?.packageDetails?.packageName;

          

            // Moengage.track_event(`${serviceName}_checkout_IN`, {
            //     [`${serviceName}_plan`]: selectedType,
            //     coupon_code_used: isApplied,
            //     total_amount: finalPayableAmount,
            //     checkout_viewed: true,
            // });
            sessionStorage.removeItem('service_details');
            sessionStorage.setItem(
                'paymentResult',
                JSON.stringify({
                    final_amount: finalPayableAmount,
                    serviceName,
                })
            );
        }
    };
    const hasAddonPrice = Number(data.annualAddonPrice) > 0 || Number(data.monthlyAddonPrice) > 0;
    const displayTotal = isValidVoucher ? 0 : finalPayableAmount;
    // WhatsApp tiers are only offered alongside GROUP plans (Peko Standard/Plus/Go). Individual
    // à-la-carte packages (eSign, Payroll, Turbo, …) must NOT show WhatsApp on their review screen.
    const whatsAppDescription =
        data.packageDetails.packageType === 'GROUP'
            ? getWhatsAppPlanDescription(
                  whatsappPlans,
                  selectedType,
                  data.packageDetails.packageName
              )
            : null;
    return (
        <Flex gap={30} vertical={!xl} className="items-center xl:items-start">
            <div className="w-full xl:w-[60%] xxl:w-[65%]">
                <PlanInfoCard
                    packageName={data.packageDetails.packageName}
                    selectedType={selectedType}
                    price={data.packageDetails.packagePrices[selectedType]}
                    subtitle={data.packageDetails.description?.split('\n')[0] ?? ''}
                    services={data.packageDetails.services ?? []}
                    isMandate={isMandate}
                    whatsAppDescription={whatsAppDescription}
                />
            </div>
            <Flex
                className="w-full h-full text-xs md:w-2/3  xl:w-[40%] xxl:w-[35%]"
                justify="space-between"
                align="flex-start"
                vertical
                gap={24}
            >
                <EnterCouponCode
                    applyCoupon={applyCoupon}
                    couponLoading={couponLoading}
                    isApplied={isApplied}
                    removeCoupon={removeCoupon}
                    totalPrice={totalPackagePrice}
                />
                <Flex
                    className="w-full h-full px-5 py-8 text-xs border border-gray-200 border-solid sm:px-6 rounded-xl"
                    justify="space-between"
                    align="flex-start"
                    vertical
                    gap={24}
                >
                    <Typography.Text className="text-lg font-medium">
                        Select Payment Method
                    </Typography.Text>
                    <PaymentMethod
                        icon={cardLogo}
                        label="UPI/Debit/Credit/ATM Cards"
                        checked={selectedPaymentMode === SubscriptionPaymentMode.card}
                        handleClick={() => {
                            setselectedPaymentMode(SubscriptionPaymentMode.card);
                            setIsValidVoucher(false);
                        }}
                    />

                    {!isMandate && (
                        <>
                            <PaymentMethod
                                icon={voucher}
                                label="I have a payment voucher"
                                checked={
                                    selectedPaymentMode === SubscriptionPaymentMode.voucherCode
                                }
                                handleClick={() => {
                                    setselectedPaymentMode(SubscriptionPaymentMode.voucherCode);
                                    setIsValidVoucher(false);
                                }}
                            />
                            {selectedPaymentMode === SubscriptionPaymentMode.voucherCode && (
                                <SubscriptionVoucher {...subscriptionCodesFn} />
                            )}
                        </>
                    )}
                </Flex>
                <Flex
                    className="w-full h-auto px-5 py-6 text-xs border border-gray-200 border-solid sm:px-8 rounded-xl"
                    justify="space-between"
                    vertical
                    gap={18}
                >
                    <Typography.Text className="text-lg font-medium text-zinc-900">
                        Order summary
                    </Typography.Text>
                    <Flex justify="space-between">
                        <GrayText text="Base Price" />
                        <BoldText
                            text={`₹ ${formatNumberWithLocalString(data?.packageDetails?.packagePrices[selectedType])}`}
                        />
                    </Flex>
                    {hasAddonPrice && (
                        <Flex justify="space-between">
                            <GrayText text={`Addon Price ( ${capitalize(selectedType)} )`} />
                            <BoldText
                                text={`₹ ${formatNumberWithLocalString(Number(selectedType === 'monthly' ? data.monthlyAddonPrice : data.annualAddonPrice))}`}
                            />
                        </Flex>
                    )}

                    {isValidVoucher ? (
                        <Flex justify="space-between">
                            <GrayText text="Voucher Discount" />
                            <BoldText
                                text={`₹ ${formatNumberWithLocalString(data?.packageDetails?.packagePrices[selectedType])}`}
                            />
                        </Flex>
                    ) : (
                        Number(data?.packageDetails?.discount?.[selectedType]) > 0 && (
                            <Flex justify="space-between">
                                <GrayText text="Discount" />
                                <BoldText
                                    text={`₹ ${formatNumberWithLocalString(data?.packageDetails?.discount[selectedType])}`}
                                />
                            </Flex>
                        )
                    )}
                    {Number(data?.discount?.price) !== 0 && (
                        <>
                            <Flex justify="space-between">
                                <div>
                                    <GrayText text="Remaining Period Credit" />
                                    <Tooltip
                                        autoAdjustOverflow
                                        className="ml-1"
                                        // overlayInnerStyle={{
                                        //     color: '#171717',
                                        //     width: '300px',
                                        // }}
                                        styles={{ body: { color: '#171717', width: '300px' } }}
                                        color="white"
                                        title={
                                            <Typography.Text className="text-xs">
                                                This is the credit from your current plan and
                                                add-ons (if any), calculated based on the unused
                                                portion of your current billing period. It is
                                                applied towards your new plan as your upgrade or
                                                change takes effect immediately.
                                            </Typography.Text>
                                        }
                                    >
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                                <BoldText
                                    text={`₹ ${formatNumberWithLocalString(Number(data?.discount?.price))}`}
                                />
                            </Flex>
                            {/* <Typography.Text className="text-xs text-green-500">
                                {data?.discount?.message}
                            </Typography.Text> */}
                        </>
                    )}

                    {isApplied && (
                        <Flex justify="space-between">
                            <GrayText text="Coupon Discount" />
                            <BoldText
                                text={`₹ ${formatNumberWithLocalString(isValidVoucher ? 0 : discountAmount)}`}
                            />
                        </Flex>
                    )}

                    <Divider />
                    <Flex justify="space-between">
                        <BoldText text="Total Amount" />
                        <BoldText text={`₹ ${formatNumberWithLocalString(displayTotal)}`} />
                    </Flex>

                    <Button
                        loading={paymentLoading || isActivating}
                        onClick={handleSubscribePackage}
                        htmlType="submit"
                        danger
                        type="primary"
                        className="w-full"
                    >
                        {`Pay ₹${formatNumberWithLocalString(displayTotal)}`}
                    </Button>
                    <Flex align="center" justify="center" gap={6} className="w-full">
                        <LockOutlined className="text-textGray" />
                        <Typography.Text className="text-xs text-textGray">
                            Secured by 256-bit encryption
                        </Typography.Text>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default PlanDetailsCard;
