import React from 'react';

import { Divider, Flex, Typography } from 'antd';

import { PricingType, QuoteConfig } from '../../types/pricing';
import { calcPricingBreakdown, fmt } from '../../utils/pricingCalc';
import RupeeSymbol from '../RupeeSymbol';

interface EstimatedQuoteProps {
    pricing: PricingType;
    config: QuoteConfig;
}

const EstimatedQuote: React.FC<EstimatedQuoteProps> = ({ pricing, config }) => {
    const { lines, total } = calcPricingBreakdown(pricing, config);

    const hasVat = (pricing.vat ?? 0) > 0 && lines.length > 0;
    const costLines = hasVat ? lines.slice(0, -1) : lines;
    const vatLine = hasVat ? lines[lines.length - 1] : null;

    return (
        <Flex
            vertical
            gap={14}
            className="rounded-3xl bg-white"
            style={{
                border: '1px solid #E5E7EB',
                padding: '30px 32px',
                boxShadow: '0px 1.5px 16.5px 0px rgba(0, 0, 0, 0.06)',
            }}
        >
            <Typography.Text className="text-lg font-semibold text-neutral-900">
                Estimated Quote
            </Typography.Text>

            <Flex vertical gap={12}>
                <Typography.Text className="text-sm text-neutral-500">
                    Estimated total
                </Typography.Text>
                <Flex align="center" gap={4}>
                    <RupeeSymbol size={28} />
                    <Typography.Text
                        className="font-bold text-neutral-900"
                        style={{ fontSize: 32, lineHeight: '42px' }}
                    >
                        {fmt(total)}
                    </Typography.Text>
                </Flex>
                <Typography.Text className="text-sm text-neutral-500">VAT included</Typography.Text>
            </Flex>

            <Divider style={{ margin: 0, borderColor: '#E5E7EB' }} />

            {lines.length === 0 ? (
                <Typography.Text className="text-sm text-neutral-500">
                    No line items yet.
                </Typography.Text>
            ) : (
                <Flex vertical gap={8}>
                    {costLines.map((line, idx) => (
                        <Flex justify="space-between" align="center" key={idx}>
                            <Typography.Text className="text-base text-neutral-600">
                                {line.label}
                            </Typography.Text>
                            <Flex align="center" gap={2}>
                                <RupeeSymbol size={14} />
                                <Typography.Text className="text-base font-semibold text-neutral-900">
                                    {fmt(line.amount)}
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    ))}
                    {vatLine && (
                        <Flex
                            justify="space-between"
                            align="center"
                            style={{
                                borderTop: '1px solid #E5E7EB',
                                paddingTop: 10,
                                marginTop: 4,
                            }}
                        >
                            <Typography.Text className="text-sm text-neutral-400">
                                {vatLine.label}
                            </Typography.Text>
                            <Flex align="center" gap={2}>
                                <RupeeSymbol size={12} />
                                <Typography.Text className="text-sm text-neutral-400">
                                    {fmt(vatLine.amount)}
                                </Typography.Text>
                            </Flex>
                        </Flex>
                    )}
                </Flex>
            )}
        </Flex>
    );
};

export default EstimatedQuote;
