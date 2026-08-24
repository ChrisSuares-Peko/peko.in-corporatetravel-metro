import { useEffect, useMemo, useState } from 'react';

import { Checkbox, Col, Flex, InputNumber, Row, Typography } from 'antd';

import { formatNumberWithLocalString } from '@utils/priceFormat';

import RupeeSymbol from './RupeeSymbol';
import { PricingType, QuoteConfig } from '../types/pricing';
import { calcPricingBreakdown, fmt } from '../utils/pricingCalc';

// ─── Card-style selector item ────────────────────────────────────────────────

function SelectableCard({
    label,
    price,
    isSelected,
    onClick,
}: {
    label: string;
    price: number;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <Flex
            vertical
            onClick={onClick}
            className={`rounded-3xl cursor-pointer transition-all ${
                isSelected
                    ? 'border border-red-500'
                    : 'border border-neutral-200 hover:border-neutral-300'
            }`}
            style={{
                padding: '24px 28px 36px',
                ...(isSelected
                    ? { boxShadow: '0px 1.24px 12.36px 1.14px rgba(0, 0, 0, 0.06)' }
                    : {}),
            }}
        >
            <Typography.Text className="text-base font-semibold block mb-3">
                {label}
            </Typography.Text>
            <Typography.Text className="text-xl font-semibold text-stone-800 flex items-center">
                <RupeeSymbol size={18} />
                {fmt(price)}
            </Typography.Text>
        </Flex>
    );
}

// ─── PricingCalculator ────────────────────────────────────────────────────────

interface PricingCalculatorProps {
    pricing: PricingType;
    initialValues?: Partial<QuoteConfig>;
    onValuesChange?: (values: QuoteConfig) => void;
}

