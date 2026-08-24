import { useEffect, useState } from 'react';

import { FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Skeleton, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { paths } from '@routes/paths';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { getSurcharge } from '@src/services/surcharge';
import { accessKeys } from '@utils/accessKeys';
import { formatNumberWithLocalString } from '@utils/priceFormat';

import useGetAllPaymentMode from '../../payments/hooks/useGetAllPaymentMode';
import usePaymentApi from '../../payments/hooks/usePaymentApi';
import useWalletApi from '../../payments/hooks/useWalletApi';
import { setPaymentData } from '../../payments/slices/payment';
import { PaymentMode } from '../../payments/types/index';
import { DraftPricing } from '../api';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PrivateLimitedPaymentCard from '../components/PrivateLimitedPaymentCard';
import { EntityType } from '../types';
import { buildRegisterPath, parseCatalogAbout } from '../utils/data';

const { Title, Paragraph, Text } = Typography;

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

interface LineItem {
    label: string;
    amount: number;
}

// Real payment (central payments pattern, mirrors the Company Incorporation
// sibling): pricing comes from the server-created PENDING draft; the wallet /
// Cashfree debit runs through the shared payment hooks against our BE endpoint.
const PaymentSummary = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id: userId, role: userType } = useAppSelector(state => state.reducer.auth);
    const { user } = useAppSelector(state => state.reducer.user);
    const { currentApplication } = useAppSelector(state => state.reducer.businessRegistration);

    const entityType = currentApplication?.entityType as EntityType | undefined;
    const applicationId = (currentApplication?.applicationId as string | undefined) ?? '';
    const pricing = currentApplication?.draftPricing as DraftPricing | undefined;
    const isPvtLtd = entityType === EntityType.PRIVATE_LIMITED;

    // Back / redirect keep the applicationId so a reload resumes the draft.
    const formPath = entityType
        ? buildRegisterPath(entityType, { applicationId })
        : `${paths.businessRegistration.index}/${paths.businessRegistration.form}`;
    // successPath must stay query-free: the central payment hook appends
    // "?status=success&…", so entityType rides as a path segment only.
    const successPath = entityType
        ? buildRegisterPath(entityType)
        : `${paths.businessRegistration.index}/${paths.businessRegistration.form}`;

    // No draft → nothing to pay against; back to the form.
    useEffect(() => {
        if (!applicationId || !pricing) navigate(formPath, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    const incorporationFee = Number(pricing?.incorporationFee) || 0;
    const gstAmount = Number(pricing?.gstAmount) || 0;
    const subtotal = Number(pricing?.totalAmount) || 0;

    const [selectedMethod, setSelectedMethod] = useState<PaymentMode>(PaymentMode.empty);
    const [checkoutJsInstance, setCheckoutJsInstance] = useState<unknown>(null);
    const [surcharge, setSurcharge] = useState(0);
    const [isSurchargeLoading, setIsSurchargeLoading] = useState(true);

    const grandTotal = subtotal + surcharge;

    // Price is GST-inclusive; the GST is the portion carved out of it. The % is
    // derived from the amounts (not hardcoded) so the label matches whatever rate
    // the server used.
    const gstPercent = incorporationFee > 0 ? Math.round((gstAmount / incorporationFee) * 100) : 0;
    // Only our own charges are shown — service (incorporation) fee + GST, plus
    // the payment surcharge. Government fees are handled off-app by the RM, so
    // they never appear here (no "Government / Office Fees" line).
    const lineItems: LineItem[] = [{ label: 'Incorporation Fee', amount: incorporationFee }];
    if (gstAmount > 0) {
        lineItems.push({ label: `GST (${gstPercent}%)`, amount: gstAmount });
    }
    if (surcharge > 0) lineItems.push({ label: 'Platform Fee', amount: surcharge });

    // "What's included" + "Please note" copy comes from the catalog (about /
    // description) the server returned with the draft pricing.
    const catalogIncludes = parseCatalogAbout(pricing?.about);
    const catalogDescription = pricing?.description?.trim() || '';

    const {
        handleWalletPaymentRequest,
        handlePaytmPaymentRequest,
        isLoading,
        isSpinnerLoading,
        loadCheckoutScript,
    } = usePaymentApi({
        checkoutJsInstance,
        setCheckoutJsInstance,
        successBasePath: paths.dashboard.payments,
    });
    const { walletData } = useWalletApi();
    const { isPgOptionsLoading, availablePgOptions, isPgDown } = useGetAllPaymentMode();

    useEffect(() => {
        loadCheckoutScript();
    }, [loadCheckoutScript]);

    // Surcharge for display parity — the BE recomputes it during the debit.
    useEffect(() => {
        if (!applicationId || !subtotal) return undefined;
        let cancelled = false;
        const fetchSurcharge = async () => {
            setIsSurchargeLoading(true);
            const data = await getSurcharge({
                userId: Number(userId),
                userType: userType ?? '',
                amount: subtotal,
                accessKey: accessKeys.businessRegistration,
            });
            if (cancelled) return;
            setSurcharge(data ? parseFloat(data.surcharge) || 0 : 0);
            setIsSurchargeLoading(false);
        };
        fetchSurcharge();
        return () => {
            cancelled = true;
        };
    }, [applicationId, subtotal, userId, userType]);

    // Hand the payment context to the central payment flow.
    useEffect(() => {
        if (!applicationId || !subtotal || isSurchargeLoading) return;
        dispatch(
            setPaymentData({
                billSummary: [
                    { key: 'Service', value: 'Business Registration' },
                    { key: 'Application ID', value: applicationId },
                ],
                paymentSummary: lineItems.map(item => ({
                    key: item.label,
                    value: `₹ ${formatNumberWithLocalString(item.amount)}`,
                })),
                totalAmount: grandTotal,
                title: 'Business Registration',
                payload: {
                    accessKey: accessKeys.businessRegistration,
                    applicationId,
                    amount: subtotal,
                    payCashback: false,
                },
                url: 'officeAndBusiness/business-registration/payment',
                successPath,
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId, subtotal, surcharge, isSurchargeLoading]);

    const showWalletOption =
        user?.roleName !== 'corporate sub user' && availablePgOptions.wallet.available;
    const walletBalance = Number(walletData?.balance ?? 0);
    const isWalletDisabled = walletBalance <= 0 || walletBalance < grandTotal;

    const handlePay = async () => {
        if (selectedMethod === PaymentMode.wallet) {
            handleWalletPaymentRequest();
        } else if (selectedMethod === PaymentMode.PAYTM) {
            await handlePaytmPaymentRequest({ isChecked: false, balance: walletBalance });
        }
    };

    const isPayDisabled =
        !applicationId || selectedMethod === PaymentMode.empty || isLoading || isSurchargeLoading;

    const handleBack = () => navigate(formPath);

    const methodSelector = isPgOptionsLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
    ) : (
        <PaymentMethodSelector
            selected={selectedMethod}
            onSelect={setSelectedMethod}
            walletBalance={walletData?.balance !== undefined ? walletBalance : undefined}
            walletDisabled={isWalletDisabled}
            showWallet={showWalletOption}
            showGateway={!isPgDown && availablePgOptions.gateway.available}
        />
    );

    return (
        <div className="bg-white min-h-screen p-3 sm:p-6">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="text-center">
                    <Title
                        level={2}
                        className="!text-[24px] sm:!text-[28px] !font-semibold !text-[#1e293b] !mb-1"
                    >
                        Complete your payment
                    </Title>
                    <Paragraph className="!mb-0 text-[16px] sm:text-[20px] text-[#6a7282]">
                        Once payment is confirmed, your order is placed and the application is
                        created.
                    </Paragraph>
                </div>

                {isPvtLtd ? (
                    <PrivateLimitedPaymentCard
                        lineItems={lineItems}
                        total={grandTotal}
                        loading={isSurchargeLoading}
                        onBack={handleBack}
                        onPay={handlePay}
                        includes={catalogIncludes}
                        description={catalogDescription}
                        methodSelector={methodSelector}
                        payDisabled={isPayDisabled}
                        payLoading={isLoading}
                    />
                ) : (
                    <>
                        <div className="bg-white border-[0.5px] border-[rgba(204,204,204,0.8)] rounded-[28px] px-6 pt-4 pb-6">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 bg-[#fff4f4] rounded-[10px] w-[37px] h-[37px] flex items-center justify-center">
                                        <FileTextOutlined className="text-[#ff4f4f]" style={{ fontSize: 18 }} />
                                    </div>
                                    <div>
                                        <Text className="!block !text-[20px] !font-semibold !text-[#27272e] !leading-[1.1]">
                                            Payment Breakdown
                                        </Text>
                                        <Text className="!text-[15px] !text-[#425466] !leading-[20px]">
                                            Incorporation fees for the selected structure.
                                        </Text>
                                    </div>
                                </div>
                                <div className="-mx-6 h-px bg-[#ebebeb]" />
                                <Spin spinning={isSurchargeLoading}>
                                    <div className="flex flex-col gap-5">
                                        {lineItems.map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <Text className="!text-[16px] !text-[#4a5565]">{item.label}</Text>
                                                <Text className="!text-[16px] !text-[#101828]">
                                                    {formatINR(item.amount)}
                                                </Text>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between">
                                            <Text className="!text-[20px] !font-semibold !text-[#101828]">
                                                Total Amount
                                            </Text>
                                            <Text className="!text-[20px] !font-semibold !text-[#101828]">
                                                {formatINR(grandTotal)}
                                            </Text>
                                        </div>
                                    </div>
                                </Spin>
                            </div>
                        </div>

                        {methodSelector}

                        <div className="flex items-center justify-between gap-4">
                            <Button
                                onClick={handleBack}
                                className="!h-[44px] !px-6 !text-[16px] !rounded-[8px] !border-[#ff4f4f] !text-[#ff4f4f] hover:!bg-[#fff5f5] transition-colors"
                            >
                                Back
                            </Button>
                            <Button
                                type="primary"
                                onClick={handlePay}
                                disabled={isPayDisabled}
                                loading={isLoading}
                                className="!h-[44px] !px-6 !text-[16px] !font-medium !rounded-[8px] !bg-[#ff4f4f] hover:!bg-[#e64444] transition-colors"
                            >
                                Pay {formatINR(grandTotal)} &amp; Place Order
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {isSpinnerLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                </div>
            )}
        </div>
    );
};

export default PaymentSummary;
