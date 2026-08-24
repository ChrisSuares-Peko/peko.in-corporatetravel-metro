import React from 'react';

import { Divider, Typography } from 'antd';

import { individualSectionLabel, type IndividualServiceView } from '@utils/plansLandingData';

import IndividualServiceCard from './IndividualServiceCard';

interface Props {
    services: IndividualServiceView[];
    onSubscribe: (service: IndividualServiceView) => void;
}

const IndividualServicesSection: React.FC<Props> = ({ services, onSubscribe }) => {
    // "Real data only" — render nothing when no service currently has an individual package.
    if (!services.length) return null;

    return (
        <div className="flex flex-col gap-10 sm:gap-12">
            <Divider className="!my-0 !border-borderDivider">
                <Typography.Text className="text-sm font-medium text-textGray">
                    {individualSectionLabel}
                </Typography.Text>
            </Divider>

            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {services.map(service => (
                    <IndividualServiceCard
                        key={service.id}
                        service={service}
                        onSubscribe={onSubscribe}
                    />
                ))}
            </div>
        </div>
    );
};

export default IndividualServicesSection;
