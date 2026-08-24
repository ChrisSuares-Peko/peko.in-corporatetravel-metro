import React, { useEffect, useMemo } from 'react';

import { Col, Divider, Empty, Flex, Row, Skeleton, Spin } from 'antd';

import BasePackagePicker from './BasePackagePicker';
import ConfigureSetup from './ConfigureSetup';
import EstablishmentCardPicker from './EstablishmentCardPicker';
import EstimatedQuote from './EstimatedQuote';
import FixedPackagePicker from './FixedPackagePicker';
import FreezoneIntroCard from './FreezoneIntroCard';
import HighlightsCard from './HighlightsCard';
import JurisdictionSummary from './JurisdictionSummary';
import OfficePicker from './OfficePicker';
import SelectedPackageRow from './SelectedPackageRow';
import { CompanyTypeAttribute, Provider } from '../../types/globalBusinessSetup';
import { PricingType, QuoteConfig } from '../../types/pricing';
import { normalizeQuoteConfig } from '../../utils/pricingCalc';

interface DetailViewProps {
    subStep: 'pick' | 'configure';
    countryName: string;
    countryFlag?: string;
    countryCode?: string;
    companyTypeLabel: string;
    freezoneLabel?: string;
    providers: Provider[];
    pricings: PricingType[];
    companyTypeAttributes?: CompanyTypeAttribute[];
    selectedPricingIdx: number;
    onSelectedPricingChange: (idx: number) => void;
    quoteConfig: QuoteConfig | null;
    onQuoteConfigChange: (next: QuoteConfig) => void;
    onJumpToStep: (next: 1 | 2 | 3) => void;
    onPackageConfirmed: () => void;
    onChangePackage: () => void;
    loading?: boolean;
}

const cardStyle: React.CSSProperties = {
    border: '1px solid #E5E7EB',
    padding: '30px 32px',
    boxShadow: '0px 1.5px 16.5px 0px rgba(0, 0, 0, 0.06)',
};

