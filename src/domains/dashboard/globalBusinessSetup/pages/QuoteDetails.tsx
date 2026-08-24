import { Flex, Spin } from 'antd';
import { useLocation } from 'react-router-dom';

import { useAppSelector } from '@src/hooks/store';
import useScreenSize from '@src/hooks/useScreenSize';

import ProviderCard from '../components/ProviderCard';

export default function QuoteDetails() {
    const { xs } = useScreenSize();
    const location = useLocation();
    const quoteId = (location.state as { id?: string } | null)?.id;

    const { provider, countryData, pricingList } = useAppSelector(
        state => state.reducer.globalBusinessSetup
    );

    if (!provider || !countryData || !pricingList) {
        return (
            <Flex justify="center" align="center" className="w-full min-h-[400px]">
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: xs ? '0 16px' : '0 24px' }}>
            <div
                className="bg-white rounded-[30px]"
                style={{
                    boxShadow: '0px 1.66px 16.56px 1.52px rgba(0, 0, 0, 0.06)',
                    border: '0.4px solid #D1D5DB',
                    padding: xs ? 24 : 48,
                }}
                data-quote-id={quoteId}
            >
                <ProviderCard
                    providers={[provider]}
                    countryData={countryData}
                    pricing={pricingList}
                    isBordered={false}
                />
            </div>
        </div>
    );
}
