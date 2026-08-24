import React from 'react';

import { GlobalOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Image, Typography } from 'antd';

import { Quote } from '../../hooks/useQuotesByCountryType';
import { fmt } from '../../utils/pricingCalc';
import RupeeSymbol from '../RupeeSymbol';

interface QuoteCardProps {
    quote: Quote;
    onProceed: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onProceed }) => {
    const {
        displayPackageName,
        provider,
        displayPrice,
        includedActivities,
        includedShareholders,
        pricings,
        freezoneLabel,
    } = quote;

    const hasPricing = pricings.length > 0;

    return (
        <Flex
            vertical
            className="bg-white h-full"
            style={{
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                boxShadow: '0px 1.66px 16.56px 1.52px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
            }}
        >
            <Flex vertical gap={16} style={{ padding: 24, flex: 1 }} justify="space-between">
                <Flex vertical>
                    <Typography.Text className="text-base font-semibold text-neutral-900">
                        {displayPackageName || provider.title}
                    </Typography.Text>

                    <Flex vertical gap={12}>
                        <Flex className="h-20" align="center">
                            <Image src={provider.logo || undefined} width={80} preview={false} />
                        </Flex>
                        <Flex vertical gap={4}>
                            <Typography.Text className="text-base font-semibold text-neutral-900">
                                {provider.title}
                            </Typography.Text>
                            {provider.description && (
                                <Typography.Text className="text-sm text-neutral-600 leading-snug">
                                    {provider.description}
                                </Typography.Text>
                            )}
                        </Flex>
                    </Flex>
                </Flex>

                <Flex vertical>
                    {freezoneLabel && (
                        <Flex align="center" gap={6}>
                            <GlobalOutlined style={{ color: '#FF4F4F', fontSize: 14 }} />
                            <Typography.Text className="text-sm text-neutral-700">
                                {freezoneLabel}
                            </Typography.Text>
                        </Flex>
                    )}

                    <Divider style={{ margin: '4px 0' }} />

                    {hasPricing ? (
                        <>
                            <Flex align="center" gap={6}>
                                <RupeeSymbol size={22} />
                                <Typography.Text className="text-2xl font-semibold text-neutral-900">
                                    {fmt(displayPrice)}
                                </Typography.Text>
                            </Flex>
                            <Typography.Text className="text-sm text-neutral-700">
                                No. of activities: {includedActivities}, No. of shareholders:{' '}
                                {includedShareholders}
                            </Typography.Text>
                        </>
                    ) : (
                        <Typography.Text className="text-sm text-amber-700">
                            No pricing packages configured for this freezone yet
                        </Typography.Text>
                    )}
                </Flex>
            </Flex>

            <div style={{ padding: '0 24px 24px' }}>
                <Button
                    block
                    type="primary"
                    danger
                    size="large"
                    disabled={!hasPricing}
                    onClick={onProceed}
                >
                    Proceed
                </Button>
            </div>
        </Flex>
    );
};

export default QuoteCard;
