import { useState } from 'react';

import { Avatar, Button, Col, Empty, Flex, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';
import { paths } from '@src/routes/paths';

import { PricingCalculator } from './PricingCalculator';
import {
    resetApplication,
    setCountryData,
    setMetrics,
    setPricingData,
    setProvider,
    setQuoteConfig,
} from '../slices/globalBusinessSetupSlice';
import { Provider } from '../types/globalBusinessSetup';
import { PricingType, QuoteConfig } from '../types/pricing';

type CountryData = {
    country: string;
    type: string;
    freezone: string;
};
type ProviderCardProps = {
    providers: Provider[];
    countryData: CountryData;
    pricing: PricingType[];
    isBordered?: Boolean;
};

const ProviderCard = ({
    providers,
    countryData,
    pricing,
    isBordered = true,
}: ProviderCardProps) => {
    const navigate = useNavigate();
    const { xs } = useScreenSize();
    const dispatch = useAppDispatch();
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [quoteConfig, setLocalQuoteConfig] = useState<QuoteConfig | null>(null);

    if (!providers.length) {
        return (
            <Empty
                description={
                    <span>
                        No providers available for this country. Try another country or contact
                        support.
                    </span>
                }
                style={{ padding: '40px 0' }}
            />
        );
    }

    const provider = providers[0];
    const activePricing = pricing[selectedIdx] ?? null;

    const handleProceed = () => {
        dispatch(resetApplication());
        dispatch(setProvider(provider));
        dispatch(setCountryData(countryData));
        if (activePricing && quoteConfig) {
            dispatch(setPricingData(activePricing));
            dispatch(setQuoteConfig(quoteConfig));
            dispatch(
                setMetrics({
                    visa: quoteConfig.visa,
                    activity: quoteConfig.activity,
                    shareholder: quoteConfig.shareholder,
                })
            );
        }
        navigate(
            `${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.getStarted}/${paths.globalBusinessSetup.new}`
        );
    };

    return (
        <>
            {/* Bordered provider section */}
            <div
                className={`rounded-[31px] ${isBordered && 'border'} border-neutral-300 mt-5`}
                style={{ padding: xs ? 20 : 40 }}
            >
                {/* Provider header */}
                <Flex gap={xs ? 16 : 32} align={xs ? 'flex-start' : 'center'} vertical={xs}>
                    <div
                        className="rounded-[10px] border border-stone-300 p-2.5 shrink-0"
                        style={{ lineHeight: 0 }}
                    >
                        <Avatar
                            src={
                                <img
                                    src={provider.logo || '/images/placeholder-image.png'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                    }}
                                    alt="Provider Logo"
                                />
                            }
                            size={xs ? 80 : 102}
                            shape="square"
                            style={{ borderRadius: 8, background: '#fff' }}
                        />
                    </div>
                    <Flex vertical gap={6}>
                        <Typography.Text className="font-semibold text-2xl">
                            {provider.title}
                        </Typography.Text>
                        <Typography.Text className="text-base">
                            {provider.description}
                        </Typography.Text>
                    </Flex>
                </Flex>

                {/* Base package selector (when multiple pricing configs exist) */}
                {pricing.length > 1 && (
                    <Flex vertical gap={20} className="mt-8">
                        <Typography.Text className="text-base font-medium">
                            Select Base Package
                        </Typography.Text>
                        <Row gutter={[12, 12]}>
                            {pricing.map((p, i) => {
                                const isSelected = i === selectedIdx;
                                return (
                                    <Col xs={24} md={8} key={p._id}>
                                        <Flex
                                            vertical
                                            onClick={() => {
                                                setSelectedIdx(i);
                                                setLocalQuoteConfig(null);
                                            }}
                                            className={`rounded-3xl cursor-pointer h-full transition-all ${
                                                isSelected
                                                    ? 'border border-red-500'
                                                    : 'border border-neutral-200 hover:border-neutral-300'
                                            }`}
                                            style={{
                                                padding: xs ? '20px' : '32px 32px 36px',
                                                ...(isSelected
                                                    ? {
                                                          boxShadow:
                                                              '0px 1.56px 15.58px 1.43px rgba(0, 0, 0, 0.06)',
                                                      }
                                                    : {}),
                                            }}
                                        >
                                            <Typography.Text className="text-base font-semibold block mb-1">
                                                {p.name}
                                            </Typography.Text>
                                            {p.description && (
                                                <Typography.Text className="text-sm text-black">
                                                    {p.description}
                                                </Typography.Text>
                                            )}
                                        </Flex>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Flex>
                )}

                {/* Pricing calculator */}
                {activePricing && (
                    <div className="mt-8">
                        <PricingCalculator
                            pricing={activePricing}
                            onValuesChange={setLocalQuoteConfig}
                        />
                    </div>
                )}

                {/* No-pricing empty state — shown when the provider exists but
                    has no pricing packages configured for this freezone. */}
                {pricing.length === 0 && (
                    <Typography.Text className="block mt-8 text-gray-500">
                        No pricing packages configured for this freezone yet
                    </Typography.Text>
                )}
            </div>

            {/* Action buttons — outside the bordered section */}
            <Flex gap={12} className="mt-8">
                <Button
                    type="primary"
                    danger
                    size="large"
                    className="!px-8"
                    disabled={pricing.length === 0}
                    onClick={handleProceed}
                >
                    Proceed
                </Button>
                <Button
                    danger
                    type="default"
                    size="large"
                    onClick={() =>
                        navigate(
                            `${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.getStarted}/${paths.globalBusinessSetup.pendingApplications}`
                        )
                    }
                >
                    View pending applications
                </Button>
            </Flex>
        </>
    );
};

export default ProviderCard;
