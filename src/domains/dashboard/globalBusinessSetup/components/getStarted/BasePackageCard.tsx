import React from 'react';

import SelectableCard from './SelectableCard';
import { CompanyTypeAttribute } from '../../types/globalBusinessSetup';
import { PricingType } from '../../types/pricing';
import { buildPackageCardRows, calcStartingFromPrice, fmt } from '../../utils/pricingCalc';

interface BasePackageCardProps {
    pricing: PricingType;
    companyTypeAttributes?: CompanyTypeAttribute[];
    selected: boolean;
    onSelect: () => void;
}

const HAIRLINE = '1px solid #F3F4F6';

const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    letterSpacing: '0.05em',
    marginBottom: 4,
    lineHeight: 1.2,
};

const valueStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.45,
};

const clamp2: React.CSSProperties = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
};

const BasePackageCard: React.FC<BasePackageCardProps> = ({
    pricing,
    companyTypeAttributes = [],
    selected,
    onSelect,
}) => {
    const startingFrom = calcStartingFromPrice(pricing);
    const rows = buildPackageCardRows(pricing, companyTypeAttributes);

    return (
        <SelectableCard selected={selected} onClick={onSelect} align="flex-start" padding={20}>
            <div style={{ width: '100%' }}>
                <div style={{ minHeight: 72, paddingBottom: 14, borderBottom: HAIRLINE }}>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#171717',
                            marginBottom: 4,
                            lineHeight: 1.3,
                        }}
                    >
                        {pricing.name}
                    </div>
                    {pricing.description && (
                        <div
                            style={{
                                ...clamp2,
                                fontSize: 12,
                                color: '#6B7280',
                                lineHeight: 1.45,
                            }}
                        >
                            {pricing.description}
                        </div>
                    )}
                </div>

                {startingFrom != null && (
                    <div style={{ padding: '14px 0', borderBottom: HAIRLINE }}>
                        <div style={labelStyle}>Starting From</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#171717' }}>
                            INR {fmt(startingFrom)}
                        </div>
                    </div>
                )}

                {rows.map((row, idx) => (
                    <div
                        key={`${row.label}-${idx}`}
                        style={{
                            padding: '14px 0',
                            borderBottom: idx < rows.length - 1 ? HAIRLINE : 'none',
                        }}
                    >
                        <div style={labelStyle}>{row.label}</div>
                        <div style={valueStyle}>{row.value}</div>
                    </div>
                ))}
            </div>
        </SelectableCard>
    );
};

export default BasePackageCard;
