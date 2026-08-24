import { useCallback, useEffect, useMemo, useState } from 'react';

import { AimOutlined, GlobalOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';
import { paths } from '@src/routes/paths';

import DetailView from '../components/getStarted/DetailView';
import SelectionView from '../components/getStarted/SelectionView';
import StickyBottomBar from '../components/getStarted/StickyBottomBar';
import { useCountries } from '../hooks/useCountries';
import { useProviders } from '../hooks/useProviders';
import {
    resetApplication,
    setCountryData,
    setMetrics,
    setPricingData,
    setProvider,
    setQuoteConfig as setQuoteConfigRedux,
} from '../slices/globalBusinessSetupSlice';
import { QuoteConfig } from '../types/pricing';

const { Title, Text } = Typography;

const formatLabel = (s: string) =>
    s
        .split('_')
        .map(w => (w.toUpperCase() === w ? w : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(' ');

type Step = 1 | 2 | 3 | 4 | 5;

export default function SetupForm() {
    const { xs } = useScreenSize();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [step, setStep] = useState<Step>(1);

    useEffect(() => {
        const container = document.getElementById('myContainer');
        container?.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const [countryId, setCountryId] = useState('');
    const [companyType, setCompanyType] = useState('');
    const [freezone, setFreezone] = useState('');
    const [selectedPricingIdx, setSelectedPricingIdx] = useState(0);
    const [quoteConfig, setQuoteConfig] = useState<QuoteConfig | null>(null);

    const { countriesAndDetails, countriesLoading } = useCountries(
        countryId,
        companyType,
        'is_active=true;has_company_types=true;has_provider=true;has_form=true;freezone_is_active=true'
    );

    const {
        fetchProviders,
        loading: providersLoading,
        providers,
        pricing,
        clearProviders,
    } = useProviders();

    const selectedCountry = useMemo(
        () => countriesAndDetails.find(c => c._id === countryId),
        [countriesAndDetails, countryId]
    );
    const selectedType = useMemo(
        () => selectedCountry?.company_types?.find(c => c.key === companyType),
        [selectedCountry, companyType]
    );
    const selectedFreezone = useMemo(
        () => selectedType?.freezones?.find(f => f.key === freezone),
        [selectedType, freezone]
    );

    const activeFreezones = useMemo(
        () => (selectedType?.freezones ?? []).filter(f => f.is_active === true),
        [selectedType]
    );
    const requiresFreezone = activeFreezones.length > 0;

    const subStep: 'pick' | 'configure' = step === 5 ? 'configure' : 'pick';

    const breadcrumb = useMemo(() => {
        const items: { label: string; icon?: React.ReactNode }[] = [];
        if (selectedCountry) {
            items.push({
                label: selectedCountry.name,
                icon: selectedCountry.logo ? (
                    <img
                        src={selectedCountry.logo}
                        alt={selectedCountry.name}
                        style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }}
                    />
                ) : undefined,
            });
        }
        if (companyType) {
            items.push({
                label:
                    selectedType?.label === 'Freezone'
                        ? 'Free Zone'
                        : selectedType?.label || formatLabel(companyType),
                icon: <AimOutlined style={{ color: '#FF4F4F', fontSize: 14 }} />,
            });
        }
        if (freezone) {
            items.push({
                label: selectedFreezone?.label || formatLabel(freezone),
                icon: <GlobalOutlined style={{ color: '#FF4F4F', fontSize: 14 }} />,
            });
        }
        return items;
    }, [selectedCountry, companyType, selectedType, freezone, selectedFreezone]);

    const handleReset = () => {
        setCountryId('');
        setCompanyType('');
        setFreezone('');
        setSelectedPricingIdx(0);
        setQuoteConfig(null);
        clearProviders();
        setStep(1);
    };

    const jumpToStep = useCallback(
        (next: 1 | 2 | 3) => {
            if (next <= 3 && step >= 4) {
                // Stepping back from detail flow — drop fetched pricing so
                // the user must re-check before re-entering Step 4.
                clearProviders();
                setSelectedPricingIdx(0);
                setQuoteConfig(null);
            }
            setStep(next);
        },
        [step, clearProviders]
    );

    const handleNext = async () => {
        if (step === 1 && countryId) {
            setStep(2);
            return;
        }
        if (step === 2 && companyType) {
            setStep(requiresFreezone ? 3 : 4);
            if (!requiresFreezone) {
                await fetchProviders({ country: countryId, type: companyType, freezone: '' });
                setSelectedPricingIdx(0);
                setQuoteConfig(null);
            }
            return;
        }
        if (step === 3 && freezone) {
            await fetchProviders({ country: countryId, type: companyType, freezone });
            setSelectedPricingIdx(0);
            setQuoteConfig(null);
            setStep(4);
            return;
        }
        if (step === 4) {
            setStep(5);
        }
    };

    const handleProceed = () => {
        const provider = providers[0];
        if (!provider) return;
        dispatch(resetApplication());
        dispatch(setProvider(provider));
        dispatch(
            setCountryData({
                country: countryId,
                type: companyType,
                freezone,
            })
        );
        const activePricing = pricing[selectedPricingIdx] ?? null;
        if (activePricing && quoteConfig) {
            dispatch(setPricingData(activePricing));
            dispatch(setQuoteConfigRedux(quoteConfig));
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

    const primaryDisabled = (() => {
        if (step === 1) return !countryId;
        if (step === 2) return !companyType;
        if (step === 3) return !freezone;
        if (step === 4) return !providers.length || pricing.length === 0;
        return !quoteConfig;
    })();

    const primaryLabel = step === 5 ? 'Proceed' : 'Next';
    const primaryLoading = step === 2 && !requiresFreezone ? providersLoading : false;

    const isInSelectionPhase = step <= 3;

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: xs ? '0 16px 24px' : '0 24px 24px',
            }}
        >
            <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="mb-6">
                <Flex vertical gap={4}>
                    <Title level={4} className="!m-0 !text-neutral-900 !font-semibold">
                        Let&apos;s Get Started
                    </Title>
                    <Text className="text-neutral-500">
                        Pick a jurisdiction to incorporate in. We&apos;ll walk you through company
                        type, location and pricing.
                    </Text>
                </Flex>
                <Button
                    danger
                    type="default"
                    onClick={() =>
                        navigate(
                            `${paths.dashboard.globalBusinessSetup}/${paths.globalBusinessSetup.getStarted}/${paths.globalBusinessSetup.pendingApplications}`
                        )
                    }
                >
                    Pending applications
                </Button>
            </Flex>

            {isInSelectionPhase ? (
                <SelectionView
                    step={step as 1 | 2 | 3}
                    countriesAndDetails={countriesAndDetails}
                    countriesLoading={countriesLoading}
                    countryId={countryId}
                    companyType={companyType}
                    freezone={freezone}
                    onCountryChange={id => {
                        if (id !== countryId) {
                            setCompanyType('');
                            setFreezone('');
                        }
                        setCountryId(id);
                    }}
                    onCompanyTypeChange={key => {
                        if (key !== companyType) setFreezone('');
                        setCompanyType(key);
                    }}
                    onFreezoneChange={setFreezone}
                    onJumpToStep={jumpToStep}
                />
            ) : (
                <DetailView
                    subStep={subStep}
                    countryName={selectedCountry?.name ?? ''}
                    countryFlag={selectedCountry?.logo}
                    countryCode={selectedCountry?.country_code}
                    companyTypeLabel={
                        selectedType?.label === 'Freezone'
                            ? 'Free Zone'
                            : selectedType?.label || formatLabel(companyType)
                    }
                    freezoneLabel={
                        freezone ? selectedFreezone?.label || formatLabel(freezone) : undefined
                    }
                    providers={providers}
                    pricings={pricing}
                    companyTypeAttributes={selectedType?.attributes}
                    selectedPricingIdx={selectedPricingIdx}
                    onSelectedPricingChange={setSelectedPricingIdx}
                    quoteConfig={quoteConfig}
                    onQuoteConfigChange={setQuoteConfig}
                    onJumpToStep={jumpToStep}
                    onPackageConfirmed={() => setStep(5)}
                    onChangePackage={() => setStep(4)}
                    loading={providersLoading}
                />
            )}

            <StickyBottomBar
                breadcrumb={breadcrumb}
                primaryLabel={primaryLabel}
                primaryDisabled={primaryDisabled}
                primaryLoading={primaryLoading}
                onPrimary={step === 5 ? handleProceed : handleNext}
                onReset={handleReset}
            />
        </div>
    );
}
