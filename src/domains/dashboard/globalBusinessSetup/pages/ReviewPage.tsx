import React from 'react';

import { Button, Flex, Image, Spin, Typography } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import subscription from '@src/domains/dashboard/globalBusinessSetup/assets/svg/subscription.svg';
import { showToast } from '@src/slices/apiSlice';

import SuccessIcon from '../assets/img/verified.png';
import PlanDetails from '../components/PlanDetails';
import Application from '../components/SingleApplicationDetails/SingleApplicationDetails';
import { useActivatePekoPlus } from '../hooks/useActivatePekoPlus';
import { useFormSchemaById } from '../hooks/useFormById';
import useGetPackages from '../hooks/useGetPackages';
import { useProviderDetails } from '../hooks/useGetSingleProvider';
import useSingleApplication from '../hooks/useSingleApplication';
import useSubscriptionDetails from '../hooks/useSubscriptionDetails';
import { SubmittedFormData } from '../types/forms';
import { calcPricingBreakdown, normalizeQuoteConfig } from '../utils/pricingCalc';

const { Text } = Typography;

const ReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const { tableData, isLoading } = useSingleApplication(id!);
    const formId = tableData?.form_data?.form;
    const { form } = useFormSchemaById(formId);
    const { subscriptionDetails, refetch: refetchSubscription } = useSubscriptionDetails();
    const { data } = useGetPackages();
    const { activate, loading: activating } = useActivatePekoPlus();
    const hasStructuredPricing = Boolean(tableData?.pricing);

    const providerId = hasStructuredPricing ? null : tableData?.provider?._id ?? null;

    const { providerData, loading: providerLoading } = useProviderDetails(providerId, {
        enabled: Boolean(providerId),
    });

    if (isLoading || !tableData || (!hasStructuredPricing && providerLoading)) {
        return (
            <div className="w-full h-full flex justify-center items-center py-20">
                <Spin size="large" />
            </div>
        );
    }

    const { form_data, provider, status, is_paid, updated_at, created_at } = tableData;
    const normalizedQuoteConfig =
        tableData.pricing != null
            ? normalizeQuoteConfig(tableData.pricing, tableData.quote_config, tableData.metrics)
            : null;
    const total = tableData.pricing
        ? calcPricingBreakdown(tableData.pricing, normalizedQuoteConfig!).total
        : (tableData.quote_config?.visa ?? tableData.metrics?.visa ?? 0) *
              (providerData?.charges?.visa || 0) +
          (tableData.quote_config?.shareholder ?? tableData.metrics?.shareholder ?? 0) *
              (providerData?.charges?.shareholder || 0) +
          (tableData.quote_config?.activity ?? tableData.metrics?.activity ?? 0) *
              (providerData?.charges?.activity || 0);

    return (
        <>
            {status === 'closed' && (
                <div className="w-full flex flex-col items-center gap-3">
                    <Image
                        src={SuccessIcon}
                        alt="Success Icon"
                        width={90}
                        height={90}
                        preview={false}
                    />
                    <Text className="sm:text-[25px] text-lg font-medium">
                        Congratulations, your company is registered!
                    </Text>
                </div>
            )}

            <PlanDetails
                planIcon={provider?.logo}
                PlanName={provider?.title || 'N/A'}
                AmountPaid={total}
                Date={updated_at || created_at || ''}
                paymentStatus={is_paid ? 'Paid' : 'Pending'}
                applicationStatus={status}
            />

            <Application company={form_data as SubmittedFormData} formSchema={form} />
            {!subscriptionDetails.isPurchased && (
                <Flex className="px-0 md:px-20 xl:px-36 mt-5">
                    <Flex className="border px-4 rounded-2xl w-full">
                        <Flex
                            align="center"
                            justify="space-between"
                            className="w-full flex-col sm:flex-row gap-3"
                        >
                            <Flex align="center" gap={10} className="w-full sm:w-auto">
                                <ReactSVG
                                    src={subscription}
                                    beforeInjection={svg => {
                                        svg.classList.add('w-10', 'h-10', 'md:w-16', 'md:h-16');
                                    }}
                                />
                                <Typography.Text className="text-xs sm:text-sm md:text-base font-normal">
                                    You have a 1-year free subscription to Peko Plus. Activate it
                                    now.
                                </Typography.Text>
                            </Flex>

                            <Button
                                size="small"
                                danger
                                loading={activating}
                                disabled={!data?.length}
                                onClick={async () => {
                                    const res = await activate({ planId: data[0].id });
                                    if (res) {
                                        refetchSubscription();
                                        dispatch(
                                            showToast({
                                                description:
                                                    'Peko Plus activated successfully - included with your Global Business Setup subscription',
                                                variant: 'success',
                                            })
                                        );
                                    }
                                }}
                                className="w-full sm:w-32 h-10 text-xs sm:text-sm rounded-lg mb-3 sm:my-2"
                            >
                                Activate Now
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            )}

            <Text className="text-center mt-6 text-sm block">
                Contact your assigned setup manager. Your setup is being managed by{' '}
                <strong>Allen Ajith</strong>
                <br />
                Email:{' '}
                <a href="mailto:allen@peko.one" style={{ textDecoration: 'none' }}>
                    <Text className="text-lightRed xs:text-xs md:text-sm">allen@peko.one</Text>
                </a>{' '}
                | Phone:{' '}
                <a href="tel:+971503949240" style={{ textDecoration: 'none' }}>
                    <Text className="text-lightRed xs:text-xs md:text-sm">+971 50 394 9240</Text>
                </a>
            </Text>
        </>
    );
};

export default ReviewPage;