const DetailView: React.FC<DetailViewProps> = ({
    subStep,
    countryName,
    countryFlag,
    countryCode,
    companyTypeLabel,
    freezoneLabel,
    providers,
    pricings,
    companyTypeAttributes,
    selectedPricingIdx,
    onSelectedPricingChange,
    quoteConfig,
    onQuoteConfigChange,
    onJumpToStep,
    onPackageConfirmed,
    onChangePackage,
    loading = false,
}) => {
    const provider = providers[0];
    const activePricing = pricings[selectedPricingIdx] ?? null;

    const isFixedWithMultiplePackages =
        Boolean(activePricing) &&
        activePricing!.pricing_model === 'fixed' &&
        (activePricing!.fixed_packages?.length ?? 0) > 1;

    useEffect(() => {
        if (!activePricing) return;
        onQuoteConfigChange(normalizeQuoteConfig(activePricing, null, null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePricing?._id]);

    const safeConfig = useMemo<QuoteConfig | null>(() => {
        if (!activePricing) return null;
        return quoteConfig ?? normalizeQuoteConfig(activePricing, null, null);
    }, [activePricing, quoteConfig]);

    const jurisdiction = (
        <JurisdictionSummary
            countryName={countryName}
            countryFlag={countryFlag}
            countryCode={countryCode}
            companyTypeLabel={companyTypeLabel}
            freezoneLabel={freezoneLabel}
            onChange={() => onJumpToStep(1)}
            onResetCountry={() => onJumpToStep(1)}
            onResetCompanyType={companyTypeLabel ? () => onJumpToStep(2) : undefined}
            onResetFreezone={freezoneLabel ? () => onJumpToStep(3) : undefined}
        />
    );

    if (loading) {
        return (
            <Flex vertical gap={24} className="mx-auto" style={{ width: '100%', maxWidth: 1200 }}>
                {jurisdiction}
                <div className="rounded-3xl bg-white" style={cardStyle}>
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
                <Flex justify="center" className="py-4">
                    <Spin />
                </Flex>
            </Flex>
        );
    }

    if (!provider) {
        return (
            <Flex vertical gap={24} className="mx-auto" style={{ width: '100%', maxWidth: 1200 }}>
                {jurisdiction}
                <Empty
                    description="No providers available for this country. Try another country or contact support."
                    style={{ padding: '40px 0' }}
                />
            </Flex>
        );
    }

    const intro = (
        <FreezoneIntroCard
            logo={provider.logo}
            title={provider.title}
            description={provider.description}
        />
    );

    if (pricings.length === 0) {
        return (
            <Flex vertical gap={24} className="mx-auto" style={{ width: '100%', maxWidth: 1200 }}>
                {jurisdiction}
                <div className="rounded-3xl bg-white" style={cardStyle}>
                    <Flex vertical gap={24}>
                        {intro}
                        <Divider style={{ margin: 0, borderColor: '#E5E7EB' }} />
                        <Empty description="No pricing packages configured for this freezone yet" />
                    </Flex>
                </div>
            </Flex>
        );
    }

    // Sub-step A: pick package
    if (subStep === 'pick') {
        return (
            <Flex vertical gap={24} className="mx-auto" style={{ width: '100%', maxWidth: 1200 }}>
                {jurisdiction}
                <div className="rounded-3xl bg-white" style={cardStyle}>
                    <Flex vertical gap={28}>
                        {intro}
                        <Divider style={{ margin: 0, borderColor: '#E5E7EB' }} />
                        <BasePackagePicker
                            pricings={pricings}
                            selectedIdx={selectedPricingIdx}
                            companyTypeAttributes={companyTypeAttributes}
                            onSelect={idx => {
                                onSelectedPricingChange(idx);
                                onPackageConfirmed();
                            }}
                        />
                    </Flex>
                </div>
            </Flex>
        );
    }

    // Sub-step B: configure
    const selectedSubtitle = activePricing?.description ?? undefined;

    return (
        <Flex vertical gap={24} className="mx-auto" style={{ width: '100%', maxWidth: 1200 }}>
            {jurisdiction}
            <Row gutter={[35, 24]} align="top">
                <Col xs={24} lg={15}>
                    <div className="rounded-3xl bg-white" style={cardStyle}>
                        <Flex vertical gap={28}>
                            {intro}
                            <Divider style={{ margin: 0, borderColor: '#E5E7EB' }} />
                            {pricings.length > 1 && activePricing && (
                                <SelectedPackageRow
                                    title={activePricing.name}
                                    subtitle={selectedSubtitle}
                                    onChange={onChangePackage}
                                />
                            )}
                            {activePricing && safeConfig && (
                                <>
                                    {isFixedWithMultiplePackages ? (
                                        <FixedPackagePicker
                                            packages={activePricing.fixed_packages ?? []}
                                            selectedIdx={safeConfig.selected_pkg ?? 0}
                                            onSelect={idx => {
                                                const pkg = activePricing.fixed_packages?.[idx];
                                                onQuoteConfigChange({
                                                    ...safeConfig,
                                                    selected_pkg: idx,
                                                    visa: pkg?.visas ?? safeConfig.visa,
                                                });
                                            }}
                                        />
                                    ) : (
                                        <ConfigureSetup
                                            pricing={activePricing}
                                            config={safeConfig}
                                            onChange={onQuoteConfigChange}
                                        />
                                    )}
                                    {(activePricing.establishment_card_options?.length ?? 0) >
                                        0 && (
                                        <EstablishmentCardPicker
                                            pricing={activePricing}
                                            config={safeConfig}
                                            onChange={onQuoteConfigChange}
                                        />
                                    )}
                                    {(activePricing.offices?.length ?? 0) > 0 && (
                                        <OfficePicker
                                            pricing={activePricing}
                                            config={safeConfig}
                                            onChange={onQuoteConfigChange}
                                        />
                                    )}
                                </>
                            )}
                        </Flex>
                    </div>
                </Col>

                <Col xs={24} lg={9}>
                    <div style={{ position: 'sticky', top: 24 }}>
                        {activePricing && safeConfig && (
                            <>
                                <EstimatedQuote pricing={activePricing} config={safeConfig} />
                                <HighlightsCard html={activePricing.highlights} />
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </Flex>
    );
};

export default DetailView;
