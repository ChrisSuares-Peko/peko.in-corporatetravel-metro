/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo, useState } from 'react';

import { Button, Flex, Modal, Spin, Typography } from 'antd';

import { useAppSelector } from '@src/hooks/store';

import ConfigureSetup from './ConfigureSetup';
import EstablishmentCardPicker from './EstablishmentCardPicker';
import FixedPackagePicker from './FixedPackagePicker';
import OfficePicker from './OfficePicker';
import SelectableCard from './SelectableCard';
import { getPlanPricing } from '../../api/globalBusinessSetup';
import { PricingType, QuoteConfig } from '../../types/pricing';
import { calcStartingFromPrice, fmt, normalizeQuoteConfig } from '../../utils/pricingCalc';

interface UpdateQuoteModalProps {
    open: boolean;
    onClose: () => void;
    country: string;
    companyType: string;
    freezone: string;
    currentPricingId: string;
    currentQuoteConfig: QuoteConfig | null;
    onSave: (pricing: PricingType, quoteConfig: QuoteConfig) => void;
}

const UpdateQuoteModal: React.FC<UpdateQuoteModalProps> = ({
    open,
    onClose,
    country,
    companyType,
    freezone,
    currentPricingId,
    currentQuoteConfig,
    onSave,
}) => {
    const { role, id } = useAppSelector(s => s.reducer.auth);

    const [pricings, setPricings] = useState<PricingType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [quoteConfig, setQuoteConfig] = useState<QuoteConfig | null>(null);

    useEffect(() => {
        if (!open || !country || !companyType) return undefined;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            const res = await getPlanPricing({
                userId: id,
                userType: role,
                country,
                company_type: companyType,
                freezone: freezone || '',
            });
            if (cancelled) return;
            const list = Array.isArray(res) ? (res as PricingType[]) : [];
            const active = list
                .filter(p => p.status === 'active')
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setPricings(active);
            const idx = active.findIndex(p => p._id === currentPricingId);
            setSelectedIdx(idx >= 0 ? idx : 0);
            setLoading(false);
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [open, country, companyType, freezone, currentPricingId, id, role]);

    const selectedPricing = pricings[selectedIdx] ?? null;

    useEffect(() => {
        if (!selectedPricing) {
            setQuoteConfig(null);
            return;
        }
        const carry = selectedPricing._id === currentPricingId ? currentQuoteConfig : null;
        setQuoteConfig(normalizeQuoteConfig(selectedPricing, carry, null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPricing?._id, currentPricingId, currentQuoteConfig]);

    const isFixedWithMultiplePackages = useMemo(
        () =>
            Boolean(selectedPricing) &&
            selectedPricing!.pricing_model === 'fixed' &&
            (selectedPricing!.fixed_packages?.length ?? 0) > 1,
        [selectedPricing]
    );

    const handleSave = () => {
        if (!selectedPricing || !quoteConfig) return;
        onSave(selectedPricing, quoteConfig);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Update Quote"
            width={680}
            destroyOnClose
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    danger
                    disabled={!selectedPricing || !quoteConfig}
                    onClick={handleSave}
                >
                    Save
                </Button>,
            ]}
        >
            {loading ? (
                <Flex justify="center" className="py-10">
                    <Spin />
                </Flex>
            ) : pricings.length === 0 ? (
                <Typography.Text className="text-sm text-neutral-500">
                    No active pricings available for this jurisdiction. Please contact support.
                </Typography.Text>
            ) : (
                <Flex vertical gap={20}>
                    {pricings.length > 1 && (
                        <Flex vertical gap={10}>
                            <Typography.Text className="text-base font-semibold text-neutral-900">
                                Select Package
                            </Typography.Text>
                            <Flex vertical gap={10}>
                                {pricings.map((p, idx) => {
                                    const startingFrom = calcStartingFromPrice(p);
                                    return (
                                        <SelectableCard
                                            key={p._id}
                                            selected={idx === selectedIdx}
                                            onClick={() => setSelectedIdx(idx)}
                                            align="flex-start"
                                            padding={14}
                                        >
                                            <Flex vertical gap={4}>
                                                <Typography.Text className="text-sm font-semibold text-neutral-900">
                                                    {p.name}
                                                </Typography.Text>
                                                {startingFrom != null && (
                                                    <Typography.Text className="text-xs text-neutral-500">
                                                        Starting from INR {fmt(startingFrom)}
                                                    </Typography.Text>
                                                )}
                                            </Flex>
                                        </SelectableCard>
                                    );
                                })}
                            </Flex>
                        </Flex>
                    )}

                    {selectedPricing && quoteConfig && (
                        <Flex vertical gap={20}>
                            {isFixedWithMultiplePackages ? (
                                <FixedPackagePicker
                                    packages={selectedPricing.fixed_packages ?? []}
                                    selectedIdx={quoteConfig.selected_pkg ?? 0}
                                    onSelect={idx => {
                                        const pkg = selectedPricing.fixed_packages?.[idx];
                                        setQuoteConfig({
                                            ...quoteConfig,
                                            selected_pkg: idx,
                                            visa: pkg?.visas ?? quoteConfig.visa,
                                        });
                                    }}
                                />
                            ) : (
                                <ConfigureSetup
                                    pricing={selectedPricing}
                                    config={quoteConfig}
                                    onChange={setQuoteConfig}
                                />
                            )}
                            {(selectedPricing.establishment_card_options?.length ?? 0) > 0 && (
                                <EstablishmentCardPicker
                                    pricing={selectedPricing}
                                    config={quoteConfig}
                                    onChange={setQuoteConfig}
                                />
                            )}
                            {(selectedPricing.offices?.length ?? 0) > 0 && (
                                <OfficePicker
                                    pricing={selectedPricing}
                                    config={quoteConfig}
                                    onChange={setQuoteConfig}
                                />
                            )}
                        </Flex>
                    )}
                </Flex>
            )}
        </Modal>
    );
};

export default UpdateQuoteModal;