export function PricingCalculator({
    pricing,
    initialValues,
    onValuesChange,
}: PricingCalculatorProps) {
    const isFixed = pricing.pricing_model === 'fixed';
    const isTable = pricing.pricing_model === 'table';
    const isTiered = pricing.pricing_model === 'tiered';

    const [selectedPkg, setSelectedPkg] = useState(initialValues?.selected_pkg ?? 0);
    const [visas, setVisas] = useState(initialValues?.visa ?? pricing.min_visas ?? 1);
    const [activities, setActivities] = useState(
        initialValues?.activity ?? pricing.included_activities ?? 1
    );
    const [shareholders, setShareholders] = useState(
        initialValues?.shareholder ?? pricing.included_shareholders ?? 1
    );
    const defaultOfficeIdx = (): number | null => {
        if (initialValues?.office_idx !== undefined) return initialValues.office_idx;
        if (!pricing.offices?.length) return null;
        return pricing.office_mandatory ? 0 : null;
    };
    const [officeIdx, setOfficeIdx] = useState<number | null>(defaultOfficeIdx());
    const [generalTrading, setGeneralTrading] = useState(initialValues?.general_trading ?? false);
    const [estCardIdx, setEstCardIdx] = useState(initialValues?.est_card_idx ?? 0);

    const hasFixedPackages = Boolean(isFixed && pricing.fixed_packages?.length);
    const hasEstCardOptions = Boolean(pricing.establishment_card_options?.length);

    const currentValues: QuoteConfig = useMemo(
        () => ({
            visa: isFixed
                ? pricing.fixed_packages?.[selectedPkg]?.visas ?? pricing.min_visas ?? 1
                : visas,
            activity: activities,
            shareholder: shareholders,
            office_idx: officeIdx,
            general_trading: generalTrading,
            ...(hasFixedPackages && { selected_pkg: selectedPkg }),
            ...(hasEstCardOptions && { est_card_idx: estCardIdx }),
        }),
        [
            selectedPkg,
            visas,
            activities,
            shareholders,
            officeIdx,
            generalTrading,
            estCardIdx,
            isFixed,
            pricing.fixed_packages,
            pricing.min_visas,
            hasFixedPackages,
            hasEstCardOptions,
        ]
    );

    useEffect(() => {
        onValuesChange?.(currentValues);
    }, [currentValues, onValuesChange]);

    const breakdown = useMemo(
        () => calcPricingBreakdown(pricing, currentValues),
        [pricing, currentValues]
    );

    return (
        <Flex vertical gap={20}>
            {/* Fixed package selector */}
            {isFixed && pricing.fixed_packages && (
                <Flex vertical gap={20}>
                    <Typography.Text className="text-base font-medium">
                        Select Package
                    </Typography.Text>
                    <Row gutter={[12, 12]}>
                        {pricing.fixed_packages.map((p, i) => (
                            <Col xs={24} sm={12} md={8} key={i}>
                                <SelectableCard
                                    label={p.label}
                                    price={p.price}
                                    isSelected={i === selectedPkg}
                                    onClick={() => setSelectedPkg(i)}
                                />
                            </Col>
                        ))}
                    </Row>
                </Flex>
            )}

            {/* Visa stepper */}
            {!isFixed && (isTable || isTiered) && (
                <Flex vertical gap={20}>
                    <Typography.Text className="text-base font-medium">Visas</Typography.Text>
                    <InputNumber
                        value={visas}
                        onChange={v => setVisas(v ?? pricing.min_visas ?? 0)}
                        min={pricing.min_visas ?? 0}
                        max={pricing.max_visas ?? 50}
                        style={{ width: 150 }}
                    />
                </Flex>
            )}

            {/* Activities & Shareholders row */}
            {(pricing.included_activities != null || pricing.included_shareholders != null) && (
                <Flex vertical gap={20}>
                    <Typography.Text className="text-base font-medium">
                        Select Package
                    </Typography.Text>
                    <Row>
                        {pricing.included_activities != null &&
                            pricing.extra_activity_fee != null && (
                                <Col xs={24} sm={6}>
                                    <Flex vertical gap={4}>
                                        <Typography.Text className="text-sm text-neutral-900 whitespace-nowrap">
                                            Activities ({pricing.included_activities} included)
                                        </Typography.Text>
                                        <InputNumber
                                            value={activities}
                                            onChange={v => setActivities(v ?? 1)}
                                            min={1}
                                            max={pricing.max_activities ?? 25}
                                            style={{ width: 150 }}
                                        />
                                    </Flex>
                                </Col>
                            )}
                        {pricing.included_shareholders != null &&
                            pricing.extra_shareholder_fee != null && (
                                <Col xs={24} sm={6}>
                                    <Flex vertical gap={4}>
                                        <Typography.Text className="text-sm text-neutral-900 whitespace-nowrap">
                                            Shareholders ({pricing.included_shareholders} included)
                                        </Typography.Text>
                                        <InputNumber
                                            value={shareholders}
                                            onChange={v => setShareholders(v ?? 1)}
                                            min={1}
                                            max={pricing.max_shareholders ?? 20}
                                            style={{ width: 150 }}
                                        />
                                    </Flex>
                                </Col>
                            )}
                    </Row>
                    {pricing.general_trading_fee != null && (
                        <Checkbox
                            checked={generalTrading}
                            onChange={e => setGeneralTrading(e.target.checked)}
                        >
                            <Typography.Text className="text-sm text-gray-700">
                                General Trading (+INR {fmt(pricing.general_trading_fee)})
                            </Typography.Text>
                        </Checkbox>
                    )}
                </Flex>
            )}

            {/* Establishment card options */}
            {pricing.establishment_card_options?.length ? (
                <Flex vertical gap={20}>
                    <Typography.Text className="text-base font-medium">
                        Establishment Card
                    </Typography.Text>
                    <Row gutter={[12, 12]}>
                        {pricing.establishment_card_options.map((ec, i) => (
                            <Col xs={24} sm={12} md={8} key={i}>
                                <SelectableCard
                                    label={ec.label}
                                    price={ec.price}
                                    isSelected={i === estCardIdx}
                                    onClick={() => setEstCardIdx(i)}
                                />
                            </Col>
                        ))}
                    </Row>
                </Flex>
            ) : null}

            {/* Office selector */}
            {pricing.offices?.length ? (
                <Flex vertical gap={20}>
                    <Typography.Text className="text-base font-medium">
                        Office{pricing.office_mandatory ? ' (required)' : ' (optional)'}
                    </Typography.Text>
                    <Row gutter={[12, 12]}>
                        {!pricing.office_mandatory && (
                            <Col xs={24} sm={12} md={8}>
                                <SelectableCard
                                    label="No office"
                                    price={0}
                                    isSelected={officeIdx === null}
                                    onClick={() => setOfficeIdx(null)}
                                />
                            </Col>
                        )}
                        {pricing.offices.map((o, i) => (
                            <Col xs={24} sm={12} md={8} key={i}>
                                <SelectableCard
                                    label={o.label}
                                    price={o.price}
                                    isSelected={i === officeIdx}
                                    onClick={() => setOfficeIdx(i)}
                                />
                            </Col>
                        ))}
                    </Row>
                </Flex>
            ) : null}

            {/* Breakdown */}
            <div className="rounded-[19px] border border-zinc-300 overflow-hidden">
                {breakdown.lines.length === 0 ? (
                    <div className="px-7 py-5">
                        <Typography.Text className="text-sm text-gray-400 italic">
                            Configure the options above to see a breakdown.
                        </Typography.Text>
                    </div>
                ) : (
                    <>
                        {breakdown.lines.map((l, i) => (
                            <div key={i}>
                                <Row justify="space-between" align="middle" className="px-7 py-4">
                                    <Col>
                                        <Typography.Text className="text-base font-semibold text-neutral-700">
                                            {l.label}
                                        </Typography.Text>
                                    </Col>
                                    <Col>
                                        <Typography.Text className="text-lg font-semibold text-stone-800 flex items-center">
                                            <RupeeSymbol size={16} />
                                            {formatNumberWithLocalString(l.amount)}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                                {i < breakdown.lines.length - 1 && (
                                    <div className="border-t border-zinc-300" />
                                )}
                            </div>
                        ))}
                        <div className="border-t border-zinc-300" />
                        <Row justify="space-between" align="middle" className="px-7 py-5">
                            <Col>
                                <Typography.Text className="text-2xl font-bold text-neutral-700">
                                    Estimated Total
                                </Typography.Text>
                            </Col>
                            <Col>
                                <Typography.Text className="text-2xl font-semibold text-stone-800 flex items-center">
                                    <RupeeSymbol />
                                    {formatNumberWithLocalString(breakdown.total)}
                                </Typography.Text>
                            </Col>
                        </Row>
                    </>
                )}
            </div>
        </Flex>
    );
}

export default PricingCalculator;
